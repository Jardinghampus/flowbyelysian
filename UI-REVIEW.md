# UI Review — Full Project Audit

**Audited:** 2026-03-19
**Baseline:** Abstract 6-pillar standards (no UI-SPEC)
**Screenshots:** Not captured (no dev server)
**Registry:** shadcn official only — 55 components, 0 flags

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 2/4 | Template "ShadcnStore" branding left in 11+ files, generic empty/error states, placeholder alt text |
| 2. Visuals | 3/4 | Good hierarchy and card consistency, but ~50 icon-only buttons lack aria-labels/tooltips |
| 3. Color | 2/4 | 193 hardcoded hex codes + 90 rgba/hsl values bypass design tokens; exchange components worst offenders |
| 4. Typography | 2/4 | 12 Tailwind sizes + 260 arbitrary pixel values; heading hierarchy inverted in multiple places |
| 5. Spacing | 3/4 | Strong base-4 rhythm; only 5 trivial arbitrary pixel values; 162 classes but consistent core |
| 6. Experience Design | 2/4 | Half of delete actions skip confirmation; 5 of 35 routes have loading.tsx; zero Suspense boundaries |

**Overall: 14/24**

---

## Top 3 Priority Fixes

1. **Replace all "ShadcnStore" template branding** — Users see an unbranded/wrong-brand experience on auth pages — Find-and-replace "ShadcnStore" with the actual brand name across 11 auth files, sidebar-notification.tsx, and upgrade-to-pro-button.tsx
2. **Add AlertDialog to unconfirmed destructive actions** — Users can accidentally delete tasks, documents, collections, saved properties, and search profiles with no undo — Add AlertDialog confirmation to 7 delete actions in tasks, smart, saved, requests, my-search, and contacts
3. **Refactor exchange components off hardcoded colors** — ~180+ hardcoded gray/neutral classes in agency-inquiry, request-form, request-popup, inventory-browser break dark mode — Replace with semantic tokens (bg-background, text-foreground, border-border)

---

## Detailed Findings

### Pillar 1: Copywriting (2/4)

#### Template Branding Left In Place
- `src/app/(auth)/sign-in-3/components/login-form-3.tsx:27` — "ShadcnStore" instead of actual brand
- `src/app/(auth)/sign-up-3/components/signup-form-3.tsx:28` — "ShadcnStore"
- `src/app/(auth)/forgot-password-2/page.tsx:15` — "ShadcnStore"
- `src/app/(auth)/forgot-password-3/components/forgot-password-form-3.tsx:27` — "ShadcnStore"
- `src/app/(auth)/layout.tsx:4` — Page title "Authentication - ShadcnStore"
- `src/app/(auth)/sign-up-2/page.tsx:15` — "ShadcnStore"
- `src/app/(auth)/sign-in-2/page.tsx:15` — "ShadcnStore"
- `src/components/sidebar-notification.tsx:38` — Links to "ShadcnStore"
- `src/components/upgrade-to-pro-button.tsx:10` — SHADCN_BLOCKS_URL

#### Placeholder Alt Text
- `src/app/(auth)/errors/*/components/*.tsx:14` — 5 error pages use `alt="placeholder image"`
- `src/app/(auth)/sign-in-3/components/login-form-3.tsx:106` — `alt="Image"`
- `src/app/(auth)/sign-up-3/components/signup-form-3.tsx:133` — `alt="Image"`
- `src/app/(auth)/sign-in-2/page.tsx:27` — `alt="Image"`
- `src/app/app/pipeline/page.tsx:474` — `alt=""` (empty)
- `src/app/app/tasks/components/user-nav.tsx:26` — `alt="@shadcn"` (template artifact)

#### Generic Empty States
- `src/app/user/dashboard/components/data-table.tsx:582,791` — "No results." (no guidance)
- `src/app/app/tasks/components/data-table.tsx:119` — "No results."
- `src/app/app/dashboard/components/data-table.tsx:791` — "No results."
- `src/components/command-search.tsx:202` — "No results found."

#### Generic Error Messages
- `src/app/user/error.tsx:27` — "Something went wrong" (vague)
- `src/app/app/error.tsx:27` — Identical copy, no differentiation between CRM and customer error
- `src/components/landing/chat-popup.tsx:82,93` — No recovery guidance

#### Generic CTAs & Placeholders
- `src/app/app/calendar/components/event-form.tsx:284` — "Add" should be "Add Attendee"
- `src/app/app/calendar/components/event-form.tsx:329` — "Delete" should be "Delete Event"
- `src/app/(auth)/sign-up/page.tsx:232,258,274,285,309` — 5x `placeholder="Select"` (should specify what)
- `src/app/(auth)/sign-in-2/components/login-form-2.tsx:23` — `defaultValue="test@example.com"` visible to users

#### Dead Links
- 5 error pages have `"Contact Us"` button linking to `"#"` — nonfunctional

---

