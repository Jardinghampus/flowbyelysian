# Zaylo Import Worker

Bayut scraper → **Supabase** (no Google Sheets).

Used by:

1. **Team** — Active Listings UI at `/app/market-listings` (price, size, listing #, link, beds, area filters)
2. **Hampus / Zaylo** — market metrics + Instagram draft posts (`dubai_land_villa_expert` narrative)

## Architecture

```
Bayut (visible Playwright)
  → workers/zaylo-import-worker
  → bayut_market_listings / bayut_transactions
  → zaylo_market_metrics
  → zaylo_social_posts (drafts for Hampus)
```

Long browser jobs must **not** run on Vercel. Run locally or on a persistent Windows/Linux box.

## Setup

```bash
cd workers/zaylo-import-worker
cp .env.example .env
# Fill NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (Zaylo project)
npm install
npx playwright install chromium
```

## Commands

From repo root:

```bash
pnpm zaylo:scrape          # scrape listings + transactions → DB + recompute metrics
pnpm zaylo:content         # draft Instagram posts from live metrics
pnpm zaylo:worker -- --job import-market
pnpm zaylo:worker -- --job generate-content
```

From this folder:

```bash
npm run import-market
npm run generate-content
```

## Source URLs

Primary source: `zaylo_source_links` in Supabase (seeded for Mudon / Mira Oasis).

Fallback CSV: `data/input_links.csv` (same communities as the old Sheets scraper).

## Compliance

- Visible Chromium + persistent `.browser-profile`
- No stealth / proxies / CAPTCHA solvers
- Pauses on Cloudflare / 403 / 429 for manual solve
