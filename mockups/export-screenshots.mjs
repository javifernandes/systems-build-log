import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.join(__dirname, "index.html");
const exportDir = path.join(__dirname, "exports");
const requireFromBookOps = createRequire(
  "/Users/jfernandes/dev/personal/bookops/bookops/web/package.json",
);
const { chromium } = requireFromBookOps("playwright");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 }, deviceScaleFactor: 1 });
await page.goto(`file://${pagePath}`);

for (const id of ["sheet-map", "sheet-log", "sheet-case"]) {
  const element = page.locator(`#${id}`);
  await element.screenshot({ path: path.join(exportDir, `${id}.png`) });
}

await browser.close();
