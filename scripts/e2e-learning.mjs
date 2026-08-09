import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { getCodeProject } from "../lib/code-projects.js";
import { getVideoCurriculum } from "../lib/video-curriculum.js";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3100";
const browserCandidates = [
  process.env.E2E_BROWSER_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);
const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));
const liveAI = process.env.E2E_LIVE_AI === "1";
const runPython = process.env.E2E_PYTHON === "1";
const lessonSlug = "professional-05-good-websites";
const newlyIntegratedSlug = "brand-01-networking-safely";
const pythonSlug = "professional-06-python-introduction";
const video = getVideoCurriculum(lessonSlug);
const newlyIntegratedVideo = getVideoCurriculum(newlyIntegratedSlug);
const project = getCodeProject(video.projectId);
const checks = [];
const runtimeErrors = [];

function check(name, condition, detail = "") {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
}

async function noHorizontalOverflow(page, label) {
  const result = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  check(`${label} has no horizontal overflow`, result.scrollWidth <= result.clientWidth + 1, JSON.stringify(result));
}

if (!browserPath) throw new Error("Chrome or Edge is required for this browser test.");

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, serviceWorkers: "allow" });
const page = await context.newPage();
page.setDefaultTimeout(65_000);
page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(`console @ ${page.url()}: ${message.text()}`);
});
page.on("pageerror", (error) => runtimeErrors.push(`page @ ${page.url()}: ${error.message}`));

await context.route("https://www.googletagmanager.com/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
await context.route("https://www.google-analytics.com/**", (route) => route.fulfill({ status: 204, body: "" }));
await context.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({
  status: 200,
  contentType: "application/javascript",
  body: `
    window.__binaryTreeFakeTime = 0;
    window.YT = { Player: class {
      constructor(element, options) {
        this.element = element;
        this.options = options;
        element.textContent = "Verified lecture player";
        setTimeout(() => options.events?.onReady?.({ target: this }), 0);
      }
      getCurrentTime() { return Number(window.__binaryTreeFakeTime || 0); }
      pauseVideo() {}
      playVideo() {}
      seekTo(seconds) { window.__binaryTreeFakeTime = Number(seconds || 0); }
      destroy() {}
    } };
    setTimeout(() => window.onYouTubeIframeAPIReady?.(), 0);
  `,
}));

