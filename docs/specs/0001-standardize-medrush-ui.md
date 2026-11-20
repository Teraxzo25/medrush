# 0001. Standardize the Medrush application UI

**Date**: 2026-11-20
**Status**: In Progress

## Summary

Medrush will become one coherent responsive application instead of three separate interface styles. Public citizen journeys will stay simple and human, while authenticated staff workspaces will use denser role specific layouts. The migration will preserve the existing emergency demo behavior, Paga contracts, and payment security while replacing local page simulation with real routes and shared components.

## Context

> Premise note: A visual refresh alone would leave the main cause of inconsistency in place. The current dashboard simulates pages and roles inside one large client component, while the guest flow and payment center use separate layout and styling systems. The right unit of work is the application structure, design system, and route model together.

The citizen SOS flow, five role views, modal workflows, navigation, demo records, and most interaction logic currently live in `components/medrush-dashboard.tsx`. Navigation changes a string value, scrolls to headings, or opens a modal. This makes browser history, direct links, permissions, responsive composition, and isolated testing difficult.

Presentation has also grown through appended overrides. `app/globals.css` defines the same tokens and surfaces more than once, while `app/payments/payments.css` introduces a separate font, color system, and component language. A shadcn and Base UI button exists, but the main screens use custom button classes instead.

The redesign must serve different contexts. Citizens and responders need fast mobile actions. Dispatch, hospital, and administration staff need denser desktop tools with usable mobile fallbacks. The product also handles location, health context, contact details, authentication, and payments, so clear status language, careful disclosure, keyboard access, and low connectivity behavior are part of correctness.

## Requirements

**User stories**:

1. As a citizen, I want to request emergency help immediately and track the request without creating an account.
2. As a responder or operations user, I want a workspace shaped around my role so the next action is obvious.
3. As a fund contributor, I want a focused public payment journey with clear provider status.
4. As a fund administrator, I want protected payout tools separated from public contribution forms.
5. As a developer, I want one route, token, and component model so new screens do not create another visual system.

**Acceptance criteria**:

1. **AC-1**: The public home shows one dominant emergency action, recent request status when present, and community fund access within the first mobile viewport. `/sos` remains directly reachable.
2. **AC-2**: The routed SOS journey preserves issue selection, contact and location entry, browser location failures, confirmation, and the prototype disclaimer. It remains usable from 320 pixel mobile widths through desktop.
3. **AC-3**: Every staff route requires a Neon Auth session and resolves one operational role from the session user. A role switcher is visible only when server configuration explicitly enables demo mode.
4. **AC-4**: Every primary navigation destination has a stable URL. Direct links, browser back and forward actions, refresh, active navigation, and route level titles work correctly.
5. **AC-5**: Public and staff surfaces share semantic tokens and the same primitives for buttons, fields, dialogs, status chips, notices, page headers, loading, empty, and error states.
6. **AC-6**: Citizen and responder views prioritize mobile use. Dispatch, hospital, and administration views prioritize desktop density and retain a usable single column or record list fallback on mobile.
7. **AC-7**: Community contribution lives in the public citizen area. Hospital payout lives in the protected administration area. Both continue to use the current payment endpoints, references, callbacks, idempotency behavior, and role checks.
8. **AC-8**: Demo requests, status changes, fund decisions, and activity persist while the same browser tab remains open. Closing the tab clears them. The stored shape is versioned so incompatible fixture changes reset safely.
9. **AC-9**: The application uses one light theme. Text and controls meet WCAG AA contrast, all actions work by keyboard, focus remains visible, dialogs manage focus, and reduced motion preferences are honored.
10. **AC-10**: Core SOS and status content works without loading an embedded map. Maps load on demand, fonts are self hosted by Next.js, and every remote or asynchronous surface has useful loading, empty, error, and retry states.
11. **AC-11**: Existing Paga contribution, payout, callback, payment status, authentication, and database behavior remains unchanged by the UI migration.
12. **AC-12**: The production build performs TypeScript checking, and automated checks cover route guards, the SOS happy path, location failure, session fixture recovery, payment placement, and key responsive layouts.

## Options considered

### Option 1: Improve the current component in place

