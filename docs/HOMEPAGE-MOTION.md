# Homepage motion parity

Source: local Webflow `prototype-webflow/index.html` and the IX2 configuration in `js/webflow.js`. Only events bound to real homepage nodes are reproduced; orphaned interactions from other template pages are excluded. `HOME_MOTION` records the event-to-element mapping in source control without depending on the ignored prototype directory at runtime.

## Entrance timeline

All entrances use the original zero-percent viewport offset, run once per page mount, and do not reverse when scrolling back. Slide means 100px below → original position with opacity 0 → 1; grow means centered scale 0.75 → 1 with opacity 0 → 1. Presets last 1000ms with an outQuart CSS Bézier approximation.

| Element                                      | Source event                  | Effect                                     | Delay                   |
| -------------------------------------------- | ----------------------------- | ------------------------------------------ | ----------------------- |
| Hero copy group                              | e-133                         | Grow                                       | 250ms                   |
| Hero outer media (including copy)            | e-135                         | Slide                                      | 350ms                   |
| What is Noumi heading group                  | e-1380                        | Grow                                       | 250ms                   |
| First feature copy group                     | e-1396                        | Slide                                      | 350ms                   |
| Second feature description                   | e-1398                        | Slide                                      | 550ms                   |
| Third feature initial arrow only             | e-1400                        | Slide                                      | 450ms                   |
| Third feature description                    | e-1402                        | Slide                                      | 550ms                   |
| CTA background section                       | e-209                         | Fade                                       | 200ms                   |
| CTA panel                                    | e-205                         | Slide                                      | 350ms                   |
| CTA title / description / button             | e-211 / e-213 / e-215         | Slide                                      | 450 / 550 / 650ms       |
| Footer brand / Product / Resources / Contact | e-217 / e-219 / e-221 / e-223 | Slide                                      | 350 / 450 / 550 / 650ms |
| Copyright                                    | e-225                         | Slide                                      | 350ms                   |
| Both section subtitle arrow pairs            | e-605 / a-54                  | Left +30px / right -30px → 0, linear 600ms | 500ms                   |

The Use Cases heading has no independent grow/slide binding in the export: only its subtitle arrows animate. The feature images and second/third titles similarly do not receive fabricated entrance effects. The already-localized gallery retains its own original transitions.

## Pointer and continuous interactions

- Header About/Waitlist and final CTA use a/a-2: label and both arrows move horizontally 40px in 300ms, reversing on pointer exit. Keyboard focus receives the same treatment.
- Hero a-5/a-6 target `.home-button-text-wrap`, which is absent from the actual homepage button. The button remains visible; the previously invented vertical arrow swap is removed.
- Footer link underline grows from 0 to 100% in 300ms; colors retain the existing prototype palette.
- Feature a-95 scroll keyframes remain 37–40 / 57–60 / 77–80 with the final e-1387 end offset and smoothing. Arrow entrance translation is isolated from scroll rotation/color, including the initial-vs-active arrow layers.
- The original looping hero video is retained.

## Reliability and verification

Animations are progressive Web Animations API enhancements, initialized in a layout effect. Without JavaScript, text is visible. Reduced-motion preference skips entrance animations; toggling it during an animation reveals all pending content immediately. Focusing a hidden descendant also reveals its ancestors. Completed animations release their transforms; observers and animations are cleaned up on route changes.

`tests/visual/motion.spec.ts` checks delays, keyframes, subtitle expansion, footer staggering, single-play behavior, horizontal button motion, clipping, route cleanup, reduced motion and no-JavaScript visibility. Run it with the existing `playwright.visual.config.ts` against a running preview; the complete suite also checks all existing layout and gallery behavior.

Verified 2026-09-09: TypeScript and 31 integration tests passed, import-map generation required no changes, OpenNext production build passed, and all 13 browser tests passed against the LAN Worker preview at port 8787. The first development run exposed an incorrect identity-transform assertion and navigation interruptions during hot reload; the assertion was corrected and the full suite rerun against the fixed production build. Final homepage and CTA screenshots were visually inspected.
