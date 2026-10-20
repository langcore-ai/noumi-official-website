# Native SE use cases (former iframe integration)

The `/use-cases` gallery now renders directly in the official website DOM. It has no
iframe, cross-window height protocol, external gallery host, proxy, or separate deployment.
The website navigation, FAQ, CMS behavior, and footer remain in their existing paths.

## Repository ownership

- `src/components/site/official/OfficialUseCasesGallery.tsx`: native React host with instant
  hover/click switching and a clean `/use-cases` address.
- `src/components/site/official/use-cases/content.json`: all 12 reviewed case templates,
  prompts, source lists, output metadata, and preference evidence. This is trusted local
  content; never insert CMS/request HTML here. No scripts or event attributes are executed.
- `src/components/site/official/use-cases/controller.js`: scoped carousel, modal preview,
  adaptive reply height, tooltip positioning, and observer cleanup.
- `src/components/site/official/use-cases/gallery.css`: approved standalone styles scoped
  to `.se-gallery`, with sticky offsets accounting for the official website header.
- `public/assets/se-use-cases/assets/`: fonts, icons, preview images, and icon license.
- `public/assets/se-use-cases/files/`: 20 downloadable outputs and one original reference workbook. Changes to
  downloads must also update the corresponding preview and metadata/checksum.

The obsolete HTML wrappers, iframe CSS/JS, and sizing protocol are removed. The separate
homepage gallery `OfficialUseCasesShowcase.tsx` is outside this task's scope.

## Accepted behavior

Desktop file panels are 440px high with fixed header/footer and a hidden-scrollbar file
list. On narrow stacked layouts they are 360px. The right column keeps User, Noumi file
response, and preference in their original order/position. Short replies retain natural
height. Long content first uses compact spacing, then only the file response scrolls in
the available height. Its readable 80px minimum can exceed the file panel on unusually
narrow columns; no content is clipped or removed.

Preference evidence sits at the card's upper right, appears on card hover/keyboard focus,
and remains visible on touch devices. Hover/focus opens a positioned evidence tooltip;
click opens the native dialog. Preview clicks call `showModal()` in the website's top
layer; Escape, close, backdrop, page arrows, download, and focus return are supported.

All case markup is in memory. Hover paints new text immediately; dimensioned preview
images load after text paint. No network round trip is required to switch cases. Case
buttons update local state without changing the URL or adding browser history entries.
Older `?case=5` links still select that case on entry, then remove the `case` parameter
with `replaceState`, preserving other query parameters and existing history state.
Sidebar scrolling and sticky positioning remain independent
of the long document output. Scrollbars stay hidden while wheel, touch, and keyboard
scrolling remain available.

Switching from below the gallery start returns to that start before replacing the case.
This prevents shorter outputs from pulling the sticky sidebar upward. Hover selection
uses pointer motion rather than layout-generated pointer entry, so a stationary cursor
cannot accidentally select another case when the layout moves. Gallery content opts out
of browser scroll anchoring; delayed preview placeholders retain their dimensions.

## Verification and release

Run `bunx tsc --noEmit`, `bun run generate:importmap`, `bun run test:int`, and the repository
local build/preview commands. Test all 12 cases on desktop and narrow/touch layouts,
file/reply scrolling, sticky current case, preference placement, modal behavior, page and
output selection, history, downloads, rapid hover, and absence of external gallery requests.

This revision is for local user approval first. Do not open a new PR or publish the
restored gallery before the user confirms the local preview.
