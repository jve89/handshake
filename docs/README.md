# docs/README.md
# Project Documentation Index

Welcome to the Handshake documentation folder. This directory contains all material needed to understand, contribute to, and maintain the project.

---

## Contents

- **Architecture & Scope**
  - [ARCHITECTURE.md](./ARCHITECTURE.md) — System design and key decisions
  - [SCOPE.md](./SCOPE.md) — What’s in/out for the current release
  - [RISKS.md](./RISKS.md) — Known risks and mitigations
  - [VISION.md](./VISION.md) — Product vision, model, and principles
- **Planning**
  - [ROADMAP.md](./ROADMAP.md) — Phases, milestones, timelines
  - [PATH.md](./PATH.md) — Prioritized task list (near-term, actionable)
  - [NOTNOW.md](./NOTNOW.md) — Deferred items (explicit “no” for now)
- **Usage & Flows**
  - [USER_FLOWS.md](./USER_FLOWS.md) — Core user interactions (sender/receiver)
- **Standards & History**
  - [CONTRIBUTING.md](./CONTRIBUTING.md) — Workflow, testing, security baseline
  - [RELEASES.md](./RELEASES.md) — Changelog and migration notes
- **Reference**
  - [proposed-filetree.txt](./proposed-filetree.txt) — Canonical repo layout

For the high-level project summary and setup instructions, see the root [README.md](../README.md).

---

## How to Use These Docs

- **Single source of truth:** If a doc mentions routes, schemas, or envs, keep it aligned with code in the same PR.
- **Non-breaking by default:** Docs must reflect the additive/alias-first approach (legacy routes remain until full cutover).
- **Tight, link-rich:** Keep sections short; prefer linking to the exact file/route/migration over repeating content.

---

## Editing Rules

- **One purpose per file.** Don’t mix roadmap with scope, etc.
- **Date your changes** when relevant (e.g., release entries, migrations).
- **Code blocks:** use 4-space *indented* blocks for shell/SQL to avoid nested-fence issues in renderers.
- **Terminology:**
  - “**Outbox**” = sender-side dashboards & APIs
  - “**Inbox**” = token-gated receiver views/APIs
  - **Use “Link ID” in UI; keep `slug` only in API paths/payloads (immutable after creation).**
  - **3-layer navigation:** Inbox/Outbox → **Folders** *(UI-only in MVP; can be bypassed via “See all handshakes”)* → Handshakes
  - **Archive (Option A):** *Archived remains public*; dashboard filter **Active / Archived / All**

---

## When to Update

- **ARCHITECTURE.md** — on structural changes (new routes, middlewares, data model)
- **PATH.md** — after sprint planning or notable reprioritization
- **RELEASES.md** — at each tag/deploy and whenever a migration lands
- **SCOPE.md / NOTNOW.md** — when scope boundaries shift
- **USER_FLOWS.md** — when a user-visible step changes

---

## Quick Links

- **Dev scripts:** see `scripts/bootstrap.sh`
- **Migrations:** see `migrations/*.sql` (apply using the commands in `CONTRIBUTING.md`)
- **Health checks:** `/api/health`, `/api/inbox/health`
- **Smoke flow:** see “Executable quickstart” in [USER_FLOWS.md](./USER_FLOWS.md)

---
