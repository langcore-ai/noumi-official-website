# Prototype HTML coverage

Source of truth: the 23 HTML files in the ignored `prototype-webflow/` directory. Static prototype text is preserved, including source spelling and duplicated copy. CMS records, access control, and external deployment configuration are not changed.

## Page-by-page mapping

| Original HTML | Application route | Implementation |
| --- | --- | --- |
| index.html | / | Previously reconstructed React homepage; regression retained |
| about.html | /about | Previously reconstructed React company page; exact introductory copy retained |
| features.html | /features | Original hero, three interactive feature cards, eight capabilities, workflow, FAQ, CTA |
| specialist-level-expertise.html | /features/specialist-level-expertise | Original illustration, four specialist capabilities, video area, FAQ, CTA |
| full-project-fluency.html | /features/full-project-fluency | Original context illustration, content and video area, FAQ, CTA |
| signature-level-fluency.html | /features/signature-level-fluency | Original experience illustration, content and video area, FAQ, CTA |
| use-cases.html | /use-cases | Original workspace hero, profession grid, FAQ, CTA |
| solution-engineer.html | /use-cases/solutions-engineer | Original profession introduction, video and testimonial carousel |
| business-analyst.html | /use-cases/business-analyst | Original profession introduction, video and testimonial carousel |
| pricing.html | /pricing | Original One Month / Monthly / Yearly tabs and all plan text, FAQ, CTA |
| faq.html | /faqs | Original questions and answers with native, animated disclosure controls |
| terms-conditions.html | /terms; /privacy | Original legal tabs; /privacy opens the Privacy tab on the server |
| blog.html | /blog | Original category tabs, article entry and empty category states |
| blog-article.html | /blog/what-is-ai-in-hr | Complete original HR article, article FAQ and CTA |
| detail_blog.html | /templates/blog | Faithful empty CMS template preview; noindex |
| detail_blog-author.html | /templates/blog-author | Faithful empty CMS template preview; noindex |
| detail_blog-category.html | /templates/blog-category | Faithful empty CMS template preview; noindex |
| detail_career.html | /templates/career | Faithful empty CMS template preview; noindex |
| detail_integration.html | /templates/integration | Faithful empty CMS template preview; noindex |
| 401.html | /protected | Original password-page appearance; no fake authentication endpoint |
| 404.html | /not-found; unknown-route boundary | Original missing-page appearance |
| template-info/licenses.html | /template-info/licenses | Original asset license/reference page; noindex |
| template-info/style-guide.html | /template-info/style-guide | Original design-token/component reference page; noindex |

All 23 `.html` URLs permanently redirect to their canonical routes. Existing CMS detail slugs without an equivalent HTML file remain available through their existing handlers. Contact, Links and Invite have no HTML counterpart in this export; they are not silently replaced by unrelated templates.

## Implementation and interactions

`scripts/sync-prototype-pages.mjs` compiles the reviewed export to versioned page data, scoped CSS and referenced local assets. It removes scripts, inline event handlers and hidden animation startup styles, rewrites relative asset/navigation URLs and never executes the Webflow bundle in a visitor's browser. Builds consume the committed artifacts and do not require the ignored prototype folder.

`PrototypePage` uses server-rendered markup within the existing shared navigation/footer. The scoped source CSS preserves typography, media queries, grids, dimensions and colors without affecting other routes or Payload admin. `PrototypeEffects` replays the relevant source interaction action lists, resolving the source CSS color variables rather than stale RGB values stored beside them. It supports scroll entrances, card/button hover and keyboard focus, source-timed FAQ expansion/collapse, keyboard-accessible tabs, testimonial navigation/autoplay and pointer-follow images. Reduced motion reveals content without entrance delays. Timers, observers and animations are cleaned up on navigation.

The legal prototype deliberately has tabs instead of a separate H1. Browser coverage checks the selected legal tab instead of inventing a heading that is absent from the reference.

## Explicit source limitations and adaptations

- The five `detail_*.html` files contain empty Webflow CMS bindings. Their layouts are accessible as clearly categorized, non-indexed template previews; they are not presented as populated articles, jobs, authors or integrations. The supplied export alone cannot establish missing record content.
- `specialist-level-expertise.html` references `images/process-diagram-2.png`, which is missing from the source folder. A small flowchart SVG uses the neighboring icons' blue-gray stroke style. This is an explicitly recorded replacement, not a claim that the missing original asset was recovered.
- Embedded YouTube videos load only after an explicit Play action, using youtube-nocookie.com. The pre-play control is a deliberate privacy adaptation, not a pixel-identical third-party player thumbnail. No external product service is replicated or silently fetched as application code.
- The Webflow protected-page form is a visual reference, not a functional security boundary. Its submit control is disabled; real authentication remains with the existing application.
- The source Blog card labels an investment-research article but links to the HR article. This source inconsistency is preserved rather than silently rewriting either article.
- Next's existing shared loading boundary can stream a 200 response before a not-found result; the native boundary includes noindex. This reconstruction does not claim to change that framework streaming behavior.

## Verification

The child-page browser suite checks every compiled route at 390, 768 and 1440px, exact heading text, runtime errors, overflow, local asset responses, FAQ and tabs, carousel navigation and HTML aliases. Existing homepage/About/footer regression tests remain in the suite.

Local original-versus-reconstruction measurements for Features, Use Cases, Specialist Level Expertise and Pricing matched headline font family, size, line height, color and width; headline Y differed by approximately 0.2px due to the shared header. Full-page screenshots were also reviewed; this is not a blanket claim of pixel equality for empty CMS bindings, third-party players or the protected-page form.

When updating the LAN Worker preview, rebuild and refresh its local HTML snapshots through the existing authorized refresh API. Rebuilding alone can leave a previous HTML snapshot visible. Do not refresh or overwrite remote CMS content as part of this local visual workflow.
