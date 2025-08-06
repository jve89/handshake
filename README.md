# Handshake

**The easiest way to request or deliver structured information between two parties.**

Handshake is a modern, branded, all-in-one platform that lets one party (an individual or business) request files, forms, payments, or actions from another party via a single shareable link. Inspired by the simplicity of tools like Tikkie and the power of onboarding platforms, Handshake combines automation, structure, and versatility in a way email attachments and shared folders never could.

---

## 🌍 Use Cases

* **Freelancers**: Request documents and deposits from new clients.
* **HR teams**: Collect license copies, forms, and signatures from hundreds of applicants.
* **Event organizers**: Gather RSVPs, documents, and participation fees in one go.
* **Service providers**: Bundle intake questions, NDAs, and uploads into one branded link.
* **Anyone**: Need a passport scan, form, and payment from a friend? Send them a handshake.

---

## 🚀 MVP Scope (v0.1)

* Basic user authentication (email login or hardcoded user)
* Admin dashboard to create and manage handshakes
* Support for:
  * File upload requests
  * Text input fields
  * Dropdown/select fields
* Public-facing Handshake page (via unique URL)
* Submission viewer to inspect incoming responses
* Clean, responsive UI for both public and admin views

---

## 🛠 Tech Stack

* **Frontend**: React + Vite + TypeScript
* **Backend**: Express.js + TypeScript
* **Database**: PostgreSQL
* **Styling**: TailwindCSS
* **Dev Tools**: Gitpod, tsx, dotenv, ESLint

---

## 🧠 Project Philosophy

* **One purpose per file**: All logic and views are cleanly separated.
* **Minimal dependencies**: Prefer in-house logic over fragile APIs.
* **Scalable by design**: Structure comes first, then logic.
* **Zero bloat**: Everything in the file tree exists for a reason.

---

## 📁 Project Structure

See [`/docs/proposed-filetree.txt`](./docs/proposed-filetree.txt) for the canonical project layout.

---

## 🔮 Vision (Beyond MVP)

* Handshake templates (HR, freelancers, schools, etc.)
* Branded handshakes with custom domain and design
* E-signature integration (optional)
* Payment handling across currencies
* Team access, permission layers
* Template marketplace / store
* Zapier / Make / API integrations
* File expiration and versioning

---

## 📌 Naming

We may still change the name. Alternatives considered:

* DropZone (technical feel)
* Relay (focused on action handoffs)
* Handshake (current, strong, universal)

---

## 🧭 Next Steps

* [ ] Finalize `/docs/USER_FLOWS.md` for every MVP interaction.
* [ ] Define DB schema.
* [ ] Build atomic components for forms & file upload.
* [ ] Implement backend endpoints (handshake creation, retrieval).

---

## 📚 Documentation Folder

All supporting documentation lives in the [`/docs`](./docs) folder:

- Architecture
- Roadmap
- Path
- Scope
- Contributing
- Releases
- Risks
- And more...

---

Feel free to reach out for clarifications or contributions!

