```md
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
- **Frontend** 
  - React Router pages for public form, outbox placeholders, and inbox viewer
- **Health checks**
  - `/api/health`, `/api/inbox/health`

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

## Notes
- Scope is additive and **non-breaking** by design; legacy routes remain until full cutover.
- Keep this aligned with `ARCHITECTURE.md`, `PATH.md`, and `RISKS.md`.
```
