# NOTNOW.md

This document captures ideas, features, and edge cases we are **intentionally deferring** from v0.1 to keep the system stable and focused. Items here may move into `PATH.md` or `ROADMAP.md` as priorities change.

---

## 🔁 Edge Cases to Handle Later

- **Immutable versions / locking after share**
  - Locking a handshake once shared; versioned edits & diffs.
- **Drafts & autosave**
  - Persist receiver progress before submission; recover abandoned sessions.
- **Expiry enforcement**
  - Hard-close public forms after `expires_at`; custom expired screen.
- **Resubmission windows**
  - Allow limited-time edits after submit; audit history of changes.
- **Token lifecycle niceties**
  - Self-serve token rotation, usage history, and notifications on access.
- **Large file handling**
  - Chunked/multipart uploads; resumable uploads; parallelization.
- **Inline previews**
  - Render common file types in-browser (PDF/images) in Inbox UI.
- **Sender-side bulk ops**
  - Bulk archive/delete/duplicate; bulk field operations across handshakes.

> ✅ Re-upload/edits **before submit** are allowed.  
> ❌ No edits **after submit** in v0.1 (immutable submission).

---

## 🛑 Excluded From MVP (v0.1)

- **Payments** (Stripe, invoicing, taxes)
- **E-signatures** & audit trail
- **Team roles / RBAC / SSO**
- **Custom branding / custom domains**
- **Public template marketplace**
- **Analytics & advanced reports**
- **Multi-language / localization**
- **Mobile apps (PWA/native)**
- **Public API / webhooks / Zapier/Make**
- **Receiver login Inbox**
  - Personal receiver accounts and their dashboards
- **Security hardening beyond baseline**
  - Full rate limiting, CSP hardening, DSR/erasure flows, etc.

---

## 🗂 Potential but Out-of-Scope (collect now, build later)

- **AI assists**
  - Auto-validate uploads, pre-fill forms, detect missing info.
- **OAuth (Google/Microsoft/LinkedIn)**
  - For sender auth and/or future receiver accounts.
- **Blockchain / notarization**
  - Proof-of-existence, smart contracts.
- **PDF generation**
  - One-click PDF of submission or full handshake package.
- **Advanced form logic**
  - Conditionals, branching, computed fields, multi-step wizards.

---

## 🔐 Security & Ops (defer but track)

- **Inbox token hashing at rest**
  - Store hash (not plaintext); show short prefix only.
- **Default expiry + revoke/rotate endpoints**
  - Enforce in middleware; admin UI to manage tokens.
- **Rate limiting**
  - `/api/inbox/*`, `/api/auth/*`, public submit.
- **S3 production storage**
  - Signed URLs; size/MIME limits; antivirus scanning pipeline.
- **Observability**
  - Structured logs (no PII/tokens), error tracking, alerts.

---

## ✅ Already Promoted for v0.2+

- **Token lifecycle**
  - Default expiries, revoke, rotate, **hash at rest**.
- **Rate limiting & headers**
  - Per-IP/per-token limits; `Referrer-Policy: no-referrer`.
- **Outbox UI consolidation**
  - Native submissions list/detail in sender dashboard.
- **S3 wiring**
  - Keep dev on local; production uses S3 with signed URLs.

---

## Notes

- Deferrals here are **intentional** to avoid scope creep and fragile logic.  
- When moving an item out of `NOTNOW.md`, add a concrete acceptance test to `PATH.md`.  
- Keep this aligned with `SCOPE.md`, `RISKS.md`, and `ROADMAP.md`.
