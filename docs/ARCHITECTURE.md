```md
# ARCHITECTURE.md

## Overview
Handshake is a modular SaaS with a clean split between **frontend (React/Vite)** and **backend (Express/TypeScript)**. We ship incrementally with non-destructive aliases, strict API contracts, and one-purpose-per-file discipline.

---

## Tech Stack
- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Express.js, TypeScript (`tsx` for dev/watch)
- **Database:** PostgreSQL (managed)
- **Storage:** Local disk for dev (`/public/uploads`); S3 planned for prod
- **Dev Environment:** Gitpod + Docker; Vite dev server (5173), API (3000)

---

## Project Structure (high level)
- `src/client` — React app
  - `pages/inbox/*` — receiver UI (read-only)
  - `pages/outbox/*` — sender wrappers (aliases; reuse legacy components)
  - `pages/dashboard/*` — **legacy sender** UI (kept during transition)
  - `utils/*` — API helpers (bearer auth where required)
- `src/server` — Express API
  - `routes/*` — route modules (public, outbox, inbox, auth, uploads)
  - `services/*` — DB logic per domain
  - `middleware/*` — `authMiddleware`, `inboxToken`
  - `db/*` — `client.ts`, schema/seed
- `migrations/*` — SQL migrations
- `docs/*` — documentation

See `docs/proposed-filetree.txt` for full layout.

---

## Design Principles
- **One purpose per file**; no shortcuts, no hidden side effects.
- **Non-breaking aliases** during refactors (old routes stay live until cutover).
- **Strict contracts** between client ↔ server.
- **Minimal deps**, clear env via `.env` / `.env.example`.

---

## Outbox/Inbox Model

### Outbox (Sender)
- Canonical sender APIs live under **`/api/outbox/handshakes`** (+ `/requests` subtree).
- Legacy sender routes remain mounted (**no destructive renames yet**):
  - `/api/user-handshake`
  - `/api/handshakes/:handshakeId/requests`
- Sender authentication via **JWT Bearer** (`authMiddleware`).

### Inbox (Receiver)
- **Token-gated, read-only** API and UI (no login required for receivers).
- Token scope is **handshake-level**. Middleware: `inboxToken`.
- Current capabilities:
  - List submissions for a handshake.
  - View a submission in detail (server also returns `handshake_id` top-level to help navigation).

### Public form
- Anyone can submit via `/handshake/:slug` (no auth). Validation enforced server-side.

---

## Backend

### Routes (summary)
> Full table: `docs/PATH.md`.

- **Public:** `/api/handshake/:slug`, `/api/handshake/:slug/submit`
- **Sender / Outbox (canonical):** `/api/outbox/handshakes`, `/api/outbox/handshakes/:id/requests`, and `/api/outbox/handshakes/:id/inbox-token`
- **Sender (legacy aliases):** `/api/user-handshake`, `/api/handshakes/:id/requests`
- **Inbox (token):** `/api/inbox/handshakes/:id/submissions`, `/api/inbox/submissions/:submissionId`, `/api/inbox/health`
- **Uploads:** `/api/upload`
- **Auth:** `/api/auth/*` (signup, login, logout, me)

### Middleware
- **`authMiddleware`**: validates JWT; attaches `req.user = { id, email }`.
- **`inboxToken`**: resolves token from `Authorization: Bearer <token>` or `?token=…`. Checks `inbox_access_tokens` (not revoked, not expired), scopes requests by `handshake_id`.

### Services
- **userHandshakeService**: CRUD for handshakes; `updated_at = NOW()` on update.
- **handshakeRequestService**: CRUD for per-handshake request fields; enforces ownership.
- **inboxService**: submission listing + detail (grouped responses), handshake scope checks.
- **authService**: signup/login/logout/me.

### Validation highlights (public submit)
- **select fields (defensive rule)**:
  - **Required** → value must be non-empty **and** in `options`.
  - **Optional** → empty allowed; if provided, must be in `options`.
- **email** uses `validator.isEmail`.
- **file/text** honor `required`.

### Uploads
- Dev: `multer` to `/public/uploads`, served at `/uploads/*`.
- Prod: plan to switch to S3 (same response shape `{ url }`).

---

## Data Model & Migrations (deltas)

### Core tables
- `users(id, email UNIQUE, password_hash, created_at, updated_at)`
- `handshakes(id, slug UNIQUE, title, description, created_at, expires_at, user_id FK, **updated_at**)` ← **added**
- `requests(id, handshake_id FK, label, type CHECK IN ('text','file','email','select'), required boolean, **options text[]**)`
- `submissions(id, handshake_id FK, submitted_at, **receiver_id FK nullable**)` ← **added column**
- `responses(id, submission_id FK, request_id FK, value text)`

### Inbox tables
- `receivers(id, email UNIQUE, name, created_at)`
- `inbox_access_tokens(id, token UNIQUE, handshake_id FK, receiver_id FK NULL, expires_at, created_at, last_used_at, is_revoked boolean)`

### Indexes (current)
- `idx_submissions_receiver` on `submissions(receiver_id)`
- `idx_iat_token` on `inbox_access_tokens(token)`
- `idx_iat_handshake` on `inbox_access_tokens(handshake_id)`
- *(optional, planned)* `idx_requests_handshake` on `requests(handshake_id)`

### Notes / Risks
- Inbox tokens stored **plaintext** for now (to be hashed later).
- No rate limiting yet on inbox endpoints.

---

## Frontend

### Routing
- **Public form:** `/handshake/:slug`
- **Inbox (read-only):**
  - List: `/inbox/handshakes/:handshakeId?token=…`
  - Detail: `/inbox/submissions/:submissionId?token=…&handshakeId=:id`
- **Outbox wrappers:** `/outbox/...` placeholders that reuse legacy components.
- **Legacy sender UI:** `/dashboard/...` (kept during transition).

### Client utilities
- Use `localStorage.getItem('authToken')` for sender requests.
- Protected calls include `Authorization: Bearer <token>`.
- Vite dev server proxies `/api` to the Express server (no CORS in dev).

---

## Dev & Deployment

- **Dev scripts:**  
  - Frontend: `npm run dev` (Vite @ 5173)  
  - Backend: `npm run dev:server` (Express @ 3000)
- **Health checks:** `/api/health`, `/api/inbox/health`
- **Prod plan:** containerized web + API, managed Postgres, S3 for uploads.

---

## Near-Term Architecture Tasks
- Token lifecycle: **revoke endpoint**, default `expires_at`, eventually **hash tokens**.
- Receiver attribution: pass `?token=` through public form link; on submit, resolve to `receiver_id`.
- Add rate limiting on inbox endpoints.
- Optional: add `requests(handshake_id)` index.

---
```
