# AI Build Log Site

React/Vite prototype for the public AI build log.

The app is static. It reads copied JSON and screenshots from `public/`, while the editable source material remains in:

- `../research/projects-v0.json`
- `../media/screenshots/manifest-v0.json`
- `../media/screenshots/*.png`

## Commands

```bash
npm install
npm run dev
npm run build
npm run verify:local
```

`predev` and `prebuild` run `npm run sync:data`, which copies the latest research JSON and screenshots into `public/`.

## GitHub Pages

For a user site such as `javifernandes.github.io`, build normally:

```bash
npm run build
```

For a project page such as `javifernandes.github.io/ai-build-log`, set the Vite base path:

```bash
VITE_BASE_PATH=/ai-build-log/ npm run build
```

Deploy the generated `dist/` directory with a GitHub Pages action or any static host.
