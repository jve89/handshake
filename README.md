# README.md

# Handshake

**The easiest way to request or deliver structured information between two parties.**

Handshake lets a sender request files, form fields, or actions from a receiver via a single shareable link. It combines the simplicity of a payment link with the structure of an onboarding form—without email chaos or shared-folder sprawl.

---

## 🌍 Use Cases

- **Freelancers:** request onboarding docs, questionnaires, and deposits.
- **HR teams:** collect IDs, forms, and confirmations at scale.
- **Event organizers:** gather RSVPs, consents, and uploads in one go.
- **Service providers:** bundle intake questions, NDAs, and uploads into one branded link.
- **Anyone:** need a passport scan + a short form from a friend? Send a handshake.

---

## 🚀 MVP Scope (v0.1)

- **Auth:** email+password with JWT (sender-side dashboard).
- **Outbox (sender):**
  - Create/list/update/delete handshakes.
  - Define dynamic fields: `text`, `email`, `select`, `file`.
  - Mint **Inbox tokens** scoped to a handshake (read-only receiver view).
  - **Archive filter:** `handshakes.archived` with dashboard filter **Active / Archived / All**. **Archived remains public.**
- **Public submission**
  - Unique **Link ID** URL for each handshake (API parameter name: `:slug`).
  - Validations:
    - Required fields enforced.
    - For `select`: required → must be an allowed option; optional → empty allowed, otherwise must be an allowed option.
  - File uploads (dev: local disk; prod: S3 planned).
- **Inbox (receiver)**
  - **Token-gated, read-only** submissions list & detail (no login required).
  - _(Out of scope for MVP)_ Receiver account linking by email.
- **UI:** clean, responsive (React + Tailwind).

### Product Rules (enforced)

- **Link ID immutability:** Link ID (`slug`) cannot change after creation → server returns `400 slug_immutable` on update attempts.
- **Free plan limit:** max **1 active** handshake → `403 plan_limit_reached { maxActive: 1 }`.
- **Legacy routes:** remain mounted during transition (see Architecture).

---

## 📬 The Handshake Model: Outbox & Inbox

- **Outbox (sender):** where handshakes are composed and managed; submissions are visible per handshake.
- **Inbox (receiver):** a **token-gated** view the sender can share (list + detail of submissions for that handshake).
- **Post-MVP (tracked in `docs/NOTNOW.md`):** optional receiver login that auto-collects their submissions into a personal inbox based on email.

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL
- **Dev Tools:** Gitpod, `tsx`, `dotenv`, ESLint

---

## 🧪 Quickstart (Dev)

> Prereqs: Postgres running and reachable via `DATABASE_URL`; apply SQL migrations from `/migrations` in order.

1. **Install deps**

   npm ci

2. **Configure environment**

   cp .env.example .env

   # Fill at minimum:

   # JWT_SECRET=...

   # DATABASE_URL=postgres://...

3. **Run servers (separate terminals)**

   npm run dev # Frontend (Vite @5173)
   npm run dev:server # Backend (Express @3000)

4. **Smoke checks**

   # API health (expect 200)

   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health

   # Inbox health (expect JSON)

   curl -s http://localhost:3000/api/inbox/health

5. **Minimal flow (sender token required)**

   # 5.1 Sign up or log in (returns JWT)

   curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"you@example.com","password":"changeme123"}'
   - Create a handshake via POST /api/outbox/handshakes.
   - Add a request field via POST /api/outbox/handshakes/:handshakeId/requests.
   - Load public page at /handshake/:slug (Link ID) and submit.
   - Mint an inbox token via POST /api/outbox/handshakes/:handshakeId/inbox-token.
   - View receiver list: /inbox/handshakes/:handshakeId?token=...
   - View receiver detail: /inbox/submissions/:submissionId?token=...&handshakeId=:handshakeId

---

## 💳 Stripe (Billing MVP) — Dev Setup

**Environment variables (dev):**

- `STRIPE_SECRET_KEY` — your test mode secret key (`sk_test_…`)
- `STRIPE_PRICE_ID` — a test Price ID (`price_…`)
- `STRIPE_WEBHOOK_SECRET` — webhook signing secret (`whsec_…`)

