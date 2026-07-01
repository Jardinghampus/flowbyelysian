# Zaylo Import Worker

This folder is the server-side boundary for Zaylo scraping/import jobs.

The CRM runs on Vercel and should not run long browser jobs. The worker should run on a persistent server where Playwright can keep a visible/persistent browser profile, logs, and scheduled jobs.

## Responsibilities

- Read active rows from `zaylo_source_links`.
- Run Firecrawl for public pages that can be fetched normally.
- Run the compliant visible-browser Playwright scraper for listing pages that need a normal browser session.
- Pause on Cloudflare, CAPTCHA, 403, 429, login, paywalls, access controls, or rate limits.
- Write import status to `zaylo_import_runs`.
- Write normalized metrics to `zaylo_market_metrics`.
- Create draft social posts in `zaylo_social_posts`.

## Non-Goals

- Do not run this in Vercel serverless functions.
- Do not bypass bot protection.
- Do not use stealth plugins, proxies, CAPTCHA solvers, or fingerprint spoofing.
- Do not auto-post to social channels without explicit approval.

## Server Environment

Copy `.env.example` to `.env` on the worker server:

```bash
cp workers/zaylo-import-worker/.env.example workers/zaylo-import-worker/.env
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIRECRAWL_API_KEY`
- `BROWSER_PROFILE_DIR`

## Recommended Runtime

- Node.js 20+
- pnpm
- Playwright Chromium installed
- A persistent Windows or Linux server with a desktop/browser environment if visible browser intervention is needed

## Production Command Shape

The first real worker command should look like:

```bash
pnpm zaylo:worker --job import-market
```

Until that CLI is implemented, `/api/zaylo/run` intentionally returns `409` on Vercel to prevent false starts.
