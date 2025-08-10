# User Flows — Handshake

This file outlines the core interactions for two roles:

- **Sender (Entity A)** — creates and manages a handshake (request)
- **Receiver (Entity B)** — completes the request via the public link
- **(Viewer via token)** — anyone with an **inbox token link** can view submissions (read-only)

---

## 👤 Sender Flow (Entity A)

> Creating and distributing a handshake link; monitoring responses

### 1) Access
- [x] Sender signs up/logs in
- [x] Lands on dashboard with their handshakes (`/dashboard/handshakes`)

### 2) Create
- [x] Create new handshake (slug, title, description, expiry optional)
- Fields (requests):
  - [x] API supports text/email/select/file with `required` and `options[]`
  - [~] UI management exists but is **legacy/placeholder**; dedicated Outbox UI is in progress

### 3) Share
- [x] **Public form** link (no auth): `/handshake/:slug`
- [x] **Inbox (read-only) link**: mint token → `/inbox/handshakes/:id?token=<TOKEN>`

### 4) Monitor
- [x] Read-only **Inbox** web UI via token lists and shows submissions
- [~] Sender dashboard view for submissions is **partial** (API complete; UI consolidation pending)

### 5) Manage
- [x] Edit handshake metadata (title/description/expiry)
- [x] Add/update/delete fields (API)
- [x] Delete handshake (API)
- [ ] Archive/duplicate flows (planned)
- Note: We do **not** lock edits after creation yet; locking rules TBD (e.g., after first submission)

---

## 👥 Receiver Flow (Entity B)

> Completing the request via the shared public link

### 1) Open
- [x] Opens `/handshake/:slug`
- [x] Sees title/description/fields; responsive UI

### 2) Submit
- [x] Fills fields; uploads files (dev: local storage; prod: S3 planned)
- [x] Server-side validation:
  - `text/file`: `required` enforced
  - `email`: must be a valid email when required
  - `select`: **defensive rule** — if required, value must be in options; if optional and provided, must be in options

### 3) Success
- [x] Shown confirmation / thank-you screen

### 4) Changes
- [x] Can modify inputs **before** clicking Submit
- [x] No edits **after** submission (no drafts/autosave in v0)

---

## 📥 Inbox — Token Viewer Flow (read-only, no login)

> For senders or designated reviewers to see submissions without an account

1. **Sender** mints a token: `POST /api/outbox/handshakes/:id/inbox-token`
2. **Viewer** opens:
   - List: `/inbox/handshakes/:id?token=<TOKEN>`
   - Detail: `/inbox/submissions/:submissionId?token=<TOKEN>&handshakeId=:id`
3. **Viewer** can:
   - [x] List submissions for the handshake (scoped by token)
   - [x] View a submission detail (server returns `handshake_id` for back link)
   - [ ] Download files (planned)

> Tokens are currently stored plaintext; expiry/revocation/hashing to be added.

---

## 🔍 Edge Cases

| Situation                                          | v0 Handling                                      |
|---------------------------------------------------|--------------------------------------------------|
| Wrong file uploaded                                | ✅ Change before submitting                       |
| Edit text after submission                         | ❌ Not supported                                  |
| Handshake expired                                  | ❌ Expiry logic not enforced yet                  |
| Sender deletes handshake                           | ✅ Public link returns Not Found after delete     |
| Duplicate/resend a handshake                       | ❌ Not implemented (tracked)                      |
| Receiver leaves mid-fill                           | ❌ No autosave/draft                              |
| Link brute-force attempt                           | ✅ Slug unguessable; token required for inbox     |
| Viewer opens inbox link without token              | ❌ 401/403                                        |
| Token expired/revoked                              | ❌ Not implemented yet (planned)                  |

---

## 🧭 Model Summary (Outbox/Inbox)

- **Outbox (Sender):** create/manage the handshake; canonical API under `/api/outbox/handshakes`
- **Public form:** anyone can submit via `/handshake/:slug`
- **Inbox (token):** read-only viewing via `/api/inbox/*` and `/inbox/*` with `?token=…`
- **Receiver accounts:** not required; future feature for attribution and personal inbox

---

## 🔧 Executable quickstart (cURL)

> Minimal end-to-end: create handshake → add a field → mint inbox token → submit → read via inbox → open UI links.

```bash
# 0) Health
curl -s http://localhost:3000/api/health

# 1) Sender auth (login; use signup once if needed)
EMAIL="you@example.com"
PASSWORD="changeme123"
SENDER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.token')
echo "sender token len=${#SENDER_TOKEN}"

# 2) Create a handshake (canonical outbox route)
SLUG="demo-$(date +%s)"
HANDSHAKE_ID=$(curl -s -X POST http://localhost:3000/api/outbox/handshakes \
  -H "Authorization: Bearer $SENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"slug\":\"$SLUG\",\"title\":\"Demo Handshake\"}" | jq -r '.handshake.id')
echo "HANDSHAKE_ID=$HANDSHAKE_ID  SLUG=$SLUG"

# 3) Add a field (request) to the handshake
REQUEST_ID=$(curl -s -X POST http://localhost:3000/api/outbox/handshakes/$HANDSHAKE_ID/requests \
  -H "Authorization: Bearer $SENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label":"Full name","type":"text","required":true}' | jq -r '.request.id')
echo "REQUEST_ID=$REQUEST_ID"

# 4) Mint an inbox token (handshake-scoped)
INBOX_TOKEN=$(curl -s -X POST http://localhost:3000/api/outbox/handshakes/$HANDSHAKE_ID/inbox-token \
  -H "Authorization: Bearer $SENDER_TOKEN" | jq -r '.token')
echo "INBOX_TOKEN=$INBOX_TOKEN"

# 5) Submit via public form (no auth)
SUB_ID=$(curl -s -X POST http://localhost:3000/api/handshake/$SLUG/submit \
  -H "Content-Type: application/json" \
  -d "{\"responses\":[{\"request_id\":$REQUEST_ID,\"value\":\"Ada Lovelace\"}]}" | jq -r '.submission_id')
echo "SUB_ID=$SUB_ID"

# 6a) Read via Inbox API (Authorization header)
curl -s http://localhost:3000/api/inbox/handshakes/$HANDSHAKE_ID/submissions \
  -H "Authorization: Bearer $INBOX_TOKEN" | jq

curl -s http://localhost:3000/api/inbox/submissions/$SUB_ID \
  -H "Authorization: Bearer $INBOX_TOKEN" | jq

# 6b) Or via token query param (same results)
curl -s "http://localhost:3000/api/inbox/handshakes/$HANDSHAKE_ID/submissions?token=$INBOX_TOKEN" | jq

# 7) UI links (open in browser)
FRONTEND="http://localhost:5173"   # replace with your Gitpod origin if applicable
echo "$FRONTEND/handshake/$SLUG"
echo "$FRONTEND/inbox/handshakes/$HANDSHAKE_ID?token=$INBOX_TOKEN"
echo "$FRONTEND/inbox/submissions/$SUB_ID?token=$INBOX_TOKEN&handshakeId=$HANDSHAKE_ID"

---

## 🧹 Cleanup (optional)

Delete only the temp field:
```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -X DELETE http://localhost:3000/api/outbox/handshakes/$HANDSHAKE_ID/requests/$REQUEST_ID \
  -H "Authorization: Bearer $SENDER_TOKEN"
