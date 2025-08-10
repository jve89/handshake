```md
# RISKS.md

## Overview
Known risks for Handshake and how we plan to mitigate them. Kept concise; update when routes, schema, auth, or infra change.

---

## ⚙️ Technical Risks

- **Ephemeral local uploads (dev) / future prod storage**
  - *Risk:* Data loss or slow IO if we stayed on local disk.
  - *Mitigation:* Move prod to S3 with signed URLs; content-type/size limits; background virus scan. Keep local disk only for dev.

- **DB connection limits / query hotspots**
  - *Risk:* Pool exhaustion; slow list endpoints at scale.
  - *Mitigation:* Use pooled `pg`; add/verify indexes (`submissions(handshake_id)`, `responses(submission_id)`, `requests(handshake_id)`, `inbox_access_tokens(token, handshake_id)`); monitor slow queries.

- **Schema drift vs. code (migrations)**
  - *Risk:* 500s when code expects columns not deployed (e.g., `updated_at`).
  - *Mitigation:* Always ship additive migrations first; gate code paths; keep `migrations/` as the source of truth.

- **ESM/Node/vite env mismatches**
  - *Risk:* Subtle import/URL issues between Gitpod and prod.
  - *Mitigation:* Standardize Node version; keep `tsx` in dev; include `.env.example`; document ports (5173/3000).

- **Unbounded payloads (JSON)**
  - *Risk:* Large bodies cause memory pressure.
  - *Mitigation:* Add `express.json({ limit: '1mb' })` (tune as needed).

---

## 🔒 Security Risks

- **Inbox tokens in plaintext (current)**
  - *Risk:* DB compromise exposes tokens; bearer tokens grant read access.
  - *Mitigation:* Hash tokens at rest (HMAC or bcrypt); store prefix for UX; compare on verify. Add rotation command.

- **Token in URL leakage**
  - *Risk:* Tokens appear in browser history, Referer headers, logs.
  - *Mitigation:* Prefer `Authorization: Bearer <token>` in clients; short expiries; easy revoke endpoint; avoid logging query strings; add `Referrer-Policy: no-referrer`.

- **No expiry/revocation enforcement (partial)**
  - *Risk:* Perpetual access.
  - *Mitigation:* Default `expires_at` (e.g., 30d) on mint; enforce in middleware; add `POST /api/outbox/handshakes/:id/inbox-token/revoke`.

- **Public submit abuse**
  - *Risk:* Spam, oversized files, scripted submissions.
  - *Mitigation:* Rate limit by IP/slug; captcha/turnstile (toggleable); size/MIME checks; server-side validation (already in place, including defensive `select`).

- **Auth/session weaknesses (senders)**
  - *Risk:* Token theft or weak JWT config.
  - *Mitigation:* Strong `JWT_SECRET`; short-lived access tokens; optional refresh flow later; `helmet` defaults; consistent `Authorization` checks.

- **Path traversal / static file serving**
  - *Risk:* Reading unintended files via `/uploads`.
  - *Mitigation:* Serve from fixed directory; never echo raw user paths; consider moving to S3-only in prod.

- **PII handling & GDPR**
  - *Risk:* Email addresses, free-text PII in responses.
  - *Mitigation:* Data minimization; define retention policy; right-to-erasure endpoints; redact tokens/emails in logs; document processing in Privacy Policy.

- **No rate limiting on sensitive routes (current)**
  - *Risk:* Brute-force, enumeration.
  - *Mitigation:* Add per-IP + per-token limits to `/api/inbox/*`, `/api/auth/*`, public submit.

---

## 🧠 Product Risks

- **Scope creep**
  - *Risk:* Fragile MVP and delays.
  - *Mitigation:* Keep aliases non-breaking; ship smallest vertical slices; track deferrals in `NOTNOW.md`.

- **Sender UX complexity**
  - *Risk:* Low creation completion for complex forms.
  - *Mitigation:* Simple defaults; templates later; measure drop-offs.

- **Receiver friction**
  - *Risk:* Confusion between public form vs. tokened inbox links.
  - *Mitigation:* Clear labels; single primary CTA; docs show example links.

---

## 🔧 Operational Risks

- **Observability gaps**
  - *Risk:* Hard to diagnose production issues.
  - *Mitigation:* Basic request logging (no tokens/PII), error tracking, health checks (`/api/health`, `/api/inbox/health`), uptime alerts.

- **Backups & disaster recovery**
  - *Risk:* Data loss.
  - *Mitigation:* Managed Postgres backups; document restore drill; S3 versioning (when enabled).

- **CI/CD breakages**
  - *Risk:* Shipping without schema or env alignment.
  - *Mitigation:* Predeploy migration step; smoke tests (curl script from docs); block deploy on failures.

---

## ✅ Current Safeguards (implemented)

- Defensive validation for `select` fields (required → in-options; optional provided → in-options).
- Ownership enforcement on sender CRUD (requests belong to user’s handshake).
- Non-destructive routing: legacy and new aliases both mounted.
- Additive DB migrations: `receivers`, `inbox_access_tokens`, `submissions.receiver_id`, `handshakes.updated_at`.
- Inbox middleware checks scope, revocation flag, and expiry when set.

---

## 📌 Next Mitigations (short list)

1. **Inbox tokens**
   - Hash at rest; default expiry; revoke endpoint; `Referrer-Policy` header.
2. **Rate limiting**
   - `/api/inbox/*`, `/api/auth/*`, public submit.
3. **Uploads**
   - S3 in prod; size/MIME limits; background malware scan.
4. **Indexes**
   - Ensure `requests(handshake_id)` exists; review query plans for lists.

---

## Notes
- Keep this file aligned with `PATH.md` and `ARCHITECTURE.md`.
- Update before each release cut (see `RELEASES.md`) and after any auth/DB change.
```
