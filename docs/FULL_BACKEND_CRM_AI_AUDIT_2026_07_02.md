# Full Backend, CRM & AI Audit - 2026-07-02

Scope: `C:\Users\jardi\flowbyelysian` only.
Deliverable type: documentation and planning audit, no runtime implementation.
Audited route files: 78 `src/app/api/**/route.ts` files.
Audited migration files: 14 `supabase/migrations/*.sql` files.

This report should be read together with `docs/SITE_AUDIT_2026_07_01.md`. If unsure about product direction or what should be built first, read this document first, then the site audit.

## 1. Executive Summary

Flow by Elysian is already much more than a simple CRM shell. It is a broad real-estate operating system with CRM, listings, owner intelligence, documents, signatures, landlord reports, market/social tooling, Zaylo market-data modules, and several AI-enabled surfaces.

The product opportunity is strong: turn the system into a villa-community broker command center where listings, owners, tenants, documents, market intelligence, and daily social proof all connect into one workflow. The current backend is not yet production-grade enough for that promise because auth, authorization, schema consistency, validation, RLS, AI cost controls, and duplicated route families are still uneven.

Highest priority:

1. Move from demo-open behavior to explicit production auth and role checks.
2. Consolidate canonical routes and remove or gate duplicate/demo surfaces.
3. Align Supabase migrations with every table used by API routes.
4. Add validation, ownership checks, audit logs, rate limits, and idempotency to all write APIs.
5. Turn AI into an approved-action system, not an uncontrolled text generator.
6. Keep long-running imports/scrapes on a worker/server, while Vercel stays dashboard, approval, and export.
7. Build the CRM around a unified activity timeline so owners, listings, leads, documents, calls, AI insights, and tasks become one history.

Production readiness verdict: promising foundation, not yet ready for real multi-user SaaS without auth/RLS/schema hardening.

## 2. System Understanding

### Product Shape

The app is a Next.js 16 / React 19 CRM and agent operating system. The important product lanes are:

- Dashboard and analytics.
- Users/admin.
- Contacts, owners, owner intelligence, outreach logs.
- Listings, listing leads, listing viewings, inventory.
- Client requests, leads, opportunities, pipeline automation.
- Documents, document settings, signatures, title deeds.
- Reports, including landlord and monthly reports.
- AI chat, AI generation, sentiment, smart document chat/analyze.
- Gmail integration and Clerk webhooks.
- Zaylo market/social tooling for area metrics and import runs.

### Technical Shape

- Framework: Next.js App Router.
- Runtime: TypeScript, Node, Vercel-compatible API routes.
- Auth stack: Clerk plus a demo auth wrapper/mode.
- Data stack: Supabase Postgres plus Supabase Storage in selected document routes.
- AI stack: OpenAI SDK, AI SDK routes, smart document chat/analyze routes.
- Integrations: Google APIs/Gmail, Resend, Svix/Clerk webhooks, PDF generation, Zaylo worker boundary.
- Known deployment model: Vercel dashboard/API plus separate worker/server for long-running imports.

### Key Backend Observation

The codebase contains many modules that look product-complete from the UI side, but several API families are still in mixed demo/production state. Some routes have route-level auth; some rely on middleware; some are public despite mutating data; some tables have broad RLS; and several API routes reference tables that are not clearly represented in the visible migration set.

This is the central architecture problem: the product surface is wider than the backend contract.

## 3. Endpoint Inventory

Legend:

- `Route auth`: handler performs a user/auth check.
- `Middleware only`: route likely depends on middleware protection, but handler is weak by itself.
- `Public`: no clear route-level auth.
- `Partial`: usable foundation but needs hardening.
- `Prod-risk`: should not be treated as production-safe until fixed.

