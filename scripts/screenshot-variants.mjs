// Generates screenshots of the Nano GPT model-selector design variants.
// Requires Playwright locally (not a project dependency):
//   npm i -D playwright && npx playwright install chromium
// Then, with the dev server running (npm run dev):
//   node scripts/screenshot-variants.mjs
import { chromium } from "playwright";

const OUT_DIR = "design-screenshots";
const URL = "http://localhost:4321/design-demo";

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1100, height: 900 },
	deviceScaleFactor: 2,
});

await page.goto(URL, { waitUntil: "networkidle" });
// Wait for React hydration to render the variants.
await page.waitForSelector("section", { timeout: 15000 });
await page.waitForTimeout(500);

await page.screenshot({ path: `${OUT_DIR}/all-variants.png`, fullPage: true });

const sections = await page.$$("section");
for (let i = 0; i < sections.length; i++) {
	await sections[i].screenshot({ path: `${OUT_DIR}/design-${i + 1}.png` });
}

console.log(`Captured ${sections.length} variants + full page.`);
await browser.close();
