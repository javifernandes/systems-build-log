import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const outputDir = resolve(siteRoot, "verification");
const url = process.env.VERIFY_URL ?? "http://127.0.0.1:5174/";

const requireFromSite = createRequire(resolve(siteRoot, "package.json"));
let chromium;

try {
  chromium = requireFromSite("playwright").chromium;
} catch {
  const requireFromBookOps = createRequire(
    "/Users/jfernandes/dev/personal/bookops/bookops/web/package.json",
  );
  chromium = requireFromBookOps("playwright").chromium;
}

mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();
const consoleMessages = [];

async function verifyViewport(name, viewport) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
  });

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push(`${name} ${message.type()}: ${message.text()}`);
    }
  });

  await page.goto(url, { waitUntil: "networkidle" });

  const result = await page.evaluate(() => {
    const bodyText = document.body.innerText.trim();
    const overlay = document.querySelector(
      ".vite-error-overlay, [data-nextjs-dialog], #webpack-dev-server-client-overlay",
    );
    return {
      title: document.title,
      bodyLength: bodyText.length,
      hasTitle:
        bodyText.includes("System Design") ||
        bodyText.includes("Diseño de sistemas") ||
        bodyText.includes("Verifiable map") ||
        bodyText.includes("Mapa verificable"),
      hasTimeline:
        bodyText.includes("The Mechanics of Thoughts") &&
        bodyText.includes("BookOps"),
      hasAtlas: bodyText.includes("Workstream Atlas"),
      hasScreenshots: document.querySelectorAll("img").length,
      hasErrorOverlay: Boolean(overlay),
    };
  });

  const screenshot = resolve(outputDir, `${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await page.close();

  return { name, screenshot, ...result };
}

const results = [
  await verifyViewport("desktop", { width: 1440, height: 1000 }),
  await verifyViewport("mobile", { width: 390, height: 900 }),
];

await browser.close();

const result = results[0];

console.log(
  JSON.stringify(
    {
      url,
      consoleMessages,
      results,
    },
    null,
    2,
  ),
);

if (
  results.some(
    (viewportResult) =>
      viewportResult.bodyLength === 0 ||
      !viewportResult.hasTitle ||
      !viewportResult.hasTimeline ||
      viewportResult.hasErrorOverlay,
  ) ||
  consoleMessages.some((message) => message.includes(" error:"))
) {
  process.exit(1);
}
