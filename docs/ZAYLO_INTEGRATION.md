# Zaylo CRM Integration

Zaylo is integrated into Flow as a local-first dashboard app at `/zaylo`.

The CRM does not copy or rewrite the existing scraper. It reads the Zaylo data folder and starts allowlisted Zaylo jobs from the CRM UI. This keeps the visible Playwright browser profile, Google Sheets sync, and existing PDF importer intact while making the workflow available beside the rest of the CRM.

## Local Paths

- CRM: `C:\Users\jardi\flowbyelysian`
- Zaylo build: `C:\Users\jardi\OneDrive\Documents\Zaylo-socials`
- PDF drop folder: `C:\Users\jardi\OneDrive\Documents\New project\pdf-import`
- CRM run logs: `C:\Users\jardi\flowbyelysian\.zaylo-runs`

You can override these paths with:

```text
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

- `scrape-listings`: runs `npm run scrape` in Zaylo.
- `generate-week`: runs `npm run content:week` in Zaylo.
- `build-zaylo`: runs `npm run build` in Zaylo.
- `import-pdfs`: runs the legacy PDF importer in `New project`.

Long-running browser jobs continue in the background. Check `.zaylo-runs` for logs.

## Important Constraint

This integration is local-first. The scraper uses visible Chrome/Playwright and a local browser profile, so it should not be treated as a normal Vercel serverless function. A hosted version should use a queue/worker machine that has browser access, secrets, and explicit operator controls.
