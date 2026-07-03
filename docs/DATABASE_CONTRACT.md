# Database Contract

Last updated: 2026-07-03

This document is the backend contract for Flow by Elysian. If you are unsure how to add a route, model, AI feature, worker, or CRM workflow, read this file before touching implementation.

## Runtime Boundary

The app currently uses:

- Clerk for app/user authentication.
- Supabase Postgres for persistence.
- Server API routes with `SUPABASE_SERVICE_ROLE_KEY` for database access.
- A separate worker/server for long-running Zaylo imports and media jobs.

Important rule: do not expose sensitive CRM tables directly to browser Supabase clients until Clerk-to-Supabase JWT mapping is explicitly designed and tested.

## Access Model

Canonical tables:

- `teams`
- `user_profiles`
- `team_members`

Purpose:

- `teams` represents the agency/team workspace.
- `user_profiles.clerk_user_id` links Clerk users to DB identity.
- `team_members` defines user roles inside a team.

Current production stance:

- These tables are service-role-only through RLS.
- API routes must authorize using the backend guard in `src/lib/api/guards.ts`.
- Later, if Supabase Auth JWTs are introduced, policies can be expanded from service-role-only to team-scoped authenticated policies.

## CRM Backbone

Canonical tables:

- `crm_activity_events`
- `audit_logs`
- `job_runs`
- `webhook_events`

Purpose:

- `crm_activity_events` is the universal timeline. Owners, listings, leads, documents, deals, AI suggestions, imports, and reports should all emit events here.
- `audit_logs` stores sensitive before/after changes and access events.
- `job_runs` tracks worker/API jobs with idempotency.
- `webhook_events` tracks external webhook delivery, dedupe, retries, and failures.

Required fields for new workflow writes:

- `team_id`
- `actor_user_id`
- `entity_type`
- `entity_id`
- `event_type`
- `source`
- `payload`

Backend rule: every important mutation should emit either an activity event, an audit log, or both.

## Owners and Outreach

Canonical existing tables:

- `owners`
- `outreach_logs`
- `owners_with_counts`
- `owners_active`

New foundation columns:

- `owners.team_id`
- `owners.source`
- `owners.import_run_id`
- `outreach_logs.team_id`

Current risk fixed by migration:

- Earlier broad RLS policies used `using (true)` / `with check (true)`.
- The audit foundation migration replaces broad direct Data API policies with service-role-only access.
- `owners_with_counts` and `owners_active` are recreated with `security_invoker = true`.

Next implementation work:

- Backfill `team_id` for existing rows.
- Emit `crm_activity_events` when an owner is created, updated, hidden, contacted, linked, or imported.
- Add import run row errors for bulk owner imports.

## Listings, Viewings, Leads, and Reports

Canonical existing tables:

- `listings`
- `listing_viewings`
- `listing_leads`
- `landlord_reports`

New foundation columns:

- `listing_viewings.team_id`
- `listing_leads.team_id`
- `landlord_reports.team_id`

Current risk fixed by migration:

- Earlier permissive RLS policies for listing viewings, leads, and landlord reports are replaced with service-role-only policies.

Next implementation work:

- Add listing import provenance: `source`, `import_run_id`, `external_listing_number`, `permit_number`, `first_seen`, `last_seen`, `data_status`.
- Add offer/deal tables before deep sales-pipeline automation.
- Save landlord report source snapshots so generated PDFs are reproducible.

## Documents and Signing

Canonical existing tables:

- `templates`
- `documents`
- `document_fields`
- `signatures`
- `document_settings`

New foundation columns:

- `templates.team_id`
- `documents.team_id`
- `document_settings.team_id`

Public signing boundary:

- Public signing routes are allowed only when scoped by signing token.
- Template authoring, document creation, document sending, settings, and logo uploads must stay authenticated.

Next implementation work:

- Add `signing_tokens`.
- Add `signature_events`.
- Add one-time-use and expiry controls.
- Audit all document sends, views, downloads, and signatures.

## AI Governance

