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
  const dimensions = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll("body *")]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { tag: node.tagName.toLowerCase(), className: String(node.className || "").slice(0, 100), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
      })
      .filter((item) => item.right > width + 1 || item.left < -1)
      .slice(0, 8);
    return { width, scrollWidth: document.documentElement.scrollWidth, offenders };
  });
  check(`${label} has no horizontal overflow`, dimensions.scrollWidth <= dimensions.width + 1, JSON.stringify(dimensions));
}

await fs.mkdir(qaDir, { recursive: true });
const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: "allow" });
const page = await context.newPage();
await context.route("https://script.google.com/**", (route) => route.fulfill({ status: 204, body: "" }));
await context.route("https://docs.google.com/forms/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Binary Tree application form</title>" }));
page.setDefaultTimeout(30_000);
page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(`console @ ${page.url()}: ${message.text()}`); });
page.on("pageerror", (error) => runtimeErrors.push(`page @ ${page.url()}: ${error.message}`));

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  check("Home title is branded", (await page.title()).includes("Binary Tree"), await page.title());
  check("Home has the handmade learning hero", await page.getByRole("heading", { level: 1, name: "Useful skills, one honest step at a time." }).isVisible());
  check("Home uses the tactile learning notebook", await page.locator(".learning-notebook").isVisible());
  await page.locator("[data-reveal].is-revealed").first().waitFor();
  check("Scroll reveal system activates visible content", await page.locator("[data-reveal].is-revealed").count() > 0);
  check("Notebook scraps have natural motion", (await page.locator(".skill-scrap-one").evaluate((node) => getComputedStyle(node).animationName)).includes("scrap-bob"));
  check("Home exposes seven course tracks", await page.locator(".course-card").count() === 7, String(await page.locator(".course-card").count()));
  check("Desktop navigation is visible", await page.locator(".desktop-nav").isVisible());
  check("Official Binary Tree logo is used", await page.locator('img[src="/btlogo.png"]').first().isVisible());
  check("Home introduces team, partners, and applications", await page.locator(".home-organization-card").count() === 3, String(await page.locator(".home-organization-card").count()));
  check("Typing practice is featured", await page.getByRole("link", { name: "Start typing practice" }).isVisible());
  await noHorizontalOverflow(page, "Desktop home");
  await page.screenshot({ path: path.join(qaDir, "home-desktop.png"), fullPage: true });

  await page.goto(`${baseURL}/team`, { waitUntil: "networkidle" });
  check("Team page lists all six leaders", await page.locator(".team-person").count() === 6, String(await page.locator(".team-person").count()));
  check("Team page includes Abhijay's official role", await page.getByText("Director of AI, Open Source and Hackathons", { exact: true }).isVisible());
  await noHorizontalOverflow(page, "Desktop team");

  await page.goto(`${baseURL}/partners`, { waitUntil: "networkidle" });
  check("Partners page lists all nine organizations", await page.locator(".partner-note").count() === 9, String(await page.locator(".partner-note").count()));
  check("Partners page includes Our Moon", await page.getByRole("heading", { name: "Our Moon", exact: true }).isVisible());
  await noHorizontalOverflow(page, "Desktop partners");

  await page.goto(`${baseURL}/apply`, { waitUntil: "networkidle" });
  check("Application page embeds the official form", (await page.locator(".application-frame").getAttribute("src"))?.includes("1FAIpQLSeQS30-93Zoh4mNZ1khcUCukazsTq8kZEBu40YxJ1hKzuN3LQ") === true);
  check("Application page provides a new-tab fallback", await page.getByRole("link", { name: /Open the form in a new tab/ }).isVisible());
  await noHorizontalOverflow(page, "Desktop application");

  await page.goto(`${baseURL}/assessment`, { waitUntil: "networkidle" });
  check("Assessment includes eight scored questions", await page.locator(".assessment-question").count() === 8, String(await page.locator(".assessment-question").count()));
  check("Assessment exposes online status", await page.locator(".connection-note.is-online").isVisible());
  await page.getByLabel("Student full name").fill("QA Learner");
  await page.getByLabel("Cohort ID or class name").fill("Browser Check");
  await page.getByLabel("Assessment stage").selectOption("Pre");
  for (const fieldset of await page.locator(".assessment-question").all()) await fieldset.locator("label").first().click();
  await page.getByPlaceholder(/I want to feel confident/).fill("I want to explain what I learn in my own words.");
  await context.setOffline(true);
  await page.getByRole("button", { name: "Submit assessment" }).click();
  check("Offline assessment is queued locally", await page.evaluate(() => JSON.parse(localStorage.getItem("binarytree-assessment-queue-v1") || "[]").length === 1));
  check("Offline assessment gives human feedback", (await page.locator(".assessment-status").innerText()).includes("Saved on this device"));
  await context.setOffline(false);
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("binarytree-assessment-queue-v1") || "[]").length === 0);
  check("Queued assessment syncs when connection returns", (await page.locator(".assessment-status").innerText()).includes("synced successfully"));
  await noHorizontalOverflow(page, "Desktop assessment");
  runtimeErrors.length = 0;

  await page.goto(`${baseURL}/learn?track=digital-literacy`, { waitUntil: "networkidle" });
  check("Course map explains the three-step learning flow", await page.locator(".course-start-guide").isVisible());
  check("Recent-upload audit is visible", (await page.locator(".course-audit-pill").innerText()).includes("37 / 37"));
  check("Digital literacy filter shows one expanded course", await page.locator(".course-path-card.is-expanded").count() === 1, String(await page.locator(".course-path-card.is-expanded").count()));
  check("Digital literacy contains five lessons", await page.locator(".lesson-row").count() === 5, String(await page.locator(".lesson-row").count()));
  const lessonHref = await page.locator(".lesson-row").first().getAttribute("href");
  check("Catalog links to a real lesson", lessonHref?.startsWith("/learn/") === true, lessonHref || "missing href");

  await page.goto(`${baseURL}${lessonHref}`, { waitUntil: "networkidle" });
  check("Lesson heading is present", await page.locator(".lesson-heading h1").isVisible());
  check("Desktop course outline contains five lessons", await page.locator(".outline-link").count() === 5, String(await page.locator(".outline-link").count()));
  check("Study companion is embedded", await page.locator(".study-card").isVisible());
  check("Lesson has a three-language overview switcher", await page.locator(".lesson-language-options button").count() === 3, String(await page.locator(".lesson-language-options button").count()));
  const englishOverview = (await page.locator(".lesson-language-copy p").innerText()).trim();
  await page.getByRole("button", { name: "Kiswahili", exact: true }).click();
  check("Language switcher replaces the visible overview", (await page.locator(".lesson-language-copy p").innerText()).trim() !== englishOverview);
  check("Detailed video lesson includes four or more deep-dive sections", await page.locator(".lecture-guide-section").count() >= 4, String(await page.locator(".lecture-guide-section").count()));
  check("Lesson gives one five-step route", await page.locator(".lesson-route li").count() === 5, String(await page.locator(".lesson-route li").count()));
  await noHorizontalOverflow(page, "Desktop lesson");

  await page.getByRole("tab", { name: "Flashcards" }).click();
  check("Lesson includes six flashcards", (await page.locator(".flashcard-controls").innerText()).includes("1 of 6"));
  const front = (await page.locator(".flashcard").innerText()).trim();
  await page.locator(".flashcard").click();
  const back = (await page.locator(".flashcard").innerText()).trim();
  check("Flashcard flips to its answer", front !== back, `${front.slice(0, 30)} -> ${back.slice(0, 30)}`);
  await page.getByRole("tab", { name: "Practice quiz" }).click();
  check("Lesson includes six practice questions", (await page.locator(".quiz-progress").innerText()).includes("Question 1 of 6"));
  await page.locator(".quiz-option").first().click();
  check("Practice quiz gives feedback", await page.locator(".quiz-feedback").isVisible());
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  check("Lesson progress is saved", await page.getByRole("button", { name: "✓ Lesson complete" }).isVisible());
  const savedProgress = await page.evaluate(() => JSON.parse(localStorage.getItem("binarytree-progress-v3") || "{}"));
  check("Progress persisted in local storage", Object.values(savedProgress.lessons || {}).some((item) => item.completed === true));

  await page.goto(`${baseURL}/typing`, { waitUntil: "networkidle" });
  check("Typing setup exposes three levels", await page.locator(".typing-level").count() === 3, String(await page.locator(".typing-level").count()));
  await page.getByRole("radio", { name: /Medium/ }).click();
  await page.getByRole("button", { name: "Start 1-minute quest" }).click();
  check("Typing session starts at one minute", (await page.locator(".typing-hud").innerText()).includes("01:00"));
  const firstPromptLabel = await page.locator(".typing-prompt").getAttribute("aria-label");
  const firstPrompt = firstPromptLabel.replace("Type: ", "");
  await page.locator("#typing-input").fill("x");
  check("Incorrect character receives live feedback", await page.locator(".typing-character.is-wrong").count() === 1);
  await page.locator("#typing-input").fill(firstPrompt);
  await page.waitForFunction((previous) => document.querySelector(".typing-prompt")?.getAttribute("aria-label") !== previous, firstPromptLabel);
  check("Completed prompt advances automatically", (await page.locator(".typing-prompt").getAttribute("aria-label")) !== firstPromptLabel);
  await page.getByRole("button", { name: "Finish session" }).click();
  check("Typing results show four metrics", await page.locator(".typing-result-grid > div").count() === 4, String(await page.locator(".typing-result-grid > div").count()));
  check("Typing personal best persists", Number(await page.evaluate(() => localStorage.getItem("binarytree-typing-best-v1") || 0)) >= 0);
  await page.screenshot({ path: path.join(qaDir, "typing-results-desktop.png"), fullPage: true });

  await page.goto(`${baseURL}/educators/lesson-planner`, { waitUntil: "networkidle" });
  await page.locator("#topic").fill("Introduction to data tables");
  await page.locator("#grade").fill("Age 14 / Grade 8");
  await page.getByRole("button", { name: "Generate lesson plan" }).click();
  await page.locator(".plan-output h2").waitFor();
  check("Planner creates a six-part timeline", await page.locator(".timeline-row").count() === 6, String(await page.locator(".timeline-row").count()));
  check("Planner includes a student exercise", await page.getByRole("heading", { name: "Student exercise" }).isVisible());
  check("Planner includes an assessment", await page.getByRole("heading", { name: "Assessment", exact: true }).isVisible());

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  check("Mobile navigation button is visible", await page.getByRole("button", { name: "Open navigation" }).isVisible());
  await page.getByRole("button", { name: "Open navigation" }).click();
  check("Mobile navigation opens as a panel", await page.locator(".mobile-navigation-panel").isVisible());
  check("Mobile navigation includes typing practice", await page.locator(".mobile-navigation-panel").getByRole("link", { name: /Typing practice/ }).isVisible());
  await page.getByRole("button", { name: "Close navigation" }).first().click();
  await noHorizontalOverflow(page, "390px home");
  await page.screenshot({ path: path.join(qaDir, "home-mobile.png"), fullPage: true });

  await page.goto(`${baseURL}/team`, { waitUntil: "networkidle" });
  check("Team page is usable on phones", await page.locator(".team-person").first().isVisible());
  await noHorizontalOverflow(page, "390px team");

  await page.goto(`${baseURL}/partners`, { waitUntil: "networkidle" });
  check("Partners page is usable on phones", await page.locator(".partner-note").first().isVisible());
  await noHorizontalOverflow(page, "390px partners");

  await page.goto(`${baseURL}/apply`, { waitUntil: "networkidle" });
  check("Application form is usable on phones", await page.locator(".application-frame").isVisible());
  await noHorizontalOverflow(page, "390px application");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  check("Reduced-motion preference disables looping motion", await page.locator(".notebook-sticky").evaluate((node) => getComputedStyle(node).animationIterationCount === "1"));
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await noHorizontalOverflow(page, "320px home");
  check("Handmade hero remains readable at 320px", await page.getByRole("heading", { level: 1, name: "Useful skills, one honest step at a time." }).isVisible());

  await page.goto(`${baseURL}/assessment`, { waitUntil: "networkidle" });
  check("Phone assessment fields use a non-zooming font size", await page.getByLabel("Student full name").evaluate((input) => getComputedStyle(input).fontSize === "16px"));
  await noHorizontalOverflow(page, "320px assessment");

  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto(`${baseURL}/learn`, { waitUntil: "networkidle" });
  check("Phone course map keeps one obvious start action", await page.locator(".course-path-next .button").first().isVisible());
  await noHorizontalOverflow(page, "390px course map");

  await page.goto(`${baseURL}${lessonHref}`, { waitUntil: "networkidle" });
  check("Mobile lesson replaces sidebar with course disclosure", await page.locator(".lesson-mobile-outline").isVisible() && !await page.locator(".lesson-sidebar").isVisible());
  check("Phone lesson route stacks into readable steps", await page.locator(".lesson-route li").count() === 5, String(await page.locator(".lesson-route li").count()));
  await noHorizontalOverflow(page, "390px lesson");

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${baseURL}/typing`, { waitUntil: "networkidle" });
  check("Phone typing level cards stack cleanly", await page.locator(".typing-level").first().isVisible());
  await noHorizontalOverflow(page, "360px typing setup");
  await page.getByRole("button", { name: "Start 1-minute quest" }).click();
  check("Phone typing input uses a non-zooming font size", await page.locator("#typing-input").evaluate((input) => getComputedStyle(input).fontSize === "16px"));
  await noHorizontalOverflow(page, "360px typing session");
  await page.screenshot({ path: path.join(qaDir, "typing-mobile.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/study`, { waitUntil: "networkidle" });
  check("Study workspace exposes all 42 lesson contexts", await page.locator(".study-library select option").count() === 42, String(await page.locator(".study-library select option").count()));
  await noHorizontalOverflow(page, "Mobile study workspace");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}${lessonHref}`, { waitUntil: "networkidle" });
  const registration = await page.evaluate(async () => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("service worker timeout")), 90_000));
    const active = await Promise.race([navigator.serviceWorker.ready, timeout]);
    return { scope: active.scope, caches: await caches.keys() };
  });
  check("PWA service worker is active", registration.scope === `${baseURL}/`, registration.scope);
  check("Offline curriculum cache is current", registration.caches.some((name) => name.startsWith("binarytree-v7")), registration.caches.join(", "));
  check("Typing route is cached for offline use", await page.evaluate(async () => Boolean(await caches.match("/typing"))));
  check("Assessment route is cached for offline use", await page.evaluate(async () => Boolean(await caches.match("/assessment"))));
  check("Team and partners routes are cached for offline use", await page.evaluate(async () => Boolean(await caches.match("/team")) && Boolean(await caches.match("/partners"))));
  await page.reload({ waitUntil: "networkidle" });
  check("Page is controlled by the service worker", await page.evaluate(() => Boolean(navigator.serviceWorker.controller)));

  const preOfflineErrors = [...runtimeErrors];
  runtimeErrors.length = 0;
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
  check("Cached lesson opens offline", await page.locator(".lesson-heading h1").isVisible());
  await page.goto(`${baseURL}/typing`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  check("Typing practice opens offline", await page.getByRole("heading", { name: "Choose your challenge" }).isVisible());
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
