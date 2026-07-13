import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const labRoot = resolve(siteRoot, "..");

const publicData = resolve(siteRoot, "public/data");
const publicMedia = resolve(siteRoot, "public/media/screenshots");

mkdirSync(publicData, { recursive: true });
mkdirSync(publicMedia, { recursive: true });

copyFileSync(
  resolve(labRoot, "research/projects-v0.json"),
  resolve(publicData, "projects.json"),
);

copyFileSync(
  resolve(labRoot, "media/screenshots/manifest-v0.json"),
  resolve(publicData, "screenshots.json"),
);

cpSync(resolve(labRoot, "media/screenshots"), publicMedia, {
  recursive: true,
  force: true,
});

console.log("Synced lab data and screenshots into site/public.");