Keep the single dashboard component and rewrite its styles and internal sections.

**Pros**:

1. Lowest initial code movement.
2. Fastest route to visible polish.

**Cons**:

1. Page strings, scroll navigation, mixed permissions, and one large state owner remain.
2. Visual inconsistency will return because boundaries are still unclear.

### Option 2: Migrate incrementally to routed role specific areas

Build shared foundations and new routes beside the current dashboard, move one complete journey at a time, then remove the legacy shell.

**Pros**:

1. Produces standard browser behavior and clear authorization boundaries.
2. Preserves working flows while each replacement is verified.
3. Lets public and operations layouts differ without fragmenting the brand.

**Cons**:

1. Old and new shells coexist during migration.
2. Temporary adapters are needed for shared demo state.

### Option 3: Replace the interface in one release

Rewrite all public, staff, and payment screens before switching traffic.

**Pros**:

1. No prolonged period with two interface systems.
2. The final component model can be designed without adapters.

**Cons**:

1. Highest regression risk across emergency and payment journeys.
2. Feedback arrives late, after most layout choices are expensive to change.

## Decision

**Chosen option**: Option 2, migrate incrementally to routed role specific areas.

Use one consumer health design system, separate public and authenticated route groups, and move one complete user journey at a time. Keep existing API and database contracts unchanged.

## Rationale

The application is small enough to improve without adding a new framework, but its current component boundaries cannot support standard navigation or authorization safely. An incremental route migration fixes those foundations while limiting the blast radius around working geolocation and payment behavior. It also supports the selected role adaptive strategy, because citizens and staff can share tokens and primitives without being forced into the same layout density.

The runner up is a direct replacement. It would reduce temporary duplication, but the emergency and payment paths have enough distinct states that a single cutover would concentrate avoidable risk.

## Feature design

### Information architecture

| Area | Route group | Primary destinations | Access |
|---|---|---|---|
| Citizen | `/`, `/sos`, `/requests/[id]`, `/fund/contribute` | Home, request flow, request status, contribution | Public |
| Staff entry | `/app` | Resolve session role and redirect | Signed in staff |
| Dispatch | `/app/dispatch/*` | Overview, emergencies, ambulances, map, hospitals | Dispatch role |
| Responder | `/app/responder/*` | Overview, offers, active route, handover | Responder role |
| Hospital | `/app/hospital/*` | Overview, arrivals, prealerts, payment records | Hospital role |
| Administration | `/app/admin/*` | Fund overview, requests, payouts, repayments, audit, settings | Administration role |

Every primary destination is a page. Dialogs are reserved for short focused actions such as confirmation, not for entire destinations.

### Visual system

| Element | Standard |
|---|---|
| Character | Human consumer health for public screens, calm clinical operations for staff screens |
| Theme | Light only |
| Type | `DM Sans` through `next/font`, with tabular numerals for metrics and money |
| Canvas | Cool pale gray with white primary surfaces and no decorative gradients |
| Brand color | Deep teal for navigation, links, and normal primary actions |
| Emergency color | Deep red only for SOS, critical alerts, and destructive actions |
| Status colors | Green for confirmed, amber for review, blue for active response, neutral gray for inactive |
| Spacing | Four pixel base scale, with public screens more open and staff screens more compact |
| Shape | Eight pixel fields, ten pixel controls, fourteen pixel panels, full pills only for compact status |
| Elevation | Borders and spacing first, one soft shadow only for overlays and floating menus |
| Motion | Short opacity and transform feedback only, no perpetual pulse, all motion disabled by reduced motion preference |

The public home uses a compact header, one dominant SOS action, request status, nearby support summary, and community fund access. Decorative stock imagery is not used. Maps, icons, status marks, and real data are the visual assets.

Staff pages use a shared sidebar and top bar on desktop. Citizen and responder pages use a compact mobile header and at most four bottom navigation destinations. Dense tables become record cards or focused detail views below the desktop breakpoint instead of relying on page wide horizontal scrolling.

### Component inventory

