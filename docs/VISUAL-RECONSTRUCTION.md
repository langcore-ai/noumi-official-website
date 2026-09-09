# Visual reconstruction verification — 2026-09-09

## Reference and scope

- Local `prototype-webflow` export and user-provided first-viewport screenshot.
- Original Webflow `a-95` scroll keyframes and `growIn` entrance animation.
- Live Use Cases gallery snapshot (2026-09-09, 5 categories / 16 cases).
- Retain the existing CMS content, published routes, pricing and backend integration. This is a visual/interaction change, not a content or pricing migration.

## Implemented corrections

- Paper `#f5f3ee`, card `#fcfaf3`, ink `#3b3f43`, text accent `#4d72c2`. The actual subtitle and feature-arrow SVG assets retain their distinct `#2a33eb` blue.
- Self-host Noto Sans SC, Noto Serif SC, Inter and Funnel Display with original Unicode subsets and OFL licenses. This removes external font-loading dependency.
- Homepage: 1200 × 472px desktop hero, original video, grouped scale/fade entrance (250ms delay, 1000ms outQuart), no invented background drift.
- Navigation returns to normal document flow, so it does not cover sticky feature titles. Mobile layout no longer doubles header spacing; title line breaks remain visible. About is available in the mobile menu.
- Feature cards: original 35/65 columns, 25px margin/padding, sticky 70/80/90px, original SVG arrows; continuous 37–40 / 57–60 / 77–80 keyframe transitions, 50% end offset and smoothing from the final source event.
- Gallery: original styles and complete source content hosted locally, language switch, attachments, real output links, carousel, keyboard access and image lightbox. Pending transitions cannot overwrite a newer selection. Optional language storage respects locale consent.
- CTA: original blue/silver swirl, centered title/subtitle/button and translucent panel. Footer: original four-column organization, logo, colors and contact destinations.
- Inner pages: remove oversized, tight-tracked headings and mismatched split headings; unify display/body fonts, surfaces and widths. Correct About light-on-light text and dark recruitment-section text.

## Reproducible checks

```sh
bun run test:int
bunx tsc --noEmit
bunx eslint .
bun run generate:importmap
bun run build
```

Browser checks use an already-running local site to avoid starting a second process over the same Next build directory:

```sh
OPEN_NEXT_LOCAL_BINDINGS=true bun run start -- --hostname 127.0.0.1 --port 3017
VISUAL_BASE_URL=http://127.0.0.1:3017 bunx playwright test --config playwright.visual.config.ts
```

The explicit local-bindings flag is required when running the production Next bundle outside Cloudflare. Without it, the current remote D1 configuration returned database-not-found during verification. The override is opt-in and does not change the deployed Worker bindings or remote database configuration.

Set `CHROMIUM_PATH` when the local Chromium executable is not `/usr/bin/chromium`.

The browser suite checks exact homepage colors and dimensions, sticky positions and activation, all 16 cases and local images, 11 public routes at 390/768/1440px, reduced motion, mobile menu navigation, language consent and stale transition cancellation. It does not submit forms, alter CMS records or deploy the site.

## Acceptance boundary

Final local results: production build and TypeScript checks passed; integration tests passed (31/31); browser regression passed in both development and the production bundle (8/8 each). ESLint completed with no errors (existing warnings remain). Payload import-map generation required no changes. Production browser verification used local bindings, not the remote D1 database.

Browser screenshots of the local prototype and implementation were inspected during development. Automated geometry/interaction checks are not a claim of pixel equality for every CMS-generated page. Existing CMS prose and pricing intentionally remain unchanged; they differ from the static export. Production deployment and validation of external product/share services are separate from this local reconstruction verification.
