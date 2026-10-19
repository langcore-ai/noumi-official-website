# Repository-owned SE use cases

## Ownership and entry points

The `/use-cases` route retains the website navigation, FAQ and footer. Its gallery loads
`/assets/se-use-cases/index.html?embed=1` from this repository on the **same origin**.
There are no runtime requests to the former chatgpt.site deployment.

- Parent component: `src/components/site/official/OfficialUseCasesEmbed.tsx`
- Gallery entry and 12 direct case pages: `public/assets/se-use-cases/*.html`
- Shared styles, interaction code, fonts, icons and previews: `public/assets/se-use-cases/assets/`
- Original downloadable deliverables: `public/assets/se-use-cases/files/`
- Instant case templates: `public/assets/se-use-cases/assets/case-views.js`

These are reviewed static demo files, not CMS-supplied HTML. Next/OpenNext includes
`public/` in its static assets. A normal repository build and preview deployment publishes
the complete gallery, including downloads. No external gallery service, proxy, storage
credentials or manual asset upload is required. Keep edits to each case HTML and its
corresponding `case-views.js` template synchronized; the latter powers hover navigation.
Internal build logs, QA material and machine-specific provenance are not published.

## Layout and interactions

The original embed layout, copy and deliverables are preserved. Cases switch from inert
in-memory templates; preview images are lazy-loaded. Navigation, file folders, response
and preference panels use natural height. The outer website owns vertical scrolling.
Enlarged previews expand inline and contribute to content height. Carousel movement stays
horizontal. Direct case links retain `embed=1`, and browser history works within the frame.

## Height protocol

The child sends `{ type: 'noumi:embed-height', height: number }` and accepts
`{ type: 'noumi:embed-measure' }`. Both sides require the exact current `location.origin`
and the expected parent/child window. This works for local, branch preview, staging and
production without broad domain wildcards or query-supplied trusted origins.

The child measures a natural-flow wrapper, never body scrollHeight or viewport height.
ResizeObserver, DOM changes, images, fonts and case events coalesce measurements per frame.
The parent validates finite heights from 1 to 100000, permits shrinking, requests a fresh
measurement on iframe load and width changes, and cleans up observers/listeners.
Before a valid reply, a scrollable fallback keeps content accessible.

## Verification and release

Run `bun run test:int`, `bunx tsc --noEmit`, `bun run generate:importmap`, and the local
build entry points in `docs/STAGING-WORKFLOW.md`. Browser verification must cover all
12 cases on desktop/mobile, height growth/shrinkage, carousel and inline preview,
file downloads, outer scrolling, and absence of failed/external gallery requests.
Push the feature branch and open a PR to staging. Verify the deployment health revision
before claiming the fixed preview site is updated. Production release is separate.

Legacy `/solution` and `/use-cases/solutions-engineer` redirects remain unchanged.
