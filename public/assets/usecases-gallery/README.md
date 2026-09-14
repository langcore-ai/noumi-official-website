# Noumi prototype gallery snapshot

Source: https://www.noumi.ai/agent/taoyang-bc/light-systems/noumi-usecases/

Retrieved 2026-09-09: `style.css?v=48`, `app.js?v=28`, manifest and all referenced case assets. The source currently has five categories and sixteen cases (including hand-sketch-to-flowchart and gallery-website cases).

The homepage embeds this same-origin snapshot with an initial 800px height, then observes the gallery content and resizes the iframe to fit it. Unlike the fixed-height Webflow embed, the homepage owns vertical scrolling. Embedded oversized images fit the available width and expand vertically. It is deliberately isolated from the marketing site's CSS. Case JSON, diagrams, images and files are local; external product/share links retain their original destinations. Files marked as placeholders in the source remain explicitly marked, not fabricated.

Local adaptations: local open-source fonts; cancel obsolete fade timers; image dialog focus restoration/trapping and scroll locking; English-only display without a language switch or stored-language preference; noindex for this embedded document. The marketing CMS schemas, published documents, pricing, authentication and remote data are not changed by this snapshot.

To refresh, review the source changes before replacing the assets and rerun `tests/visual/redesign.spec.ts`. Do not blindly overwrite the local accessibility, race-condition and consent fixes.
