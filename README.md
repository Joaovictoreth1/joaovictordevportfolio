# João Victor Barros — Portfolio

Bilingual (pt-BR / en) single-page portfolio, served as a static site on Netlify at
[joaovictordevportfolio.online](https://joaovictordevportfolio.online/).

## Stack

| Layer   | Choice                                                                  |
| ------- | ----------------------------------------------------------------------- |
| Build   | Vite 8, strict TypeScript 5.9                                           |
| Styling | Tailwind CSS 3 compiled at build time (PostCSS + Autoprefixer)          |
| Motion  | GSAP 3 (intro), Three.js (lazy-loaded WebGL background)                 |
| Assets  | Fontsource variable fonts, Lucide icons, Devicon SVGs — all self-hosted |
| Hosting | Netlify (static `dist/`, Netlify Forms, generated `_headers`)           |
| Quality | ESLint (typescript-eslint strict), Prettier, html-validate              |
| Tests   | Vitest + jsdom (unit), Playwright + axe-core (end-to-end)               |

No third-party script, style or font is loaded at runtime; the only external origin is the
GitHub avatar.

## Architecture

```
index.html, 404.html     Static markup with data-i18n hooks and the Netlify form
config/security-headers  CSP and security headers (emitted to dist/_headers and used by preview)
src/main.ts              Entry: boot sequence, motion, terminal, idle-loaded WebGL
src/app.ts               App state (language, project filter) and event wiring
src/content/data.ts      Typed experience, tech stack and project data
src/i18n/                Dictionaries, language resolution, DOM translation
src/ui/                  Rendering, contact form, navigation, terminal, icons, effects
src/webgl/               Three.js particle sphere with WebGL fallback
tests/unit, tests/e2e    Vitest and Playwright suites
```

Design rules:

- Dynamic content is built with DOM nodes and `textContent` (`src/lib/dom.ts`); only
  dictionary-owned strings go through `innerHTML`.
- Language changes update `<html lang>`, title and description, persist to `localStorage`, and keep
  the active project filter.
- `prefers-reduced-motion` disables the boot delay, GSAP intro, custom cursor and WebGL animation.

## Getting started

Requires Node 24 (see `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:5173
```

No environment variables are needed.

## Scripts

| Command                 | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Vite dev server                                        |
| `npm run build`         | Typecheck and production build into `dist/`            |
| `npm run preview`       | Serve `dist/` on :4173 with the production headers     |
| `npm run lint`          | ESLint (zero warnings) and html-validate               |
| `npm run typecheck`     | `tsc --noEmit`                                         |
| `npm run format:check`  | Prettier check (`npm run format` to fix)               |
| `npm test`              | Unit tests                                             |
| `npm run test:coverage` | Unit tests with coverage gates (90% lines, 85% branch) |
| `npm run test:e2e`      | Playwright against `npm run preview` (build first)     |
| `npm run check`         | Everything above, in CI order                          |

First Playwright run: `npx playwright install chromium`.

## Contact form

The form uses [Netlify Forms](https://docs.netlify.com/forms/setup/): Netlify detects
`data-netlify="true"` at deploy time, and the script posts the fields URL-encoded to `/`. The
`bot-field` honeypot drops spam. The success state is shown only after Netlify answers 2xx; any
other answer shows an error and keeps the message so the visitor can retry.

Configure notification email under **Site configuration → Forms → Form notifications**.

## Deployment

Netlify reads `netlify.toml`: `npm run build`, publish `dist`, Node 24. The build writes
`dist/_headers` with the CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and
immutable caching for hashed assets. Edit `config/security-headers.ts` to change them; the preview
server and the e2e suite use the same values.

CI (`.github/workflows/ci.yml`) runs audit, format, lint, typecheck, coverage, build and Playwright
on every push to `main` and every pull request.

## Troubleshooting

- **CSP violation in the console after adding an asset**: import it from `src/` (bundled) or add
  its origin to `config/security-headers.ts`.
- **Form submissions do not appear in Netlify**: form detection must be enabled for the site, and
  the deployed `index.html` must still contain the `contact` form markup.
- **Playwright cannot find a browser**: run `npx playwright install chromium`.
- **WebGL background missing**: expected when WebGL is unavailable or reduced motion is set; the
  page stays fully usable.