| Method | Path | File | Purpose | Auth | Main data/external touchpoints | Category | Status | Main risk | Recommended improvement |
|---|---|---|---|---|---|---|---|---|---|
| GET,PATCH,DELETE | `/api/admin/users/:id` | `src/app/api/admin/users/[id]/route.ts` | Admin user detail/update/delete | Route auth | Clerk/user metadata | Admin/Auth | Partial | Admin authorization must be explicit | Add role policy and audit log |
| GET,POST | `/api/admin/users` | `src/app/api/admin/users/route.ts` | Admin user list/create | Route auth | Clerk/user metadata | Admin/Auth | Partial | Admin route can become overpowered | Add admin-only guard and schema validation |
| GET,PATCH,DELETE | `/api/areas/:slug` | `src/app/api/areas/[slug]/route.ts` | Area detail and related market data | Route auth | `areas`, `area_market_data`, `listings`, `client_requests`, `agent_area_assignments`, `contacts`, `agent_performance` | Analytics/Areas | Partial | Heavy aggregation with schema drift risk | Add typed repository and indexes |
| GET,POST,DELETE | `/api/areas/assignments` | `src/app/api/areas/assignments/route.ts` | Assign agents to areas | Route auth | `agent_area_assignments` | Team/Collaboration | Partial | Permission boundaries unclear | Require admin/manager role |
| GET,POST | `/api/areas` | `src/app/api/areas/route.ts` | Area listing/create | Route auth | `areas`, `area_market_data`, `listings`, `agent_area_assignments` | Analytics/Areas | Partial | Missing complete migration confidence | Normalize area/sub-area schema |
| POST | `/api/chat/handoff` | `src/app/api/chat/handoff/route.ts` | AI chat handoff to lead | Public | `leads`, AI-adjacent flow | AI/Leads | Prod-risk | Public lead mutation path | Add signed/session token and rate limit |
| POST,GET | `/api/chat/inbound` | `src/app/api/chat/inbound/route.ts` | Inbound chat webhook/demo endpoint | Public | AI chat flow | AI/Integrations | Prod-risk | Public endpoint without webhook verification | Add webhook verification and idempotency |
| POST | `/api/chat` | `src/app/api/chat/route.ts` | Authenticated AI chat | Route auth | `@ai-sdk/openai`, `ai`, Clerk | AI | Partial | No visible cost/abuse budget boundary | Add per-user token budgets and logs |
| GET,PATCH,DELETE | `/api/contacts/:id` | `src/app/api/contacts/[id]/route.ts` | Contact detail/update/delete | Route auth | `contacts` | Clients/Contacts | Partial | Need owner/team authorization | Add RLS-aligned `team_id` checks |
| GET,POST | `/api/contacts` | `src/app/api/contacts/route.ts` | Contact list/create | Route auth | `contacts` | Clients/Contacts | Partial | Validation and dedupe strategy unclear | Add zod, dedupe keys, activity events |
| GET,POST | `/api/daily-activity` | `src/app/api/daily-activity/route.ts` | Daily activity logging | Public | `daily_activity_log` | Analytics/Tasks | Prod-risk | Public write/read activity data | Require auth and team scope |
| GET,PUT | `/api/document-settings` | `src/app/api/document-settings/route.ts` | Document settings | Public | `document_settings` | Documents/Admin | Prod-risk | Public settings mutation risk | Make admin-only except safe read |
| POST | `/api/document-settings/upload-logo` | `src/app/api/document-settings/upload-logo/route.ts` | Upload branding logo | Public | Supabase Storage `document-assets` | Documents/Admin | Prod-risk | Public file upload/storage abuse | Auth, file validation, size limits |
| GET,PATCH,DELETE | `/api/documents/:id` | `src/app/api/documents/[id]/route.ts` | Document detail/update/delete | Route auth | `documents`, `document_fields`, `signatures`, `signed-documents` | Documents | Partial | Sensitive doc access needs strict ownership | Add owner/team checks and audit log |
| POST | `/api/documents/:id/send` | `src/app/api/documents/[id]/send/route.ts` | Send document for signing | Public | `documents` | Documents/Signing | Prod-risk | Public action may trigger sends | Require auth and signed recipient flow |
| POST | `/api/documents/:id/sign` | `src/app/api/documents/[id]/sign/route.ts` | Public signing submission | Public token flow | `documents`, `document_fields`, `document_settings`, `signed-documents`, `signatures` | Documents/Signing | Partial | Public signing needs expiry and replay controls | Add one-time tokens, expiry, IP/event audit |
| GET,PUT,POST | `/api/documents/auto-delete` | `src/app/api/documents/auto-delete/route.ts` | Auto-delete document maintenance | Route auth | `document_settings`, `documents`, `signed-documents` | Documents/Admin | Partial | Destructive maintenance path needs roles | Admin-only, dry-run, audit log |
| GET,POST | `/api/documents` | `src/app/api/documents/route.ts` | Document list/create | Public | `documents`, `document_fields` | Documents | Prod-risk | Public document creation/listing | Require auth except public signing lookup |
| GET | `/api/documents/sign-lookup` | `src/app/api/documents/sign-lookup/route.ts` | Public signing lookup | Public | `documents`, `document_fields` | Documents/Signing | Partial | Lookup must not expose unrelated docs | Signed token scope and expiry |
| POST | `/api/generate` | `src/app/api/generate/route.ts` | AI generation | Route auth | OpenAI, Clerk | AI | Partial | Missing cost controls and content provenance | Add token budget and result storage |
| GET | `/api/gmail/auth` | `src/app/api/gmail/auth/route.ts` | Start Gmail OAuth | Route auth | googleapis | Integrations | Partial | OAuth state/tenant binding is critical | Persist signed state and scopes |
| GET | `/api/gmail/callback` | `src/app/api/gmail/callback/route.ts` | Gmail OAuth callback | Public callback | googleapis | Integrations | Partial | Callback must verify state | Enforce state and encrypt tokens |
| POST | `/api/gmail/disconnect` | `src/app/api/gmail/disconnect/route.ts` | Disconnect Gmail | Public | Gmail token state | Integrations | Prod-risk | Public disconnect/mutation | Require user auth and ownership |
| GET | `/api/gmail/messages` | `src/app/api/gmail/messages/route.ts` | Read Gmail messages | Route auth | googleapis | Integrations | Partial | Sensitive message data | Strict scopes, encryption, audit |
| GET,POST | `/api/lead-scoring` | `src/app/api/lead-scoring/route.ts` | Lead scoring/opportunity scoring | Public | `opportunities` | Leads/AI | Prod-risk | Public mutation and model opacity | Auth, deterministic scoring events |
| GET,POST,PATCH | `/api/listings/:id/leads` | `src/app/api/listings/[id]/leads/route.ts` | Listing-specific leads | Route auth | `listing_leads` | Listings/Leads | Partial | Lead ownership and statuses need rules | Add workflow state machine |
| GET,PATCH,DELETE | `/api/listings/:id` | `src/app/api/listings/[id]/route.ts` | Listing detail/update/delete | Route auth | `listings` | Listings | Partial | Listing ownership and audit unclear | Add team_id, status transitions |
| GET,POST,PATCH | `/api/listings/:id/viewings` | `src/app/api/listings/[id]/viewings/route.ts` | Viewing management | Route auth | `listing_viewings` | Viewings/Listings | Partial | RLS appears overly broad in migrations | Tighten RLS and add calendar sync |
| GET,POST | `/api/listings` | `src/app/api/listings/route.ts` | Listings list/create | Route auth | `listings` | Listings | Partial | Needs validation and import provenance | Add source/import metadata and zod |
| GET | `/api/market/video/:id` | `src/app/api/market/video/[id]/route.ts` | Render/download market video | Public | `child_process`, file system | Zaylo/Media | Prod-risk | Public render/file route can be abused | Require auth, queue jobs, restrict paths |
| POST | `/api/marketplace-chat` | `src/app/api/marketplace-chat/route.ts` | Marketplace AI chat | Route auth | `@ai-sdk/openai`, `ai`, Clerk | AI | Partial | Duplicate chat surface and costs | Consolidate AI gateway |
| GET | `/api/migrate` | `src/app/api/migrate/route.ts` | Migration helper | Public | `owners`, `outreach_logs` | Admin/Misc | Critical | Public migration endpoint | Remove from production or admin-lock |
| POST,GET | `/api/mock/notify` | `src/app/api/mock/notify/route.ts` | Mock notification endpoint | Public | `notifications` | Misc/Demo | Prod-risk | Demo endpoint can pollute real data | Disable outside demo mode |
| GET | `/api/news` | `src/app/api/news/route.ts` | News feed/status | Public | External news config | Integrations | Partial | Fine if configured false; noisy if live | Keep explicit configured false fallback |
| GET,POST,PATCH | `/api/notifications` | `src/app/api/notifications/route.ts` | Notifications | Route auth | `notifications` | Tasks/Collaboration | Partial | Notification ownership must be enforced | Add per-user/team filters |
| GET,POST,PATCH | `/api/opportunities` | `src/app/api/opportunities/route.ts` | Opportunities/pipeline | Public | `opportunities` | Offers/Deals/Pipeline | Prod-risk | Public CRM deal mutation | Require auth and stage rules |
| POST | `/api/outreach-logs` | `src/app/api/outreach-logs/route.ts` | Outreach logging | Route auth | `outreach_logs` | Owners/Tasks | Partial | Needs idempotency and contact linkage | Add unique source event key |
| POST | `/api/owner-intelligence/bulk` | `src/app/api/owner-intelligence/bulk/route.ts` | Bulk owner intelligence job | Route auth | `bulk_jobs`, `owner_contacts` | Owners/AI | Partial | Expensive jobs need queue and caps | Move to worker with quotas |
| GET,DELETE | `/api/owner-intelligence/contacts` | `src/app/api/owner-intelligence/contacts/route.ts` | Owner intelligence contacts | Route auth | `owner_contacts` | Owners | Partial | Sensitive owner data | Add source, consent, audit |
| GET | `/api/owner-intelligence/export` | `src/app/api/owner-intelligence/export/route.ts` | Export owner contacts | Route auth | `owner_contacts` | Owners/Export | Partial | Export is high-risk data egress | Add role, log, watermark |
| POST | `/api/owner-intelligence/lookup-owners` | `src/app/api/owner-intelligence/lookup-owners/route.ts` | Owner lookup batch | Route auth | `owner_contacts` | Owners/AI | Partial | External lookup quotas/costs | Queue, cache, rate limit |
| POST | `/api/owner-intelligence/lookup` | `src/app/api/owner-intelligence/lookup/route.ts` | Owner lookup single | Route auth | `owner_contacts` | Owners/AI | Partial | Same as above | Cache, quota, audit |
| GET | `/api/owner-intelligence/status/:runId` | `src/app/api/owner-intelligence/status/[runId]/route.ts` | Lookup/bulk status | Route auth | Job status | Owners/AI | Partial | Status must be scoped to owner/team | Add job ownership |
| GET | `/api/owner-intelligence/usage` | `src/app/api/owner-intelligence/usage/route.ts` | Usage summary | Route auth | Usage counters | Owners/AI | Partial | Usage data can leak team activity | Scope by user/team |
| POST,DELETE | `/api/owners/:id/link` | `src/app/api/owners/[id]/link/route.ts` | Link owner to entities | Route auth | Owner relation state | Owners | Partial | Relationship rules unclear | Add relation table constraints |
| GET,PATCH,DELETE | `/api/owners/:id` | `src/app/api/owners/[id]/route.ts` | Owner detail/update/delete | Route auth | Owners model | Owners/Landlords | Partial | Sensitive owner records need strong RLS | Team scoped RLS and audit |
| POST | `/api/owners/bulk-import` | `src/app/api/owners/bulk-import/route.ts` | Bulk import owners | Route auth | Owners model | Owners/Import | Partial | Duplicate and provenance risk | Add import runs and row errors |
| POST | `/api/owners/check-duplicates` | `src/app/api/owners/check-duplicates/route.ts` | Owner duplicate check | Route auth | `owners` | Owners | Partial | Matching logic needs consistency | Normalize phones/emails/addresses |
| GET | `/api/owners/performance` | `src/app/api/owners/performance/route.ts` | Owner performance analytics | Public | Owner stats | Owners/Analytics | Prod-risk | Public analytics leak | Require auth/team scope |
| GET,POST | `/api/owners` | `src/app/api/owners/route.ts` | Owner list/create | Route auth | Owners model | Owners/Landlords | Partial | Needs strong validation/import provenance | Add zod and activity events |
| GET | `/api/owners/stats` | `src/app/api/owners/stats/route.ts` | Owner stats | Public | Owner stats | Owners/Analytics | Prod-risk | Public operational data | Require auth |
| GET | `/api/owners/todos` | `src/app/api/owners/todos/route.ts` | Owner follow-up todos | Public | Owner task state | Owners/Tasks | Prod-risk | Public tasks expose CRM actions | Require auth |
| GET | `/api/pipeline-automations` | `src/app/api/pipeline-automations/route.ts` | Pipeline automation suggestions | Public | `opportunities` | Pipeline/AI | Prod-risk | Public access to pipeline logic | Require auth and safe suggestions |
| POST | `/api/reports/landlord` | `src/app/api/reports/landlord/route.ts` | Generate landlord report PDF | Route auth | React PDF | Reports | Partial | Report data source and authorization must be enforced | Save report run and source snapshot |
| GET | `/api/reports/monthly` | `src/app/api/reports/monthly/route.ts` | Monthly performance report | Route auth | `agent_performance`, Supabase, React PDF | Reports/Analytics | Partial | Team metrics leakage | Team filters and report snapshots |
| GET,PATCH,DELETE | `/api/requests/:id` | `src/app/api/requests/[id]/route.ts` | Client request detail/update/delete | Route auth | `client_requests` | Buyers/Tenants | Partial | Need ownership/status transition rules | Add request lifecycle model |
| GET,POST | `/api/requests` | `src/app/api/requests/route.ts` | Client request list/create | Route auth | `client_requests` | Buyers/Tenants | Partial | Validation and matching missing | Add request schema and match endpoint |
| POST | `/api/sentiment` | `src/app/api/sentiment/route.ts` | Sentiment analysis | Public | AI/local scoring | AI | Prod-risk | Public AI abuse/cost route | Require auth and quota |
| POST | `/api/smart/analyze` | `src/app/api/smart/analyze/route.ts` | Analyze smart document | Route auth | `smart_documents`, `smart_document_analysis` | AI/Documents | Partial | Needs model logging and PII policy | Add ai_runs and redaction |
| POST,GET,DELETE | `/api/smart/chat` | `src/app/api/smart/chat/route.ts` | Smart document chat | Route auth | `smart_documents`, `smart_chat_messages`, OpenAI | AI/Documents | Partial | Retrieval/cost controls unclear | Add embeddings, budgets, citations |
| GET,PATCH,DELETE | `/api/smart/collections/:id` | `src/app/api/smart/collections/[id]/route.ts` | Smart collection detail | Route auth | `smart_collections`, `smart_documents` | AI/Documents | Partial | Ownership checks needed | Team/user scoped RLS |
| GET,POST | `/api/smart/collections` | `src/app/api/smart/collections/route.ts` | Smart collections | Route auth | `smart_collections` | AI/Documents | Partial | Schema/migration confidence unclear | Add migration and typed repository |
| GET,PATCH,DELETE | `/api/smart/documents/:id` | `src/app/api/smart/documents/[id]/route.ts` | Smart document detail | Route auth | `smart_documents`, `smart_collections` | AI/Documents | Partial | Document PII needs stronger controls | Add access logs and retention |
| GET,POST | `/api/smart/documents` | `src/app/api/smart/documents/route.ts` | Smart document upload/list | Route auth | `smart_documents`, `smart_collections` | AI/Documents | Partial | Upload validation and retention unclear | Add file policy and status model |
| GET | `/api/stats` | `src/app/api/stats/route.ts` | Dashboard stats | Public | `listings`, `opportunities`, `owners`, `daily_activity_log`, `notifications`, `outreach_logs` | Analytics | Prod-risk | Public business metrics | Require auth/team scope |
| PATCH,DELETE | `/api/tasks/:id` | `src/app/api/tasks/[id]/route.ts` | Task update/delete | Public | `tasks` | Tasks/Todos | Prod-risk | Public task mutation | Require auth |
| GET,POST | `/api/tasks` | `src/app/api/tasks/route.ts` | Task list/create | Route auth | `tasks` | Tasks/Todos | Partial | Task ownership and reminders missing | Team/user scoping |
| GET,PATCH | `/api/templates/:id` | `src/app/api/templates/[id]/route.ts` | Template detail/update | Public | `templates` | Documents/Templates | Prod-risk | Public template mutation | Require auth/admin |
| GET,POST | `/api/templates` | `src/app/api/templates/route.ts` | Template list/create | Public | `templates` | Documents/Templates | Prod-risk | Public template creation | Require auth/admin |
| POST,GET | `/api/title-deeds` | `src/app/api/title-deeds/route.ts` | Title deed records | Route auth | `title_deeds` | Owners/Documents | Partial | Sensitive property docs | Strong RLS and storage policy |
| GET,PATCH,DELETE | `/api/training/:id` | `src/app/api/training/[id]/route.ts` | Training module detail | Route auth | `training_modules` | Team/Training | Partial | Low risk, but schema consistency needed | Add role-based authoring |
| GET,POST | `/api/training` | `src/app/api/training/route.ts` | Training module list/create | Route auth | `training_modules` | Team/Training | Partial | Authoring permissions unclear | Admin/manager guard |
| GET,PATCH | `/api/user/metadata` | `src/app/api/user/metadata/route.ts` | User metadata | Route auth | Clerk metadata | Auth/User | Partial | User can over-write privileged fields if unchecked | Whitelist mutable fields |
| POST | `/api/webhooks/clerk` | `src/app/api/webhooks/clerk/route.ts` | Clerk webhook sync | Webhook verified | `contacts`, `areas`, `agent_area_assignments`, Svix, Clerk | Integrations/Auth | Partial | Webhook idempotency and mapping risks | Add event table and retries |
| GET | `/api/zaylo/market-studio` | `src/app/api/zaylo/market-studio/route.ts` | Zaylo market studio state | Public | Zaylo store | Zaylo | Partial | Public market data is okay only if no private state | Add auth if operator-only |
| POST | `/api/zaylo/run` | `src/app/api/zaylo/run/route.ts` | Trigger Zaylo import run | Public | Worker boundary | Zaylo/Worker | Prod-risk | Public job trigger unless intentionally locked | Require operator auth and worker secret |
| POST | `/api/zaylo/source-links` | `src/app/api/zaylo/source-links/route.ts` | Manage Zaylo source links | Public + zod | Source links store | Zaylo | Prod-risk | Public source mutation | Require auth/operator role |
| GET | `/api/zaylo/state` | `src/app/api/zaylo/state/route.ts` | Zaylo state health | Public | Zaylo store | Zaylo | Partial | Public state may expose operator config | Split public read vs admin state |

