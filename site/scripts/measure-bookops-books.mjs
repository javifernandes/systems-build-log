import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const labRoot = resolve(siteRoot, "..");
const workspaceRoot = resolve(labRoot, "..");
const projectsPath = resolve(labRoot, "research/projects-v0.json");

const wordsPerMinute = 225;
const wordsPerPage = 300;

const bookConfigs = {
  progbook: {
    root: "progbook/parts",
    extensions: [".tex"],
    syntax: "latex",
  },
  "psicoanalisis-freud-laznik": {
    root: "psicoanalisis-freud-laznik/libro/bookops",
    extensions: [".md"],
    syntax: "markdown",
    numberedTopLevelOnly: true,
  },
  "ontahi-book-of-style": {
    root: "ontahi-book-of-style",
    extensions: [".md"],
    syntax: "markdown",
    numberedTopLevelOnly: true,
  },
  "ontahi-library-living-systems": {
    root: "ontahi-library/library/01-living-systems",
    extensions: [".md"],
    syntax: "markdown",
    numberedTopLevelOnly: true,
  },
};

const skipDirs = new Set([
  ".git",
  ".next",
  "assets",
  "dist",
  "figures",
  "media",
  "node_modules",
  "public",
]);

const projectsPayload = JSON.parse(readFileSync(projectsPath, "utf8"));

const collectFiles = (root, config, files = []) => {
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      if (!skipDirs.has(entry)) collectFiles(path, config, files);
      continue;
    }

    if (!stat.isFile() || !config.extensions.includes(extname(entry))) continue;

    const relativePath = relative(root, path);
    if (entry.toLowerCase() === "readme.md") continue;
    if (config.numberedTopLevelOnly && !/^\d/.test(relativePath)) continue;

    files.push(path);
  }

  return files;
};

const stripMarkdown = (text) =>
  text
    .replace(/^---[\s\S]*?---\s*/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[\s>]*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[|*_~>#=]/g, " ");

const stripLatex = (text) => {
  let output = text
    .replace(/%.*$/gm, " ")
    .replace(
      /\\begin\{(?:lstlisting|verbatim|minted)\}[\s\S]*?\\end\{(?:lstlisting|verbatim|minted)\}/g,
      " ",
    )
    .replace(/\\includegraphics(?:\[[^\]]*])?\{[^}]*}/g, " ");

  for (let index = 0; index < 6; index += 1) {
    output = output.replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*])?\{([^{}]*)}/g, " $1 ");
  }

  return output
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*])?/g, " ")
    .replace(/\\./g, " ")
    .replace(/[{}$^_~&#]/g, " ");
};

const normalizeText = (text, syntax) =>
  syntax === "latex" ? stripLatex(text) : stripMarkdown(text);

const countWords = (text) =>
  text.match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu)?.length ?? 0;

const countParts = (root, files) =>
  new Set(
    files
      .map((file) => relative(root, file).split(/[\\/]/)[0])
      .filter(Boolean),
  ).size;

const summarizeBook = (config) => {
  const root = resolve(workspaceRoot, config.root);
  const files = collectFiles(root, config).sort();
  const wordCount = files.reduce((total, file) => {
    const raw = readFileSync(file, "utf8");
    return total + countWords(normalizeText(raw, config.syntax));
  }, 0);

  return {
    parts: countParts(root, files),
    chapters: files.length,
    wordCount,
    readMinutes: Math.max(1, Math.ceil(wordCount / wordsPerMinute)),
    estimatedPages: Math.max(1, Math.ceil(wordCount / wordsPerPage)),
    sourceFiles: files.length,
  };
};

const measured = [];

for (const project of projectsPayload.projects) {
  const config = bookConfigs[project.id];
  if (!config) continue;

  project.readingSignals = summarizeBook(config);
  measured.push({
    id: project.id,
    title: project.title,
    ...project.readingSignals,
  });
}

writeFileSync(projectsPath, `${JSON.stringify(projectsPayload, null, 2)}\n`);

console.log(JSON.stringify({ measured }, null, 2));
