// Admin dashboard tests (Playwright core + local Chrome). Needs a server with
// writable storage and the default (or ADMIN_USERNAME/ADMIN_PASSWORD) login.
//   BASE_URL=http://localhost:3000 CHROME_PATH=... npm run test:admin
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const USER = process.env.ADMIN_USERNAME || "admin";
const PASS = process.env.ADMIN_PASSWORD || "admin";
const run = Date.now().toString(36);
let browser;
let context;
let page;

// 1×1 transparent PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

before(async () => {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
  page.on("dialog", (d) => d.accept());
});
after(async () => {
  await browser?.close();
});

test("signed-out visitors are sent to the login page and protected data is refused", async () => {
  await page.goto(`${BASE}/admin`);
  assert.match(page.url(), /\/admin\/login$/);
  const res = await fetch(`${BASE}/api/admin/export/registrations`);
  assert.equal(res.status, 401);
});

test("wrong credentials are rejected", async () => {
  await page.goto(`${BASE}/admin/login`);
  await page.getByLabel("Username").fill(USER);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("alert").filter({ hasText: "Incorrect username or password" }).waitFor();
});

test("admin can sign in and sees the overview", async () => {
  // React resets the form after each submission, so fill both fields again.
  await page.getByLabel("Username").fill(USER);
  await page.getByLabel("Password").fill(PASS);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`${BASE}/admin`);
  await page.getByRole("heading", { name: "Overview" }).waitFor();
  const cookies = await context.cookies();
  const session = cookies.find((c) => c.name === "ih_admin");
  assert.ok(session?.httpOnly, "session cookie is HttpOnly");
  assert.equal(session?.sameSite, "Strict");
});

test("form submissions are listed, searchable and exportable", async () => {
  const email = `admin-view-${run}@example.com`;
  const post = await fetch(`${BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE, "x-forwarded-for": `10.9.${run.length}.1` },
    body: JSON.stringify({ name: "Admin View", email, topic: "Other", message: `Visible in admin ${run}`, consent: true, elapsedMs: 5000 }),
  });
  assert.equal(post.status, 201);

  await page.goto(`${BASE}/admin/submissions/contact_messages`);
  await page.getByRole("heading", { name: "Contact messages" }).waitFor();
  await page.getByRole("searchbox", { name: "Search submissions" }).fill(run);
  await page.getByRole("cell", { name: email }).waitFor();

  const csv = await page.request.get(`${BASE}/api/admin/export/contact_messages`);
  assert.equal(csv.status(), 200);
  assert.match(csv.headers()["content-type"], /text\/csv/);
  assert.match(await csv.text(), new RegExp(run));
});

test("editing page text updates the live site, and reset restores it", async () => {
  const edited = `The lead story ${run}`;
  await page.goto(`${BASE}/admin/content/copy.home`);
  const lead = page.getByRole("group", { name: "Lead", exact: true });
  const tag = lead.getByLabel("Tag", { exact: true });
  await tag.fill(edited);
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Saved" }).waitFor();

  const home = await (await fetch(`${BASE}/`)).text();
  assert.ok(home.includes(edited), "homepage shows the edited text");

  await page.getByRole("button", { name: "Reset to default" }).click();
  await page.getByRole("status").filter({ hasText: "Restored" }).waitFor();
  const restored = await (await fetch(`${BASE}/`)).text();
  assert.ok(!restored.includes(edited), "homepage no longer shows the edit");
  assert.ok(restored.includes("The lead story"));
});

test("invalid content is sanitized instead of breaking the site", async () => {
  await page.goto(`${BASE}/admin/content/copy.global`);
  await page.getByRole("button", { name: "Edit as JSON" }).click();
  // Replace the 404 copy with the wrong types; the server keeps the defaults for those fields.
  const json = JSON.parse(await page.getByRole("textbox", { name: "Section JSON" }).inputValue());
  json.notFound = { kicker: 42, title: ["not", "a", "string"], body: "Edited 404 body", primary: null };
  await page.getByRole("textbox", { name: "Section JSON" }).fill(JSON.stringify(json));
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Saved" }).waitFor();
  const res = await fetch(`${BASE}/no-such-page-${run}`);
  assert.equal(res.status, 404);
  const html = await res.text();
  assert.ok(html.includes("Edited 404 body"));
  assert.ok(html.includes("Error 404 · Wrong stop"), "invalid kicker fell back to the default");
  await page.getByRole("button", { name: "Reset to default" }).click();
  await page.getByRole("status").filter({ hasText: "Restored" }).waitFor();
});

test("event settings control registration across the site", async () => {
  await page.goto(`${BASE}/admin/content/event`);
  // The Registration group also contains nested status fields (dates, fee); target the top-level one.
  await page.locator("#f-registration-status").selectOption("open");
  await page.getByRole("button", { name: "Save & publish" }).click();
  await page.getByRole("status").filter({ hasText: "Saved" }).waitFor();

  const register = await (await fetch(`${BASE}/register`)).text();
  assert.match(register, /Register your team/, "registration form is shown");
  const api = await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ elapsedMs: 5000 }),
  });
  assert.equal(api.status, 400, "API now accepts (and validates) registrations instead of refusing them");

  await page.getByRole("button", { name: "Reset to default" }).click();
  await page.getByRole("status").filter({ hasText: "Restored" }).waitFor();
  const closed = await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ elapsedMs: 5000 }),
  });
  assert.equal(closed.status, 403, "registration is refused again after reset");
});

test("images can be uploaded and deleted", async () => {
  await page.goto(`${BASE}/admin/media`);
  await page.locator('input[type="file"]').setInputFiles({ name: `test-${run}.png`, mimeType: "image/png", buffer: PNG });
  await page.getByRole("status").filter({ hasText: `Uploaded test-${run}.png` }).waitFor();
  const img = page.locator('section[aria-labelledby="uploads-title"] li img').first();
  const src = await img.getAttribute("src");
  assert.ok(src);
  const served = await page.request.get(new URL(src, BASE).toString());
  assert.equal(served.status(), 200);
  await page.getByRole("button", { name: "Delete image" }).first().click();
  await page.getByRole("status").filter({ hasText: "Image deleted" }).waitFor();
});

test("signing out ends the session", async () => {
  await page.goto(`${BASE}/admin`);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(`${BASE}/admin/login`);
  await page.goto(`${BASE}/admin`);
  assert.match(page.url(), /\/admin\/login$/);
});
