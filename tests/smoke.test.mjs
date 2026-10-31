// End-to-end smoke tests. Run against a running server:
//   BASE_URL=http://localhost:3000 npm test
// Set EXPECT_REGISTRATION_OPEN=1 when the server runs with REGISTRATION_STATUS=open.
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const REG_OPEN = process.env.EXPECT_REGISTRATION_OPEN === "1";
const run = Date.now().toString(36);
// A per-run client IP keeps rate-limit buckets independent between test runs
// (the server trusts x-forwarded-for, as it would behind a proxy).
const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

const routes = [
  "/", "/about", "/chapter-1", "/tracks", "/tracks/artificial-intelligence", "/tracks/open-innovation",
  "/timeline", "/prizes", "/partners", "/updates", "/register", "/contact", "/faq", "/rules", "/privacy", "/terms",
];

function post(path, body, headers = {}) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE, "x-forwarded-for": ip, ...headers },
    body: JSON.stringify(body),
  });
}

test("every public route renders with exactly one h1 and a unique title", async () => {
  const titles = new Set();
  for (const r of routes) {
    const res = await fetch(`${BASE}${r}`);
    assert.equal(res.status, 200, `${r} status`);
    const html = await res.text();
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${r} should have one h1`);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    assert.ok(title, `${r} has a title`);
    assert.ok(!titles.has(title), `${r} title is unique: ${title}`);
    titles.add(title);
  }
});

test("article pages render and unknown routes return 404", async () => {
  const list = await (await fetch(`${BASE}/updates`)).text();
  const slugs = [...new Set([...list.matchAll(/href="\/updates\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
  assert.ok(slugs.length > 0, "updates lists at least one article");
  for (const s of slugs) assert.equal((await fetch(`${BASE}/updates/${s}`)).status, 200, s);
  assert.equal((await fetch(`${BASE}/updates/does-not-exist`)).status, 404);
  assert.equal((await fetch(`${BASE}/no-such-page`)).status, 404);
});

test("all internal links resolve", async () => {
  const seen = new Set();
  for (const r of routes) {
    const html = await (await fetch(`${BASE}${r}`)).text();
    for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
      const href = m[1];
      if (href.startsWith("/_next") || seen.has(href)) continue;
      seen.add(href);
    }
  }
  for (const href of seen) {
    const res = await fetch(`${BASE}${href}`);
    assert.equal(res.status, 200, `link ${href}`);
  }
});

test("sitemap, robots and OG image are served", async () => {
  const sitemap = await fetch(`${BASE}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /<loc>[^<]+\/chapter-1<\/loc>/);
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  assert.match(robots, /Disallow: \/api\//);
  const og = await fetch(`${BASE}/opengraph-image`);
  assert.equal(og.status, 200);
  assert.equal(og.headers.get("content-type"), "image/png");
});

test("content rules: exactly two domains, and Chapter 1 figures only in the archive", async () => {
  // React separates adjacent text nodes with <!-- --> markers; strip them and tags.
  const text = async (r) => (await (await fetch(`${BASE}${r}`)).text()).replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ");
  const has = (t, re, what) => assert.ok(re.test(t), `expected ${what}`);
  const home = await text("/");
  has(home, /Domain 01/, "Domain 01");
  has(home, /Domain 02/, "Domain 02");
  assert.ok(!/Domain 03/.test(home), "there is no third domain");
  has(home, /₹1,00,000 in tiered cash awards/, "the Chapter 2 cash awards");
  for (const re of [/Finalist teams reported/i, /Applications reported/i, /Advertised total reward pool/i, /Explore Chapter 1/i]) {
    assert.ok(!re.test(home), `the homepage must not show Chapter 1 information: ${re}`);
  }
  const ch1 = await text("/chapter-1");
  has(ch1, /170/, "the reported finalist figure");
  has(ch1, /Advertised total reward pool/i, "the reward pool labelled as advertised");
  has(ch1, /do not describe Chapter 2/i, "the note separating the figures from Chapter 2");
  has(ch1, /200–250/, "the planned shortlist");
  has(ch1, /not a record of funding invested or disbursed/i, "the funding caveat");
});

test("update list: stores, de-duplicates and validates", async () => {
  const email = `smoke-${run}@example.com`;
  const ok = await post("/api/updates", { name: "Smoke Test", email, consent: true, website: "", elapsedMs: 3000 });
  assert.equal(ok.status, 201, await ok.clone().text());
  assert.equal((await ok.json()).ok, true);

  const dupe = await post("/api/updates", { name: "Smoke Test", email: email.toUpperCase(), consent: true, elapsedMs: 3000 });
  assert.equal(dupe.status, 409);

  const bad = await post("/api/updates", { name: "S", email: "not-an-email", consent: false, elapsedMs: 3000 });
  assert.equal(bad.status, 400);
  const { errors } = await bad.json();
  assert.ok(errors.name && errors.email && errors.consent, "field errors returned");
});

test("anti-abuse: honeypot, timing, origin and content type", async () => {
  const body = { name: "Bot", email: `bot-${run}@example.com`, consent: true, elapsedMs: 3000 };
  assert.equal((await post("/api/updates", { ...body, website: "http://spam" })).status, 400);
  assert.equal((await post("/api/updates", { ...body, elapsedMs: 100 })).status, 400);
  assert.equal((await post("/api/updates", body, { Origin: "https://evil.example" })).status, 403);
  const form = await fetch(`${BASE}/api/updates`, { method: "POST", headers: { "Content-Type": "text/plain", Origin: BASE }, body: "x" });
  assert.equal(form.status, 415);
});

test("partner inquiry and contact forms store valid submissions", async () => {
  const partner = await post("/api/partner-inquiry", {
    organization: "Smoke Labs", contactName: "Asha Rao", contactRole: "CTO", email: `partner-${run}@example.com`,
    category: "Company", interest: "Domain challenge", message: "We would like to propose a challenge.",
    consent: true, elapsedMs: 4000,
  });
  assert.equal(partner.status, 201, await partner.clone().text());
  const contact = await post("/api/contact", {
    name: "Ravi", email: `contact-${run}@example.com`, topic: "General question",
    message: "When will the dates be announced?", consent: true, elapsedMs: 4000,
  });
  assert.equal(contact.status, 201, await contact.clone().text());
  const badPartner = await post("/api/partner-inquiry", { organization: "", category: "Nope", consent: true, elapsedMs: 4000 });
  assert.equal(badPartner.status, 400);
});

test("registration respects the configured status", async () => {
  const registration = {
    lead: { fullName: "Lead Person", email: `lead-${run}@example.com`, phone: "+91 98765 43210", organization: "Test College", city: "Pune", state: "Maharashtra" },
    team: { name: `Team ${run}`, members: [{ fullName: "Member Two", email: `m2-${run}@example.com` }] },
    domain: "open-innovation",
    project: { title: "Queue-free clinics", summary: "A booking system that removes queues at small clinics for patients and staff alike." },
    consents: { rules: true, privacy: true, updates: false },
    elapsedMs: 9000,
  };
  const res = await post("/api/register", registration);
  if (!REG_OPEN) {
    assert.equal(res.status, 403, "registration is closed by configuration");
    return;
  }
  assert.equal(res.status, 201, await res.clone().text());
  assert.equal((await post("/api/register", registration)).status, 409);
  const badDomain = await post("/api/register", { ...registration, lead: { ...registration.lead, email: `x-${run}@example.com` }, domain: "fintech" });
  assert.equal(badDomain.status, 400, "only the two official domains are accepted");
  const dupeMembers = await post("/api/register", {
    ...registration,
    lead: { ...registration.lead, email: `y-${run}@example.com` },
    team: { ...registration.team, members: [{ fullName: "Twin", email: `y-${run}@example.com` }] },
  });
  assert.equal(dupeMembers.status, 400, "member emails must be unique");
});

test("rate limiting kicks in", async () => {
  const limitedIp = `10.200.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  let status = 0;
  for (let i = 0; i < 8; i++) {
    const res = await post(
      "/api/contact",
      { name: "Rate", email: `rate-${run}-${i}@example.com`, topic: "Other", message: `Rate limit probe ${i}`, consent: true, elapsedMs: 4000 },
      { "x-forwarded-for": limitedIp },
    );
    status = res.status;
    if (status === 429) break;
  }
  assert.equal(status, 429);
});
