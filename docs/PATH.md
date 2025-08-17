# docs/PATH.md

# PATH.md

## Overview

Tactical development path for Handshake. Priorities reflect MVP focus: **billing first**, then folders/navigation. This file stays aligned with `ARCHITECTURE.md` and `ROADMAP.md`.

---

## ✅ Recently Shipped (2025-08-10/11)

- **Dashboard list UX:** View public, Copy link, Delete.
- **Archive flow (Option A):** DB flag + API + UI filter (Active/Archived/All).
- **Slug immutability:** `PUT /api/outbox/handshakes/:id` returns 400 `slug_immutable` if `slug` present.
- **Duplicate slug handling:** `POST /api/outbox/handshakes` returns 409 `slug_taken`.
- **Dev auth:** automatic token via `VITE_DEV_EMAIL/PASSWORD`.
- **Billing (dev skeleton):** Stripe Checkout + Webhook routes in place (Test mode).

---

## 🎯 Current Focus (Billing MVP)

**Goal:** prove end-to-end Stripe in dev, then lift limits for paid users.

1. **Checkout session (dev)**
   - `POST /api/billing/create-checkout-session` → returns Checkout URL (Test mode).
   - Env: `STRIPE_SECRET_KEY (sk_test_…)`, `STRIPE_PRICE_ID (price_…)`, `STRIPE_WEBHOOK_SECRET (whsec_…)`.

2. **Webhook (dev)**
   - `POST /api/billing/webhook` (Stripe **raw body**).
   - On `checkout.session.completed` / `customer.subscription.updated`:
     - Update `users.subscription_status` (`'active'|'past_due'|'canceled'…`).
     - Set `stripe_customer_id`, `stripe_subscription_id`.
     - (Optionally set `users.plan` later when we add multi-plan.)

3. **Enforce limits**
   - **Free:** 1 active handshake (already enforced).
   - **Active subscriber (MVP):** 3 active handshakes.
   - Return **`403 plan_limit_reached { maxActive: N }`** on create/unarchive when over limit.

---

## 📌 API Map (sender/outbox)

- `GET /api/outbox/handshakes?archived=false|true|all`
- `POST /api/outbox/handshakes` → 409 `slug_taken` on duplicate
- `GET /api/outbox/handshakes/:id`
- `PUT /api/outbox/handshakes/:id` → 400 `slug_immutable` if `slug` present
- `DELETE /api/outbox/handshakes/:id`
- `PUT /api/outbox/handshakes/:id/archive`
- `PUT /api/outbox/handshakes/:id/unarchive`
- `GET /api/outbox/handshakes/:handshakeId/requests` (and related CRUD)

**Aliases kept during transition:**

- `/api/user-handshake`
- `/api/handshakes/:handshakeId/requests`

## 📌 API Map (inbox / token)

- `GET /api/inbox/handshakes/:id/submissions`
- `GET /api/inbox/submissions/:submissionId`

## 📌 API Map (public)

- `GET /api/handshake/:slug`
- `POST /api/handshake/:slug/submit`

## 📌 API Map (billing / dev)

- `POST /api/billing/create-checkout-session`
- `POST /api/billing/webhook`

---

## 🧪 Smoke / Acceptance (Billing MVP)

- Create active handshake → OK (while under limit).
- Create second on free plan → `403 plan_limit_reached { maxActive: 1 }`.
- Archive first → create again → OK.
- Try Unarchive when at limit → `403 plan_limit_reached { maxActive: 1 }`.
- Complete Stripe Checkout (Test mode) → webhook flips `subscription_status='active'`.
- After active → can keep up to **3** active handshakes.

---

## 🔜 Next (after Billing MVP)

- **Navigation shell (3-layer UI):**
  - **Layer 1:** Inbox / Outbox toggle.
  - **Layer 2:** **Folders** (UI-only for MVP; provide **“See all handshakes”** to bypass).
  - **Layer 3:** Handshakes list/detail.
- **Folders (FLD) persistence (post-MVP):** DB+API → UI move/assign.
- **Multi-plan billing:** map `plan → price`, limits per plan.
- **Receiver UX:** polish token flow, optional login.

---

## Notes

- Gitpod: port `3000` must be **Public** for Stripe webhooks.
- Stripe environments must match end-to-end (keys, prices, webhooks).
- Keep messages stable: `slug_taken`, `slug_immutable`, `plan_limit_reached`.
