export type SignalValue = number | string | string[];

export type Project = {
  id: string;
  title: string;
  kind: string;
  localPath?: string;
  repo?: string;
  publicUrl?: string;
  source?: string;
  firstCommit?: string;
  latestCommit?: string;
  firstObservedCommit?: string;
  currentBranchLatest?: string;
  observedDate?: string;
  commitCount?: number;
  activeMonths?: string[];
  trackedFiles?: number;
  approxTextLines?: number;
  pitch: string;
  media?: string[];
  mediaNeeded?: string[];
  stackSignals?: string[];
  lineage?: string[];
  workspacePackages?: string[];
  packageExtractionCommits?: string[];
  atlasItems?: number;
  verificationStatus?: string;
  dataSignals?: Record<string, SignalValue>;
  internalSignals?: Record<string, SignalValue>;
  readingSignals?: Record<string, SignalValue>;
};

export type ProjectsPayload = {
  generatedAt: string;
  projects: Project[];
  llmProductionLayer?: {
    providerJourney?: string[];
    spendNotes?: string[];
    workMode?: string;
  };
};

export type Screenshot = {
  id: string;
  path: string;
  projectId: string;
  title: string;
  mode: "light" | "dark" | string;
  kind: string;
  notes: string;
};

export type ScreenshotManifest = {
  generatedAt: string;
  screenshots: Screenshot[];
};

export type LabData = {
  projectsPayload: ProjectsPayload;
  screenshotManifest: ScreenshotManifest;
};

const withBase = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const publicAssetPath = (path: string) => {
  const normalized = path.replace(
    /^ai-build-log-lab\/media\/screenshots\//,
    "media/screenshots/",
  );

  return withBase(normalized);
};

export const loadLabData = async (): Promise<LabData> => {
  const [projectsResponse, screenshotResponse] = await Promise.all([
    fetch(withBase("data/projects.json")),
    fetch(withBase("data/screenshots.json")),
  ]);

  if (!projectsResponse.ok || !screenshotResponse.ok) {
    throw new Error("Could not load lab data.");
  }

  const [projectsPayload, screenshotManifest] = await Promise.all([
    projectsResponse.json() as Promise<ProjectsPayload>,
    screenshotResponse.json() as Promise<ScreenshotManifest>,
  ]);

  return { projectsPayload, screenshotManifest };
};

const datePattern = /\d{4}-\d{2}-\d{2}/;

export const projectDate = (project: Project) => {
  const candidates = [
    project.firstCommit,
    project.firstObservedCommit,
    project.observedDate,
    project.currentBranchLatest,
    project.latestCommit,
  ];

  for (const candidate of candidates) {
    const match = candidate?.match(datePattern);
    if (match) return match[0];
  }

  if (project.activeMonths?.[0]) return `${project.activeMonths[0]}-01`;
  return "2026-01-01";
};

export const dateLabel = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

export const monthLabel = (isoDate: string, locale = "es") => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "es" ? "es" : "en", {
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .replace(".", "");
};

export const formatNumber = (value: number, locale = "es-AR") =>
  new Intl.NumberFormat(locale).format(value);

export const formatSignalValue = (value: SignalValue, locale = "es-AR") => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return formatNumber(value, locale);
  return value;
};