| Foundation | Components |
|---|---|
| Shells | `PublicShell`, `StaffShell`, `StaffSidebar`, `MobilePrimaryNav`, `PageHeader` |
| Actions | `Button`, `IconButton`, `EmergencyAction`, `MenuItem` |
| Forms | `FormField`, `SelectField`, `InlineError`, `FormActions` |
| Feedback | `StatusChip`, `Notice`, `Toast`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `Skeleton` |
| Data | `Metric`, `RecordTable`, `RecordList`, `DetailList`, `ActivityFeed` |
| Domain | `RequestSummary`, `DispatchStatus`, `AmbulanceSummary`, `FundSummary`, `PaymentStatus`, `MapPanel` |

Base UI and the existing shadcn setup provide accessible primitives. Product components compose those primitives and use Tailwind utilities plus semantic CSS variables. Large page specific class blocks and duplicate button systems are not retained.

### Demo state model

No PostgreSQL schema changes are part of this work. Existing payment records remain the only persisted domain data.

`DemoWorkspaceProvider` owns typed emergency, ambulance, fund, payment, activity, and settings fixtures. It writes a versioned snapshot to `sessionStorage` under `medrush.demo.v1`. Invalid, missing, or older snapshots fall back to clean fixtures. The provider exposes domain actions rather than raw setters so status rules remain in one place.

### State transitions

Emergency transitions remain `Incoming` to `Offered` to `Accepted` to `En route` to `At scene` to `Completed`, with `Declined` available where the current demo allows it. Fund decisions remain `Review`, `Approved`, or `Declined`. Payment states remain `pending`, `processing`, `successful`, `failed`, or `reversed` from the existing provider flow.

### Interface surface

Existing payment APIs remain unchanged.

| Interface | Purpose | Access | Change |
|---|---|---|---|
| `/api/auth/[...path]` | Neon Auth actions and sessions | Public protocol, protected session | None |
| `/api/payments/community-contribution` | Start public Paga contribution | Public with current validation | None |
| `/api/payments/hospital-payout` | Validate and send hospital payout | Administration role | None |
| `/api/payments/status` | Read contribution or payout status | Current reference rules | None |
| `/api/payments/paga-callback` | Receive signed provider updates | Signed provider callback | None |

Route guards read the session on the server. Client navigation never decides authorization. The demo role selector receives its allowed roles from the server only when `MEDRUSH_DEMO_MODE` is enabled.

### Value sourcing

| Action | Value produced or displayed | Source |
|---|---|---|
| Render citizen home | Open request, request status, contribution entry | Versioned session fixtures and existing payment status data |
| Submit demo SOS | Request identity, category, contact, location, initial status | Form values plus a generated demo request identifier |
| Resolve staff workspace | Staff role and allowed navigation | Neon Auth session user role |
| Render operations metrics | Counts, response states, fund totals | Demo provider selectors and existing Paga transaction rows |
| Start contribution | Reference, checkout URL, pending state | Existing contribution API response |
| Submit payout | Verified account name, masked account, reference, provider state | Existing payout API response |

### Key invariants

1. Red never represents routine navigation or a normal primary action.
2. An emergency action is always visible without competing primary actions.
3. Authorization is enforced on the server, not hidden only in the client.
4. Public contribution and protected payout forms never share one screen.
5. Full contact details appear only where the role and task require them.
6. Core emergency content never depends on an embedded map loading.
7. A destination that users may revisit has a URL rather than local page state.

### Security model

Citizen SOS and contribution routes are public. Dispatch, responder, hospital, and administration route groups require a valid session and an exact role match. Administration and owner roles retain access to payout actions. The production UI has no role impersonation.

Lists show masked phone and account values. Full contact details appear only on an authorized request detail surface. Notifications, browser storage, analytics events, and error text do not include health details, full phone numbers, bank values, secrets, or provider credentials.

### Configuration required

1. `MEDRUSH_DEMO_MODE`: enables the staff role switcher and visible demo controls when set on the server.
2. `MEDRUSH_UI_V2`: sends users to the new routed interface during staged rollout and provides an immediate rollback switch.

### Critical test scenarios

