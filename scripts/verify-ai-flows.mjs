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
  check("Copilot returns real curriculum actions", await page.locator(".ai-copilot-actions a").count() >= 1, String(await page.locator(".ai-copilot-actions a").count()));
  check("Copilot uses live AI", await page.locator(".ai-copilot-offline").count() === 0);
  const firstHref = await page.locator(".ai-copilot-actions a").first().getAttribute("href");
  check("Copilot action is a real lesson link", firstHref?.startsWith("/learn/") === true, firstHref || "missing");
  await noOverflow(page, "Desktop copilot");
  await page.screenshot({ path: path.join(outputDir, "binary-tree-ai-desktop.png") });

  await page.goto(`${baseURL}/team`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Ask Binary Tree AI/ }).click();
  await page.locator("#binary-tree-ai-question").fill("Wait, on this team page, who is Abhijay Gangarapu? Is he smart?");
  const teamResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/ai/copilot") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Send question" }).click();
  const teamPayload = await (await teamResponsePromise).json();
  check("Team question is answered by Groq", teamPayload.provider === "groq" && Boolean(teamPayload.model), JSON.stringify(teamPayload).slice(0, 300));
  await page.locator(".ai-copilot-message:not(.is-user)").nth(1).waitFor();
  const teamAnswer = await page.locator(".ai-copilot-message:not(.is-user)").nth(1).innerText();
  check("Team answer identifies Abhijay's complete role", teamAnswer.includes("Director of AI, Open Source and Hackathons"), teamAnswer);
  check("Team answer addresses the subjective question honestly", /smart/i.test(teamAnswer) && /(not enough evidence|cannot judge|can't judge|can’t say|does not provide (?:enough|any) (?:evidence|information)|not possible to judge)/i.test(teamAnswer), teamAnswer);
  check("Direct team answer does not add irrelevant cards", await page.locator(".ai-copilot-actions a").count() === 0, String(await page.locator(".ai-copilot-actions a").count()));
  check("Published team facts do not fall back to an offline label", await page.locator(".ai-copilot-offline").count() === 0);

  await page.locator("#binary-tree-ai-question").fill("besies binary tree waht is he");
  const followUpResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/ai/copilot") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Send question" }).click();
  const followUpPayload = await (await followUpResponsePromise).json();
  await page.locator(".ai-copilot-message:not(.is-user)").nth(2).waitFor();
  const followUpAnswer = await page.locator(".ai-copilot-message:not(.is-user)").nth(2).innerText();
  check("Misspelled follow-up is answered by a live model", followUpPayload.provider === "groq" && Boolean(followUpPayload.model), JSON.stringify(followUpPayload).slice(0, 300));
  check("Follow-up uses conversation context", /Abhijay/i.test(followUpAnswer) && /(outside|besides|other|does not provide|no information)/i.test(followUpAnswer), followUpAnswer);
  check("Follow-up does not return generic guidance cards", await page.locator(".ai-copilot-actions a").count() === 0, String(await page.locator(".ai-copilot-actions a").count()));

  await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Ask Binary Tree AI/ }).click();
  await page.locator("#binary-tree-ai-question").fill("teach me calculus");
  const calculusResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/ai/copilot") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Send question" }).click();
  const calculusPayload = await (await calculusResponsePromise).json();
  await page.locator(".ai-copilot-message:not(.is-user)").nth(1).waitFor();
  const calculusAnswer = await page.locator(".ai-copilot-message:not(.is-user)").nth(1).innerText();
  check("Open-ended teaching is answered by a live model", calculusPayload.provider === "groq" && Boolean(calculusPayload.model), JSON.stringify(calculusPayload).slice(0, 300));
  check("Calculus request receives a substantive lesson", /calculus/i.test(calculusAnswer) && /(derivative|differential)/i.test(calculusAnswer) && /(integral|accumulation)/i.test(calculusAnswer), calculusAnswer);
  check("Calculus request is not the generic site fallback", !/I can explain this page, find a course/i.test(calculusAnswer), calculusAnswer);

  await page.goto(`${baseURL}/assessment`, { waitUntil: "networkidle" });
  await page.getByLabel("Student full name").fill("QA Learner");
  await page.getByLabel("Cohort ID or class name").fill("AI Flow Check");
  await page.getByLabel("Assessment stage").selectOption("Pre");
  for (const fieldset of await page.locator(".assessment-question").all()) await fieldset.locator("label").first().click();
  await page.getByPlaceholder(/I want to feel confident/).fill("I want to learn practical computer skills for work.");
  const assessmentResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/ai/coach") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Submit assessment" }).click();
  const assessmentPayload = await (await assessmentResponsePromise).json();
  check("Assessment plan uses live Groq", assessmentPayload.provider === "groq" && assessmentPayload.offline === false, JSON.stringify(assessmentPayload).slice(0, 300));
  await page.locator(".assessment-ai-content h2").waitFor();
  check("Assessment shows the score", (await page.locator(".assessment-score-orb").innerText()).includes("out of 8"));
  check("Assessment creates three AI course recommendations", await page.locator(".assessment-recommendations a").count() === 3, String(await page.locator(".assessment-recommendations a").count()));
  check("Assessment explains its AI privacy boundary", (await page.locator(".assessment-ai-privacy").innerText()).includes("name and cohort are never sent"));
  await page.screenshot({ path: path.join(outputDir, "binary-tree-assessment-ai.png"), fullPage: true });

  await page.goto(`${baseURL}/typing`, { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: /Easy/ }).click();
  await page.getByRole("button", { name: "Start 1-minute quest" }).click();
  await page.locator("#typing-input").fill("sad");
  const typingResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/ai/coach") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Finish session" }).click();
  const typingPayload = await (await typingResponsePromise).json();
  check("Typing results use live Groq", typingPayload.provider === "groq" && typingPayload.offline === false, JSON.stringify(typingPayload).slice(0, 300));
  await page.locator(".typing-ai-coach-heading strong").filter({ hasNotText: "Reading your session" }).waitFor();
  check("Typing results include an AI coach", await page.locator(".typing-ai-coach").isVisible());
  check("Typing coach gives three next steps", await page.locator(".typing-ai-coach li").count() === 3, String(await page.locator(".typing-ai-coach li").count()));
  check("Typing coach offers a next level action", await page.locator(".typing-coach-level").isVisible());
  await page.screenshot({ path: path.join(outputDir, "binary-tree-typing-ai.png"), fullPage: true });


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