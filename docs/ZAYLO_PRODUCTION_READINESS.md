# Zaylo Market Studio Production Readiness

Zaylo Market Studio is currently CRM-native, with a static seed catalog and browser-saved temporary source links. It is intentionally marked as draft/needs-data until verified source imports are connected.

## Current Operator Flow

1. Open `/zaylo`.
2. Filter by master community, for example `Mudon`, `Arabian Ranches 1`, `Town Square`, or `DAMAC Hills`.
3. Filter by `3BR`, `4BR`, or `5BR`.
4. Select a market segment.
5. Review prepared source links.
6. Add temporary source links in the Source Links form when a Bayut Transactions or DXB Interact URL needs to be tested.
7. Copy captions or download the 1350x1080 SVG only after the numbers are verified.

Temporary custom links are stored in browser localStorage under `zaylo.customSourceLinks`. They are not shared between devices and are not durable enough for production.

## Seed Catalog

The seed catalog lives in:

`src/lib/zaylo/market-catalog.ts`

It includes the requested villa-community coverage:

- Arabian Ranches 1
- Arabian Ranches 2
- Arabian Ranches 3
- Mudon
- Mira
- Mira Oasis
- Town Square
- DAMAC Hills

Every catalog area generates 3BR, 4BR, and 5BR market segments for its configured property types.

## Supabase Migration

The migration scaffold lives in:

`supabase/migrations/20260701000000_zaylo_market_studio.sql`

Tables prepared:

- `zaylo_areas`
- `zaylo_source_links`
- `zaylo_market_metrics`
- `zaylo_import_runs`
- `zaylo_social_posts`

RLS is enabled and policies are service-role-only for the first production pass. Do not expose service role keys to the browser.

## Production Architecture

For production, move from static/browser state to this flow:

1. CRM UI writes areas and source links to Supabase.
2. A server job reads active source links.
3. Firecrawl handles pages that can be fetched normally.
4. Playwright visible-browser scraper handles public listing pages that require a normal browser session.
5. The job pauses on CAPTCHA, Cloudflare, 403, or 429 instead of bypassing protection.
6. Parsed rows are normalized into metric inputs.
7. Metric engine updates `zaylo_market_metrics`.
8. Content engine creates draft social posts in `zaylo_social_posts`.
9. Operator approves/downloads posts from `/zaylo`.

## Server Recommendation

Yes, run the scraping/import jobs on a server for best results.

Use a persistent server for:

- scheduled weekly area runs
- browser profile persistence
- logs and blocked-url tracking
- Firecrawl API calls
- Supabase service-role writes

Keep the CRM/Vercel app focused on control, approval, filtering, and downloads. Avoid running long browser scraping jobs inside Vercel serverless functions.
