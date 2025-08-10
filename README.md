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

- Auth: email+password with JWT (sender-side dashboard).
- **Outbox (sender)**
  - Create/list/update/delete handshakes.
  - Define dynamic fields: `text`, `email`, `select`, `file`.
  - Mint **Inbox tokens** scoped to a handshake (read-only receiver view).
- **Public submission**
  - Unique slug URL for each handshake.
  - Validations:
    - Required fields enforced.
    - For `select`: required → must be allowed option; optional → empty allowed, otherwise must be allowed.
  - File uploads (dev: local disk; prod: S3 planned).
- **Inbox (receiver)**
  - **Token-gated read-only** submissions list & detail (no login required).
  - (Future) Receiver account linking by email is out of scope for MVP.
- Clean, responsive UI (React + Tailwind).

---

## 📬 The Handshake Model: Outbox & Inbox

- **Outbox (sender):** where handshakes are composed and managed; submissions are visible per handshake.
- **Inbox (receiver):** a **token-gated** view the sender can share (list + detail of submissions for that handshake).
- **Future (post-MVP):** optional receiver login that auto-collects their submissions into a personal inbox based on email—tracked in `docs/NOTNOW.md` and roadmap.

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL
- **Dev Tools:** Gitpod, `tsx`, `dotenv`, ESLint

---

## 🧪 Quickstart (Dev)

1. Install deps

       npm ci

2. Configure environment

       cp .env.example .env
       # Fill values (at minimum):
       # JWT_SECRET=...
       # DATABASE_URL=postgres://...

3. Run servers (in separate terminals)

       npm run dev        # Frontend (Vite @5173)
       npm run dev:server # Backend (Express @3000)

4. Smoke checks

       # API health (should be 200)
       curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health

       # Inbox health (should be JSON)
       curl -s http://localhost:3000/api/inbox/health

5. Minimal flow (sender token required)
   - Sign up or log in via `/api/auth/signup` or `/api/auth/login` (returns JWT).
   - Create a handshake via `/api/outbox/handshakes`.
   - Add a request field via `/api/outbox/handshakes/:id/requests`.
   - Load public page at `/handshake/:slug` and submit.
   - Mint an inbox token via `/api/outbox/handshakes/:id/inbox-token`.
   - View receiver list: `/inbox/handshakes/:id?token=...`
   - View receiver detail: `/inbox/submissions/:submissionId?token=...&handshakeId=:id`

---

## 🔌 API Overview (MVP)

- **Public**
  - `GET /api/handshake/:slug`
  - `POST /api/handshake/:slug/submit`

- **Outbox (sender, JWT)**
  - `GET/POST /api/outbox/handshakes`
  - `GET/PUT/DELETE /api/outbox/handshakes/:handshakeId`
  - `GET/POST /api/outbox/handshakes/:handshakeId/requests`
  - `PUT/DELETE /api/outbox/handshakes/:handshakeId/requests/:requestId`
  - `POST /api/outbox/handshakes/:handshakeId/inbox-token`

- **Inbox (token)**
  - `GET /api/inbox/handshakes/:handshakeId/submissions`
  - `GET /api/inbox/submissions/:submissionId`
  - `GET /api/inbox/health`

- **Auth**
  - `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`

> Legacy routes remain mounted for safety during transition (see `docs/ARCHITECTURE.md`).

---

## 📁 Project Structure

- `src/client` — React app (pages for public, outbox, and inbox)
- `src/server` — Express API (routes, services, middleware)
- `src/server/db` — Postgres client, schema, seed
- `migrations` — SQL-first, additive migrations
- `docs` — Architecture, scope, roadmap, and more

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

All docs live under [`/docs`](./docs):

- Architecture • Scope • Path • Roadmap • Risks
- Contributing • Releases • User Flows • Not Now
- `proposed-filetree.txt` (canonical structure)

For contribution and migration details, read `docs/CONTRIBUTING.md` and `docs/RELEASES.md`.
