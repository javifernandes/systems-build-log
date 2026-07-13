# Systems Build Log

A visual, verifiable build log of systems, books, tools, and study surfaces built between January and July 2026.

The repository keeps the inventory and screenshot evidence in plain files:

- `research/projects-v0.json`: project inventory, links, metrics, and narrative.
- `media/screenshots/manifest-v0.json`: screenshot metadata.
- `media/screenshots/`: source screenshots.
- `site/`: Vite + React site.

## Local Development

```sh
cd site
npm install
npm run dev
```

The site syncs `research/` and `media/` into `site/public/` before dev and build.

## Build

```sh
cd site
npm run build
```

For GitHub Pages, the workflow builds with:

```sh
VITE_BASE_PATH=/systems-build-log/ npm run build
```
