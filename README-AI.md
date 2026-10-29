# README-AI.md

## Responsibility

This repository is the Noumi public website and its Payload CMS runtime. It owns the public Next.js routes, Payload Admin/API, D1 schema and migrations, R2 media/cache/snapshots, and the Cloudflare Worker deployment wrapper.

Start every development task with [docs/STAGING-WORKFLOW.md](docs/STAGING-WORKFLOW.md) and [docs/TEST-ENVIRONMENTS.md](docs/TEST-ENVIRONMENTS.md). Before changing production behavior, read [README.md](README.md), [docs/HANDOVER.md](docs/HANDOVER.md), and [AGENTS.md](AGENTS.md).

## Current Baseline

- Historical human handover baseline: `411a8b2` (2026-08-13). For current behavior use this checkout; staging workflow and site management documentation updated 2026-10-16.
- Canonical site: `https://noumi.ai`.
- Product auth target: `https://www.noumi.ai/auth`.
- Runtime: Next.js through OpenNext on Cloudflare Workers.
- Primary data: Payload CMS on D1.
- Production object storage: `official-website-bucket` through both `R2` and `NEXT_INC_CACHE_R2_BUCKET` bindings.
- Dependency lock: `bun.lock`; use Bun project entrypoints; legacy tooling may still require pnpm.
- Cloudflare top-level config is production. Local commands use `env.local`; cloud previews use `previews` and the generated test-only config. `env.staging` remains a migration/resource reference, not a standalone Worker deployment target. There is no named `production`. See [test environments](docs/TEST-ENVIRONMENTS.md).

## Preview delivery

Developers need GitHub access, Git, Node.js and Bun. Installing dependencies installs project-local Wrangler; do not require global Wrangler, `wrangler login`, or personal Cloudflare tokens. Push the authorized branch and let Cloudflare Builds execute the preview commands. A feature branch updates its own Preview; staging updates `https://preview.staging.noumi.ai`. Do not merge branches without task authorization.

Verify the target health endpoint reports staging, healthy, and the expected commit revision. If logs are inaccessible and the revision does not match, report deployment as unconfirmed. As of 2026-10-16, manual deployment and runtime smoke checks passed; the Git-triggered Builds workflow still needs maintainer confirmation. See [Builds setup](docs/CLOUDFLARE-BUILDS.md).

## Evolution

The frontend was derived from urgently shipped static HTML. It intentionally retains page-sized JSX, historical class names, and route-specific CSS. CSS has already been extracted from page markup: shared styles live in `official-base.css`/`official-home.css`, while most routes use a dedicated CSS Module.

Do not treat this history as permission for a broad rewrite. Preserve URL, visual, CMS, preview, and snapshot behavior unless a task explicitly changes them.

## Structure

```text
src/access/                 Payload role and access policies
src/app/(frontend)/         Public routes and route CSS
src/app/(payload)/          Payload Admin, REST, GraphQL
src/app/api/site/           Site-specific operational APIs
src/collections/            Payload collections
src/globals/                Payload globals
src/fields/                 Shared CMS fields, including HTML mode
src/lib/site/official-cms.ts
                            Published/draft reads and frontend view models
src/lib/site/publishing.ts  Draft/version/preview behavior
src/lib/site/official-snapshot-store.ts
                            R2 JSON snapshot state
src/lib/site/official-snapshot-hooks.ts
                            CMS change -> dirty/refresh hooks
src/migrations/             Authoritative D1 migrations
src/payload.config.ts       Payload configuration and Cloudflare bindings
worker.ts                   R2 HTML snapshot read/backfill/cron wrapper
wrangler.jsonc              Worker resources, vars, cron, observability
docs/HANDOVER.md            Complete implementation and operations guide
```

## Core Flow

1. A public GET/HEAD first reaches `worker.ts`.
2. Eligible requests read `official-site-snapshots/html/.../index.html` from R2.
3. A miss or bypass runs the OpenNext worker and may backfill HTML in the background.
4. Published CMS loaders in `official-cms.ts` prefer R2 JSON snapshots and fall back to Payload/D1.
5. Relevant Payload changes mark snapshots dirty and request a refresh.
6. The refresh API rebuilds JSON snapshots and returns public routes; `worker.ts` then rebuilds route HTML.
7. Cloudflare Cron runs every five minutes but refreshes only when dirty, missing, or older than the effective stale interval.

Cloud Preview sets `NOUMI_DISABLE_SNAPSHOTS=true`: it bypasses the above HTML/JSON snapshot flow and does not use Cron. Validate published CMS content directly.

## CMS Boundaries

CMS-backed collections:

- `users`, `media`, `blog-posts`, `feature-pages`, `use-case-pages`, `faq-items`, `friendly-links`, `invite-requests`, `seo-configs`.
- Redirects are added by the Payload redirects plugin.

CMS globals:

- `site-settings`, `features-page`, `use-cases-page`, `about-page`, `faq-page`, `privacy-page`, `terms-page`, `menu-settings`.

Important boundaries:

- Published `seo-configs` override metadata by public path; empty fields retain page defaults. Published and enabled `menu-settings` control desktop/mobile navigation and footer. Historical `site-settings` navigation/footer fields do not control active chrome.
- Redirects support published 301/302 rules, validated site paths and cycle prevention. Worker resolves them before HTML snapshots; local Next uses middleware. Relationship targets are resolved on save, so re-save a rule after changing the target slug.
- Localized fields and Chinese dictionaries exist, but published CMS reads and snapshot keys are not locale-aware. Treat the current site as English-only.
- Public publish state is Payload `_status`. The separate Blog `status` field is editorial metadata and does not control public access.
- Invite is a permanent collection. The public form is currently disabled and `/invite` redirects to product auth; authenticated service sync remains.

