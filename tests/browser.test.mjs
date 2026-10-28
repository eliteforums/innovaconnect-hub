// Browser tests (Playwright core + a local Chrome/Chromium).
//   BASE_URL=http://localhost:3000 CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const run = Date.now().toString(36);
let browser;

before(async () => {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
});
after(async () => {
  await browser?.close();
});

test("update form shows server-confirmed success, then a duplicate error", async () => {
  const page = await browser.newPage();
  await page.goto(`${BASE}/register#updates`);
  const form = page.getByRole("form", { name: "Get event updates" });
  const email = `browser-${run}@example.com`;
  const fill = async () => {
    await form.getByRole("textbox", { name: "Name", exact: true }).fill("Browser Test");
    await form.getByRole("textbox", { name: "Email", exact: true }).fill(email);
    await form.getByRole("checkbox", { name: /Email me official/ }).check();
  };
  await page.waitForTimeout(1800); // the server rejects forms submitted faster than a human could
  await fill();
  await form.getByRole("button", { name: "Get event updates" }).click();
  await assert.doesNotReject(form.getByRole("status").filter({ hasText: "on the list" }).waitFor({ timeout: 10000 }));

  await fill();
  await form.getByRole("button", { name: "Get event updates" }).click();
  await assert.doesNotReject(form.getByRole("alert").filter({ hasText: "already on the update list" }).waitFor({ timeout: 10000 }));
  await page.close();
});

test("required fields are enforced before submitting", async () => {
  const page = await browser.newPage();
  let posted = false;
  page.on("request", (r) => r.method() === "POST" && r.url().includes("/api/") && (posted = true));
  await page.goto(`${BASE}/contact`);
  await page.getByRole("button", { name: "Send message" }).click();
  await page.waitForTimeout(500);
  assert.equal(posted, false, "browser validation blocks an empty form");
  const invalid = await page.locator("form :invalid").count();
  assert.ok(invalid >= 3);
  await page.close();
});

test("mobile menu opens, traps nothing and closes with Escape", async () => {
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
  await page.goto(`${BASE}/`);
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile" });
  assert.equal(await mobileNav.isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await mobileNav.isVisible(), false);
  assert.equal(await page.getByRole("button", { name: "Open menu" }).evaluate((el) => el === document.activeElement), true);

  await page.getByRole("button", { name: "Open menu" }).click();
  await mobileNav.getByRole("link", { name: /Chapter 1/ }).click();
  await page.waitForURL(`${BASE}/chapter-1`);
  assert.equal(await page.getByRole("navigation", { name: "Mobile" }).isVisible(), false);
  await page.close();
});

test("no horizontal overflow on small screens", async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
  for (const r of ["/", "/tracks", "/chapter-1", "/register", "/partners", "/faq"]) {
    await page.goto(`${BASE}${r}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `${r} overflows by ${overflow}px`);
  }
  await page.close();
});

test("team registration form submits when registration is open", { skip: process.env.EXPECT_REGISTRATION_OPEN !== "1" }, async () => {
  const page = await browser.newPage();
  await page.goto(`${BASE}/register`);
  const form = page.getByRole("form", { name: "Team registration" });
  const box = (name) => form.getByRole("textbox", { name, exact: true });
  await page.waitForTimeout(1800);
  await box("Full name").fill("Browser Lead");
  await box("Email").fill(`lead-browser-${run}@example.com`);
  await form.getByRole("textbox", { name: /^Phone/ }).fill("+91 98765 43210");
  await box("College or organization").fill("Test Institute");
  await box("City").fill("Nagpur");
  await form.getByRole("combobox", { name: "State or union territory" }).selectOption("Maharashtra");
  await box("Team name").fill(`Browser Team ${run}`);
  await form.getByRole("button", { name: "Add a team member" }).click();
  await box("Member 2 · full name").fill("Second Member");
  await box("Member 2 · email").fill(`member-browser-${run}@example.com`);
  await form.getByRole("radio", { name: /Artificial Intelligence/ }).check();
  await box("Working title").fill("Crop advisory agent");
  await form.getByRole("textbox", { name: /^Project summary/ }).fill(
    "An AI agent that turns local weather and soil data into simple advice for small farmers.",
  );
  await form.getByRole("checkbox", { name: /official rules/ }).check();
  await form.getByRole("checkbox", { name: /privacy notice/ }).check();
  await form.getByRole("button", { name: "Submit registration" }).click();
  await assert.doesNotReject(form.getByRole("status").filter({ hasText: "has been received and saved" }).waitFor({ timeout: 10000 }));
  await page.close();
});

test("keyboard users can skip to content", async () => {
  const page = await browser.newPage();
  await page.goto(`${BASE}/`);
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  assert.equal(await skip.evaluate((el) => el === document.activeElement), true);
  await page.close();
});
