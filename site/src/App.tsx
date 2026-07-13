import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatNumber,
  formatSignalValue,
  loadLabData,
  monthLabel,
  projectDate,
  publicAssetPath,
} from "./data";
import type { LabData, Project, Screenshot, SignalValue } from "./data";

const repoHref = (repo?: string) => {
  if (!repo) return undefined;
  if (repo.startsWith("http")) return repo;
  if (repo.startsWith("git@github.com:")) {
    return `https://github.com/${repo
      .replace("git@github.com:", "")
      .replace(/\.git$/, "")}`;
  }
  return undefined;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sortByDate = (projects: Project[]) =>
  [...projects].sort((a, b) => {
    const byDate = projectDate(a).localeCompare(projectDate(b));
    if (byDate !== 0) return byDate;

    const tieBreak: Record<string, number> = {
      ontahi: 0,
      "ontahi-book-of-style": 1,
    };

    return (tieBreak[a.id] ?? 10) - (tieBreak[b.id] ?? 10);
  });

type Locale = "en" | "es";

const localeStorageKey = "ai-build-log-locale";

const detectInitialLocale = (): Locale => {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(localeStorageKey);
  if (stored === "en" || stored === "es") return stored;

  return window.navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
};

const numberLocale = (locale: Locale) => (locale === "es" ? "es-AR" : "en-US");

const t = {
  en: {
    kicker: "Exploratory systems design / January to July 2026",
    title: "Verifiable map of AI-built systems",
    lead: "Real needs, running tools, repos, commits, screenshots, and architecture decisions in one navigable surface.",
    seeProjects: "See Projects",
    externalProfiles: "External profiles",
    githubProfile: "Javier Fernandes on GitHub",
    linkedInProfile: "Javier Fernandes on LinkedIn",
    summary: "Quantitative summary",
    map: "Map and evidence",
    timeline: "Timeline",
    detail: "Selected project detail",
    stack: "Stack",
    openSite: "Open site",
    repository: "Repository",
    nextEvidence: "Next evidence",
    visualEvidence: "Visual evidence",
    previousShot: "Previous screenshot",
    nextShot: "Next screenshot",
    pendingShot: "Screenshot pending",
    pendingEvidence: "Evidence pending",
    metrics: "Project metrics",
    loadingTitle: "Loading projects...",
    loadingSubtitle: "Preparing the build map and visual evidence.",
    loadingImage: "Loading preview",
    errorTitle: "Could not load the lab",
    language: "Language",
    zoom: "Zoom",
    close: "Close",
    previous: "Previous",
    next: "Next",
    totals: {
      atlas: "atlas",
      commits: "commits",
      lines: "lines",
      plans: "plans",
      projects: "projects",
      screenshots: "screenshots",
    },
    kinds: {
      book: "book",
      essay: "essay",
      framework: "framework",
      system: "system",
      tooling: "tooling",
    },
    signals: {
      archivos: "files",
      atlas: "atlas",
      atlasItems: "atlas items",
      chapters: "chapters",
      commits: "commits",
      estimatedPages: "pages",
      generatedBooks: "generated books",
      lineas: "lines",
      parts: "parts",
      planFiles: "plans",
      questions: "questions",
      readMinutes: "reading",
      readingItems: "readings",
      sourceFiles: "source files",
      sources: "sources",
      topics: "topics",
      wordCount: "words",
      workspacePackages: "packages",
    },
  },
  es: {
    kicker: "Diseno exploratorio de sistemas / Enero a Julio 2026",
    title: "Mapa verificable de sistemas construidos con IA",
    lead: "Necesidades reales, herramientas andando, repos, commits, capturas y decisiones de arquitectura en una sola superficie navegable.",
    seeProjects: "Ver proyectos",
    externalProfiles: "Perfiles externos",
    githubProfile: "GitHub de Javier Fernandes",
    linkedInProfile: "LinkedIn de Javier Fernandes",
    summary: "Resumen cuantitativo",
    map: "Mapa y evidencia",
    timeline: "Linea de tiempo",
    detail: "Detalle del proyecto seleccionado",
    stack: "Stack",
    openSite: "Abrir sitio",
    repository: "Repositorio",
    nextEvidence: "Proximas evidencias",
    visualEvidence: "Evidencia visual",
    previousShot: "Captura anterior",
    nextShot: "Captura siguiente",
    pendingShot: "Captura pendiente",
    pendingEvidence: "Evidencia pendiente",
    metrics: "Metricas del proyecto",
    loadingTitle: "Cargando proyectos...",
    loadingSubtitle: "Preparando el mapa y la evidencia visual.",
    loadingImage: "Cargando vista",
    errorTitle: "No pude cargar el lab",
    language: "Idioma",
    zoom: "Zoom",
    close: "Cerrar",
    previous: "Anterior",
    next: "Siguiente",
    totals: {
      atlas: "atlas",
      commits: "commits",
      lines: "lineas",
      plans: "planes",
      projects: "proyectos",
      screenshots: "screenshots",
    },
    kinds: {
      book: "book",
      essay: "essay",
      framework: "framework",
      system: "system",
      tooling: "tooling",
    },
    signals: {
      archivos: "archivos",
      atlas: "atlas",
      atlasItems: "items atlas",
      chapters: "capitulos",
      commits: "commits",
      estimatedPages: "paginas",
      generatedBooks: "libros generados",
      lineas: "lineas",
      parts: "partes",
      planFiles: "planes",
      questions: "preguntas",
      readMinutes: "lectura",
      readingItems: "lecturas",
      sourceFiles: "archivos fuente",
      sources: "fuentes",
      topics: "temas",
      wordCount: "palabras",
      workspacePackages: "paquetes",
    },
  },
} as const;

const englishPitches: Record<string, string> = {
  atlas:
    "Markdown-first semantic map born from meta-analyzing, exploring, and formalizing how BookOps and Ontahi were being developed. It extends spec-driven development into a living frame for plans, evidence, and decisions where issue trackers, skills, and current CLIs did not quite fit.",
  bookops:
    "Publishing and feedback system for living books: extraction, interactive reading, conversations, sharing, reading tracking, audio, operations, and synchronization.",
  "freud-reading-board-2do-parcial":
    "GitHub Pages Kanban board for the second Freud partial: readings, progress, photocopy packets, course guides, repeated blocks, and textual audit cases.",
  "neuro-mcq":
    "Simple HTML simulator for multiple choice practice, topic recombination, JSON question banks, and localStorage progress.",
  ontahi:
    "Framework born from the need to improve BookOps architecture and from years of practical experience developing, researching, and teaching systems. It models entities, operations, runtimes, data, refs, cache, reflective execution, and durable operations; it is the core on which the other systems may be rebuilt.",
  "ontahi-book-of-style":
    "BookOps book that specifies Ontahi visual language and UX while pushing BookOps itself to support custom reading experiences.",
  "ontahi-library-living-systems":
    "BookOps essay on systems and architecture through organic, biological, neural, anatomical, and psychoanalytic lenses.",
  "progbook":
    "Book on programming fundamentals that sparked the need to ideate BookOps. Published as the first BookOps book, it opens prototypes for learning books with dynamic exercises generated and corrected by people or specialized LLMs, plus examples tailored to the reader's preferences or domains.",
  "psicoanalisis-freud-laznik":
    "BookOps study book that integrates class notes, bibliography, guides, and exam material to organize Freud by stages and conceptual problems while exercising the reading system itself.",
  "shiki-lang-wollok":
    "Small but working plugin that lets BookOps render Wollok code with Shiki highlighting.",
  "uba-psi-scheduler":
    "Calendar-style decision surface for Psychology UBA course registration: seats, venues, conflicts, block grouping, and vacancy analytics.",
};

const externalTermLinks = new Map([
  ["AI SDK", "https://ai-sdk.dev/"],
  ["Axiom / OpenTelemetry", "https://axiom.co/"],
  ["Chromatic", "https://www.chromatic.com/"],
  ["Clerk", "https://clerk.com/"],
  ["Cloudflare Workers", "https://workers.cloudflare.com/"],
  ["Codecov", "https://about.codecov.io/"],
  ["Convex", "https://www.convex.dev/"],
  ["ECharts", "https://echarts.apache.org/"],
  ["Effect", "https://effect.website/"],
  ["GitHub Actions", "https://github.com/features/actions"],
  ["GitHub Pages", "https://pages.github.com/"],
  ["JSON data", "https://www.json.org/json-en.html"],
  ["LaTeX", "https://www.latex-project.org/"],
  ["localStorage", "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"],
  ["Next.js", "https://nextjs.org/"],
  ["next-safe-action", "https://next-safe-action.dev/"],
  ["OpenNext", "https://opennext.js.org/"],
  ["Playwright", "https://playwright.dev/"],
  ["PostHog", "https://posthog.com/"],
  ["Resend", "https://resend.com/"],
  ["Sentry", "https://sentry.io/"],
  ["Shepherd.js", "https://shepherdjs.dev/"],
  ["SonarCloud", "https://www.sonarsource.com/products/sonarcloud/"],
  ["static HTML", "https://developer.mozilla.org/en-US/docs/Web/HTML"],
  ["Statsig / feature flags", "https://www.statsig.com/"],
  ["Storybook", "https://storybook.js.org/"],
  ["Supabase", "https://supabase.com/"],
  ["Supabase Auth", "https://supabase.com/auth"],
  ["Vercel", "https://vercel.com/"],
  ["Vercel Workflow", "https://vercel.com/docs/workflow"],
  ["Vite", "https://vite.dev/"],
  ["Vitest", "https://vitest.dev/"],
  ["Wollok", "https://www.wollok.org/"],
]);

const shortDateLabel = (isoDate: string) => {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
};

const formatCount = (value: number, locale: Locale) =>
  formatNumber(value, numberLocale(locale));

const primaryMetric = (project: Project, locale: Locale) => {
  if (project.commitCount) return `${formatCount(project.commitCount, locale)} commits`;
  if (project.atlasItems) return `${formatCount(project.atlasItems, locale)} items`;
  if (typeof project.dataSignals?.questions === "number") {
    return `${formatCount(project.dataSignals.questions, locale)} ${
      locale === "es" ? "preguntas" : "questions"
    }`;
  }
  if (project.approxTextLines) {
    return `${formatCount(project.approxTextLines, locale)} ${
      locale === "es" ? "lineas" : "lines"
    }`;
  }
  return project.kind;
};

const projectKind = (project: Project): keyof (typeof t)["en"]["kinds"] => {
  if (
    project.kind === "book" ||
    project.kind === "essay" ||
    project.kind === "framework" ||
    project.kind === "system" ||
    project.kind === "tooling"
  ) {
    return project.kind;
  }

  return "system";
};

const projectKindLabel = (project: Project, locale: Locale) =>
  t[locale].kinds[projectKind(project)];

const projectPitch = (project: Project, locale: Locale) =>
  locale === "en" ? englishPitches[project.id] ?? project.pitch : project.pitch;

const signalLabel = (key: string, locale: Locale) =>
  t[locale].signals[key as keyof (typeof t)["en"]["signals"]] ??
    key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[-_]+/g, " ")
      .toLowerCase();

