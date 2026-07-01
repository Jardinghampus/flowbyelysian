# Flow by Elysian / Zaylo Site Audit

Date: 2026-07-01

## Executive Read

The site is now a broad CRM with a strong real-estate operating-system direction, but it still carries demo-mode scaffolding, duplicate route families, and several modules that are useful only after Supabase and external API configuration are finished.

The product should be tightened around one primary promise:

> Villa-community agent operating system: listings, owners, documents, reports, market intelligence, and social proof content.

## What Works Now

- Production deploy is live.
- Main CRM shell loads.
- `/zaylo` loads and has a market catalog/source-link manager.
- Owner, document, report, pipeline, listing, and intelligence modules exist in the codebase.
- Build and TypeScript pass.
- Market Studio now covers 3BR/4BR/5BR segments across Arabian Ranches 1/2/3, Mudon, Mira, Mira Oasis, Town Square, and DAMAC Hills.

## What Is Needed

1. **Authentication and roles**
   - Middleware now supports `AUTH_MODE=clerk`.
   - Demo remains the default until Clerk env vars are configured.
   - Production should set both `AUTH_MODE=clerk` and `NEXT_PUBLIC_AUTH_MODE=clerk`.
   - Clerk auth protects `/app`, `/user`, `/zaylo`, and private API families when enabled.
   - Public routes should stay public: homepage, communities, off-plan, opportunity, auth pages, document signing token route.

2. **One canonical app route family**
   - Current navigation points mostly to `/app/...`.
   - A second legacy dashboard route family still exists under `/(dashboard)`.
   - Keep `/app/...` as the canonical CRM path.
   - Common legacy root-dashboard routes now redirect to `/app/...`.
   - Gradually redirect or remove duplicated `/(dashboard)` pages after confirming no unique feature exists only there.

3. **Database readiness**
   - Supabase needs upgraded/linked locally.
   - Apply migrations for CRM tables and Zaylo market tables.
   - Generate current database types.
   - Make every data-heavy module show a clear empty/config-needed state.

4. **Zaylo production pipeline**
   - Market Studio now reads through a server store that prefers Supabase and falls back to seed data.
   - New source-link writes go through `/api/zaylo/source-links`; no browser localStorage is used as the source of truth.
   - Server job should run Firecrawl and Playwright scraping.
   - Vercel should remain dashboard/approval/export only.
   - Scraping must respect CAPTCHA, Cloudflare, 403, 429, and rate limits.

5. **Content export**
   - Current Zaylo export is SVG.
   - Production should add PNG export, then MP4/hyperframe/reel export via server-side rendering.

6. **Operational health**
   - Add a `/app/admin/system-health` page or expand Zaylo Data Health.
   - Show env status, Supabase status, scraper status, last import run, and external API status.

## What Is Not Needed Right Now

- Three sign-in variants and three sign-up variants in production navigation.
- Public demo routes as primary user journey.
- Duplicate `/dashboard` and `/app/dashboard` experiences.
- Theme customizer visible to every production user.
- News module unless `NEWS_API_KEY` is configured and it supports a real workflow.
- Marketplace/customer portal breadth until internal CRM workflows are stable.

## Keep As Core Modules

- `/app/dashboard`
- `/app/data`
- `/app/owner-intelligence`
- `/app/pipeline`
- `/app/leads`
- `/app/inventory`
- `/app/my-listings`
- `/app/documents`
- `/app/landlord-report`
- `/app/users`
- `/zaylo`

## Keep But Gate Behind Admin/Experimental

- `/app/news`
- `/app/market-pulse`
- `/app/market-statistics`
- `/app/listing-video`
- `/app/smart`
- `/app/seo-generator`
- `/app/training`
- `/app/whatsapp`
- `/app/exchange`

## Hide Or Consolidate Later

- Duplicate `/(dashboard)` route pages after parity check.
- `/demo` and `/demo/deal` from production navigation.
- Auth variant pages `sign-in-2`, `sign-in-3`, `sign-up-2`, `sign-up-3`.
- Public marketplace/customer pages until the customer-facing product is intentionally designed.

## Findings From Live Smoke Test

- `/`, `/zaylo`, `/app/dashboard`, `/app/data`, `/app/owner-intelligence`, `/app/documents`, `/app/landlord-report`, `/app/my-listings`, `/app/pipeline`, `/demo`, and `/sign-in` return `200`.
- `/api/zaylo/market-studio` returns `200` and the expected catalog.
- `/api/news` previously returned `503` when `NEWS_API_KEY` was missing. It now returns `200` with `configured: false`.
- `/api/listings` previously returned `500` when the listings data source was not ready. It now returns an empty configured-warning fallback for recoverable setup errors.
- `/api/zaylo/run` now returns a worker-required response on Vercel instead of trying to spawn local jobs.
- `/app/admin/system-health` provides browser-visible checks for core systems.

## Next Build Order

1. Apply Supabase migrations and seed `zaylo_areas` / `zaylo_source_links`.
2. Implement the dedicated worker CLI under `workers/zaylo-import-worker`.
3. Add PNG export for 1350x1080 posts.
4. Enable `AUTH_MODE=clerk` in Vercel after Clerk routes/env are confirmed.
5. Continue consolidating duplicated route families.

## Server Strategy

Run the scraper/import worker on a persistent server, not Vercel. The server should own:

- visible-browser Playwright runs
- persistent browser profile
- scheduled weekly imports
- Firecrawl calls
- logs
- blocked URL tracking
- Supabase service-role writes

Vercel should own:

- CRM UI
- approvals
- reports
- dashboards
- post downloads