## 4. Core CRM Functionality Review

### Auth/User

Strengths:

- Clerk is already present.
- Middleware and provider wrappers already support a path toward production auth.
- Admin/user metadata endpoints exist.

Gaps:

- Demo mode is still a major product convenience and a production risk.
- Several route handlers do not enforce local authorization.
- There is no consistent role/permission matrix across owner, document, listing, admin, and Zaylo routes.

Recommendation: keep demo mode only behind explicit env flags and add a backend permission helper used in every mutating route.

### Leads, Buyers, Tenants, Requests

Strengths:

- `client_requests`, chat handoff, lead scoring, listing leads, and opportunities show the intended workflow.

Gaps:

- Lead lifecycle is fragmented between `leads`, `listing_leads`, `client_requests`, `opportunities`, and chat handoff.
- Public routes can mutate lead/opportunity data.
- There is no unified source attribution, consent record, or activity timeline.

Recommendation: create a single lead/request lifecycle with status transitions, source, owner, assigned agent, match criteria, activity, and AI score snapshots.

### Properties, Inventory, Listings

Strengths:

- Listings and listing-specific viewings/leads exist.
- Zaylo can become a strong market-data layer around listings.

Gaps:

- Listing imports need provenance: source, import run, area, sub-area, listing number, permit number, first seen, last seen, status.
- RLS for listing support tables appears too broad.
- No clear normalized property/unit table separates real unit identity from marketing listing identity.