Canonical tables:

- `ai_prompt_versions`
- `ai_runs`
- `ai_cost_ledger`
- `ai_recommendations`
- `ai_actions`
- `ai_entity_summaries`
- `ai_embeddings`

Purpose:

- `ai_prompt_versions` versions prompts and model settings.
- `ai_runs` stores every model call.
- `ai_cost_ledger` stores token/cost tracking.
- `ai_recommendations` stores insights and drafts for review.
- `ai_actions` stores proposed actions that require approval.
- `ai_entity_summaries` stores incremental summaries for owners, leads, listings, deals, documents, and areas.
- `ai_embeddings` stores semantic search vectors as JSON until pgvector is explicitly enabled.

AI safety rule:

AI may draft, summarize, score, and recommend. AI must not mutate sensitive CRM state without an approved `ai_actions` row.

Next implementation work:

- Add `src/lib/ai/gateway.ts`.
- Route `/api/chat`, `/api/generate`, `/api/smart/*`, owner intelligence, sentiment, and lead scoring through the gateway.
- Record cost and output state for each AI call.
- Add an admin AI cost dashboard.

## Zaylo Market Studio

Canonical existing tables:

- `zaylo_areas`
- `zaylo_source_links`
- `zaylo_market_metrics`
- `zaylo_import_runs`
- `zaylo_social_posts`

Current production stance:

- Vercel dashboard/API can show status and create commands.
- Dedicated worker/server should execute imports, scraping, and rendering.
- `/api/zaylo/run` must continue to refuse long-running jobs on Vercel.

Next implementation work:

- Add `zaylo_import_rows`.
- Add `zaylo_transaction_snapshots`.
- Add `zaylo_report_snapshots`.
- Add `zaylo_render_jobs`.
- Build report/social post generation from stored metrics only.

## Integration and Operations

Canonical tables:

- `webhook_events`
- `job_runs`

Recommended future tables:

- `external_accounts`
- `integration_tokens`
- `rate_limit_events`
- `system_health_checks`

Rules:

- Every webhook should have an idempotent `webhook_events` row.
- Every import/render/AI batch should have a `job_runs` row.
- Tokens must not be stored as plaintext.
- Exports should create `audit_logs` rows.

## RLS Policy Stance

Current safe stance:

- Sensitive canonical tables are service-role-only.
- Browser clients should call API routes, not query sensitive tables directly.
- Do not add `using (true)` policies for production CRM data.
- Do not use user-editable metadata for authorization.
- If Supabase authenticated access is added later, policies must use team membership and ownership predicates, not `to authenticated` alone.

Known exception:

- Legacy public signing lookup/signing endpoints are intentionally public at the HTTP layer, but should be token scoped and audited.

## Route Development Rules

For every new route:

1. Use `requireApiUser` unless the route is an intentional public webhook/signing route.
2. Validate request body with Zod.
3. Write through a server Supabase client.
4. Attach `team_id` where the table supports it.
5. Emit `crm_activity_events` for user-visible workflow changes.
6. Emit `audit_logs` for sensitive changes, exports, documents, auth, integrations, or AI actions.
7. Use `job_runs` for background work.
8. Use `webhook_events` for external callbacks.
9. Use `ai_runs` and `ai_cost_ledger` for model calls.
10. Return operator-friendly errors, not raw stack traces.

## Current Gaps

These tables are referenced by routes but are not fully covered by the visible migration set:

- `areas`
- `area_market_data`
- `agent_area_assignments`
- `contacts`
- `agent_performance`
- `opportunities`
- `notifications`
- `tasks`
- `training_modules`
- `client_requests`
- `smart_documents`
- `smart_collections`
- `smart_chat_messages`
- `smart_document_analysis`
- `owner_contacts`
- `bulk_jobs`

Do not build deeper features on these until their migrations are added or confirmed from the live Supabase schema.

## Next Database Task

Create a schema-drift migration for the missing route-referenced tables above, or pull the live Supabase schema and commit the missing migration history.

