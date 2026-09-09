# About reconstruction — 2026-09-09

The `/about` page now follows the supplied `prototype-webflow/about.html` rather than the old memory-focused story and CMS-dependent founder carousel. `/about.html` permanently redirects to `/about`.

## Content and layout

- Original Company Info / Craft headline and four introduction paragraphs.
- All ten Core Crew members, in source order, with their source names, roles, portraits and LinkedIn destinations. The source's `#` placeholder for Grit Zhao is rendered without a fake link.
- Desktop five-column grid; tablet/mobile two-column grid. The supplied 500px portrait variants and recruitment photo are hosted under `/assets/about/` (about 1.4MB total).
- Original recruitment copy, photo, email, seven FAQ questions/answers and Get Started Today CTA.
- Title metadata and the AboutPage JSON-LD node match the new page. Existing CMS records and collection definitions remain untouched; this page deliberately renders a versioned prototype content snapshot.

The export begins its introduction with the repeated, joined text “We build tools for the people who know their craftNoumi…”. Per the user's text-parity correction, this first paragraph is preserved verbatim, including the joined “craftNoumi”; do not editorially remove the repeated headline. Other wording, including the source's member spelling “Chunk Liao” and its separate FAQ recruitment address `hr@noumi.ai`, is also preserved. This is content reproduction, not independent verification of the FAQ's product/privacy statements.

## Interaction mapping

- e-227/e-239: headline and intro centered grow entrance, 250ms delay.
- e-261: Core Crew heading slides in after 250ms.
- e-515/a-47 and e-535/a-48: portrait cover retracts to zero height while image scale changes 1.4 → 1 over 1000ms.
- e-793/e-795/e-797: recruitment title, copy and email slide in after 250/300/400ms.
- e-767 and e-769…e-809: FAQ heading grows; question cards slide in with original 350/450/550/650/750/750/750ms delays.
- Native details/summary disclosure with 300ms measured-height enhancement, keyboard support and reduced-motion handling. Native markup still opens without JavaScript; the surrounding Next streaming shell is not claimed to be JavaScript-independent.
- Shared subtitle arrows, CTA and footer reuse the previously verified prototype motion.

The shared focus enhancement now only reveals pending animation targets on keyboard-visible focus. Pointer focus must not move a clickable element between pointerdown and pointerup.

## Checks

Local prototype and implementation screenshots were compared at 1440px and 390px, with computed typography/grid measurements. Dedicated browser tests check the exact headline, ten names and roles, all portraits loading, seven FAQ disclosures, five/two-column grids, portrait entrance, keyboard interaction and the legacy URL redirect. TypeScript, integration tests and production preview regression supplement those visual checks; these are not a blanket pixel-equality claim for every breakpoint.

Final result: `check:fast` passed (format, ESLint with warnings/no errors, TypeScript, 31 integration tests, Next production build); OpenNext local build passed; all 16 browser tests passed on the LAN Worker preview at port 8787. The tests wait for the streamed About page to settle before checking exact DOM counts, and assert actual subtitle-marker width plus the prototype's desktop title size/position. Final desktop, phone and recruitment screenshots were inspected. No remote database or public deployment was changed.
