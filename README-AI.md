# README-AI.md

## Responsibility

This repository is the Noumi public website and its Payload CMS runtime. It owns the public Next.js routes, Payload Admin/API, D1 schema and migrations, R2 media/cache/snapshots, and the Cloudflare Worker deployment wrapper.

Before changing production behavior, read [README.md](README.md), [docs/HANDOVER.md](docs/HANDOVER.md), and [AGENTS.md](AGENTS.md).

## Current Baseline

- Human handover baseline: `main` at `411a8b2`, reviewed on 2026-08-13.
- Canonical site: `https://noumi.ai`.
- Product auth target: `https://www.noumi.ai/auth`.
- Runtime: Next.js through OpenNext on Cloudflare Workers.
- Primary data: Payload CMS on D1.
- Shared object storage: `official-website-bucket` through both `R2` and `NEXT_INC_CACHE_R2_BUCKET` bindings.
- Dependency lock: `bun.lock`; project scripts still require pnpm 9/10.
- Cloudflare config currently has only the top-level environment. There is no implemented named staging/production environment.

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

## CMS Boundaries

CMS-backed collections:

- `users`, `media`, `blog-posts`, `feature-pages`, `use-case-pages`, `faq-items`, `friendly-links`, `invite-requests`.
- Redirects are added by the Payload redirects plugin.

CMS globals:

- `site-settings`, `features-page`, `use-cases-page`, `about-page`, `faq-page`, `privacy-page`, `terms-page`.

Important boundaries:

- The existence of a CMS field does not mean the current frontend consumes it. `site-settings` navigation/footer fields are not wired into the active official chrome.
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
- Slug changes affect canonical URLs, sitemap entries, snapshots, navigation, and external links. The redirects plugin is present but no active frontend redirect consumption was found.
- CSS refactors can cross route boundaries through `official-home.css` and pasted raw HTML styles.

## Operational Constraints

- Never run `deploy`, `deploy:database`, migration reset/down/fresh commands, or `preview` without reading the production warnings in [docs/HANDOVER.md](docs/HANDOVER.md).
- Deployment is non-atomic: remote D1 migration finishes before Worker deployment.
- Worker rollback does not roll back D1 or R2.
- Do not purge the shared R2 bucket.
- Do not assume `CLOUDFLARE_ENV=production` is valid. Named environments must first be implemented with separate Worker/D1/R2 resources.
- Keep secrets out of tracked files. Use Wrangler secrets or the Cloudflare dashboard secret type.

## Known Risks

The handover documents the full risk register. Highest-priority areas are raw HTML trust, preview redirect handling, possible preview HTML backfill, non-atomic snapshot locking/refresh, remote-D1 preview risk, missing staging isolation, and limited test coverage.

## Verification

For documentation-only changes:

```bash
git diff --check
pnpm exec prettier --check README.md README-AI.md docs/HANDOVER.md
```

For code changes, select tests based on the impact matrix in [docs/HANDOVER.md](docs/HANDOVER.md); do not rely on the current homepage-only E2E coverage.
