# Zaylo CRM Integration

Zaylo is integrated into Flow as a local-first dashboard app at `/zaylo`.

Canonical scrape path is now **in-repo**: `workers/zaylo-import-worker` writes Bayut data to **Supabase** (`bayut_market_listings`, `bayut_transactions`). Google Sheets is no longer required.

- Team UI: `/app/market-listings` (Active Listings)
- Hampus marketing: `/zaylo` drafts from `zaylo_social_posts` using live metrics

Legacy local folders (`Zaylo-socials`, PDF import) remain optional for older assets.

## Local Paths

- CRM: `C:\Users\jardi\flowbyelysian`
- Worker: `C:\Users\jardi\flowbyelysian\workers\zaylo-import-worker`
- Legacy Zaylo build: `C:\Users\jardi\OneDrive\Documents\Zaylo-socials`
- PDF drop folder: `C:\Users\jardi\OneDrive\Documents\New project\pdf-import`
- CRM run logs: `C:\Users\jardi\flowbyelysian\.zaylo-runs`

You can override these paths with:

```text
ZAYLO_WORKER_DIR=
ZAYLO_SOCIALS_DIR=
ZAYLO_PDF_IMPORT_DIR=
```

## CRM Surface

Open:

```text
http://localhost:3000/zaylo
```

The module shows:

- listing scraper counts
- PDF import folder status
- market snapshot health
- configured source-link coverage
- draft/approved content queue
- generated reports

## Allowlisted Jobs

The CRM can start only these local jobs:

- `scrape-listings`: runs worker `import-market` (Bayut → Supabase)
- `generate-week`: runs worker `generate-content` (metrics → Instagram drafts for Hampus)
- `build-zaylo`: optional legacy build in `Zaylo-socials`
- `import-pdfs`: legacy PDF importer in `New project`

Long-running browser jobs continue in the background. Check `.zaylo-runs` for logs.

## Important Constraint

This integration is local-first. The scraper uses visible Chrome/Playwright and a local browser profile, so it should not be treated as a normal Vercel serverless function. A hosted version should use a queue/worker machine that has browser access, secrets, and explicit operator controls.
