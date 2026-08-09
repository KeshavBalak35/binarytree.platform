import fs from "node:fs";
import { chromium } from "playwright-core";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3211";
const executablePath = [process.env.E2E_BROWSER_PATH,"C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].filter(Boolean).find(fs.existsSync);
if (!executablePath) throw new Error("Chrome or Edge is required.");
const checks = [];
function check(name, value, detail="") { checks.push({ name, passed:Boolean(value), detail }); if (!value) throw new Error(`${name}${detail ? `: ${detail}` : ""}`); }
async function noOverflow(page,name){const value=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));check(name,value.scroll<=value.client+1,JSON.stringify(value));}
const browser = await chromium.launch({ executablePath, headless:true });
const context = await browser.newContext({ viewport:{ width:1440,height:960 }, serviceWorkers:"block" });
const page = await context.newPage(); page.setDefaultTimeout(30000);
await context.route("https://www.googletagmanager.com/**",route=>route.fulfill({status:200,body:""}));
await context.route("https://www.google-analytics.com/**",route=>route.fulfill({status:204,body:""}));
try {
  await page.goto(baseURL+"/",{waitUntil:"networkidle"});
  check("Home has one clear assessment CTA",await page.getByRole("link",{name:/Take the starting assessment/}).isVisible());
  check("Home explains three steps",await page.locator(".guided-step-grid > li").count()===3);
  check("Assessment is far-left desktop action",await page.locator(".header-inner > a").first().getAttribute("href")==="/assessment");
  check("Desktop primary navigation is compact",await page.locator(".desktop-nav > a").count()===4);
  await noOverflow(page,"Desktop home has no overflow");

  await page.goto(baseURL+"/tree-path",{waitUntil:"networkidle"});
  check("TreePath renders all prerequisite nodes",await page.locator(".treepath-node").count()===35);
  check("TreePath renders five tiers",await page.locator(".treepath-tier").count()===5);
  check("First root is ready",(await page.locator('[data-node="0.1"] .treepath-node-status').innerText()).includes("READY"));
  check("Second root starts locked",(await page.locator('[data-node="0.2"] .treepath-node-status').innerText()).includes("LOCKED"));
  await page.locator('[data-node="4.5"]').focus();
  await page.waitForTimeout(100);
  const pathCount = await page.locator(".treepath-node.is-path").count();
  check("Focus highlights prerequisite ancestry", pathCount > 4, String(pathCount));
  await noOverflow(page,"Desktop TreePath has no overflow");

  await page.goto(baseURL+"/learn/senegal-01-computer-skills",{waitUntil:"networkidle"});
  check("Direct lesson URL respects prerequisites",await page.getByRole("heading",{name:"This lesson comes later."}).isVisible());
  await page.evaluate(()=>localStorage.setItem("binarytree-placement-v1",JSON.stringify({percent:85,score:14,total:16})));
  await page.goto(baseURL+"/tree-path",{waitUntil:"networkidle"});
  check("Placement bypasses roots",await page.locator('.treepath-node-status').filter({hasText:"Placed out"}).count()===5);
  check("Trunk entry unlocks after placement",(await page.locator('[data-node="1.1"] .treepath-node-status').innerText()).includes("READY"));

  await page.goto(baseURL+"/learn/professional-01-resumes-and-email",{waitUntil:"networkidle"});
  check("Later trunk lesson remains locked",await page.locator(".prerequisite-card").isVisible());
  await page.evaluate(()=>localStorage.setItem("binarytree-progress-v3",JSON.stringify({version:3,lessons:{"professional-03-google-workspace":{completed:true},"data-01-office-data-toolkit":{completed:true}}})));
  await page.reload({waitUntil:"networkidle"});
  check("Completing prerequisite nodes unlocks lesson",await page.locator(".lesson-experience,.lesson-page,.lesson-shell").count()>0 || !(await page.locator(".prerequisite-card").count()));

  await page.goto(baseURL+"/learn",{waitUntil:"networkidle"});
  check("Course library uses compact cards",await page.locator(".compact-course-card").count()===7);
  check("Course library points uncertain learners to TreePath",await page.getByRole("link",{name:/Open TreePath/}).isVisible());
  await noOverflow(page,"Desktop course library has no overflow");

  await page.setViewportSize({width:390,height:844});
  await page.goto(baseURL+"/tree-path",{waitUntil:"networkidle"});
  await noOverflow(page,"Phone TreePath has no overflow");
  await page.getByRole("button",{name:"Open navigation"}).click();
  const firstGroup=page.locator(".mobile-navigation-group").first();
  check("Phone menu starts with assessment",await firstGroup.locator("a").nth(0).getAttribute("href")==="/assessment");
  check("Phone menu puts TreePath second",await firstGroup.locator("a").nth(1).getAttribute("href")==="/tree-path");
  check("Phone menu fits viewport",await page.locator(".mobile-navigation-panel").evaluate(node=>node.getBoundingClientRect().width<=document.documentElement.clientWidth));
  console.log(JSON.stringify({passed:checks.length,checks},null,2));
} catch(error){console.error(JSON.stringify({passed:checks.filter(item=>item.passed).length,failed:error.message,checks},null,2));process.exitCode=1;} finally {await browser.close();}



