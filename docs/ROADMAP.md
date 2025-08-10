```md
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
- **Health/smoke:** `/api/health`, `/api/inbox/health`, cURL flow documented in `USER_FLOWS.md`

Exit criteria met for Phase 0.

---

## Phase 1 — MVP (v0.1) Completion (Next 1–2 weeks)

**Goals**
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
- Public submit UX is clear and validated end-to-end
- Outbox shows submissions list for a handshake
- Tests cover critical flows; CI green on PR

---

## Phase 2 — Stabilization & Security (v0.2)

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

## Phase 3 — Expansion & Monetization (v1.0)

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

## Phase 4 — Scale & Integrations (v2.0+)

- Prod uploads on **S3** with signed URLs; background malware scan
- Deep integrations (Slack/Email notifications, CRM hooks)
- Localization & multi-language flows
- PWA; evaluate native mobile
- AI assists: auto-validate uploads, pre-fill/detect missing info
- Compliance: retention policy, DSR endpoints, audit logging

---

## Timeline (Tentative)

| Quarter | Goals                                                     |
|--------:|-----------------------------------------------------------|
| Q3 2025 | Phase 0 shipped (tokened Inbox); MVP polish (Phase 1)     |
| Q4 2025 | Stabilization & Security (Phase 2)                        |
| Q1 2026 | Expansion & Monetization (Phase 3)                        |
| Q2 2026 | Scale & deeper integrations (Phase 4)                     |

---

## Notes
- Roadmap adapts to user feedback; keep `SCOPE.md`, `PATH.md`, and `RISKS.md` synchronized.
- Non-destructive policy: keep legacy routes until full UI cutover and tests pass.
```