### Pillar 2: Visuals (3/4)

#### Icon-Only Buttons Without Accessible Labels (~50)
- `src/app/app/smart/components/document-card.tsx:157-174` — Eye, MessageSquare icons
- `src/app/user/settings/connections/page.tsx:121-171` — Four Globe buttons
- `src/app/app/inventory/components/inventory-table.tsx:186` — MoreHorizontal
- `src/app/app/users/components/contact-card.tsx:154-168` — Copy, Mail icons
- `src/app/app/smart/components/collection-sidebar.tsx:123,198` — Multiple icon buttons
- `src/app/app/training/components/create-module-dialog.tsx:257,276` — Icon buttons
- `src/app/app/smart/components/chat-panel.tsx:117,128,307` — Three icon buttons

#### Positive Patterns
- `src/app/user/chat/components/chat-header.tsx:132-184` — Icon buttons correctly wrapped in Tooltip
- `src/app/app/mail/components/mail-display.tsx:42-58` — Icon buttons use title= attributes
- `src/components/notification-bell.tsx:114` — sr-only span for screen reader text
- `src/components/marketplace/property-card.tsx:86-160` — Strong visual hierarchy
- `src/app/globals.css:178-193` — Base typography system with heading weights

#### Loading States Gap
- Skeleton component exists but only used in 4 files
- Only 5 of ~72 pages have loading.tsx files

---

### Pillar 3: Color (2/4)

#### Hardcoded Colors (bypass design tokens)
- **193 hex codes** and **90+ rgba/hsl values** in TSX files
- `src/components/loading-screen.tsx:32-33` — Hardcoded #0DC1FD, #D915EF, #FF3F2ECC
- `src/components/ui/button.tsx:155-260` — 20+ hardcoded rgba() in shadow definitions
- `src/components/ui/colourful-text.tsx:13-22` — 10 hardcoded rgb() values

#### Worst Offender Files (exchange components)
- `src/components/exchange/agency-inquiry.tsx` — 39 hardcoded color references
- `src/components/exchange/request-form.tsx` — 46+ hardcoded gray/neutral classes
- `src/components/exchange/request-popup.tsx` — 43+ hardcoded references
- `src/components/exchange/inventory-browser.tsx` — 35+ hardcoded references

#### Contrast Failures (WCAG AA)
- `src/components/landing/footer.tsx:187,195` — `text-white/40` (fails 4.5:1)
- `src/app/app/news/components/news-feed.tsx:193` — `text-white/30` (extremely low)
- `src/components/landing/off-plan-cta.tsx:117` — `text-white/40`
- `src/components/landing/hero-section.tsx:105` — `text-white/50`

#### Dark Mode Inconsistency
- 443 `dark:` prefixes across 50+ files — good foundation
- Exchange components manually implement dark mode with `dark:bg-neutral-*` instead of semantic tokens
- `src/components/marketplace/property-card.tsx:100` — `bg-white` instead of `bg-background`

#### 60/30/10 Balance
- Neutral tokens: ~213 uses (60% layer) — OK
- Muted/secondary: ~338 uses (30% layer) — OK
- Primary accent: ~338 uses — **overrepresented** vs 10% target
- ~682 raw Tailwind color utilities (text-red-500, bg-green-100) outside token system

---

### Pillar 4: Typography (2/4)

#### Font Size Proliferation
- **12 distinct Tailwind sizes** in use (threshold: >6 = flag)
- **260 arbitrary pixel font sizes** bypassing the design system:
  - `text-[10px]`: 162 occurrences
  - `text-[11px]`: 72 occurrences
  - `text-[9px]`: 11 occurrences
  - `text-[13px]`: 7 occurrences
  - Plus 4 more non-standard sizes

#### Font Weights — OK
- 3 dominant weights: font-medium (598), font-semibold (330), font-bold (321)
- font-normal only 26 occurrences in UI primitives

#### Heading Hierarchy — Broken
- **h1 uses 7 different sizes** (text-2xl to text-7xl)
- **h2 uses 8 different sizes** (text-sm to text-5xl)
- **h3 uses 8 different sizes** (text-xs to text-4xl)
- `src/components/landing/areas-section.tsx:140` — h3 uses text-3xl/text-4xl, **larger than many h1s**
- `src/app/user/marketplace/page.tsx:541` — h2 uses text-sm, **smaller than most h3s**
- `src/components/landing/hero-section.tsx` — h1 text-7xl vs `src/components/layouts/base-layout.tsx:32` h1 text-2xl (5-step gap)

#### Recommended Fix
- Standardize: h1 = text-2xl (app) / text-4xl+ (marketing), h2 = text-xl (app) / text-3xl (marketing), h3 = text-base/text-lg
- Replace 260 arbitrary pixel values with Tailwind scale equivalents or a custom `text-2xs` utility
- Consider shared heading component variants (PageTitle, SectionTitle, CardTitle)

---

### Pillar 5: Spacing (3/4)

