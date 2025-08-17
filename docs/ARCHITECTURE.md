# docs/ARCHITECTURE.md

## Overview

Handshake is a modular SaaS with a clean split between **frontend (React/Vite)** and **backend (Express/TypeScript)**. We ship incrementally with non-breaking aliases, strict API contracts, and one-purpose-per-file discipline.

---

## Information Architecture (3-Layer UI)

- **Layer 1 — Inbox / Outbox:** top-level mode (incoming vs outgoing).
- **Layer 2 — Folders (UI-only in MVP):** optional grouping to organize handshakes. Users can **skip this layer** via a clear “See all handshakes” action.
- **Layer 3 — Handshakes:** list and detail views (compose/manage in Outbox; read submissions in Inbox).

**Notes**

- This model is **UI/IA only** for MVP (no schema/API changes). Folder persistence may be considered post-MVP.
- Use **“Link ID”** in UI; keep `slug` in API payloads/paths.

---

## Tech Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Express.js, TypeScript (`tsx` for dev/watch)
- **Database:** PostgreSQL (managed)
- **Storage:** Local disk for dev (`/public/uploads`); S3 planned for prod
- **Dev Environment:** Gitpod (Frontend `5173`, API `3000`, Vite proxy `/api → :3000`)
- **Auth:** JWT; in dev, `src/client/utils/devAuth.ts` auto-logs in via `VITE_DEV_EMAIL` / `VITE_DEV_PASSWORD`
- **Billing (dev):** Stripe Checkout + Webhook (test mode)

---

## Project Structure (high level)

- `src/client` — React app
  - `pages/public/*` — public form (routed as `/handshake/:slug`)
  - `pages/inbox/*` — receiver UI (token-gated, read-only; implements Layers 1–3)
  - `pages/outbox/*` — sender UI (implements Layers 1–3; **`/dashboard/*` remains as an alias during transition**)
  - `components/*` — shared UI (e.g., `ArchiveFilter`, folder list, list/detail shells)
  - `utils/*` — API helpers (`devAuth`, fetch helpers)
- `src/server` — Express API
  - `routes/*` — public, outbox, inbox, auth, uploads, billing
  - `services/*` — DB domain logic (e.g., `userHandshakeService`)
  - `middleware/*` — `authMiddleware`, `inboxToken`
  - `db/*` — `client.ts`, `schema.sql`, `seed.ts`
- `migrations/*` — SQL migrations (**repo root**)
- `docs/*` — documentation

> See `docs/proposed-filetree.txt` for the full layout.

---

## Design Principles

- **One purpose per file**; no shortcuts, no hidden side effects.
- **Non-breaking aliases** during refactors (old routes stay live until cutover).
- **Strict contracts** client ↔ server.
- **Minimal deps**, clear env via `.env` / `.env.example`.
- **Process rule:** never patch a file without seeing its current version.

---

## Outbox / Inbox Model

### Outbox (Sender)

- Canonical sender APIs live under **`/api/outbox/handshakes`** (+ `/requests` subtree).
- Legacy sender routes (aliases) remain mounted:
  - `/api/user-handshake`
  - `/api/handshakes/:handshakeId/requests`
- Sender auth via **JWT Bearer** (`authMiddleware`).
- **Plan limit (Free):** max **1 active** handshake → `403 plan_limit_reached { maxActive: 1 }`.

### Inbox (Receiver)

- **Token-gated, read-only** API and UI (no login for receivers).
- Token scope is **handshake-level**. Middleware: `inboxToken`.
- Capabilities:
  - List submissions for a handshake.
  - View a submission in detail.

### Public Form

- Anyone can submit via `/handshake/:slug` (no auth). Validation is server-side.
- **Archived handshakes remain public** (Option A).

---

## Backend

### Routes (summary)

> Details in `docs/PATH.md`.

- **Health:** `GET /api/health` → `{ status: "ok" }`
- **Public:** `GET /api/handshake/:slug`, `POST /api/handshake/:slug/submit`
- **Sender / Outbox (canonical):**
  - `GET /api/outbox/handshakes?archived=false|true|all`
  - `POST /api/outbox/handshakes` (409 `slug_taken` on duplicate)
  - `GET /api/outbox/handshakes/:id`
  - `PUT /api/outbox/handshakes/:id` (**slug immutable** → 400 `slug_immutable`)
  - `DELETE /api/outbox/handshakes/:id`
  - `PUT /api/outbox/handshakes/:id/archive` / `:id/unarchive` (idempotent)
  - `.../:handshakeId/requests` (per-handshake fields)
- **Inbox (token):**
  - `GET /api/inbox/handshakes/:id/submissions`
  - `GET /api/inbox/submissions/:submissionId`
- **Uploads:** `/api/upload` (dev = disk; prod plan = S3)
- **Auth:** `/api/auth/*` (signup, login)
- **Billing (dev):**
  - `POST /api/billing/create-checkout-session`
  - `POST /api/billing/webhook` (Stripe **raw body** required)