Recommendation: split `properties` or `units` from `listings`, then track imported listings and market metrics as time-series facts.

### Owners/Landlords

Strengths:

- Owner CRUD, duplicate checking, bulk import, outreach logs, owner intelligence, title deeds, and landlord reports are present.

Gaps:

- Owner data is sensitive and should have the strictest access model.
- Performance/stats/todos endpoints are public.
- Owner intelligence needs cost controls, usage logs, and source policy.

Recommendation: make owners the central CRM object with ownership verification, document links, listings, outreach timeline, consent/source fields, and AI-generated next actions.

### Viewings, Offers, Deals

Strengths:

- Viewings and opportunities are present.

Gaps:

- Offers/deals are not yet a first-class backend workflow.
- Stage transitions and required fields are not enforced.
- No transaction record connects lead, property, owner, agent, documents, and commission.

Recommendation: introduce deal-stage state machine and offer records before adding more UI.

### Tasks, Notes, Messages, Collaboration

Strengths:

- Tasks, notifications, daily activity, and training modules exist.

Gaps:

- Tasks update/delete includes public mutation risk.
- Notes/messages are not a central normalized model.
- No universal timeline across owner/listing/lead/deal/document.

Recommendation: build `crm_activity_events` and make it the source of truth for "what happened".

### Documents, Signatures, Reports

Strengths:

- Document templates, fields, signatures, signed files, settings, logo upload, auto-delete, title deeds, landlord reports, and monthly reports exist.

Gaps:

- Public document/template/settings routes need stricter auth separation.
- Signing flows require one-time token, expiry, replay protection, and audit logging.
- Reports should persist a source-data snapshot so generated PDFs are reproducible.

Recommendation: harden public signing as a separate trust boundary and keep all authoring/admin routes authenticated.

### AI

Strengths:

- Multiple AI surfaces already exist: chat, marketplace chat, generate, sentiment, smart document analyze/chat, owner intelligence, lead scoring, Zaylo social generation potential.

Gaps:

- No single AI gateway, budget ledger, prompt registry, run log, approval queue, or model strategy.
- Public AI routes create cost and abuse exposure.
- AI output is not consistently attached to CRM records as reviewable recommendations.

Recommendation: add `ai_runs`, `ai_actions`, `ai_recommendations`, and `ai_cost_ledger`, then make AI create drafts and suggestions before it mutates CRM state.

### Zaylo

Strengths:

- Zaylo has a good strategic lane: area metrics, source links, import runs, social assets, and market reports.

Gaps:

- Public routes can change source links or trigger runs.
- Worker/server boundary is recognized but not fully operationalized.
- Zaylo should use Supabase-backed state, not local/state fallbacks long term.

Recommendation: make Vercel the dashboard and approval surface; run scrapes/imports/render jobs on a worker with service-role credentials and audit logs.

## 5. Critical Issues

1. Demo-open auth behavior and route-level authorization gaps.
2. Public mutating endpoints for CRM, document, Zaylo, stats, task, template, migration, and AI routes.
3. Supabase schema drift: API routes reference many tables not clearly present in current migrations.
4. RLS policies that allow all access on sensitive listing/report tables.
5. Missing tenant/team model across CRM records.
6. Missing validation and idempotency across many write routes.
7. Public or under-protected document signing/settings/upload surfaces.
8. AI endpoints lack cost controls, run logs, budgets, prompt governance, and approval gates.
9. Long-running jobs and render/import workflows need worker-only execution.
10. No universal CRM activity timeline or audit trail.

## 6. Detailed Findings

### Brist 1: Auth is not production-hard at the backend boundary

Var bristen finns: `src/middleware.ts`, `src/lib/auth-mode.ts`, many `src/app/api/**/route.ts` files.

