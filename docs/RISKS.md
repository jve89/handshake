# docs/RISKS.md

# RISKS.md

## Overview

Known risks for Handshake and how we plan to mitigate them. Kept concise; update when routes, schema, auth, or infra change.

---

## ⚙️ Technical Risks

- **Ephemeral local uploads (dev) / future prod storage**
  - _Risk:_ Data loss or slow IO if we stayed on local disk.
  - _Mitigation:_ Move prod to S3 with signed URLs; content-type/size limits; background virus scan. Keep local disk only for dev.

- **DB connection limits / query hotspots**
  - _Risk:_ Pool exhaustion; slow list endpoints at scale.
  - _Mitigation:_ Use pooled `pg`; add/verify indexes (`submissions(handshake_id)`, `responses(submission_id)`, `requests(handshake_id)`, `inbox_access_tokens(token, handshake_id)`); monitor slow queries.

- **Schema drift vs. code (migrations)**
  - _Risk:_ 500s when code expects columns not deployed (e.g., `updated_at`).
  - _Mitigation:_ Always ship additive migrations first; gate code paths; keep **`/migrations` at repo root** as the source of truth.

- **ESM/Node/Vite env mismatches**
  - _Risk:_ Subtle import/URL issues between Gitpod and prod.
  - _Mitigation:_ Standardize Node version; keep `tsx` in dev; include `.env.example`; document ports (5173/3000).

- **Unbounded payloads (JSON)**
  - _Risk:_ Large bodies cause memory pressure.
  - _Mitigation:_ Add `express.json({ limit: '1mb' })` (tune as needed).

---

## 🔒 Security Risks

- **Inbox tokens in plaintext (current)**
  - _Risk:_ DB compromise exposes tokens; bearer tokens grant read access.
  - _Mitigation:_ Hash tokens at rest (HMAC or bcrypt); store prefix for UX; compare on verify. Add rotation command.

- **Token in URL leakage**
  - _Risk:_ Tokens appear in browser history, Referer headers, logs.
  - _Mitigation:_ Prefer `Authorization: Bearer <token>` in clients; short expiries; easy revoke endpoint; avoid logging query strings; add `Referrer-Policy: no-referrer`.

- **No expiry/revocation enforcement (partial)**
  - _Risk:_ Perpetual access.
  - _Mitigation:_ Default `expires_at` (e.g., 30d) on mint; enforce in middleware; add `POST /api/outbox/handshakes/:id/inbox-token/revoke`.

- **Public submit abuse**
  - _Risk:_ Spam, oversized files, scripted submissions.
  - _Mitigation:_ Rate limit by IP/slug; captcha/turnstile (toggleable); size/MIME checks; server-side validation (already in place, including defensive `select`).

- **Auth/session weaknesses (senders)**
  - _Risk:_ Token theft or weak JWT config.
  - _Mitigation:_ Strong `JWT_SECRET`; short-lived access tokens; optional refresh flow later; `helmet` defaults; consistent `Authorization` checks.

- **Path traversal / static file serving**
  - _Risk:_ Reading unintended files via `/uploads`.
  - _Mitigation:_ Serve from fixed directory; never echo raw user paths; consider moving to S3-only in prod.

- **PII handling & GDPR**
  - _Risk:_ Email addresses, free-text PII in responses.
  - _Mitigation:_ Data minimization; define retention policy; right-to-erasure endpoints; redact tokens/emails in logs; document processing in Privacy Policy.

- **No rate limiting on sensitive routes (current)**
  - _Risk:_ Brute-force, enumeration.
  - _Mitigation:_ Add per-IP + per-token limits to `/api/inbox/*`, `/api/auth/*`, public submit.

---

## 🧠 Product Risks

- **Scope creep**
  - _Risk:_ Fragile MVP and delays.
  - _Mitigation:_ Keep aliases non-breaking; ship smallest vertical slices; track deferrals in `NOTNOW.md`.

- **Sender UX complexity**
  - _Risk:_ Low creation completion for complex forms.
  - _Mitigation:_ Simple defaults; templates later; measure drop-offs.

- **Receiver friction**
  - _Risk:_ Confusion between public form vs. **token-gated** inbox links.
  - _Mitigation:_ Clear labels; single primary CTA; docs show example links.

- **Archive semantics misunderstood (Option A)**
  - _Risk:_ Senders expect Archive to hide public link.
  - _Mitigation:_ Explicit UI copy: “Archived remains public”; docs + tooltip; keep dashboard filter (Active / Archived / All).

- **Folders are UI-only in MVP**
  - _Risk:_ Expectations of cross-device persistence; perceived desync.
  - _Mitigation:_ Always provide **All** (no folder) default; label folders as “View-only groups” in MVP; evaluate persistence post-Billing.

---

## 🔧 Operational Risks

- **Observability gaps**
  - _Risk:_ Hard to diagnose production issues.
  - _Mitigation:_ Basic request logging (no tokens/PII), error tracking, health checks (`/api/health`, `/api/inbox/health`), uptime alerts.

- **Backups & disaster recovery**
  - _Risk:_ Data loss.
  - _Mitigation:_ Managed Postgres backups; document restore drill; S3 versioning (when enabled).

- **CI/CD breakages**
  - _Risk:_ Shipping without schema or env alignment.
  - _Mitigation:_ Predeploy migration step; smoke tests (curl script from docs); block deploy on failures.

---

## ✅ Current Safeguards (implemented)

- Defensive validation for `select` fields (required → in-options; optional provided → in-options).
- Ownership enforcement on sender CRUD (requests belong to user’s handshake).
- Non-destructive routing: legacy and new aliases both mounted.
- Additive DB migrations: `receivers`, `inbox_access_tokens`, `submissions.receiver_id`, `handshakes.updated_at`. Source: **`/migrations`**.
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
