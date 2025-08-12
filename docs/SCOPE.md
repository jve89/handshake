# docs/SCOPE.md
# SCOPE.md

## Overview
What’s in and out for the current MVP (v0.1) and what comes next. This reflects the system as implemented today.

---

## In-Scope for MVP (v0.1)

- **Sender authentication (JWT)**
  - Signup/login/logout, `/api/auth/me`
- **Outbox (sender) APIs — canonical + legacy aliases kept**
  - Canonical: `/api/outbox/handshakes` (+ `/requests`, `/:id/inbox-token`)
  - Legacy (kept, non-breaking): `/api/user-handshake`, `/api/handshakes/:id/requests`
- **Public handshake**
  - Public form at `/handshake/:slug`
  - Server-side validation for responses, including **defensive rule for `select`**:
    - Required → value in options
    - Optional → empty allowed; if provided, must be in options
- **Fields/requests**
  - Types: text, email, select, file
  - `options` stored as `text[]` (not JSON)
- **Submissions & responses**
  - Stored in PostgreSQL; grouped responses available via API
- **Uploads (dev)**
  - Local disk via `/api/upload`; served under `/uploads/*`
- **Inbox (read-only) via token (no login)**
  - Mint token: `POST /api/outbox/handshakes/:id/inbox-token`
  - List: `GET /api/inbox/handshakes/:id/submissions`
  - Detail: `GET /api/inbox/submissions/:submissionId`
  - Minimal UI pages under `/inbox/*`
- **Additive migrations applied**
  - `receivers`, `inbox_access_tokens`, `submissions.receiver_id`, `handshakes.updated_at`
  - Migrations live at repo root: `/migrations`
- **Frontend** 
  - React Router pages for public form, outbox placeholders, and inbox viewer
- **Health checks**
  - `/api/health`, `/api/inbox/health`
- **Archive (Option A)**
  - `handshakes.archived` flag + dashboard filter **Active / Archived / All**
  - **Archived remains public** at `/handshake/:slug`

### Product Rules (enforced)
- **Link ID immutability:** attempting to change `slug` on update → `400 slug_immutable`
- **Plan limit (Free):** **1 active** handshake max → `403 plan_limit_reached { maxActive: 1 }`

---

## Out-of-Scope for MVP (v0.1)

- **Payments** (Stripe or other)
- **E-signatures** and audit trails
- **Multi-language/localization**
- **Teams/roles/SSO**
- **Custom branding/themes**
- **Analytics & advanced reporting**
- **Public API/webhooks/integrations** (Zapier/Make/Slack)
- **Autosave/drafts** for public form
- **Malware scanning / strict file type enforcement** (basic size/MIME hardening only later)
- **Rate limiting** (auth, inbox, public submit)
- **Receiver accounts & personal Inbox** (login-based attribution)
- **Inbox token lifecycle hardening**
  - Default expiries, revoke endpoints, **hashing tokens at rest**
- **Production uploads to S3** (dev-only local is in scope)
- **Advanced form logic** (conditionals, branching, formulas)
- **Template marketplace / duplication flows**
- **Mobile apps (PWA/native)**

---

## Future Considerations

- **Storage & security**
  - Move uploads to S3; signed URLs; background malware scan
  - Hash inbox tokens at rest; default expiry; revoke/rotate; `Referrer-Policy`
  - Add per-IP/per-token **rate limits**
- **Receiver attribution**
  - Carry token on public link; set `submissions.receiver_id`; optional receiver accounts later
- **Sender UX**
  - Consolidated Outbox UI; search/filter/sort; archive/duplicate/resend
- **Integrations**
  - Webhooks & Zapier/Make; Slack/Email notifications
- **Commerce & signatures**
  - Stripe (one-off + subscriptions), e-sig with audit trail
- **Quality & scale**
  - Test coverage (unit/integration), CI/CD checks, indexes (e.g. `requests(handshake_id)`), observability

---

## UI/UX Navigation Model (Planned — post Billing MVP)

### Layers
1. **Layer 1 — Box:** **Inbox / Outbox** (tabs or toggle).
2. **Layer 2 — Folders:** optional grouping. Always provide **All** (no folder). Users can **skip this layer** via **“See all handshakes.”**
3. **Layer 3 — Handshakes:** list with actions (View, Copy, Archive/Unarchive, Edit, Delete).

### Routing (shareable, persistent)
- **Canonical:**  
  - Outbox: `/outbox?folder=all|<id>&archived=false|true|all`  
  - Inbox: `/inbox?folder=all|<id>&archived=false|true|all&token=…`
- **Alias (during transition):**  
  - `/dashboard?box=outbox|inbox&folder=all|<id>&archived=false|true|all`

**Default:** Outbox, All folder, Active only →  
`/outbox?folder=all&archived=false` (alias: `/dashboard?box=outbox&folder=all&archived=false`)

### Responsive behavior
- **Desktop:** Two-pane layout — folders (left) | handshakes (center).
- **Mobile/Tablet:** Top tabs + hamburger to open folder drawer; same URL params/state.

### Out of scope for MVP
- Drag & drop between folders.
- Advanced folder rules/automation.
- Cross-user shared folders.