Vad problemet ar: the app supports Clerk, but many handlers still rely on broad middleware, demo mode, or no auth at all. Public endpoints can mutate data in several places.

Varfor det ar ett problem: UI auth is not enough for SaaS. Every sensitive route must protect itself because API routes are directly callable.

Riskniva: Critical.

Teknisk forbattrring: add a shared `requireUser`, `requireRole`, and `requireTeamAccess` helper and call it in every sensitive handler. Keep `AUTH_MODE=demo` explicit and impossible to confuse with production.

Produktforbattring: agents can trust that owner data, documents, listings, and deal state are safe per user/team.

AI-implementering: AI routes should use the same helper and attach every AI run to a user/team.

Kostnadsanalys for AI: no direct model cost; this is an abuse-prevention fix. It reduces uncontrolled AI spend by blocking anonymous use.

Note: this should be the first implementation task.

Plan:

- Lock production env to `AUTH_MODE=clerk`.
- Add route-level auth helpers.
- Update public mutation routes first.
- Add tests for anonymous 401/403 behavior.

Tva ideer:

- Add a `/api/system/auth-check` endpoint for deployment verification.
- Add an admin page showing which routes are still public by design.

### Brist 2: Supabase schema and route expectations are not fully aligned

Var bristen finns: `supabase/migrations/*.sql` vs `src/app/api/**/route.ts`.

Vad problemet ar: routes reference tables such as `areas`, `contacts`, `listings`, `client_requests`, `agent_performance`, `opportunities`, `notifications`, `tasks`, `training_modules`, `owner_contacts`, `bulk_jobs`, and `smart_*` while the visible migration set does not clearly define all of them.

Varfor det ar ett problem: local builds can pass while runtime fails in production. It also makes RLS and typed clients unreliable.

Riskniva: Critical.

Teknisk forbattrring: generate a database contract document and add missing migrations. Generate Supabase TypeScript types from the deployed database and fail CI when route table usage is not represented.

Produktforbattring: dashboards stop breaking when data is missing; import runs and reports become reliable.

AI-implementering: AI needs stable tables for runs, embeddings, scores, and recommendations before it can safely automate.

Kostnadsanalys for AI: fixing schema prevents repeated failed AI calls caused by missing persistence. Cost saving is indirect but material.

Note: do not add more AI features before schema is stable.

Plan:

- Create `docs/DATABASE_CONTRACT.md`.
- Diff route table usage against migrations.
- Add migrations for missing tables.
- Generate typed Supabase client.

Tva ideer:

- Add a nightly schema-drift check.
- Add a dashboard badge: "DB contract healthy".

### Brist 3: RLS policies are too broad for sensitive data

Var bristen finns: migrations for `listing_viewings`, `listing_leads`, `landlord_reports`, owners/outreach, documents, and title-deed-related tables.

Vad problemet ar: some policies allow all access or all authenticated users without team ownership.

Varfor det ar ett problem: real estate CRM data is commercially sensitive. Owners, landlord reports, title deeds, and leads must not be globally readable.

Riskniva: Critical.

Teknisk forbattrring: add `team_id`, `created_by`, `assigned_to`, and team membership checks. Replace broad policies with scoped policies.

Produktforbattring: enables multi-agent SaaS without data leakage between agents or teams.

AI-implementering: embeddings and AI summaries must inherit parent entity access, not become a backdoor.

Kostnadsanalys for AI: no direct AI cost, but prevents expensive incident response and reprocessing.

Note: policy cleanup should happen before inviting external users.

Plan:

- Define team and role tables.
- Add team_id to sensitive records.
- Backfill owner/team fields.
- Replace permissive RLS.

Tva ideer:

- Add "private to me" vs "shared with team" flags.
- Add a compliance export for who accessed a record.

### Brist 4: Validation is inconsistent across write APIs

Var bristen finns: most POST/PATCH handlers outside a few zod-backed routes.

Vad problemet ar: many write routes accept untyped JSON and trust body shape.

Varfor det ar ett problem: malformed data creates broken workflows, bad AI context, and runtime exceptions.

Riskniva: High.

Teknisk forbattrring: create zod schemas per domain and validate before DB writes. Return consistent 400 responses.

Produktforbattring: fewer broken owners, listings, reports, and tasks. Better trust for operators.

AI-implementering: AI output should be validated against the same schemas before it can become a draft or action.

Kostnadsanalys for AI: validation avoids paying for AI to summarize polluted CRM data.

Note: this is a high-leverage incremental refactor.

Plan:

- Start with owners, listings, documents, tasks, opportunities, Zaylo.
- Add `parseJson` helper.
- Add route tests for invalid body responses.

Tva ideer:

- Add import row-level errors instead of failing whole batches.
- Add "AI repaired this malformed field" as a reviewed suggestion, not automatic mutation.

### Brist 5: AI has no central governance layer

Var bristen finns: `/api/chat`, `/api/marketplace-chat`, `/api/generate`, `/api/sentiment`, `/api/smart/*`, owner intelligence, lead scoring.

Vad problemet ar: AI routes are scattered. There is no single model router, budget ledger, prompt registry, run log, or approval queue.

Varfor det ar ett problem: costs can grow silently, outputs are hard to trust, and AI actions cannot be audited.

Riskniva: High.

Teknisk forbattrring: add an AI gateway module with model selection, token logging, run records, redaction, prompt versioning, and review state.

Produktforbattring: AI becomes a trustworthy assistant: it proposes, explains, cites, and waits for approval before risky actions.

AI-implementering: store every AI result as `draft`, `approved`, `rejected`, or `applied`.

Kostnadsanalys for AI: for low-risk classification/summarization, GPT-4.1 mini pricing is currently listed by OpenAI at $0.40 per 1M input tokens and $1.60 per 1M output tokens. A 1,000-run light classifier using 500 input tokens and 50 output tokens per run is roughly $0.28 before retries and overhead. Embeddings with `text-embedding-3-small` are listed at $0.02 per 1M tokens. Exact monthly cost depends on usage, retries, and model choice.

Note: AI should not be blocked, but it must be made observable.

Plan:

- Add `ai_runs`, `ai_cost_ledger`, `ai_prompt_versions`, `ai_recommendations`.
- Route all AI calls through a shared service.
- Add per-user/team daily budgets.
- Add admin cost dashboard.

Tva ideer:

- "Morning agent briefing" generated daily from activity and market data.
- "Owner call prep" generated from owner, property, outreach, market comps, and documents.

### Brist 6: Document and signing trust boundaries are blurred

Var bristen finns: `/api/documents`, `/api/documents/:id/send`, `/api/documents/:id/sign`, `/api/documents/sign-lookup`, `/api/document-settings`, `/api/templates`.

Vad problemet ar: public signing is legitimate, but authoring/settings/template/admin operations should not share the same public exposure.

Varfor det ar ett problem: document templates, logos, settings, and sent documents can contain sensitive business and customer data.

Riskniva: High.

Teknisk forbattrring: split public signing routes from authenticated document authoring. Use signing tokens with expiry, one-time-use behavior, recipient binding, and event audit.

Produktforbattring: clients can sign safely while agents retain control over documents and templates.

