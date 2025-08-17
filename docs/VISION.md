# docs/VISION.md

## 🌐 What is Handshake?

**Handshake** is a universal intake and interaction layer between two parties. It replaces messy email threads and scattered uploads with a single, branded, structured request link.

Use it for:

- File requests
- Form collection
- Confirmations & light approvals
- (Later) Payments and e-signatures

**Philosophy:** one link per request, zero friction for receivers, full control for senders.

---

## 🧭 Product Model (at a glance)

- **Outbox (Sender):** create and manage requests (handshakes). Track submissions.
- **Inbox (Receiver):** read-only via a **token-gated** link today; optional receiver accounts later.
- **Public Form:** anyone with the **Link ID** can submit (API path uses `:slug`).

This keeps the barrier to entry near zero while preserving a clean path to richer workflows.

---

## 🧱 Experience Model (3 layers)

- **Layer 1 — Inbox / Outbox:** top-level mode (incoming vs outgoing).
- **Layer 2 — Folders (UI-only in MVP):** optional grouping; users can **skip** via **“See all handshakes.”**
- **Layer 3 — Handshakes:** list and detail (compose/manage in Outbox; read submissions in Inbox).

> MVP: folders are UI-only (no schema/API changes). Persistence can be considered post-MVP.

---

## 🎯 MVP Scope (shipped & near-term)

- Structured requests: text, email, select, file
- Public submission with server-side validation (defensive for `select`)
- Sender dashboard (legacy) + **Outbox** API aliases (non-breaking)
- **Inbox (read-only)** via token: list + detail of submissions
- Local uploads in dev; S3 planned for prod
- Auth for senders (JWT)

> We keep non-destructive aliases during refactors to avoid regressions.

---

## 🔒 Product Rules (current)

- **Link ID immutability:** the Link ID (`slug`) cannot change after creation → updates attempting to change it return `400 slug_immutable`.
- **Archive semantics (Option A):** **Archived remains public**; archive is a sender-side hygiene flag and a dashboard filter (Active / Archived / All).
- **Plan limit (Free):** **1 active** handshake max → `403 plan_limit_reached { maxActive: 1 }`.

---

## 💡 Core Principles

- **Sender-first:** the requester controls structure, timing, and brand.
- **Zero-friction for receivers:** no app, no account, just a link.
- **One purpose per file / clean contracts:** predictable behavior; no hidden side effects.
- **Data integrity by default:** strict validation, additive migrations, reversible changes.
- **Operational simplicity:** minimal moving parts, clear env/config, observable health.

---

## 🏆 Competitive Edge

- Frictionless intake with **single-link flows**
- **Structured** data (not just files) for downstream automation
- **No-login** receiver experience (with a path to account-based features)
- Clear separation of **Outbox** (sender ops) and **Inbox** (receiver viewing)

---

## 🔭 Long-Term Opportunities

- **Templates Store** (HR, Legal, Freelance, Events)
- **Receiver accounts** (optional): unified Inbox across handshakes
- **Paid tiers:** storage, branding, analytics, API access, priority support
- **E-signatures** (NDAs, contracts) with audit trail
- **Payments** (one-off and recurring), invoice-like handshakes
- **Integrations:** Zapier/Make, webhooks, Slack/Email notifications
- **Localization** and multi-language flows
- **Mobile** (PWA first; native later)
- **AI assists:** auto-validate uploads, pre-fill forms, detect missing info

---

## 🧱 Non-Goals

- Full CRM or project manager
- Mandatory receiver logins
- Heavy, multi-app dependency graph
- Early paywalling of the core single-link flow

---

## 🔐 Trust & Safety (direction)

- Token-based Inbox access with expiries and revocation
- Server-side validation and safe upload handling
- Audit-friendly event trail (submissions, token usage)
- (Planned) Token hashing at rest; rate limiting on sensitive endpoints

---

## 📈 Monetization Sketch

- **Free:** core single-link intake, **1 active handshake** limit
- **Pro:** custom branding, increased storage, analytics, integrations
- **Business:** SSO, audit trail, role-based access, advanced automation

---

## 🛣️ Execution Notes

- Ship in **small, reversible steps** (additive DB migrations, alias routes)
- Maintain **legacy paths** until replaced end-to-end
- Keep docs current with each change (routes, schema, tokens)
