# RISKS.md

## Overview

This document identifies known risks to the Handshake project and outlines mitigation strategies. It is updated continuously alongside architectural and roadmap decisions.

---

## ⚙️ Technical Risks

- **Ephemeral Filesystem on Heroku**  
  Uploads stored locally are lost on dyno restart.  
  _Mitigation_: Prioritize persistent storage (S3 or equivalent) for all production uploads.

- **Database Connection Limits / Scaling**  
  PostgreSQL instances may hit connection ceilings with growing load.  
  _Mitigation_: Use connection pooling; monitor usage; plan for read replicas or managed DB scaling.

- **Dependency Instability or Breaking Changes**  
  Libraries may introduce regressions or security issues.  
  _Mitigation_: Minimize dependencies; pin versions; audit weekly; automate checks in CI/CD.

- **ESM/Node Environment Mismatch**  
  Differences between local, Gitpod, and production runtimes may introduce bugs.  
  _Mitigation_: Standardize `.nvmrc`, `tsconfig`, `vite.config.ts`, and testing across all environments.

---

## 🧠 Product Risks

- **Feature Creep and Scope Drift**  
  MVP can become unstable if overloaded.  
  _Mitigation_: Lock scope with [`SCOPE.md`](./SCOPE.md) and [`NOTNOW.md`](./NOTNOW.md); defer non-core features post-v0.1.

- **Lack of Early User Adoption**  
  Poor validation or feedback cycles can stall momentum.  
  _Mitigation_: Launch early; collect feedback fast; iterate weekly based on user actions, not opinions.

- **Sender UX Complexity**  
  Overloaded or unclear form composition UI may lead to drop-off.  
  _Mitigation_: Maintain ruthless simplicity; test workflows early; defer advanced logic to templates or v1.0+.

---

## 🔒 Security Risks

- **Malicious File Uploads**  
  Uploaded files could contain viruses or harmful content.  
  _Mitigation_: Add MIME type restrictions, size limits, and virus scanning in post-MVP release.

- **Unauthorized Data Access**  
  Weak auth logic may expose sensitive handshake data.  
  _Mitigation_: Enforce strict access control (sender-only dashboard visibility); log access events.

- **Privacy and Compliance Gaps**  
  Unclear data retention or consent flows may breach GDPR or other laws.  
  _Mitigation_: Adopt data minimization by default; maintain clear audit logs; implement terms/privacy early.

---

## 🔧 Operational Risks

- **CI/CD Failures or Test Inconsistency**  
  Broken pipelines slow down velocity.  
  _Mitigation_: Maintain green test suite; isolate unit and integration tests; monitor builds per PR.

- **Downtime, Crashes, or Platform Outages**  
  Infrastructure volatility could impact reliability.  
  _Mitigation_: Use trusted cloud providers; implement backups, rate-limiting, and basic uptime alerts.

---

## 📌 Notes

- This file is **complementary** to [`ROADMAP.md`](./ROADMAP.md) and [`PATH.md`](./PATH.md).  
- Update this document **before each major release milestone** or when introducing new system components.