AI-implementering: AI can draft document fields and report summaries, but all generated legal/commercial text should require approval.

Kostnadsanalys for AI: document summarization is cheap on mini models for short docs, but full PDF/contract analysis can grow quickly. Use retrieval and chunking, not whole-document prompts every time.

Note: this becomes more important before real landlord/customer traffic.

Plan:

- Lock settings/templates/doc creation behind auth.
- Add signing token table.
- Log every view, sign, resend, and download.
- Add retention rules.

Tva ideer:

- "Explain this document to the client" AI draft.
- "Landlord report narrative" generated from market data and viewing outcomes.

### Brist 7: Zaylo needs worker-backed imports and operator-only controls

Var bristen finns: `/api/zaylo/run`, `/api/zaylo/source-links`, `/api/zaylo/state`, `/api/market/video/:id`, worker docs.

Vad problemet ar: source links and import runs are strategic but should not be public mutation endpoints. Rendering/importing should not happen in Vercel request lifecycles.

Varfor det ar ett problem: imports and media generation can be slow, fail unpredictably, or consume external rate limits.

Riskniva: High.

Teknisk forbattrring: keep Vercel API routes as command/status endpoints; run imports/render jobs on a persistent worker with service-role credentials and job queues.

Produktforbattring: operators get reliable refresh buttons, run history, status, errors, and downloadable social assets.

AI-implementering: Zaylo AI should generate drafts from verified metrics only and mark stale or missing data clearly.

Kostnadsanalys for AI: daily area reports can stay inexpensive if using structured metrics plus short generation prompts. Rendering cost is mainly compute, not tokens.

Note: this aligns with the existing worker-boundary direction.

Plan:

- Add `zaylo_import_runs` status as source of truth.
- Add signed worker trigger secret.
- Add import logs and row counts.
- Add render jobs for 1350x1080 and 9:16 outputs.

Tva ideer:

- Weekly area rotation calendar.
- "Trust card" social posts with source links and latest transaction snapshots.

### Brist 8: CRM has no universal activity timeline

Var bristen finns: owners, contacts, listings, opportunities, tasks, documents, outreach logs, notifications, daily activity.

Vad problemet ar: actions exist in separate islands. There is no single normalized timeline for what happened to a client, owner, listing, or deal.

Varfor det ar ett problem: agents need context fast. AI also needs a reliable event history.

Riskniva: High.

Teknisk forbattrring: add `crm_activity_events` with entity type/id, actor, source, event type, payload, occurred_at, visibility, and team_id.

Produktforbattring: every record gets a clear history: calls, notes, emails, documents, viewings, offers, AI suggestions, imports, and status changes.

AI-implementering: AI briefings, follow-up suggestions, owner motivation scores, and pipeline forecasts should read from the timeline.

Kostnadsanalys for AI: event-based summaries are cheaper than re-reading whole CRM records. Summarize incrementally.

Note: this is the backbone of the SaaS product.

Plan:

- Create activity event schema.
- Emit events from owners/listings/tasks/documents/opportunities.
- Add timeline endpoint.
- Add daily briefing generation.

Tva ideer:

- "What changed since yesterday?" operator feed.
- "Why should I call this owner now?" AI explanation.

### Brist 9: Observability, rate limits, and idempotency are missing

Var bristen finns: most write APIs, imports, webhooks, AI, integrations.

Vad problemet ar: production failures will be hard to diagnose and retries can create duplicate data.

Varfor det ar ett problem: CRM users lose trust fast when imports duplicate rows, webhooks replay badly, or AI silently fails.

Riskniva: High.

Teknisk forbattrring: add request IDs, structured logs, webhook event tables, idempotency keys, rate limits, and health checks.

Produktforbattring: support becomes easier and agents can see if jobs are running, failed, or blocked.

AI-implementering: every AI run should log prompt version, model, token estimate, entity target, result state, and error.

Kostnadsanalys for AI: idempotency prevents repeated AI calls on retries.

Note: this should be built before scaling import jobs.

Plan:

- Add `request_id` middleware/helper.
- Add `webhook_events` and `job_runs`.
- Add rate limiter for AI/public routes.
- Add `/api/system/health`.

Tva ideer:

- Operator "last run" panel for all jobs.
- Error digest emailed to admin daily.

### Brist 10: Product surface is wider than the canonical workflow

Var bristen finns: duplicate dashboard/app routes, demo routes, marketplace/chat variants, smart/news/training/whatsapp/exchange modules.

Vad problemet ar: many surfaces exist, but not all are ready or central.

Varfor det ar ett problem: users can get lost and unfinished modules can look like broken product.

Riskniva: Medium.

Teknisk forbattrring: route-gate experimental modules and consolidate canonical `/app/...` paths.

Produktforbattring: the product becomes focused: dashboard, owners, listings, leads, documents, reports, Zaylo, AI briefing.

AI-implementering: AI should appear inside core workflows, not as disconnected tools.

Kostnadsanalys for AI: focused workflows reduce wasted token calls on low-value experiments.

Note: keep experimental modules, but gate them.

Plan:

- Mark core routes vs labs routes.
- Add feature flags.
- Redirect duplicate routes.
- Add nav only for production-ready modules.

Tva ideer:

- "Agent OS" mode for internal daily work.
- "Market Studio" mode for public/social output.

## 7. AI Implementation Strategy

### Level 1: AI as Assistant

Goal: save time without letting AI mutate high-risk records.

Use cases:

- Lead/contact summary.
- Owner call prep.
- Listing description draft.
- Landlord report narrative draft.
- Social post captions from verified Zaylo metrics.
- Follow-up email/WhatsApp drafts.
- Document summary and field extraction.

Backend requirements:

- `ai_runs`
- `ai_prompt_versions`
- `ai_cost_ledger`
- `ai_recommendations`
- per-user/team budgets

Priority: immediate after auth/schema fixes.

### Level 2: AI as CRM Analyst

Goal: rank and explain what the agent should do today.

Use cases:

- Hot lead score.
- Owner motivation score.
- Stale follow-up detection.
- Missing-document detection.
- Area price movement summaries.
- Best-match listings for tenant/buyer requests.

Backend requirements:

- activity timeline
- normalized lead/request/listing/property data
- scoring tables with explanation fields
- scheduled jobs

Priority: after Level 1 and activity events.

### Level 3: AI as Market Intelligence Engine

Goal: make the agent look like the top specialist in villa communities.

Use cases:

- "Mudon Al Ranim 3BR rental average 195K and sale average 3.8M" style outputs.
- Weekly community briefing.
- Latest transaction commentary.
- Price-per-sqft trend cards.
- Client downloadable area reports.
- Social-ready 1350x1080 posts and 9:16 reels.

Backend requirements:

- area/sub-area/bedroom-segment model
- source links
- import runs
- metric snapshots
- content drafts
- approval workflow
- media render jobs

Priority: strategic differentiator. Build after source/import reliability.

### Level 4: AI as Agentic Operator

Goal: AI proposes a day plan and prepares actions, but humans approve sensitive sends/changes.

Use cases:

