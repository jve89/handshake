# CONTRIBUTING.md

Thank you for your interest in contributing to **Handshake**! This document outlines the contribution process, coding standards, and architectural expectations that keep the project clean, scalable, and sustainable.

---

## 🧭 Code of Conduct

- Be respectful and constructive in all interactions.  
- Follow the project’s architecture principles and scope boundaries.  
- Keep all contributions modular, testable, and deterministic.

---

## ⚙️ Development Setup

- Use **Gitpod** as the primary dev environment.  
- Run `scripts/bootstrap.sh` to initialize the database, seed data, and start dev servers.  
- Follow **TypeScript strict mode** — no `any`, no implicit `any`.  
- Run linting (`npm run lint`) and formatting (`npm run format`) before commits.

---

## 🌿 Branching & Workflow

- Create feature branches off `main`:
  - Use clear, descriptive names: `feature/file-upload`, `fix/validation-error`, etc.
- Open Pull Requests (PRs) with:
  - A clear summary of changes  
  - Linked issues (if applicable)  
  - Screenshots or test output for UI or API changes
- Keep commits:
  - Atomic (one purpose per commit)  
  - Clean (no commented-out code, debug logs, or console output)

---

## ✅ Testing

- Write **unit and integration tests** for all new logic and flows.  
- Ensure **file uploads** and **API endpoints** are tested thoroughly.  
- Validate frontend and backend behavior in both:
  - Authenticated dashboard flows  
  - Public submission flows  
- No PR will be accepted unless **all existing tests pass**.

---

## 🧹 Code Style & Quality

- Use ESLint and Prettier (already configured).  
- Do not introduce new dependencies without discussion.  
- Match existing folder structure and naming conventions exactly.  
- Avoid logic duplication — extract reusable functions where applicable.  
- Never bypass type checks, validations, or error handling — **no shortcuts**.

---

## 🗣️ Communication & Collaboration

- Use the **issue tracker** for bugs and feature discussions.  
- For architectural changes, open a discussion or edit relevant `docs/*.md` files first.  
- Respect `ROADMAP.md`, `SCOPE.md`, and `NOTNOW.md` as guardrails.

---

## 🔍 Review & Merge Process

- All PRs require **at least one approval** from a maintainer.  
- Maintainers may request changes for clarity, structure, or alignment.  
- Use **squash or merge commits only** — never rebase-and-force-push `main`.

---

## 👏 Thank You

Your contributions help keep Handshake focused, clean, and impactful.  
Let's build a product that lasts — thoughtfully and together.
