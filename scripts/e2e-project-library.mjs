import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3010";
const browserCandidates = [process.env.E2E_BROWSER_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].filter(Boolean);
const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));
const qaDirectory = path.resolve(process.cwd(), "qa");
const checks = [];
const runtimeErrors = [];

function check(name, condition, detail = "") {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
}

async function noHorizontalOverflow(page, label) {
  const result = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  check(`${label} has no horizontal overflow`, result.scrollWidth <= result.clientWidth + 1, JSON.stringify(result));
}

if (!browserPath) throw new Error("Chrome or Edge is required for this browser test.");
fs.mkdirSync(qaDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, serviceWorkers: "allow" });
const page = await context.newPage();
page.setDefaultTimeout(45_000);
page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(`console @ ${page.url()}: ${message.text()}`); });
page.on("pageerror", (error) => runtimeErrors.push(`page @ ${page.url()}: ${error.message}`));
await context.route("https://www.googletagmanager.com/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
await context.route("https://www.google-analytics.com/**", (route) => route.fulfill({ status: 204, body: "" }));
await context.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "window.YT={Player:class{constructor(el,o){el.textContent='Verified lecture player';setTimeout(()=>o.events?.onReady?.({target:this}),0)}getCurrentTime(){return 0}pauseVideo(){}playVideo(){}seekTo(){}destroy(){}}};setTimeout(()=>window.onYouTubeIframeAPIReady?.(),0);" }));

try {
  await page.goto(`${baseURL}/lab`, { waitUntil: "networkidle" });
  check("Project Library renders", await page.getByRole("heading", { level: 1, name: "42 lessons. 42 things you can actually make." }).isVisible());
  check("Library contains all 42 lesson projects", await page.locator(".project-library-card").count() === 42, String(await page.locator(".project-library-card").count()));
  check("No framework error overlay", await page.locator('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay').count() === 0);
  await page.getByRole("button", { name: "Code", exact: true }).click();
  check("Code filter exposes 18 checked studios", await page.locator(".project-library-card").count() === 18, String(await page.locator(".project-library-card").count()));
  await page.getByRole("button", { name: "All projects", exact: true }).click();
  await page.getByPlaceholder("Search projects, courses, or skills").fill("phishing");
  check("Search finds the matching lesson project", await page.locator(".project-library-card").count() === 1 && await page.getByRole("heading", { name: "Write a phishing-response playbook" }).isVisible());
  await page.getByPlaceholder("Search projects, courses, or skills").fill("");
  await noHorizontalOverflow(page, "Desktop Project Library");
  await page.screenshot({ path: path.join(qaDirectory, "project-library-desktop.png"), fullPage: true });

  const videoLesson = "professional-05-good-websites";
  await page.goto(`${baseURL}/learn/${videoLesson}`, { waitUntil: "networkidle" });
  check("Lesson route has four clear stages", await page.locator(".lesson-route li").count() === 4, String(await page.locator(".lesson-route li").count()));
  check("Video chapter notebook mirrors the chapter map", await page.locator(".chapter-note").count() === await page.locator(".video-chapter-panel li").count());
  check("Lesson exposes its specific project brief", await page.getByRole("heading", { name: "Build a trustworthy community website" }).isVisible());
  check("Coding project links to its matching studio", (await page.locator(".lesson-mission").getByRole("link", { name: /Open this project/ }).getAttribute("href")) === `/lab/${videoLesson}`);
  await noHorizontalOverflow(page, "Desktop detailed lesson");
  await page.screenshot({ path: path.join(qaDirectory, "lesson-notebook-desktop.png"), fullPage: true });

  const workbookLesson = "digital-01-orientation";
  await page.goto(`${baseURL}/lab/${workbookLesson}`, { waitUntil: "networkidle" });
  check("Non-code project opens a three-phase workbook", await page.locator(".mission-workbook-main article").count() === 3);
  const phases = await page.locator(".mission-workbook-main article").all();
  for (let index = 0; index < phases.length; index += 1) {
    await phases[index].locator("textarea").fill(`Phase ${index + 1}: I made a specific decision, recorded evidence, and explained how I will test and improve the result.`);
    await phases[index].getByRole("button", { name: "Check this phase" }).click();
  }
  await page.getByText("Project evidence complete.", { exact: false }).waitFor();
  await page.waitForFunction((slug) => {
    const saved = JSON.parse(localStorage.getItem(`binarytree-mission:${slug}:v1`) || "{}");
    return saved.completedIds?.length === 3 && Object.keys(saved.responses || {}).length === 3;
  }, workbookLesson);
  const savedWorkbook = await page.evaluate((slug) => ({
    workbook: JSON.parse(localStorage.getItem(`binarytree-mission:${slug}:v1`) || "{}"),
    progress: JSON.parse(localStorage.getItem("binarytree-progress-v3") || "{}").lessons?.[slug]?.project,
  }), workbookLesson);
  check("Workbook draft remains saved on this device", Object.keys(savedWorkbook.workbook.responses || {}).length === 3, JSON.stringify(savedWorkbook.workbook));
  check("Three evidence phases complete unified project progress", savedWorkbook.progress?.complete === true && savedWorkbook.progress?.passedCheckIds?.length === 3, JSON.stringify(savedWorkbook.progress));
  await noHorizontalOverflow(page, "Desktop project workbook");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/lab`, { waitUntil: "networkidle" });
  check("Phone Library still contains 42 projects", await page.locator(".project-library-card").count() === 42);
  await noHorizontalOverflow(page, "390px Project Library");
  await page.getByRole("button", { name: "Open navigation" }).click();
  check("Phone menu names the Project Library clearly", await page.locator(".mobile-navigation-panel").getByRole("link", { name: /Project Library/ }).isVisible());
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(qaDirectory, "project-library-mobile.png"), fullPage: true });

  await page.goto(`${baseURL}/learn/${videoLesson}`, { waitUntil: "networkidle" });
  check("Phone lesson keeps the four-stage route", await page.locator(".lesson-route li").count() === 4);
  check("Phone lesson keeps the chapter notebook", await page.locator(".chapter-note").count() > 0);
  await noHorizontalOverflow(page, "390px detailed lesson");
  await page.screenshot({ path: path.join(qaDirectory, "lesson-notebook-mobile.png"), fullPage: true });

  check("No browser runtime errors", runtimeErrors.length === 0, runtimeErrors.join(" | "));
  console.log(JSON.stringify({ passed: checks.length, checks, screenshots: ["project-library-desktop.png", "lesson-notebook-desktop.png", "project-library-mobile.png", "lesson-notebook-mobile.png"] }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed: checks.filter((item) => item.passed).length, failed: error.message, checks, runtimeErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