const formatReadTime = (minutes: number, locale: Locale) => {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0
    ? `${hours} h`
    : `${hours} h ${remainingMinutes} min`;
};

const signalValue = (key: string, value: SignalValue, locale: Locale) => {
  if (key === "readMinutes" && typeof value === "number") {
    return formatReadTime(value, locale);
  }
  return formatSignalValue(value, numberLocale(locale));
};

type ProjectSignal = {
  group: "reading" | "repo" | "data";
  label: string;
  startsGroup?: boolean;
  value: string;
};

const pushSignal = (
  signals: ProjectSignal[],
  group: ProjectSignal["group"],
  label: string,
  value: SignalValue | undefined,
  locale: Locale,
) => {
  if (value === undefined) return;
  signals.push({
    group,
    label: signalLabel(label, locale),
    value: signalValue(label, value, locale),
  });
};

const projectSignals = (project: Project, locale: Locale) => {
  const contentSignals: ProjectSignal[] = [];
  const repoSignals: ProjectSignal[] = [];

  const reading = project.readingSignals ?? {};
  const hasReadingSignals = Object.keys(reading).length > 0;

  for (const key of ["parts", "chapters", "estimatedPages"]) {
    pushSignal(contentSignals, "reading", key, reading[key], locale);
  }

  if (hasReadingSignals && project.approxTextLines) {
    pushSignal(contentSignals, "reading", "lineas", project.approxTextLines, locale);
  }

  for (const key of ["wordCount", "readMinutes"]) {
    pushSignal(contentSignals, "reading", key, reading[key], locale);
  }

  if (!hasReadingSignals && project.approxTextLines) {
    pushSignal(contentSignals, "data", "lineas", project.approxTextLines, locale);
  }
  if (project.atlasItems) pushSignal(contentSignals, "data", "atlas", project.atlasItems, locale);

  const internal = project.internalSignals ?? {};
  for (const key of ["planFiles", "generatedBooks", "workspacePackages", "atlasItems"]) {
    pushSignal(contentSignals, "data", key, internal[key], locale);
  }

  const data = project.dataSignals ?? {};
  for (const key of ["questions", "topics", "sources", "readingItems"]) {
    pushSignal(contentSignals, "data", key, data[key], locale);
  }

  if (project.commitCount) pushSignal(repoSignals, "repo", "commits", project.commitCount, locale);
  if (project.trackedFiles) pushSignal(repoSignals, "repo", "archivos", project.trackedFiles, locale);

  const visibleSignals = [
    ...contentSignals.slice(0, Math.max(0, 8 - repoSignals.length)),
    ...repoSignals,
  ];

  return visibleSignals.map((signal, index) => ({
    ...signal,
    startsGroup: index > 0 && signal.group !== visibleSignals[index - 1].group,
  }));
};