**Notes:**

- The webhook endpoint **expects raw request body**. Ensure body parsing excludes `/api/billing/webhook` or uses raw middleware there.
- On Gitpod or tunnels, expose **port 3000** publicly so Stripe can reach the webhook.

**Endpoints (dev):**

- `POST /api/billing/create-checkout-session` → returns Checkout URL
- `POST /api/billing/webhook` → processes events (e.g., `checkout.session.completed`)

**Happy-path test:**

    # 1) Set env (example)
    export STRIPE_SECRET_KEY=sk_test_xxx
    export STRIPE_PRICE_ID=price_xxx
    export STRIPE_WEBHOOK_SECRET=whsec_xxx

    # 2) Create a Checkout session (returns a URL)
    curl -s -X POST http://localhost:3000/api/billing/create-checkout-session | jq

    # 3) Complete test Checkout, then verify limits lift for subscriber (3 active handshakes)

---

## 🔌 API Overview (MVP)

- **Public (legacy-mounted during transition)**
  - GET /api/handshake/:slug
  - POST /api/handshake/:slug/submit

- **Outbox (sender, JWT)**
  - GET /api/outbox/handshakes
  - POST /api/outbox/handshakes
  - GET /api/outbox/handshakes/:handshakeId
  - PUT /api/outbox/handshakes/:handshakeId _(Link ID/slug is immutable; changing it yields 400 slug_immutable)_
  - DELETE /api/outbox/handshakes/:handshakeId
  - GET /api/outbox/handshakes/:handshakeId/requests
  - POST /api/outbox/handshakes/:handshakeId/requests
  - PUT /api/outbox/handshakes/:handshakeId/requests/:requestId
  - DELETE /api/outbox/handshakes/:handshakeId/requests/:requestId
  - POST /api/outbox/handshakes/:handshakeId/inbox-token

- **Inbox (token)**
  - GET /api/inbox/handshakes/:handshakeId/submissions
  - GET /api/inbox/submissions/:submissionId
  - GET /api/inbox/health

- **Billing (dev)**
  - POST /api/billing/create-checkout-session
  - POST /api/billing/webhook

- **Auth**
  - POST /api/auth/signup
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/auth/me

> Free plan: enforcing **1 active** handshake; creating another active handshake or unarchiving beyond the limit returns `403 plan_limit_reached { maxActive: 1 }`.

---

## 📁 Project Structure

- `src/client` — React app (public, outbox, inbox pages)
- `src/server` — Express API (routes, services, middleware)
- `src/server/db` — Postgres client and helpers
- `migrations/` — repo root; SQL-first, additive migrations
- `docs/` — Architecture, scope, roadmap, and more

See canonical layout: `docs/proposed-filetree.txt`.

---

## 🔮 Vision (Beyond MVP)

- Template library and marketplace
- Branded handshakes + custom domains
- E-signatures with audit trail
- Payments & subscriptions (Stripe)
- Team roles/permissions
- Receiver login for personal inbox
- Zapier/Make/API integrations
- S3 (prod) with signed URLs and malware scanning
- File expiration and versioning

---

## 📌 Market Positioning

Frictionless, branded, and structured intake—stronger than generic form builders and far less painful than email+attachments. Senders get maximum flexibility; receivers need only a link.

---

## 🧭 Next Steps

- Per-field errors + loading/disabled states on public form.
- Minimal Outbox submissions list/detail in the sender UI.
- Automated tests (public submit, outbox CRUD, inbox reads).
- S3 wiring for production uploads (dev remains local).
- Token lifecycle hardening (default expiry, revoke/rotate, hash at rest).
- Consolidate docs with code in PRs (see `docs/CONTRIBUTING.md`).

---

## 📚 Documentation

All docs live under `/docs`:

- Architecture • Scope • Path • Roadmap • Risks
- Contributing • Releases • User Flows • Not Now
- `proposed-filetree.txt` (canonical structure)

For contribution and migration details, read `docs/CONTRIBUTING.md` and `docs/RELEASES.md`.