try {
  await page.goto(`${baseURL}/learn/${lessonSlug}`, { waitUntil: "networkidle" });
  check("Recent-video lesson renders", await page.getByRole("heading", { level: 1, name: "Good Websites & Web Development" }).isVisible());
  check("Interactive lecture mode renders", await page.locator(".interactive-video").isVisible());
  check("Lecture map contains every researched chapter", await page.locator(".video-chapter-panel li").count() === video.chapters.length, String(await page.locator(".video-chapter-panel li").count()));
  check("Detailed guide contains multiple deep dives", await page.locator(".lecture-guide-section").count() === video.guide.length && video.guide.length >= 4);
  check("Glossary contains six grounded terms", await page.locator(".lecture-glossary dt").count() === video.glossary.length && video.glossary.length >= 6);
  check("Lesson launches its mapped project", (await page.locator(".lesson-project-launch").getAttribute("href")) === `/lab/${lessonSlug}`);
  await page.getByText("Playing from 0:00", { exact: false }).waitFor();

  const checkpoint = video.checkpoints[0];
  await page.evaluate((time) => { window.__binaryTreeFakeTime = time; }, checkpoint.time);
  await page.locator(".video-checkpoint-card").waitFor();
  check("Video pauses for a real checkpoint", await page.getByRole("heading", { name: checkpoint.prompt }).isVisible());
  await page.locator(".checkpoint-choices").getByRole("button", { name: checkpoint.choices[checkpoint.answer], exact: true }).click();
  check("Correct answer receives an explanation", await page.getByText("That’s it.", { exact: true }).isVisible());
  await page.getByRole("button", { name: /Continue the lecture/ }).click();
  const videoProgress = await page.evaluate((slug) => JSON.parse(localStorage.getItem("binarytree-progress-v3") || "{}").lessons?.[slug]?.video, lessonSlug);
  check("Checkpoint persists in unified progress", videoProgress?.checkpointIds?.includes(checkpoint.id), JSON.stringify(videoProgress));
  await noHorizontalOverflow(page, "Desktop interactive lesson");

  await page.goto(`${baseURL}/learn/${newlyIntegratedSlug}`, { waitUntil: "networkidle" });
  check("Newly integrated Brand lesson uses the official upload", (await page.locator(".lesson-source-banner").innerText()).includes(newlyIntegratedVideo.title));
  check("Newly integrated upload has its complete chapter map", await page.locator(".video-chapter-panel li").count() === newlyIntegratedVideo.chapters.length, String(await page.locator(".video-chapter-panel li").count()));
  check("Newly integrated upload has deep notes and a five-step route", await page.locator(".lecture-guide-section").count() === newlyIntegratedVideo.guide.length && await page.locator(".lesson-route li").count() === 5);

  await page.goto(`${baseURL}/lab/${lessonSlug}`, { waitUntil: "networkidle" });
  check("Mapped Code Lab opens", await page.getByRole("heading", { level: 1, name: project.title }).isVisible());
  check("Code editor and isolated preview render", await page.locator("#code-lab-editor").isVisible() && await page.locator("iframe[sandbox='allow-scripts']").isVisible());
  await page.getByRole("button", { name: /Check project/ }).click();
  await page.locator(".code-lab-result-list li").first().waitFor();
  check("Every deterministic project check ran", await page.locator(".code-lab-result-list li").count() === project.tests.length, String(await page.locator(".code-lab-result-list li").count()));
  check("Working starter passes objective checks", await page.locator(".code-lab-result-list li.is-passed").count() === project.tests.length);
  await page.getByRole("button", { name: "Show a hint" }).click();
  check("Hint ladder reveals one step at a time", await page.locator(".code-lab-hints li").count() === 1);

  if (liveAI) {
    const responsePromise = page.waitForResponse((response) => response.url().endsWith("/api/ai/code-feedback") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Ask the AI coach" }).click();
    const payload = await (await responsePromise).json();
    await page.locator(".code-lab-ai-feedback:not(.is-error)").waitFor();
    const feedback = await page.locator(".code-lab-ai-feedback p").innerText();
    check("Coding coach uses live Groq", payload.provider === "groq" && Boolean(payload.model), JSON.stringify(payload).slice(0, 260));
    check("Coding coach gives substantive code-specific feedback", feedback.length >= 80, feedback);
  }

  const projectProgress = await page.evaluate((slug) => JSON.parse(localStorage.getItem("binarytree-progress-v3") || "{}").lessons?.[slug]?.project, lessonSlug);
  check("Project checks persist in unified progress", projectProgress?.complete === true && projectProgress.passedCheckIds.length === project.tests.length, JSON.stringify(projectProgress));
  await noHorizontalOverflow(page, "Desktop Code Lab");

  await page.goto(`${baseURL}/progress`, { waitUntil: "networkidle" });
  const overall = Number.parseInt(await page.locator(".overall-meter strong").innerText(), 10);
  check("Learning tree colors from saved activity", Number.isFinite(overall) && overall > 0, String(overall));
  check("Progress page recommends a next lesson", await page.getByText("Up next", { exact: true }).isVisible());
  await noHorizontalOverflow(page, "Desktop progress tree");

  await page.goto(`${baseURL}/lab/${pythonSlug}`, { waitUntil: "networkidle" });
  check("Python project studio renders", await page.getByRole("heading", { level: 1, name: /opportunity recommender/i }).isVisible());
  check("Python editor exposes runnable source", (await page.locator("#python-editor").inputValue()).includes("def recommend"));
  if (runPython) {
    await page.getByRole("button", { name: /Check project/ }).click();
    await page.locator(".python-results li").first().waitFor({ timeout: 65_000 });
    check("Browser Python executed every behavioral test", await page.locator(".python-results li").count() === getCodeProject("python-opportunity").tests.length);
    check("Python checker reports passing and failing behavior", await page.locator(".python-results li.is-passed").count() >= 1 && await page.locator(".python-results li:not(.is-passed)").count() >= 1);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/lab/${lessonSlug}`, { waitUntil: "networkidle" });
  check("Phone Code Lab editor avoids input zoom", await page.locator("#code-lab-editor").evaluate((node) => getComputedStyle(node).fontSize === "16px"));
  await noHorizontalOverflow(page, "390px Code Lab");
  await page.getByRole("button", { name: "Open navigation" }).click();
  check("Phone navigation exposes Code Lab", await page.locator(".mobile-navigation-panel").getByRole("link", { name: /Code Lab/ }).isVisible());
  check("Phone navigation exposes progress", await page.locator(".mobile-navigation-panel").getByRole("link", { name: /Progress/ }).isVisible());

  await page.goto(`${baseURL}/lab/${pythonSlug}`, { waitUntil: "networkidle" });
  check("Phone Python editor avoids input zoom", await page.locator("#python-editor").evaluate((node) => getComputedStyle(node).fontSize === "16px"));
  await noHorizontalOverflow(page, "390px Python Lab");
  await page.screenshot({ path: path.join(process.env.TEMP || "C:/tmp", "binary-tree-learning-mobile.png"), fullPage: true });

  check("No browser runtime errors", runtimeErrors.length === 0, runtimeErrors.join(" | "));
  console.log(JSON.stringify({ passed: checks.length, checks, liveAI, runPython }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed: checks.filter((item) => item.passed).length, failed: error.message, checks, runtimeErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
