import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3001";
const edgePath = process.env.E2E_BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const here = path.dirname(fileURLToPath(import.meta.url));
const qaDir = path.resolve(here, "../qa");
const checks = [];
const runtimeErrors = [];

function check(name, condition, detail = "") {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
}

async function noHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  check(`${label} has no horizontal overflow`, dimensions.scrollWidth <= dimensions.width + 1, JSON.stringify(dimensions));
}

await fs.mkdir(qaDir, { recursive: true });
const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: "allow" });
const page = await context.newPage();
page.setDefaultTimeout(30_000);
page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(`console @ ${page.url()}: ${message.text()}`);
});
page.on("pageerror", (error) => runtimeErrors.push(`page @ ${page.url()}: ${error.message}`));

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  check("Home title is branded", (await page.title()).includes("BinaryTree"), await page.title());
  check("Home has the intended hero", await page.getByRole("heading", { level: 1, name: "Skills that keep opening doors." }).isVisible());
  check("Home exposes seven course tracks", await page.locator(".course-card").count() === 7, String(await page.locator(".course-card").count()));
  check("Desktop navigation is visible", await page.locator(".desktop-nav").isVisible());
  await noHorizontalOverflow(page, "Desktop home");
  await page.screenshot({ path: path.join(qaDir, "home-desktop.png"), fullPage: true });

  await page.goto(`${baseURL}/learn?track=digital-literacy`, { waitUntil: "networkidle" });
  check("Digital literacy filter shows one track", await page.locator(".track-section").count() === 1, String(await page.locator(".track-section").count()));
  check("Digital literacy contains five lessons", await page.locator(".lesson-row").count() === 5, String(await page.locator(".lesson-row").count()));
  const lessonHref = await page.locator(".lesson-row").first().getAttribute("href");
  check("Catalog links to a real lesson", lessonHref?.startsWith("/learn/") === true, lessonHref || "missing href");

  await page.goto(`${baseURL}${lessonHref}`, { waitUntil: "networkidle" });
  check("Lesson heading is present", await page.locator(".lesson-heading h1").isVisible());
  check("Course outline contains five lessons", await page.locator(".outline-link").count() === 5, String(await page.locator(".outline-link").count()));
  check("Study companion is embedded", await page.locator(".study-card").isVisible());

  await page.getByRole("tab", { name: "Flashcards" }).click();
  const front = (await page.locator(".flashcard").innerText()).trim();
  await page.locator(".flashcard").click();
  const back = (await page.locator(".flashcard").innerText()).trim();
  check("Flashcard flips to its answer", front !== back, `${front.slice(0, 30)} -> ${back.slice(0, 30)}`);

  await page.getByRole("tab", { name: "Practice quiz" }).click();
  await page.locator(".quiz-option").first().click();
  check("Practice quiz gives feedback", await page.locator(".quiz-feedback").isVisible());

  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  check("Lesson progress is saved", await page.getByRole("button", { name: "✓ Lesson complete" }).isVisible());
  const savedProgress = await page.evaluate(() => JSON.parse(localStorage.getItem("binarytree-progress-v2") || "{}"));
  check("Progress persisted in local storage", savedProgress && Object.values(savedProgress).some((item) => item.complete === true));

  await page.goto(`${baseURL}/educators/lesson-planner`, { waitUntil: "networkidle" });
  await page.locator("#topic").fill("Introduction to data tables");
  await page.locator("#grade").fill("Age 14 / Grade 8");
  await page.getByRole("button", { name: "Generate lesson plan" }).click();
  await page.locator(".plan-output h2").waitFor();
  check("Planner creates a six-part timeline", await page.locator(".timeline-row").count() === 6, String(await page.locator(".timeline-row").count()));
  check("Planner includes a student exercise", await page.getByRole("heading", { name: "Student exercise" }).isVisible());
  check("Planner includes an assessment", await page.getByRole("heading", { name: "Assessment", exact: true }).isVisible());
  check("Planner reports its grounded fallback", (await page.locator(".plan-notice").innerText()).toLowerCase().includes("built-in"));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/study`, { waitUntil: "networkidle" });
  check("Mobile navigation control is visible", await page.locator(".mobile-menu summary").isVisible());
  check("Study workspace exposes all 42 lesson contexts", await page.locator(".study-library select option").count() === 42, String(await page.locator(".study-library select option").count()));
  await noHorizontalOverflow(page, "Mobile study workspace");
  await page.screenshot({ path: path.join(qaDir, "study-mobile.png"), fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}${lessonHref}`, { waitUntil: "networkidle" });
  const registration = await page.evaluate(async () => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("service worker timeout")), 90_000));
    const ready = navigator.serviceWorker.ready;
    const active = await Promise.race([ready, timeout]);
    return { scope: active.scope, caches: await caches.keys() };
  });
  check("PWA service worker is active", registration.scope === `${baseURL}/`, registration.scope);
  check("Offline curriculum cache exists", registration.caches.some((name) => name.startsWith("binarytree-v2")), registration.caches.join(", "));
  await page.reload({ waitUntil: "networkidle" });
  check("Page is controlled by the service worker", await page.evaluate(() => Boolean(navigator.serviceWorker.controller)));

  const preOfflineErrors = [...runtimeErrors];
  runtimeErrors.length = 0;
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
  check("Cached lesson opens offline", await page.locator(".lesson-heading h1").isVisible());
  await context.setOffline(false);
  check("No runtime errors before intentional offline mode", preOfflineErrors.length === 0, preOfflineErrors.join(" | "));

  console.log(JSON.stringify({ passed: checks.length, checks, offlineRuntimeMessages: runtimeErrors }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed: checks.filter((item) => item.passed).length, failed: error.message, checks, runtimeErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await context.setOffline(false).catch(() => {});
  await browser.close();
}
