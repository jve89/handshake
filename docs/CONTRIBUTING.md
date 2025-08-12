# docs/CONTRIBUTING.md
# CONTRIBUTING.md

Thanks for your interest in contributing to **Handshake**. This guide defines how we work so the codebase stays clean, modular, and easy to ship. Read this before opening a PR.

---

## 🧭 Principles (non-negotiable)

- **One purpose per file.** No grab-bags, no side effects.
- **Additive, non-breaking changes.** Keep legacy routes until the new path is fully wired + tested.
- **No blind edits.** Never patch a file you haven’t opened. Align on structure first.
- **Strict contracts.** Backend response shapes are explicit; frontend expects **exactly** those shapes.
- **Minimal deps.** Justify any new dependency.

### Terminology & IA guardrails
- **UI wording:** say **“Link ID”**; keep `slug` only in API paths/payloads.
- **Navigation (3 layers):** **Inbox/Outbox** → **Folders** *(UI-only in MVP; can be bypassed via “See all handshakes”)* → **Handshakes**.

### Product rules (do not violate)
- **Link ID immutability:** attempts to change `slug` on update must return `400 slug_immutable`.
- **Plan limit (Free):** allow **1 active** handshake; over limit → `403 plan_limit_reached { maxActive: 1 }`.
- **Archive (Option A):** `handshakes.archived` is a hygiene flag; **Archived remains public**.

---

## ⚙️ Dev Setup

- **Environment:** Gitpod (preferred) or local.
- **Node:** Use the version from `.nvmrc` if present (or latest LTS).
- **Install:** `npm ci` (or `npm install` on first run).
- **Env vars:** Copy `.env.example` → `.env` and fill required values (e.g., `JWT_SECRET`, Postgres URL if running locally).

### Run apps

    # Frontend (Vite @ 5173)
    npm run dev

    # Backend (Express @ 3000; watch)
    npm run dev:server

    # One-off server (no watch)
    npm run server

### Bootstrap helpers

There’s a helper script you can run in Gitpod/local if needed:

    bash scripts/bootstrap.sh

*(It should install deps, ensure DB connectivity, and start dev servers. If anything fails, follow the manual steps above.)*

---

## 🗃️ Database & Migrations

Migrations live at the **repo root** in `migrations/`. They are **SQL-first** and **additive**.

- **Never** remove/rename columns or tables in a PR that also ships code. Deprecate first, remove later.
- Keep migrations idempotent where possible (`IF NOT EXISTS`, `DO $$ … $$` checks).

### Apply migrations

    # Use your managed Postgres URL (Gitpod secrets or local env)
    psql "<YOUR_POSTGRES_URL>" -f migrations/001_inbox.sql
    psql "<YOUR_POSTGRES_URL>" -f migrations/002_handshakes_updated_at.sql
    psql "<YOUR_POSTGRES_URL>" -f migrations/003_handshakes_add_archived.sql

If you’re already *inside* `psql`, don’t paste `psql …` again — just:

    \i migrations/001_inbox.sql
    \i migrations/002_handshakes_updated_at.sql
    \i migrations/003_handshakes_add_archived.sql

### Sanity checks

    -- basic tables
    \d+ public.users
    \d+ public.handshakes
    \d+ public.requests
    \d+ public.submissions
    \d+ public.responses
    \d+ public.inbox_access_tokens
    \d+ public.receivers

---

## 🔌 Routes & Aliases (do not break)

- **Public:** `/api/handshake/:slug`, `/api/handshake/:slug/submit`
- **Outbox (canonical):** `/api/outbox/handshakes`, `/api/outbox/handshakes/:id/requests`, `/api/outbox/handshakes/:id/inbox-token`
- **Legacy (kept):** `/api/user-handshake`, `/api/handshakes/:id/requests`
- **Inbox (token-gated):** `/api/inbox/handshakes/:id/submissions`, `/api/inbox/submissions/:submissionId`, `/api/inbox/health`
- **Auth:** `/api/auth/*`
- **Uploads:** `/api/upload` (dev: local disk; prod: S3 planned)

When you add/adjust server endpoints:
1. Mount **new** aliases (don’t remove the old).
2. Update `docs/ARCHITECTURE.md`, `docs/PATH.md`, and `docs/RELEASES.md`.
3. Provide a smoke script (see below) or tests.

---

## 🔐 Security & Privacy (baseline)

- **Inbox tokens:** treat as secrets. Don’t log tokens or query strings containing `?token=`.
- Prefer `Authorization: Bearer <token>` over `?token=…` where possible.
- Keep request bodies small; consider `express.json({ limit: '1mb' })` when relevant.
- No PII in logs. Redact emails, tokens, and file names if needed.

**Planned** (do not implement ad-hoc without alignment):
- Hash inbox tokens at rest; default expiries; revoke/rotate endpoints.
- Rate limit `/api/inbox/*`, `/api/auth/*`, and public submit.
- S3 uploads with signed URLs + malware scanning.
- Add `Referrer-Policy: no-referrer`.

---

## ✅ Testing & Smoke

### Minimum before merge

- For backend services & routes: unit/integration tests **or** a reproducible smoke script that exercises the change.
- For frontend: show how to manually verify (steps + screenshots).

### Smoke (example)

Use the **Executable quickstart** in `docs/USER_FLOWS.md`:

- Create handshake → add field → mint inbox token → submit → read via inbox.
- Include any new endpoints you touched.

**Assertions to include when relevant:**

- Updating `slug` returns `400 slug_immutable`.
- Over free-plan limit returns `403 plan_limit_reached { maxActive: 1 }`.
- Archiving does **not** change public visibility; dashboard filter shows **Active / Archived / All**.

---

## 🌿 Branching & Commits

- Branch from `main`:
  - `feat/inbox-revoke`, `fix/select-validation`, `chore/docs-release`
- Keep commits atomic, one purpose each. No commented code or stray logs.
- Conventional style **encouraged**:
  - `feat(outbox): add inbox-token mint endpoint`
  - `fix(public): enforce select option membership`
  - `docs: update PATH and RELEASES`

---

## 🔍 Pull Requests

**Checklist (paste into PR description):**
- [ ] Changes are **additive** (no breaking removals/renames)
- [ ] Updated docs where needed (`ARCHITECTURE.md`, `PATH.md`, `RELEASES.md`, etc.)
- [ ] Added tests or provided a smoke script
- [ ] Verified locally (`npm run dev` + `npm run dev:server`)
- [ ] No tokens/PII logged; no secrets committed
- [ ] DB migration applied and verified (if applicable)

**Include:**
- What changed & why (1–3 sentences)
- Routes touched
- DB migrations (file names)
- Verification steps (curl commands or UI steps)

---

## 🧹 Code Style & Quality

- TypeScript strict. Avoid `any`. Model shared shapes under `src/shared/types.ts` when reused.
- ESLint + Prettier: run before committing.
- Keep functions small and deterministic. Extract helpers when duplication appears.
- Avoid magic strings/ints — define small enums/consts where helpful.

---

## 🗣️ Communication

- Use GitHub issues for bugs/ideas. Keep them small and actionable.
- For architectural shifts, open a brief proposal (issue or PR touching `docs/*.md`) **before** coding.
- Respect `SCOPE.md`, `NOTNOW.md`, `PATH.md`, `ROADMAP.md`, and `ARCHITECTURE.md` as guardrails.

---

## 🙌 Thanks

Every thoughtful, modular contribution keeps Handshake resilient and fast to ship. Build small, verify hard, document as you go.
