# ARCHITECTURE.md

## Overview

Handshake is designed as a modular, scalable SaaS platform built with a clear separation between frontend and backend.

---

## Tech Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS  
- **Backend:** Express.js, TypeScript  
- **Database:** PostgreSQL (hosted externally, e.g. Heroku)  
- **Storage:** Local disk (dev), planned S3 for production  
- **Dev Environment:** Gitpod with Docker, `tsx` for running TypeScript directly

---

## Project Structure

- `src/client` — React frontend  
- `src/server` — Express backend  
- `public/uploads` — Local file storage for uploads  
- `/docs` — Project documentation  

See [`/docs/proposed-filetree.txt`](./proposed-filetree.txt) for full layout.

---

## Design Principles

- **One purpose per file** to keep logic clean  
- **Minimal dependencies** for long-term maintainability  
- **Zero bloat**—only essential features included  
- Strict API contract between frontend and backend  
- Use of environment variables via `.env`

---

## Backend Details

- Routes separated in `/routes`  
- DB access via `pg` client in `/db`  
- Multer for file uploads with local disk storage in dev  
- Error handling and validation centralized per route  

---

## Frontend Details

- React Router for routing  
- Dynamic form generation from backend handshake requests  
- Immediate file upload with URLs stored in form state  
- Vite proxy configured for backend API calls

---

## Dev & Deployment

- Dev runs in Gitpod with hot reload (frontend) and watch mode (backend)  
- Production planned on Heroku with PostgreSQL  
- Persistent storage via S3 planned for production uploads  

---

## Future Architecture Notes

- Microservice separation considered for scaling  
- API versioning strategy planned  
- CI/CD pipelines to be added