- "Prepare tomorrow's top 10 owner calls."
- "Generate area report and social post for Arabian Ranches Mirador."
- "Draft landlord update for all owners with stale listings."
- "Find listings with price drift and suggest repricing notes."

Backend requirements:

- action queue
- approvals
- policy engine
- audit logs
- rollback/undo where possible
- integration permissions

Priority: later. Do not allow autonomous mutation until auth, RLS, events, and AI logs are stable.

## 8. AI Cost Analysis

Pricing changes often. The following is current-planning guidance and should be re-verified before production budget commitments.

Verified provider references used for this audit:

- OpenAI GPT-4.1 mini model page lists GPT-4.1 mini at $0.40 per 1M input tokens, $0.10 per 1M cached input tokens, and $1.60 per 1M output tokens.
- OpenAI embeddings model page lists `text-embedding-3-small` at $0.02 per 1M tokens and `text-embedding-3-large` at $0.13 per 1M tokens.
- Supabase public pricing lists Pro from $25/month with included database, auth, storage, and bandwidth allowances.
- Anthropic pricing should be checked directly before using Claude models in production because exact model choice and price tier materially affects cost.

### Cost Drivers

1. Chat length and repeated context.
2. Document size.
3. Number of daily CRM events.
4. Owner intelligence/bulk jobs.
5. Social content generation volume.
6. Re-rendering media assets.
7. Retry loops without idempotency.

### Approximate AI Cost Scenarios

| Workflow | Assumption | Low-cost model estimate | Cost note |
|---|---:|---:|---|
| Lead classification | 1,000 runs, 500 input tokens, 50 output tokens | about $0.28 on GPT-4.1 mini | Good Level 1 use case |
| Contact/owner summary | 1,000 runs, 2,000 input tokens, 300 output tokens | about $1.28 on GPT-4.1 mini | Use incremental summaries |
| Embedding CRM notes | 10M tokens/month | about $0.20 with text-embedding-3-small | Storage/query costs separate |
| Area report draft | 300 reports/month, 3,000 input, 500 output | about $0.60/month on mini | Excludes image/video rendering |
| Premium reasoning | Any high-stakes workflow | variable | Use only for reviewed workflows |

### Cost Strategy

- Default to small/mini models for extraction, tagging, and drafts.
- Use embeddings for retrieval instead of sending all CRM history every time.
- Summarize incrementally after each important activity event.
- Cache AI outputs by entity, prompt version, and source-data hash.
- Add per-team daily/monthly token budgets.
- Store cost per action so the UI can show ROI.
- Use premium models only for high-value reports, complex reasoning, or final-review drafts.

## 9. Backend Architecture Review

### What Is Good

- App Router route structure is easy to inventory.
- Product domains are already visible as API families.
- Supabase is an appropriate data platform for this stage.
- Clerk is a strong auth foundation.
- Zaylo worker boundary is the right architectural direction.
- React PDF/report generation is useful for broker workflows.

### What Needs Hardening

- Route-level auth must be explicit and consistent.
- RLS must be team-scoped.
- Database schema must be source-controlled and complete.
- Public signing/webhook routes need clear token verification.
- AI calls need a central gateway and cost ledger.
- Long-running work needs queues/workers.
- Route families need canonical paths and feature gates.
- Mutating routes need validation and idempotency.

### Recommended Backend Layers

1. `src/lib/auth/permissions.ts`
2. `src/lib/api/handler.ts`
3. `src/lib/db/repositories/*`
4. `src/lib/ai/gateway.ts`
5. `src/lib/jobs/queue.ts`
6. `src/lib/audit/activity.ts`
7. `src/lib/zaylo/*`

## 10. SaaS/Product Opportunities

### Immediate Product Wedge

"The villa community agent cockpit."

The strongest differentiated product is not generic CRM. It is a broker command center that proves local market expertise every day.

### Highest-Value SaaS Modules

1. Community market dashboard.
2. Owner intelligence and follow-up queue.
3. Listing import and freshness tracker.
4. Landlord report generator.
5. Document/signature workflow.
6. Daily AI briefing.
7. Social proof content generator.
8. Client area report downloader.
9. Pipeline and offer/deal tracker.
10. Admin/team performance dashboard.

### Social/Lead Machine Opportunity

Zaylo can generate daily posts like:

- "Mudon Al Ranim 3BR rentals are averaging AED X/year this week."
- "4BR villas in Arabian Ranches 2 moved from AED X to AED Y."
- "Latest transactions in Mira Oasis show buyers still paying AED X/sqft."
- "If you own a villa in X, here is what changed this week."

The important product rule: every post should be backed by stored metrics, source links, imported_at timestamps, and confidence/status labels.

## 11. Prioritized Roadmap

### P0 - Production Safety

1. Force `AUTH_MODE=clerk` in production.
2. Add route-level auth helpers to all sensitive routes.
3. Lock public mutation endpoints.
4. Remove or admin-lock `/api/migrate`.
5. Add env validation for production.
6. Add Supabase schema contract.
7. Replace broad RLS policies.

### P1 - CRM Reliability

1. Add validation schemas for owners, listings, documents, opportunities, tasks, Zaylo.
2. Add `crm_activity_events`.
3. Add audit logs for document/signature/owner/listing/deal changes.
4. Add route tests for 401/403/400 behavior.
5. Add idempotency to imports/webhooks.
6. Add `system-health` API and UI checks.

### P2 - Zaylo Market Engine

1. Move Zaylo to Supabase-backed state.
2. Add area/sub-area/segment source link management.
3. Add import runs and row-level errors.
4. Add worker trigger secret.
5. Add report snapshots.
6. Add 1350x1080 and 9:16 content render jobs.

### P3 - AI Trust Layer

1. Add AI gateway.
2. Add AI run/cost tables.
3. Add daily briefing.
4. Add owner call prep.
5. Add social draft generation from Zaylo metrics.
6. Add semantic search over owners/listings/docs.

### P4 - SaaS Expansion

1. Team billing/roles.
2. Client portal.
3. WhatsApp/email integrations.
4. Deal closing workflow.
5. Multi-agent performance analytics.

## 12. Suggested New Endpoints

| Endpoint | Method | Purpose | Priority |
|---|---|---|---|
| `/api/system/health` | GET | Production dependency health | P0 |
| `/api/system/routes` | GET | Admin route exposure inventory | P0 |
| `/api/crm/activity` | GET,POST | Universal activity timeline | P1 |
| `/api/crm/timeline/:entityType/:id` | GET | Entity timeline | P1 |
| `/api/auth/session-check` | GET | Verify auth mode/user/team | P0 |
| `/api/ai/runs` | GET | AI run/cost audit | P1 |
| `/api/ai/actions` | GET,POST,PATCH | AI action approval queue | P2 |
| `/api/ai/briefing/daily` | POST,GET | Daily agent briefing | P2 |
| `/api/leads/:id/score/recompute` | POST | Recompute lead score | P2 |
| `/api/matches` | POST | Match request to listings | P2 |
| `/api/follow-ups/suggestions` | GET | AI follow-up queue | P2 |
| `/api/offers` | GET,POST | Offer records | P1 |
| `/api/deals/:id/stage` | PATCH | Controlled deal transition | P1 |
| `/api/communications` | GET,POST | Calls/emails/WhatsApp history | P1 |
| `/api/communications/drafts` | POST | AI message draft | P2 |
| `/api/zaylo/areas` | GET,POST,PATCH | Area/sub-area management | P1 |
| `/api/zaylo/import-runs` | GET,POST | Import run management | P1 |
| `/api/zaylo/import-runs/:id` | GET | Run detail/errors | P1 |
| `/api/zaylo/reports` | GET,POST | Area report snapshots | P2 |
| `/api/zaylo/social-posts` | GET,POST,PATCH | Social draft approval | P2 |
| `/api/jobs/:id` | GET | Worker job status | P1 |
| `/api/webhooks/events` | GET | Admin webhook event logs | P1 |

