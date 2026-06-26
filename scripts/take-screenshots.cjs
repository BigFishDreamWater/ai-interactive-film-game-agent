const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const OUT = path.join(__dirname, "..", "public", "screenshots");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function clickByText(page, tag, text) {
  const handle = await page.evaluateHandle(
    (tag, text) => {
      const els = Array.from(document.querySelectorAll(tag));
      return els.find((el) => el.textContent && el.textContent.trim().includes(text)) || null;
    },
    tag,
    text
  );
  const el = handle.asElement();
  if (el) {
    await el.click();
    return true;
  }
  return false;
}

async function getHrefByText(page, text) {
  return page.evaluate((text) => {
    const links = Array.from(document.querySelectorAll("a"));
    const found = links.find((a) => a.textContent && a.textContent.includes(text));
    return found ? found.getAttribute("href") : null;
  }, text);
}

async function run() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Empty workspace — wait for h1 to ensure React hydration
  console.log("1. Loading workspace (empty state)...");
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("h1", { timeout: 30000 });
  await sleep(3000); // extra time for CSS + hydration
  await page.screenshot({ path: path.join(OUT, "workspace-empty.png"), fullPage: false });
  console.log("   -> workspace-empty.png");

  // 2. Create project
  console.log("2. Creating project...");
  await clickByText(page, "button", "Create Project");
  await page.waitForSelector(".chat-bubble", { timeout: 15000 });
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, "workspace-created.png"), fullPage: false });
  console.log("   -> workspace-created.png");

  // 3. Run Pi Agent
  console.log("3. Running Pi Agent...");
  await clickByText(page, "button", "Run Pi Agent");

  let generated = false;
  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    const href = await getHrefByText(page, "Play in Browser");
    if (href) {
      generated = true;
      break;
    }
  }
  console.log(generated ? "   Generation complete." : "   (timeout, screenshot anyway)");
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, "workspace-generated.png"), fullPage: true });
  console.log("   -> workspace-generated.png");

  // 4. Play page
  console.log("4. Loading play page...");
  const playHref = await getHrefByText(page, "Play in Browser");
  if (playHref) {
    await page.goto(`${BASE}${playHref}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector("h1", { timeout: 15000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT, "play-page.png"), fullPage: false });
    console.log("   -> play-page.png");
  } else {
    console.log("   (Play link not found, skipping)");
  }

  await browser.close();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Screenshot error:", err.message);
  process.exit(1);
});
