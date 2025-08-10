# RELEASES.md

## Changelog
All notable changes to this project are tracked here. Keep entries concise and traceable.

---

### [2025-08-10] - 2025-08-10

#### Added
- **Outbox (sender) — canonical routes**
  - `/api/outbox/handshakes` (CRUD)
  - `/api/outbox/handshakes/:handshakeId/requests` (CRUD)
  - `/api/outbox/handshakes/:handshakeId/inbox-token` (mint read-only inbox token)
- **Inbox (read-only) — token-gated API**
  - `GET /api/inbox/handshakes/:handshakeId/submissions`
  - `GET /api/inbox/submissions/:submissionId`
  - `GET /api/inbox/health`
- **Inbox UI (read-only)**
  - `/inbox/handshakes/:handshakeId?token=…` (list)
  - `/inbox/submissions/:submissionId?token=…&handshakeId=:id` (detail)
- **DB migrations**
  - `receivers` table
  - `inbox_access_tokens` table
  - `submissions.receiver_id` (nullable, indexed)
  - `handshakes.updated_at`
- **Health checks** for API and inbox

#### Changed
- **Public submit validation** (select fields): defensive rule  
  - Required → value must be in options  
  - Optional → empty allowed; if provided, must be in options
- **Client utils** now target Outbox canonical routes; legacy routes still work.

#### Deprecated (not removed)
- Legacy sender routes kept during transition:
  - `/api/user-handshake`
  - `/api/handshakes/:handshakeId/requests`

#### Security
- **Inbox token middleware**: validates token, checks `is_revoked` and `expires_at` when present, scopes access to `handshake_id`.

#### Upgrade notes
1. **Run migrations (in order):**

        psql "<YOUR_POSTGRES_URL>" -f migrations/001_inbox.sql
        psql "<YOUR_POSTGRES_URL>" -f migrations/002_handshakes_updated_at.sql

2. **Env:** ensure `JWT_SECRET` is set.  
3. **Server:** restart after deploy. No breaking API changes; old aliases continue to function.

---

### [v0.1.0] - Unreleased

#### Planned
- Public form UX polish (per-field errors, loading states)
- Minimal Outbox submissions view in UI
- Test coverage for public submit, outbox CRUD, inbox reads
- Prep S3 wiring for prod uploads (dev remains local)

---

## 🧭 Future Releases
Follow Semantic Versioning (`MAJOR.MINOR.PATCH`).

- Log **features**, **fixes**, **breaking changes**
- Note **DB migrations** and required **env** changes
- Reference PRs/issues where useful
- Cross-link to `/docs/PATH.md` and relevant docs

---

## Notes
Update this file on **every release tag or production deploy**.