## 13. Suggested Database Improvements

### Access Model

- `teams`
- `team_members`
- `roles`
- `permissions`
- `role_permissions`
- `user_profiles`

### CRM Core

- `crm_activity_events`
- `communications`
- `notes`
- `tasks`
- `follow_up_rules`
- `audit_logs`
- `entity_links`

### Real Estate Core

- `properties`
- `property_units`
- `listings`
- `listing_import_runs`
- `listing_import_rows`
- `listing_snapshots`
- `viewings`
- `offers`
- `deals`
- `deal_stage_events`

### Owner/Client Core

- `owners`
- `owner_properties`
- `owner_documents`
- `owner_outreach_events`
- `client_requests`
- `lead_scores`
- `lead_status_events`

### Documents

- `document_templates`
- `document_instances`
- `document_fields`
- `signing_tokens`
- `signature_events`
- `document_snapshots`
- `report_runs`

### AI

- `ai_runs`
- `ai_prompt_versions`
- `ai_cost_ledger`
- `ai_recommendations`
- `ai_actions`
- `ai_embeddings`
- `ai_entity_summaries`
- `ai_feedback`

### Zaylo

- `zaylo_areas`
- `zaylo_sub_areas`
- `zaylo_source_links`
- `zaylo_import_runs`
- `zaylo_import_rows`
- `zaylo_market_metrics`
- `zaylo_transaction_snapshots`
- `zaylo_report_snapshots`
- `zaylo_social_posts`
- `zaylo_render_jobs`

### Integration/Operations

- `external_accounts`
- `integration_tokens`
- `webhook_events`
- `job_runs`
- `rate_limit_events`
- `system_health_checks`

## 14. Suggested AI Data Model

### `ai_runs`

Tracks every AI call.

Recommended fields:

- `id`
- `team_id`
- `user_id`
- `entity_type`
- `entity_id`
- `feature`
- `prompt_version_id`
- `model`
- `input_tokens`
- `output_tokens`
- `estimated_cost_usd`
- `status`
- `error`
- `created_at`

### `ai_prompt_versions`

Tracks prompt templates and model settings.

Recommended fields:

- `id`
- `feature`
- `version`
- `system_prompt`
- `schema`
- `model`
- `temperature`
- `is_active`
- `created_by`

### `ai_recommendations`

Stores reviewed AI insights.

Recommended fields:

- `id`
- `team_id`
- `target_entity_type`
- `target_entity_id`
- `recommendation_type`
- `title`
- `body`
- `confidence`
- `source_run_id`
- `status`
- `approved_by`
- `applied_at`

### `ai_actions`

Stores actions AI wants to take.

Recommended fields:

- `id`
- `team_id`
- `action_type`
- `target_entity_type`
- `target_entity_id`
- `payload`
- `risk_level`
- `status`
- `requires_approval`
- `approved_by`
- `executed_at`

### `ai_embeddings`

Stores semantic-search vectors.

Recommended fields:

- `id`
- `team_id`
- `entity_type`
- `entity_id`
- `content_hash`
- `content_excerpt`
- `embedding`
- `embedding_model`
- `created_at`

### `ai_entity_summaries`

Stores incremental summaries.

Recommended fields:

- `id`
- `team_id`
- `entity_type`
- `entity_id`
- `summary`
- `source_event_until`
- `model`
- `updated_at`

## 15. Final Implementation Plan

### Phase 1: Safety and Contract

1. Make production auth explicit.
2. Add route-level permission helpers.
3. Lock public mutation endpoints.
4. Produce database contract and fill migration gaps.
5. Tighten RLS.
6. Add validation helpers and schemas.

Acceptance criteria:

- Anonymous users cannot mutate CRM state.
- Production env cannot accidentally run demo-open auth.
- Route inventory shows only intentional public endpoints.
- Supabase migrations define all tables used by API routes.

### Phase 2: CRM Backbone

1. Add activity timeline.
2. Add audit logs.
3. Normalize lead/request/opportunity/deal workflow.
4. Normalize owner/property/listing relationships.
5. Add communication history and follow-up queue.

Acceptance criteria:

- Every important user action creates an event.
- Every owner/listing/lead/deal has a readable timeline.
- Dashboard uses real CRM events, not isolated counters.

### Phase 3: Zaylo Production Pipeline

1. Store area/sub-area/source links in Supabase.
2. Move import execution to worker.
3. Add import run history and row errors.
4. Add market metric snapshots.
5. Add report snapshots.
6. Add social post draft generation.

Acceptance criteria:

- Operator can add areas and links.
- Worker can run imports safely.
- Dashboard shows last run, errors, and metrics.
- Social outputs cite data freshness.

### Phase 4: AI Layer

1. Add AI gateway.
2. Add AI run/cost logging.
3. Add daily briefing.
4. Add owner call prep.
5. Add lead scoring with explanations.
6. Add AI action approval queue.

Acceptance criteria:

- Every AI call is logged with user/team/model/cost.
- AI suggestions are reviewable.
- AI cannot mutate sensitive records without approval.
- Admin can see cost by feature/team.

### Phase 5: SaaS Readiness

1. Add roles/teams/billing model.
2. Add production monitoring.
3. Add onboarding flows.
4. Add data export/admin tooling.
5. Add support/debug dashboards.

Acceptance criteria:

- New agency/team can be onboarded safely.
- Admin can diagnose failures without shell access.
- Sensitive exports are logged.
- Product is understandable from the first login.

## 16. Next command to run / Next file to inspect / First implementation task

Next command to run:

```powershell
pnpm exec tsc --noEmit
```

Next file to inspect:

```text
C:\Users\jardi\flowbyelysian\src\middleware.ts
```

First implementation task:

Create a shared backend permission helper and apply it to the highest-risk public mutation endpoints first:

1. `/api/migrate`
2. `/api/zaylo/run`
3. `/api/zaylo/source-links`
4. `/api/documents`
5. `/api/document-settings`
6. `/api/document-settings/upload-logo`
7. `/api/opportunities`
8. `/api/tasks/:id`
9. `/api/templates`
10. `/api/stats`

Recommended first implementation branch:

```text
codex/harden-api-auth-boundaries
```