## Raw HTML Boundary

`OfficialRawHtml` is trusted-code rendering, not sanitization or sandboxing.

- Supported by Blog, Feature, Use Case, FAQ, Privacy, and Terms content.
- Removes embedded nav/footer and external script tags.
- Preserves JSON-LD and executes inline classic/module scripts after hydration.
- Leaves event attributes, iframes, forms, DOM, and CSS effectively unisolated.
- Only content-editor/admin can write generic HTML fields; because legal globals use a different update role, legal HTML currently requires admin.

Any change to this path requires explicit security review and tests.

## Impact Scope

- Collection/global/field changes require a reviewed migration, generated Payload types, and usually import-map regeneration.
- `wrangler.jsonc` changes require regenerated `cloudflare-env.d.ts`; the generated file is not runtime truth.
- Changes to frontend routes, CMS loaders, layouts, shared chrome, assets, or metadata can invalidate both JSON and HTML snapshots.
- Changes to `worker.ts`, snapshot prefixes, or the shared R2 bucket can affect media and cache availability across the whole site.
- Slug changes affect canonical URLs, sitemap entries, snapshots, navigation, and external links. Published redirects are consumed by Worker and local middleware.
- CSS refactors can cross route boundaries through `official-home.css` and pasted raw HTML styles.

## Operational Constraints

- Never run `deploy`, `deploy:database`, or migration reset/down/fresh commands without reading the production warnings in [docs/HANDOVER.md](docs/HANDOVER.md). The repository's `preview` script uses simulated bindings but is not a staging environment; do not bypass it with the raw OpenNext preview command.
- Deployment is non-atomic: remote D1 migration finishes before Worker deployment.
- Worker rollback does not roll back D1 or R2.
- Do not purge the shared R2 bucket.
- Do not assume `CLOUDFLARE_ENV=production` is valid. Named environments must first be implemented with separate Worker/D1/R2 resources.
- Keep secrets out of tracked files. Use Wrangler secrets or the Cloudflare dashboard secret type.

## Known Risks

The handover documents the full risk register. Highest-priority areas are raw HTML trust, preview redirect handling, possible preview HTML backfill, non-atomic snapshot locking/refresh, and limited test coverage.

## Verification

### Website visit replay

- `/admin/visit-replays` is an admin-only Payload custom view. Every `/api/site/replay/*` read endpoint independently checks the authenticated user's current database role; `/config` exposes only the public capture settings.
- `src/lib/site/replay/` owns the rrweb Cloud recorder, privacy rules, event whitelist and bounded Cloud reads. `OfficialReplayController` mounts only in the public, non-draft layout. It starts after analytics Cookie consent, stops on withdrawal, and groups activity into visits with a 30-minute idle boundary.
- After analytics consent, `src/lib/site/shared-visitor.ts` reads/writes the parent-domain `noumi_visitor_id` shared with `www.noumi.ai`; preview/local hosts use a separate host-only Cookie. Recordings retain this ID as `anonymous_id` / `visitor_id`, PostHog events carry `visitor_id`, and CTA attribution forwards it for first-visit fallback. It is an observation label, never an authentication credential. Withdrawing consent clears the visitor Cookie and stops website recording.
- Product account replay pages can open `/admin/visit-replays?visitor=<UUID>`; the existing administrator view starts with that visitor filter and retains its normal role checks.
- Replay receives the existing website business events through `OfficialAnalyticsProvider.capture`, independently of PostHog availability. Replay page views have one owner in the recorder. Keep PostHog session recording disabled.
- Production uses `RRWEB_PUBLIC_KEY`, `RRWEB_SECRET_KEY`, `RRWEB_SCOPE`. Local/staging use only `RRWEB_TEST_PUBLIC_KEY`, `RRWEB_TEST_SECRET_KEY`, `RRWEB_TEST_SCOPE`. Use separate website/test Cloud projects and scopes; keys are not CMS fields or tracked configuration. Config is read at runtime with no-store so HTML snapshots cannot freeze capture settings.
- Visits are filtered by `app=noumi-official` and configured scope; anonymous visitor IDs are filters for administrators, not visitor access credentials. Recording reads validate the same metadata before returning DOM or short-lived player URLs. Signed URLs are bearer links; there is no public replay route or sharing UI.
- Lists load metadata only. Timeline extraction and the player load on demand, with limits inherited from neo-noumi: 20 recordings per visit, 16 MiB decompressed per recording, 2000 timeline events; partial results are marked incomplete. There is no D1 event table or durable delivery queue.
- Passwords, OTP/private regions are blocked and known credential formats redacted. Normal page text/inputs remain visible. Images, video/audio, canvas and iframe interiors are excluded. Do not silently relax these rules to improve visual fidelity.
- Capture is off without valid keys/scope. Real Cloud ingestion/playback requires configured test keys and a consenting test visit; mocked tests do not establish live delivery. Local full validation uses `bun run mode:start` / `mode:reload`.

For documentation-only changes:

```bash
git diff --check
pnpm exec prettier --check README.md README-AI.md docs/HANDOVER.md
```

For code changes, select tests based on the impact matrix in [docs/HANDOVER.md](docs/HANDOVER.md); do not rely on the current homepage-only E2E coverage.

Cloudflare Builds 自动部署 staging 的配置与验证见 [部署指南](docs/CLOUDFLARE-BUILDS.md)。预览构建使用 `build:worker-preview` / `deploy:worker-preview`，开发者通过 GitHub 触发；本地模拟仍使用 `mode:start` / `mode:preview up`。