const screenshotByProject = (screenshots: Screenshot[]) => {
  const map = new Map<string, Screenshot[]>();
  for (const screenshot of screenshots) {
    const items = map.get(screenshot.projectId) ?? [];
    items.push(screenshot);
    map.set(screenshot.projectId, items);
  }
  return map;
};

function App() {
  const [labData, setLabData] = useState<LabData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>(detectInitialLocale);
  const [selectedId, setSelectedId] = useState<string>("atlas");
  const [activeShotIndex, setActiveShotIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [loadedShotPath, setLoadedShotPath] = useState<string | null>(null);
  const shotRailRef = useRef<HTMLDivElement | null>(null);
  const copy = t[locale];

  useEffect(() => {
    loadLabData()
      .then(setLabData)
      .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
    document.documentElement.lang = locale;
    document.title =
      locale === "en" ? "Verifiable map of AI-built systems" : "Mapa verificable de sistemas";
  }, [locale]);

  const projects = useMemo(
    () => sortByDate(labData?.projectsPayload.projects ?? []),
    [labData],
  );

  const screenshots = labData?.screenshotManifest.screenshots ?? [];
  const screenshotsMap = useMemo(() => screenshotByProject(screenshots), [screenshots]);

  const selectedProject =
    projects.find((project) => project.id === selectedId) ?? projects.at(-1) ?? null;

  const selectedScreenshots = useMemo(() => {
    if (!selectedProject) return [];

    const items = screenshotsMap.get(selectedProject.id) ?? [];
    const order = new Map(
      (selectedProject.media ?? []).map((path, index) => [path, index]),
    );

    return [...items].sort(
      (a, b) => (order.get(a.path) ?? 9999) - (order.get(b.path) ?? 9999),
    );
  }, [screenshotsMap, selectedProject]);

  const selectedShot = selectedScreenshots[activeShotIndex] ?? selectedScreenshots[0];
  const selectedShotSrc = selectedShot ? publicAssetPath(selectedShot.path) : null;
  const isSelectedShotLoaded = selectedShotSrc !== null && loadedShotPath === selectedShotSrc;

  useEffect(() => {
    setActiveShotIndex(0);
    setIsZoomOpen(false);
  }, [selectedId]);

  useEffect(() => {
    const activeThumb = shotRailRef.current?.querySelector<HTMLButtonElement>(
      `[data-shot-index="${activeShotIndex}"]`,
    );
    activeThumb?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeShotIndex, selectedId]);

  useEffect(() => {
    if (!isZoomOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsZoomOpen(false);
      if (event.key === "ArrowLeft") showPreviousShot();
      if (event.key === "ArrowRight") showNextShot();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const showPreviousShot = () => {
    if (!selectedScreenshots.length) return;
    setActiveShotIndex((index) =>
      index === 0 ? selectedScreenshots.length - 1 : index - 1,
    );
  };

  const showNextShot = () => {
    if (!selectedScreenshots.length) return;
    setActiveShotIndex((index) => (index + 1) % selectedScreenshots.length);
  };

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const selectProject = (projectId: string, shouldScroll = false) => {
    setSelectedId(projectId);
    if (shouldScroll) window.requestAnimationFrame(scrollToProjects);
  };

  const renderRichText = (text: string, project: Project) => {
    const references = projects
      .filter((candidate) => candidate.id !== project.id && text.includes(candidate.title))
      .sort((a, b) => b.title.length - a.title.length);
    const tokens = [
      ...references.map((reference) => reference.title),
      ...[...externalTermLinks.keys()].filter((term) => text.includes(term)),
    ].sort((a, b) => b.length - a.length);

    if (!tokens.length) return text;

    const referencePattern = new RegExp(
      `(${tokens.map((token) => escapeRegExp(token)).join("|")})`,
      "g",
    );

    return text.split(referencePattern).map((part, index) => {
      const reference = references.find((candidate) => candidate.title === part);
      if (reference) {
        return (
          <button
            className="inline-project-link"
            key={`${reference.id}-${index}`}
            onClick={() => selectProject(reference.id)}
            type="button"
          >
            {part}
          </button>
        );
      }

      const externalHref = externalTermLinks.get(part);
      if (externalHref) {
        return (
          <a
            className="inline-external-link"
            href={externalHref}
            key={`${part}-${index}`}
            rel="noreferrer"
            target="_blank"
          >
            {part}
          </a>
        );
      }

      return part;
    });
  };

  const totals = useMemo(() => {
    const commitCount = projects.reduce((sum, project) => sum + (project.commitCount ?? 0), 0);
    const textLines = projects.reduce(
      (sum, project) => sum + (project.approxTextLines ?? 0),
      0,
    );
    const rawPlans =
      projects.find((project) => project.id === "bookops")?.internalSignals?.planFiles ?? 0;
    const plans = typeof rawPlans === "number" ? rawPlans : 0;
    const atlasItems = projects.find((project) => project.id === "atlas")?.atlasItems ?? 0;

    return {
      projects: projects.length,
      screenshots: screenshots.length,
      commitCount,
      textLines,
      plans,
      atlasItems,
    };
  }, [projects, screenshots.length]);

  if (error) {
    return (
      <main className="app-shell">
        <section className="status-panel">
          <h1>{copy.errorTitle}</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!labData || !selectedProject) {
    return (
      <main className="app-shell">
        <section className="status-panel">
          <h1>{copy.loadingTitle}</h1>
          <p>{copy.loadingSubtitle}</p>
          <span className="status-spinner" aria-hidden="true" />
        </section>
      </main>
    );
  }

  const selectedRepo = repoHref(selectedProject.repo);

  return (
    <main className="app-shell">
      <section className="landing" aria-labelledby="page-title">
        <nav className="social-links" aria-label={copy.externalProfiles}>
          <div className="locale-switcher" role="group" aria-label={copy.language}>
            <button
              className={locale === "en" ? "active" : ""}
              type="button"
              onClick={() => setLocale("en")}
            >
              EN
            </button>
            <button
              className={locale === "es" ? "active" : ""}
              type="button"
              onClick={() => setLocale("es")}
            >
              ES
            </button>
          </div>
          <a
            href="https://github.com/javifernandes"
            target="_blank"
            rel="noreferrer"
            aria-label={copy.githubProfile}
          >
            <GithubIcon />
          </a>
          <a
            href="https://www.linkedin.com/in/javier-fernandes-0144414/"
            target="_blank"
            rel="noreferrer"
            aria-label={copy.linkedInProfile}
          >
            <LinkedInIcon />
          </a>
        </nav>

        <div className="landing-copy">
          <p className="kicker">{copy.kicker}</p>
          <h1 id="page-title">{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>

        <nav className="landing-timeline" aria-label={copy.timeline}>
          {projects.map((project) => {
            const date = projectDate(project);
            const isActive = project.id === selectedProject.id;

            return (
              <button
                className={isActive ? "landing-point active" : "landing-point"}
                key={project.id}
                onClick={() => selectProject(project.id, true)}
                type="button"
              >
                <span>{monthLabel(date, locale)}</span>
                <strong>{project.title}</strong>
                <em>{projectKindLabel(project, locale)}</em>
                <small>{primaryMetric(project, locale)}</small>
              </button>
            );
          })}
        </nav>

        <button className="scroll-cue" type="button" onClick={scrollToProjects}>
          {copy.seeProjects}
        </button>

        <dl className="metric-strip" aria-label={copy.summary}>
          <Metric label={copy.totals.projects} value={totals.projects} locale={locale} />
          <Metric label={copy.totals.commits} value={totals.commitCount} locale={locale} />
          <Metric label={copy.totals.screenshots} value={totals.screenshots} locale={locale} />
          <Metric label={copy.totals.lines} value={totals.textLines} locale={locale} />
          <Metric label={copy.totals.plans} value={totals.plans} locale={locale} />
          <Metric label={copy.totals.atlas} value={totals.atlasItems} locale={locale} />
        </dl>
      </section>

      <section className="workbench-flow" id="projects" aria-label={copy.map}>
        <nav className="timeline-rail" aria-label={copy.timeline}>
          <div className="timeline-list">
            {projects.map((project) => {
              const date = projectDate(project);
              const isActive = project.id === selectedProject.id;

              return (
                <button
                  className={isActive ? "timeline-row active" : "timeline-row"}
                  key={project.id}
                  onClick={() => selectProject(project.id)}
                  type="button"
                >
                  <span className="timeline-date">
                    <strong>{monthLabel(date, locale)}</strong>
                    <small>{shortDateLabel(date)}</small>
                  </span>
                  <span className="timeline-body">
                    <span>{project.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <section className="case-copy" aria-label={copy.detail}>
          <h2>{selectedProject.title}</h2>
          <p className="case-kind">{projectKindLabel(selectedProject, locale)}</p>
          <p className="pitch">
            {renderRichText(projectPitch(selectedProject, locale), selectedProject)}
          </p>

          {selectedProject.stackSignals?.length ? (
            <div className="tag-cluster" aria-label={copy.stack}>
              {selectedProject.stackSignals.slice(0, 10).map((item) => {
                const externalHref = externalTermLinks.get(item);
                if (externalHref) {
                  return (
                    <a href={externalHref} key={item} rel="noreferrer" target="_blank">
                      {item}
                    </a>
                  );
                }

                return <span key={item}>{item}</span>;
              })}
            </div>
          ) : null}

          <div className="link-row">
            {selectedProject.publicUrl ? (
              <a
                className="icon-link"
                href={selectedProject.publicUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.openSite}
              >
                <ExternalLinkIcon />
                <span className="tooltip">{copy.openSite}</span>
              </a>
            ) : null}
            {selectedProject.resources?.map((resource) => (
              <a
                className="icon-link"
                href={resource.href}
                key={resource.href}
                target="_blank"
                rel="noreferrer"
                aria-label={resource.label}
              >
                {resource.kind === "pdf" ? <PdfIcon /> : <ExternalLinkIcon />}
                <span className="tooltip">{resource.label}</span>
              </a>
            ))}
            {selectedRepo ? (
              <a
                className="icon-link"
                href={selectedRepo}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.repository}
              >
                <GithubIcon />
                <span className="tooltip">{copy.repository}</span>
              </a>
            ) : null}
          </div>

          {selectedProject.mediaNeeded?.length ? (
            <div className="todo-block">
              <h3>{copy.nextEvidence}</h3>
              <ul>
                {selectedProject.mediaNeeded.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="evidence-stage" aria-label={copy.visualEvidence}>
          <div className="media-composition">
            {selectedScreenshots.length > 1 ? (
              <button
                className="media-arrow previous"
                type="button"
                onClick={showPreviousShot}
                aria-label={copy.previousShot}
              >
                <ChevronLeftIcon />
              </button>
            ) : null}

            <figure className="hero-shot">
              <div className="hero-media" aria-busy={selectedShot ? !isSelectedShotLoaded : undefined}>
                {selectedShot && selectedShotSrc ? (
                  <button
                    className={isSelectedShotLoaded ? "zoom-trigger loaded" : "zoom-trigger loading"}
                    type="button"
                    onClick={() => setIsZoomOpen(true)}
                  >
                    <img
                      key={selectedShot.path}
                      src={selectedShotSrc}
                      alt={selectedShot.title}
                      onLoad={() => setLoadedShotPath(selectedShotSrc)}
                      onError={() => setLoadedShotPath(selectedShotSrc)}
                    />
                    {!isSelectedShotLoaded ? (
                      <span className="image-loading" aria-live="polite">
                        <span className="status-spinner" aria-hidden="true" />
                        <span>{copy.loadingImage}</span>
                      </span>
                    ) : null}
                    <span className="zoom-affordance">
                      <MagnifyIcon />
                    </span>
                  </button>
                ) : (
                  <div className="empty-shot">{copy.pendingShot}</div>
                )}
              </div>
              <figcaption>
                {selectedShot?.notes ??
                  selectedProject.mediaNeeded?.[0] ??
                  copy.pendingEvidence}
              </figcaption>
            </figure>

            {selectedScreenshots.length > 1 ? (
              <button
                className="media-arrow next"
                type="button"
                onClick={showNextShot}
                aria-label={copy.nextShot}
              >
                <ChevronRightIcon />
              </button>
            ) : null}

            {selectedScreenshots.length > 1 ? (
              <div className="shot-carousel" aria-label={copy.visualEvidence}>
                <button
                  className="shot-carousel-button previous"
                  type="button"
                  onClick={showPreviousShot}
                  aria-label={copy.previousShot}
                >
                  <ChevronLeftIcon />
                </button>
                <div className="shot-rail" ref={shotRailRef}>
                  {selectedScreenshots.map((shot, index) => (
                    <button
                      className={index === activeShotIndex ? "shot-thumb active" : "shot-thumb"}
                      data-shot-index={index}
                      key={shot.id}
                      onClick={() => setActiveShotIndex(index)}
                      type="button"
                    >
                      <img src={publicAssetPath(shot.path)} alt="" />
                      <span>{shot.mode}</span>
                    </button>
                  ))}
                </div>
                <button
                  className="shot-carousel-button next"
                  type="button"
                  onClick={showNextShot}
                  aria-label={copy.nextShot}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <dl className="signal-grid detail-stats" aria-label={copy.metrics}>
          {projectSignals(selectedProject, locale).map((signal) => (
            <div
              className={signal.startsGroup ? "signal signal-group-start" : "signal"}
              key={`${signal.label}-${signal.value}`}
            >
              <dt>{signal.label}</dt>
              <dd>{signal.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {isZoomOpen && selectedShot ? (
        <div className="zoom-overlay" role="dialog" aria-modal="true" aria-label={selectedShot.title}>
          <button
            className="zoom-close"
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label={copy.close}
          >
            <CloseIcon />
          </button>
          <div className="zoom-body">
            {selectedScreenshots.length > 1 ? (
              <button
                className="zoom-nav previous"
                type="button"
                onClick={showPreviousShot}
                aria-label={copy.previousShot}
              >
                <ChevronLeftIcon />
              </button>
            ) : null}
            <figure className="zoom-figure">
              <img src={publicAssetPath(selectedShot.path)} alt={selectedShot.title} />
              <figcaption>{selectedShot.notes}</figcaption>
            </figure>
            {selectedScreenshots.length > 1 ? (
              <button
                className="zoom-nav next"
                type="button"
                onClick={showNextShot}
                aria-label={copy.nextShot}
              >
                <ChevronRightIcon />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Metric({
  label,
  locale,
  value,
}: {
  label: string;
  locale: Locale;
  value: number | string;
}) {
  return (
    <div className="metric">
      <dt>{label}</dt>
      <dd>{typeof value === "number" ? formatCount(value, locale) : value}</dd>
    </div>
  );
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.4-1.1.7-1.3-2.3-.3-4.7-1.2-4.7-5A3.9 3.9 0 0 1 6.6 8.6c-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1.1a9.5 9.5 0 0 1 5 0c1.9-1.4 2.8-1.1 2.8-1.1.6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M5.2 8.8h3.1v10H5.2v-10Zm1.6-4.9a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm3.9 4.9h3v1.4h.1c.4-.8 1.5-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.9v5.4h-3.1v-4.9c0-1.2 0-2.7-1.6-2.7-1.7 0-1.9 1.3-1.9 2.6v5h-3.1v-10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M8 6.2a1 1 0 0 0 0 2h6.4l-8.1 8.1a1 1 0 0 0 1.4 1.4l8.1-8.1V16a1 1 0 1 0 2 0V7.2a1 1 0 0 0-1-1H8Z"
        fill="currentColor"
      />
      <path
        d="M6.5 4.5A2.5 2.5 0 0 0 4 7v10.5A2.5 2.5 0 0 0 6.5 20H17a2.5 2.5 0 0 0 2.5-2.5v-3a1 1 0 1 0-2 0v3a.5.5 0 0 1-.5.5H6.5a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 .5-.5h3a1 1 0 0 0 0-2h-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M7 3.5h6.2a1 1 0 0 1 .7.3l3.8 3.8a1 1 0 0 1 .3.7v12.2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Zm6 1.8V8h2.7L13 5.3ZM7 5.5v13h9v-8.7h-4.4a.6.6 0 0 1-.6-.6V5.5H7Z"
        fill="currentColor"
      />
      <path
        d="M8.2 14.2h1.5c.9 0 1.5.5 1.5 1.3s-.6 1.3-1.5 1.3h-.6v1H8.2v-3.6Zm1.4 1.9c.4 0 .7-.2.7-.6s-.3-.6-.7-.6h-.5v1.2h.5Zm2.1-1.9h1.4c1.1 0 1.8.7 1.8 1.8s-.7 1.8-1.8 1.8h-1.4v-3.6Zm1.4 2.8c.6 0 .9-.4.9-1s-.3-1-.9-1h-.5v2h.5Zm2.3-2.8h2.4v.8h-1.5v.8h1.3v.8h-1.3v1.2h-.9v-3.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MagnifyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M10.7 4.2a6.5 6.5 0 0 1 5.1 10.5l3.2 3.2a1 1 0 0 1-1.4 1.4l-3.2-3.2A6.5 6.5 0 1 1 10.7 4.2Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="m6.8 5.4 5.2 5.2 5.2-5.2a1 1 0 0 1 1.4 1.4L13.4 12l5.2 5.2a1 1 0 0 1-1.4 1.4L12 13.4l-5.2 5.2a1 1 0 0 1-1.4-1.4l5.2-5.2-5.2-5.2a1 1 0 1 1 1.4-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M14.8 5.3a1 1 0 0 1 0 1.4L9.5 12l5.3 5.3a1 1 0 0 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M9.2 18.7a1 1 0 0 1 0-1.4l5.3-5.3-5.3-5.3a1 1 0 0 1 1.4-1.4l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default App;
