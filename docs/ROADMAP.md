# docs/ROADMAP.md
# ROADMAP.md

## Overview
Iterative, non-breaking delivery. Ship small, reversible slices; keep legacy routes alive until full cutover. This roadmap reflects the **current state** and near-term plan.

---

## Phase 0 — Today (2025-08-10) ✅

**Shipped**
- **Outbox (sender) aliases** live: `/api/outbox/handshakes` (+ `/requests`, `/:id/inbox-token`)  
  *Legacy routes retained:* `/api/user-handshake`, `/api/handshakes/:id/requests`
- **Inbox (read-only) via token:**  
  - `GET /api/inbox/handshakes/:id/submissions`  
  - `GET /api/inbox/submissions/:submissionId`  
  - Middleware scopes by `handshake_id`; supports `Bearer <token>` or `?token=…`
- **Public submit validation** hardened: defensive `select` rule (optional provided values must be in options)
- **DB migrations:** `receivers`, `inbox_access_tokens`, `submissions.receiver_id`, `handshakes.updated_at`
- **Frontend:** minimal Inbox UI (list/detail), Outbox wrappers; legacy dashboard kept
- **Billing (dev skeleton):** Stripe Checkout + Webhook routes present (test mode)
- **Health/smoke:** `/api/health`, `/api/inbox/health`, cURL flow documented in `USER_FLOWS.md`

Exit criteria met for Phase 0.

---

## Phase 1 — MVP (v0.1) Completion (Next 1–2 weeks)

**Goals**
- **Billing MVP (dev):** end-to-end Checkout (test), Webhook handling, and **plan limit lift** for subscribers
  - Free plan: **1 active** handshake; Active subscriber: **3** active handshakes
- Public form UX polish:
  - Per-field error display (client), disable-on-submit + loading states
- Sender UI baseline:
  - Simple list/detail of submissions within Outbox (reuse current components)
- Storage:
  - Keep dev on local; prepare S3 wiring (no prod cutover yet)
- Quality gates:
  - Unit tests for services + integration tests for key routes (public submit, outbox CRUD, inbox read)
- Docs:
  - Keep `PATH.md`, `ARCHITECTURE.md`, `SCOPE.md` aligned per change

**Exit criteria**
- Billing path verified in dev; limits enforced/relaxed per plan
- Public submit UX is clear and validated end-to-end
- Outbox shows submissions list for a handshake
- Tests cover critical flows; CI green on PR

---

## Phase 2 — Navigation Shell (3-Layer UI)

**Experience model**
- **Layer 1 — Inbox / Outbox** (incoming vs outgoing)
- **Layer 2 — Folders** (UI-only initially; **“See all handshakes”** bypass)
- **Layer 3 — Handshakes** (list/detail)

**Scope (UI-first)**
- Desktop: left rail **Folders** | center **Handshakes**; URL-driven state
- Mobile/Tablet: top tabs + hamburger folder drawer; same URL params/state
- Routing:
  - Outbox: `/outbox?folder=all|<id>&archived=false|true|all`
  - Inbox: `/inbox?folder=all|<id>&archived=false|true|all&token=…`
  - Alias during transition: `/dashboard?box=outbox|inbox&folder=…&archived=…`

**📌 Cleanup Candidates (Post–DashboardV2 Migration)**  
*(Track and remove after `/dashboard/v2` fully replaces legacy dashboard flows)*

- `src/client/pages/outbox/OutboxHome.tsx` → wraps `HandshakeList` (legacy sender list)  
- `src/client/pages/outbox/OutboxRequests.tsx` → wraps `HandshakeRequests` (legacy sender handshake detail)  

**Removal Criteria:**  
- Outbox listing and detail available inside `DashboardV2` (Layer 1–3 shell)  
- All `/outbox/*` and `/dashboard/handshakes*` references migrated to `/dashboard/v2`

**Exit criteria**
- Shell live with folders as **UI-only grouping**; refresh preserves state via URL  
- Legacy Outbox wrappers removed per “Cleanup Candidates” above
 
---

## Phase 3 — Stabilization & Security (v0.2)

**Security & tokens**
- Inbox tokens: **default expiry**, **revoke endpoint**, and **hash at rest**
- Add `Referrer-Policy: no-referrer`; avoid logging query strings

**Rate limiting & hardening**
- Rate limit `/api/inbox/*`, `/api/auth/*`, and public submit
- Enforce body size limits; MIME/size checks for uploads (dev)

