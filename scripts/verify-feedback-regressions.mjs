import fs from "node:fs";
import { chromium } from "playwright-core";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3001";
const candidates = [
  process.env.E2E_BROWSER_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);
const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error("Chrome or Edge is required.");

const checks = [];
function check(name, condition, detail = "") {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(name + (detail ? ": " + detail : ""));
}
async function noOverflow(page, name) {
  const value = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  check(name, value.scroll <= value.client + 1, JSON.stringify(value));
}

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, serviceWorkers: "block" });
const page = await context.newPage();
page.setDefaultTimeout(45000);
await context.route("https://www.googletagmanager.com/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
await context.route("https://www.google-analytics.com/**", (route) => route.fulfill({ status: 204, body: "" }));
await context.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({
  status: 200,
  contentType: "application/javascript",
  body: "window.__binaryTreeFakeTime=0;window.YT={Player:class{constructor(element,options){this.options=options;element.textContent='Verified lecture player';setTimeout(()=>options.events?.onReady?.({target:this}),0)}getCurrentTime(){return Number(window.__binaryTreeFakeTime||0)}pauseVideo(){}playVideo(){}seekTo(seconds){window.__binaryTreeFakeTime=Number(seconds||0)}destroy(){}}};setTimeout(()=>window.onYouTubeIframeAPIReady?.(),0);",
}));

try {
  await page.goto(baseURL + "/learn/professional-05-good-websites", { waitUntil: "networkidle" });
  await page.getByText("Playing from 0:00", { exact: false }).waitFor();
  check("Three checkpoint markers render", await page.locator(".video-timeline-marker").count() === 3);
  await page.evaluate(() => { window.__binaryTreeFakeTime = 390; });
  await page.locator(".video-checkpoint-card").waitFor();
  check("Seeking past checkpoints opens the first unanswered check", await page.locator(".checkpoint-label").innerText().then((text) => text.includes("2:10")));
  await page.locator(".checkpoint-choices button").nth(1).click();
  if (await page.getByRole("button", { name: "Try again" }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Try again" }).click();
    await page.locator(".checkpoint-choices button").first().click();
  }
  if (await page.getByRole("button", { name: /Continue the lecture/ }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /Continue the lecture/ }).click();
  }
  await page.getByRole("tab", { name: "Flashcards" }).click();
  check("Lesson has 30 flashcards", (await page.locator(".flashcard-controls").innerText()).includes("1 of 30"));
  await page.getByRole("tab", { name: "Practice quiz" }).click();
  check("Lesson has 30 questions", (await page.locator(".quiz-progress").innerText()).includes("Question 1 of 30"));
  const sidebar = await page.locator(".lesson-sidebar").evaluate((node) => ({ width: node.getBoundingClientRect().width, overflow: node.scrollWidth - node.clientWidth }));
  check("Lesson sidebar is wide and has no horizontal scrollbar", sidebar.width >= 280 && sidebar.overflow <= 1, JSON.stringify(sidebar));
  await noOverflow(page, "Desktop lesson has no horizontal overflow");
  await page.screenshot({ path: "C:/tmp/binarytree-lesson-desktop.png", fullPage: true });

  await page.goto(baseURL + "/assessment", { waitUntil: "networkidle" });
  check("Assessment roadmap has four steps", await page.locator(".assessment-roadmap > div").count() === 4);
  check("Assessment has 16 questions", await page.locator(".assessment-question").count() === 16);
  const dimensions = await page.locator(".assessment-question-copy small").evaluateAll((nodes) => new Set(nodes.map((node) => node.textContent)).size);
  check("Assessment covers eight skill areas", dimensions === 8, String(dimensions));
  await noOverflow(page, "Desktop assessment has no horizontal overflow");
  await page.screenshot({ path: "C:/tmp/binarytree-assessment-desktop.png", fullPage: true });

  await page.goto(baseURL + "/progress", { waitUntil: "networkidle" });
  check("Real branch tree renders", await page.locator(".tree-trunk-main").isVisible() && await page.locator(".growth-branches").isVisible());
  check("Old canopy blobs are gone", await page.locator(".tree-canopy").count() === 0);
  await noOverflow(page, "Desktop progress has no horizontal overflow");
  await page.screenshot({ path: "C:/tmp/binarytree-progress-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL + "/learn/professional-05-good-websites", { waitUntil: "networkidle" });
  await noOverflow(page, "Phone lesson has no horizontal overflow");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const firstLink = page.locator(".mobile-navigation-group").first().locator("a").first();
  check("Phone navigation starts with assessment", (await firstLink.getAttribute("href")) === "/assessment");
  check("Phone navigation panel fits the viewport", await page.locator(".mobile-navigation-panel").evaluate((node) => node.getBoundingClientRect().width <= document.documentElement.clientWidth));
  await page.screenshot({ path: "C:/tmp/binarytree-mobile-navigation.png", fullPage: true });

  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed: checks.filter((item) => item.passed).length, failed: error.message, checks }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}