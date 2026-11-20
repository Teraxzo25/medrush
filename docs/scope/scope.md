# Medrush scope

**Workflow:** Beta

## At a glance

| Feature | Status | Spec |
|---|---|---|
| Standardize the application UI | in-progress | [0001](../specs/0001-standardize-medrush-ui.md) |

## In progress

### Standardize the application UI `in-progress`

**Intent:** Replace the simulated single page dashboard with one consumer health design system, routed citizen journeys, and protected role specific staff workspaces while preserving the emergency demo and Paga behavior.

**Done when:** Public and staff destinations use real routes and shared primitives, role guards protect staff workspaces, citizen and staff layouts meet their responsive needs, payment journeys are split by audience, and the legacy dashboard and duplicate styles are removed after regression checks pass.

**Code:** `app/page.tsx`, `app/sos/`, `app/requests/`, `components/public/`, `components/ui/`, `lib/demo-workspace.tsx`

- [x] Design it (spec): [0001](../specs/0001-standardize-medrush-ui.md)
- [ ] Build it: /develop standardize the application UI
  - [ ] Establish the tokens, primitives, demo state provider, strict build, and shared test foundation, covers **AC-5**, **AC-8**, **AC-9**, **AC-12**
  - [x] Migrate the public home, SOS, request status, and low connectivity behavior, covers **AC-1**, **AC-2**, **AC-4**, **AC-8**, **AC-10**
  - [ ] Add the protected staff shell and migrate each operational role, covers **AC-3**, **AC-4**, **AC-5**, **AC-6**
  - [ ] Split contribution and payout journeys, verify payment contracts, then retire the legacy shell, covers **AC-7**, **AC-11**, **AC-12**
- [ ] Verify it: /check verify standardize the application UI
- [ ] Test it: /test standardize the application UI
