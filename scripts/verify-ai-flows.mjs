import path from "node:path";
import { chromium } from "playwright-core";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3001";
const browserPath = process.env.E2E_BROWSER_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const outputDir = process.env.TEMP || "C:/tmp";
const checks = [];
const errors = [];

function check(name, condition, detail = "") {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
}

async function noOverflow(page, name) {
  const sizes = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  check(`${name} has no horizontal overflow`, sizes.scroll <= sizes.client + 1, JSON.stringify(sizes));
}

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, serviceWorkers: "block" });
const page = await context.newPage();
page.setDefaultTimeout(35_000);
page.on("console", (message) => { if (message.type() === "error") errors.push(`console ${page.url()}: ${message.text()}`); });
page.on("pageerror", (error) => errors.push(`page ${page.url()}: ${error.message}`));
await context.route("https://script.google.com/**", (route) => route.fulfill({ status: 204, body: "" }));

try {
  await page.goto(`${baseURL}/learn`, { waitUntil: "networkidle" });
  check("Course page loads", await page.locator(".catalog-shell").isVisible());
  check("Global AI launcher is visible", await page.getByRole("button", { name: /Ask Binary Tree AI/ }).isVisible());
  await page.getByRole("button", { name: /Ask Binary Tree AI/ }).click();
  await page.waitForTimeout(300);
  const desktopPanelState = await page.locator(".ai-copilot").evaluate((node) => ({ className: node.className, expanded: node.querySelector(".ai-copilot-toggle")?.getAttribute("aria-expanded"), panelCount: node.querySelectorAll(".ai-copilot-panel").length, text: node.innerText.slice(0, 180) }));
  check("Desktop AI panel opens", await page.locator(".ai-copilot-panel").isVisible(), JSON.stringify(desktopPanelState));
  await page.locator("#binary-tree-ai-question").fill("I want to learn Python from the beginning");
  await page.getByRole("button", { name: "Send question" }).click();
  await page.locator(".ai-copilot-actions a").first().waitFor();
  check("Copilot returns real curriculum actions", await page.locator(".ai-copilot-actions a").count() >= 2, String(await page.locator(".ai-copilot-actions a").count()));
  check("Copilot uses live AI", await page.locator(".ai-copilot-offline").count() === 0);
  const firstHref = await page.locator(".ai-copilot-actions a").first().getAttribute("href");
  check("Copilot action is a real lesson link", firstHref?.startsWith("/learn/") === true, firstHref || "missing");
  await noOverflow(page, "Desktop copilot");
  await page.screenshot({ path: path.join(outputDir, "binary-tree-ai-desktop.png") });

  const copilotAPI = await page.request.post(`${baseURL}/api/ai/copilot`, { data: { question: "Where should a complete beginner start?", pathname: "/learn" } });
  const copilotData = await copilotAPI.json();
  check("Copilot API returns live Groq", copilotAPI.ok() && copilotData.provider === "groq" && copilotData.offline === false, JSON.stringify(copilotData).slice(0, 300));

  await page.goto(`${baseURL}/assessment`, { waitUntil: "networkidle" });
  await page.getByLabel("Student full name").fill("QA Learner");
  await page.getByLabel("Cohort ID or class name").fill("AI Flow Check");
  await page.getByLabel("Assessment stage").selectOption("Pre");
  for (const fieldset of await page.locator(".assessment-question").all()) await fieldset.locator("label").first().click();
  await page.getByPlaceholder(/I want to feel confident/).fill("I want to learn practical computer skills for work.");
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await page.locator(".assessment-ai-content h2").waitFor();
  check("Assessment shows the score", (await page.locator(".assessment-score-orb").innerText()).includes("out of 8"));
  check("Assessment creates three AI course recommendations", await page.locator(".assessment-recommendations a").count() === 3, String(await page.locator(".assessment-recommendations a").count()));
  check("Assessment explains its AI privacy boundary", (await page.locator(".assessment-ai-privacy").innerText()).includes("name and cohort are never sent"));
  await page.screenshot({ path: path.join(outputDir, "binary-tree-assessment-ai.png"), fullPage: true });

  await page.goto(`${baseURL}/typing`, { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: /Easy/ }).click();
  await page.getByRole("button", { name: "Start 1-minute quest" }).click();
  await page.locator("#typing-input").fill("sad");
  await page.getByRole("button", { name: "Finish session" }).click();
  await page.locator(".typing-ai-coach-heading strong").filter({ hasNotText: "Reading your session" }).waitFor();
  check("Typing results include an AI coach", await page.locator(".typing-ai-coach").isVisible());
  check("Typing coach gives three next steps", await page.locator(".typing-ai-coach li").count() === 3, String(await page.locator(".typing-ai-coach li").count()));
  check("Typing coach offers a next level action", await page.locator(".typing-coach-level").isVisible());
  await page.screenshot({ path: path.join(outputDir, "binary-tree-typing-ai.png"), fullPage: true });

  const typingAPI = await page.request.post(`${baseURL}/api/ai/coach`, { data: { type: "typing", result: { wpm: 24, rawWpm: 27, accuracy: 94, mistakes: 4, words: 20, level: "easy" } } });
  const typingData = await typingAPI.json();
  check("Typing coach API returns live Groq", typingAPI.ok() && typingData.provider === "groq" && typingData.offline === false, JSON.stringify(typingData).slice(0, 300));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/learn`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Ask Binary Tree AI/ }).click();
  check("Phone AI panel opens", await page.locator(".ai-copilot-panel").isVisible());
  const panel = await page.locator(".ai-copilot-panel").boundingBox();
  check("Phone AI panel stays inside viewport", panel && panel.x >= 0 && panel.x + panel.width <= 390 && panel.y >= 0 && panel.y + panel.height <= 844, JSON.stringify(panel));
  await noOverflow(page, "Phone copilot");
  await page.screenshot({ path: path.join(outputDir, "binary-tree-ai-mobile.png") });
  await page.getByRole("button", { name: "Close AI guide" }).last().click();
  await page.getByRole("button", { name: "Open navigation" }).click();
  const layers = await page.evaluate(() => ({ menu: Number(getComputedStyle(document.querySelector(".mobile-navigation-panel")).zIndex), ai: Number(getComputedStyle(document.querySelector(".ai-copilot")).zIndex) }));
  check("Mobile navigation stays above AI launcher", layers.menu > layers.ai, JSON.stringify(layers));

  check("No browser runtime errors", errors.length === 0, errors.join(" | "));
  console.log(JSON.stringify({ passed: checks.length, checks, screenshots: outputDir }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed: checks.filter((item) => item.passed).length, failed: error.message, checks, errors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}