### Middleware

- `authMiddleware`: validates JWT; attaches `req.user = { id, email }`
- `inboxToken`: reads `Authorization: Bearer <token>` or `?token=…`; scopes to handshake

### Services (highlights)

- `userHandshakeService`:
  - CRUD handshakes (`updated_at = NOW()` on update)
  - `setHandshakeArchived(userId, handshakeId, state)` (archive toggle)
  - (Free-plan limit enforcement currently in routes; billing lift later)

### Uploads

- Dev: `multer` to `/public/uploads`, served at `/uploads/*`
- Prod: S3 planned; keep `{ url }` response shape

---

## Data Model & Migrations (current)

### Core tables

- `users(id, email UNIQUE, password_hash, created_at, updated_at, stripe_customer_id NULL, stripe_subscription_id NULL, subscription_status TEXT NOT NULL DEFAULT 'inactive', plan TEXT NOT NULL DEFAULT 'free')`
- `handshakes(id, slug UNIQUE, title, description, created_at, expires_at, user_id REFERENCES users(id) ON DELETE CASCADE, updated_at, archived BOOLEAN NOT NULL DEFAULT FALSE)`
- `requests(id, handshake_id REFERENCES handshakes(id) ON DELETE CASCADE, label, type CHECK IN ('text','file','email','select'), required BOOLEAN DEFAULT false, options TEXT[] DEFAULT NULL)`
- `submissions(id, handshake_id REFERENCES handshakes(id) ON DELETE CASCADE, submitted_at TIMESTAMP DEFAULT NOW())`
- `responses(id, submission_id REFERENCES submissions(id) ON DELETE CASCADE, request_id REFERENCES requests(id) ON DELETE CASCADE, value TEXT NOT NULL)`

### Inbox tokens

- `inbox_access_tokens(id, token UNIQUE, handshake_id REFERENCES handshakes(id) ON DELETE CASCADE, receiver_id INT NULL, expires_at, created_at, last_used_at, is_revoked BOOLEAN DEFAULT false)`
  - Indexes: `token`, `handshake_id`
  - (Receiver table optional; tokens may be anonymous)

### Indexes (not exhaustive)

- `handshakes_slug_key`, `handshakes_pkey`, `idx_handshakes_archived(archived)`
- `inbox_access_tokens(token)`, `inbox_access_tokens(handshake_id)`
- (Consider `requests(handshake_id)` later)

### Notes / Risks

- **Archived stay public** by design (Option A).
- Stripe environments must match end-to-end (Test keys + Test price + Test webhook).
- Gitpod domain rotates; update webhook endpoint accordingly.
- Keep `schema.sql` in sync with prod (run audits before changes).

---

## Frontend

### Routing (UI; 3-Layer)

- **Layer 1 (mode):**
  - `/outbox` (sender) — **alias:** `/dashboard`
  - `/inbox` (receiver, token-gated)
- **Layer 2 (folders; optional UI-only):**
  - `/outbox/folders` and `/inbox/folders` (may be skipped)
- **Layer 3 (handshakes & detail):**
  - Outbox: `/outbox/handshakes`, `/outbox/handshakes/new`, `/outbox/handshakes/:id`, `/outbox/handshakes/:id/edit` (Link ID/slug is immutable)
  - Inbox: `/inbox/handshakes/:handshakeId?token=...`, `/inbox/submissions/:submissionId?token=...&handshakeId=:handshakeId`
- **Public form:** `/handshake/:slug`

### Client utilities

- `devAuth.ts` ensures a dev token exists (uses `VITE_DEV_EMAIL` / `VITE_DEV_PASSWORD`)
- Sender requests include `Authorization: Bearer <token>`
- Vite dev server proxies `/api` → Express `3000` (no CORS in dev)

---

## Near-Term Architecture Tasks

- **Propagate 3-layer IA** through client routes and navigation; keep `/dashboard/*` as a temporary alias to `/outbox/*`.
- **Folders:** implement **UI-only grouping** for MVP; add a post-MVP evaluation for persistence.
- **Limits:** ensure free plan enforcement (1 active handshake) returns `403 plan_limit_reached { maxActive: 1 }`.
- **Inbox tokens:** lifecycle hardening (revoke/expire; later hash at rest).
- **Rate limiting** on public/inbox endpoints.
- Optional index: `requests(handshake_id)`.

---

## Archive Flag (Option A) — Implemented

**Purpose:** sender list hygiene; **does not** affect public visibility.

- Schema: `handshakes.archived BOOLEAN NOT NULL DEFAULT FALSE`; index `idx_handshakes_archived(archived)`
- API: `GET ?archived=...` (default `false`); `PUT :id/archive` / `:id/unarchive`
- UI: dashboard filter **Active / Archived / All**; Archive/Unarchive row action
