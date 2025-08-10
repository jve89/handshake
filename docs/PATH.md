# PATH.md

## Overview

This document outlines the tactical development path for Handshake. It serves as a living, prioritized task list and should be regularly reviewed to reflect the most current priorities, dependencies, and user feedback.

---

## ✅ Recently shipped (2025-08-10)

- Outbox API aliases live under `/api/outbox/handshakes` (+ `/requests`); legacy sender routes retained.
- Inbox (read-only) endpoints live:
  - `GET /api/inbox/handshakes/:id/submissions` (token)
  - `GET /api/inbox/submissions/:submissionId` (token)
- Minimal Inbox UI (read-only):
  - `/inbox/handshakes/:id?token=…` (list)
  - `/inbox/submissions/:submissionId?token=…&handshakeId=:id` (detail with back link)
- DB changes applied: `receivers`, `inbox_access_tokens`, `submissions.receiver_id` (nullable), `handshakes.updated_at`.
- Public submit: defensive validation for `select` fields (optional values must be in options if provided).

> Note: “Inbox view for receivers (logged-in users)” remains **separate** and unshipped. Current inbox is token-gated, read-only.

---

## 🎯 Immediate Priorities (Next 1–2 Weeks)

- [ ] Add per-field validation and error display in public submission form  
- [ ] Implement loading spinners + disable submit button during async actions  
- [ ] Connect file uploads to persistent storage (S3) in production  
- [ ] Build admin dashboard views:  
  - [ ] List of handshakes  
  - [ ] Submissions viewer  
  - [ ] Archive/delete flow  
- [ ] Write backend unit + integration tests for all API routes  
- [ ] Setup frontend test harness with React Testing Library + Jest

---

## 🔧 Short-Term Enhancements (1–3 Months)

- [ ] Complete full user auth flows and access control  
- [ ] Add structured error feedback across UI  
- [ ] Add inbox view for receivers (logged-in users)  
- [ ] Implement resend, revoke, and archive logic for handshakes  
- [ ] Add search, filtering, and sorting in dashboard views  
- [ ] Add API documentation for internal and public endpoints  
- [ ] Optimize DB schema (indexes, constraints, relationships)

---

## 🧩 Mid-Term Features (3–6 Months)

- [ ] Stripe payment integration (one-time and subscription)  
- [ ] E-signature capture with audit trail  
- [ ] Template library (HR, Freelance, Legal, etc.)  
- [ ] Public template marketplace  
- [ ] Localization and multi-language UI  
- [ ] Team support (multi-user dashboards, roles, permissions)

---

## 🚀 Long-Term Vision (6+ Months)

- [ ] AI-powered form autofill and content validation  
- [ ] Smart contract integration for notarized workflows  
- [ ] Mobile app (native or PWA)  
- [ ] Analytics dashboards (submission rates, completion stats)  
- [ ] Webhooks, Zapier, and third-party integration support  
- [ ] Versioned handshake flows and file expiration handling

---

## 📌 Notes

- Tasks are not always sequential — parallel progress is encouraged where feasible.  
- This file works alongside `ROADMAP.md`, `SCOPE.md`, and `NOTNOW.md`.  
- Update this file after sprint reviews, roadmap changes, or major architectural decisions.