**Observability**
- Structured request/error logging (no PII/tokens)
- Basic uptime + error alerts

**Indexes & perf**
- Ensure `requests(handshake_id)` index; review slow queries

**Exit criteria**
- Token lifecycle enforced; abuse mitigations in place
- Baseline observability and rate limits live

---

## Phase 4 — Expansion & Monetization (v1.0)

**Receiver attribution & accounts**
- Carry token on public link; set `submissions.receiver_id`
- (Optional) Receiver accounts with personal Inbox (later)

**Sender experience**
- Archive/duplicate/resend
- Search, filter, sort in Outbox

**Commerce & signatures**
- Stripe (one-off + subscriptions)
- E-signatures with audit trail

**Branding & API**
- Custom branding/domains
- Webhooks + public API; initial integrations (Zapier/Make)

**Analytics**
- Basic reporting (submission counts, completion times)

**Exit criteria**
- Paid tier(s) available; core workflows stable and measurable

---

## Phase 5 — Scale & Integrations (v2.0+)

- Prod uploads on **S3** with signed URLs; background malware scan
- Deep integrations (Slack/Email notifications, CRM hooks)
- Localization & multi-language flows
- PWA; evaluate native mobile
- AI assists: auto-validate uploads, pre-fill/detect missing info
- Compliance: retention policy, DSR endpoints, audit logging

---

## Timeline (Tentative)

| Quarter | Goals                                                       |
|--------:|-------------------------------------------------------------|
| Q3 2025 | Phase 0 shipped (**token-gated** Inbox); Phase 1 kick-off   |
| Q4 2025 | Phase 1 completion; Phase 2 Navigation Shell                |
| Q1 2026 | Phase 3 Stabilization & Security                            |
| Q2 2026 | Phase 4 Expansion & Monetization                            |
| Q3 2026 | Phase 5 Scale & Integrations                                |

---

## Planned (Deferred until after Billing MVP): Folders (FLD)

**Status:** Planned  
**Why now?** Improves navigability at scale  
**Why not now?** Billing MVP first (Checkout + Webhook + Limits)

### Overview
Three-layer model: **Box** (Inbox/Outbox) → **Folders** → **Handshakes**.  
Folders are optional; **All** (no folder) is always available. **For MVP, folders are UI-only.**

### Phases
**FLD-1 — DB + API (post-Billing)**
- Tables / columns
  - `folders(id SERIAL PK, user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW())`
  - Unique per user: `(user_id, name)`
  - `handshakes.folder_id INT NULL REFERENCES folders(id) ON DELETE SET NULL`
- Indexes
  - `CREATE INDEX idx_folders_user ON folders(user_id);`
  - `CREATE INDEX idx_handshakes_folder ON handshakes(folder_id);`
- Endpoints
  - `GET /api/folders` → list user folders with counts `{ id, name, count_active, count_archived }`
  - `POST /api/folders` `{ name }` → 409 on duplicate (per user)
  - `PUT /api/folders/:id` `{ name }` → rename
  - `DELETE /api/folders/:id` → handshakes fallback to `NULL`
  - Extend list: `GET /api/outbox/handshakes?archived=false|true|all&folderId=<id|null>`
  - Move handshake: `PUT /api/outbox/handshakes/:id/folder` `{ folderId: number|null }`

**FLD-2 — UI Skeleton**
- Shell with **Inbox/Outbox** tabs (Layer 1).
- Folder list (left rail on desktop; slide-in drawer on mobile) including **All** (Layer 2).
- Main area shows filtered handshake list (Layer 3).
- URL-driven state:
  - `/outbox?folder=all|<id>&archived=false|true|all`
  - `/inbox?folder=all|<id>&archived=false|true|all&token=…`
  - Alias: `/dashboard?box=outbox|inbox&folder=…&archived=…`

**FLD-3 — Assign / Move**
- Row action “Move to…” (menu of folders + “All”), optimistic update.
- Basic rename/delete folder flows.

### Acceptance (per phase)
- **FLD-1:** schema + curl happy paths (list/create/move).
- **FLD-2:** folders visible; clicking updates URL and list; refresh persists.
- **FLD-3:** move persists and survives refresh.

### Dependencies
Ships **after** Billing MVP: Checkout + Webhook verified and paid limits active.

---

## Notes
- Roadmap adapts to user feedback; keep `SCOPE.md`, `PATH.md`, and `RISKS.md` synchronized.
- Non-destructive policy: keep legacy routes until full UI cutover and tests pass.