#### Consistent Core Rhythm
- Top values: gap-2 (663), px-4 (276), gap-4 (243), gap-3 (239), gap-1 (218)
- Clear base-4 rhythm (1rem) with half-step (0.5rem) increments

#### Minimal Arbitrary Values
- Only 5 arbitrary pixel spacings: p-[4px], p-[3px], p-[2px], m-[1px], gap-[3px]
- All are sub-pixel adjustments, not structural violations

#### Card Padding — Consistent
- Card component defaults: py-6 with px-6 on CardHeader/CardContent/CardFooter
- Consumer overrides mostly p-4, p-3 — acceptable variation

#### Responsive Breakpoints
- lg: 80 usages, md: 56 usages, sm: 19 usages
- Mobile-first approach evident; sm: slightly underutilized for mobile-to-tablet transitions

---

### Pillar 6: Experience Design (2/4)

#### Loading States (partial)
- **5 of ~35 route segments** have loading.tsx files
- **Zero Suspense boundaries** in entire codebase
- Client-side loading exists for: leads, admin, tasks, news, ai-assistant, owner-intelligence
- **Missing loading.tsx:** app/leads, app/mail, app/tasks, app/inventory, app/pipeline, app/calendar, app/news, app/training, app/performance, app/areas, user/marketplace, user/chat, user/requests, user/my-listings, user/saved, user/my-search, user/market-updates, user/market-statistics
- Plain text "Loading..." in: `src/app/app/tasks/page.tsx:52`, `src/app/user/chat/page.tsx:39`

#### Error States (good foundation)
- 2 route-level error.tsx files with retry buttons
- 5 polished auth error pages (401, 403, 404, 500, maintenance)
- Only 12 files use react-hook-form/zodResolver; rest rely on HTML `required`
- Auth forms (sign-in-3, sign-up-3) have no client-side validation

#### Empty States (good)
- Most list/table views handle empty data with helpful messages
- Minor gap: some lack actionable CTAs

#### Destructive Actions — Mixed
**WITH AlertDialog (good):**
- `src/app/app/inventory/components/inventory-table.tsx:237` — Delete listing
- `src/app/user/my-listings/page.tsx:1118` — Remove listing
- `src/app/app/admin/page.tsx:545` — Delete user
- `src/app/app/admin/components/market-updates-cms.tsx:314` — Delete post
- `src/app/app/training/components/training-module-card.tsx:186` — Delete module

**WITHOUT confirmation (needs fix):**
- `src/app/app/tasks/components/data-table-row-actions.tsx:45` — Delete task
- `src/app/app/smart/components/document-card.tsx:208` — Delete document
- `src/app/app/smart/components/collection-sidebar.tsx:216` — Delete collection
- `src/app/user/saved/page.tsx:87` — Remove saved property
- `src/app/user/requests/page.tsx:171` — Delete request
- `src/app/user/my-search/page.tsx:326` — Delete search profile
- `src/app/app/owner-intelligence/_components/ContactsTable.tsx:381` — Delete contact

#### Navigation Gaps
- Breadcrumb component exists at `src/components/ui/breadcrumb.tsx` but is **never used**
- No back-navigation buttons on nested pages (areas/[slug], settings sub-pages)
- Toast (Sonner) used consistently for action feedback — good

#### Accessibility Gaps
- `aria-label` used in only 10 files (14 occurrences) — sparse
- Only 1 file uses `role="status"` or `aria-live`
- No skip-to-content navigation link
- No `role="alert"` for error messages
- Only 9 `onKeyDown` handlers — limited keyboard navigation beyond shadcn defaults
- `sr-only` used in 24 files (68 occurrences) — decent but not comprehensive

---

## Registry Safety

Registry audit: Official shadcn registry only. 55 components installed, 0 third-party blocks, 0 suspicious flags.

**Modified components:**
- `button.tsx` — Extended with custom "cool" variant, LiquidButton, MetalButton components
- `card.tsx` — Border customized to `border-neutral-200/70 dark:border-white/[0.08]`, corner radius changed to `rounded-2xl`

---

## Files Audited

Comprehensive audit across all directories:
- `src/app/(auth)/*` — All auth pages and error pages
- `src/app/app/*` — All CRM/ZFLOW pages (dashboard, pipeline, leads, inventory, tasks, mail, calendar, smart, training, news, performance, areas, admin, ai-assistant, seo-generator, description-writer, follow-up, listing-video, owner-intelligence, exchange)
- `src/app/user/*` — All customer pages (dashboard, marketplace, chat, saved, requests, my-listings, my-search, market-updates, market-statistics, settings)
- `src/app/(landing)/*` — Landing pages
- `src/components/*` — All shared components (sidebar, navbar, command-search, exchange, landing, marketplace, ui)
- `src/components/ui/*` — 55 shadcn components
- `src/middleware.ts` — Route configuration
- `src/app/globals.css` — Theme tokens and base styles