1. A citizen starts at `/`, completes `/sos`, and sees the same request on `/requests/[id]`, verifying **AC-1**, **AC-2**, and **AC-8**.
2. Location permission denial leaves manual location entry usable and clearly explained, verifying **AC-2** and **AC-10**.
3. A signed out user and a user with the wrong role cannot open a staff route, verifying **AC-3**.
4. Direct route entry, refresh, and browser history preserve the correct page and active navigation, verifying **AC-4**.
5. Public contribution completes through the current callback while payout remains protected in administration, verifying **AC-7** and **AC-11**.
6. Public and staff layouts pass keyboard, focus, contrast, reduced motion, and target mobile viewport checks, verifying **AC-6**, **AC-9**, and **AC-12**.
7. An invalid stored fixture version resets safely without breaking the shell, verifying **AC-8**.

## Build plan

The project has no recorded delivery approach. Use a tracer bullet approach, meaning one complete working journey is migrated before the next journey begins.

1. Establish semantic tokens, `DM Sans`, shared primitives, page state components, route test helpers, and strict TypeScript builds, satisfying **AC-5**, **AC-9**, and **AC-12**.
2. Add the versioned demo provider and migrate the public home, SOS flow, and request detail as the first complete route slice, satisfying **AC-1**, **AC-2**, **AC-4**, **AC-8**, and **AC-10**.
3. Add the protected staff shell, server role guard, responsive navigation, and dispatch overview plus queue as the first operations slice, satisfying **AC-3**, **AC-4**, **AC-5**, and **AC-6**.
4. Migrate responder, hospital, and administration destinations one role at a time, replacing simulated page strings with URLs and shared domain components, satisfying **AC-3**, **AC-4**, **AC-5**, and **AC-6**.
5. Move community contribution into the citizen area and hospital payout into administration without changing API contracts, satisfying **AC-7** and **AC-11**.
6. Complete on demand maps, all loading, empty, error, retry, offline, table fallback, focus, and disclosure states, satisfying **AC-5**, **AC-6**, **AC-9**, and **AC-10**.
7. Run route, accessibility, responsive, and payment regression checks. Enable the new routes by configuration, then remove `components/medrush-dashboard.tsx`, conflicting legacy CSS, and the old role switcher after verification, satisfying **AC-11** and **AC-12**.

## Consequences

**Positive**:

1. Navigation, permissions, and browser behavior become predictable.
2. Each role gets the density and controls its work requires.
3. Public payments and protected payouts no longer compete on one screen.
4. Shared primitives make future screens faster and safer to add.

**Negative and tradeoffs**:

1. Two shells and two route paths coexist during migration.
2. Session fixtures need a version and recovery path even though they are temporary.
3. Light only removes the existing dark mode preference.
4. Route level components create more files than the current monolith, in exchange for clearer ownership and testing.

**Neutral**:

1. Payment APIs and the Paga transaction schema do not change.
2. Demo emergency records remain local to one browser tab and are not production records.

## Migration plan

**Strategy**: Strangler migration behind `MEDRUSH_UI_V2`.

**Phases**:

1. Build the shared foundation and citizen route slice while the current root remains available.
2. Enable the citizen slice for internal review and verify geolocation, session recovery, mobile layout, and request tracking.
3. Add the staff shell and migrate one role at a time, beginning with dispatch.
4. Split contribution and payout placement while preserving the existing endpoints.
5. Switch the default interface, observe errors and payment status behavior, then remove the legacy shell and duplicate CSS.

**Rollback**: Disable `MEDRUSH_UI_V2` to return traffic to the current shell. No database rollback is needed because the migration does not change persisted schemas or payment contracts.

**Risks**: Shared session fixtures can drift between old and new shells. Payment links can break if routes change without preserving callback parameters. Staff role values can differ from the labels currently used by the client. Each risk is contained by adapters, route tests, and an unchanged API layer until the final cutover.

## Follow up

1. Confirm the exact Neon Auth role values for dispatch, responder, hospital, administration, and owner before implementing route guards.
2. Define a production emergency data model and service boundary in a separate decision before replacing demo fixtures.
3. Add project context in `AGENTS.md` so the route, component, styling, auth, and payment conventions remain durable.
4. Consider installing the official Vercel React best practices, Vercel composition patterns, shadcn, and Neon PostgreSQL skills before implementation.
