# User Flows — Handshake

This file outlines the core interactions for two personas:

* **Sender (Entity A)**: Person or business requesting files/info/etc.  
* **Receiver (Entity B)**: Person responding to a handshake request

---

## 👤 Sender Flow (Entity A)

> Creating and managing a handshake link

### 1. Dashboard Access

* [x] User signs up/logs in  
* [x] Lands in dashboard showing all past handshakes

### 2. Create New Handshake

* [x] Clicks “Create new handshake”  
* [x] Chooses:  
  * Title / description  
  * What is being requested:  
    * [x] File uploads  
    * [x] Text input (e.g. name, comment)  
    * [x] Dropdown/select options  
  * [x] Dynamically add, reorder, and configure unlimited fields of various types (file, text, select, email, etc.) using intuitive UI controls

> ❌ Payment tracking, due dates, and advanced form logic are out of scope for v0.1

* [ ] Optionally selects a template (e.g. Freelance onboarding, HR form)

### 3. Generate & Share Link

* [x] Handshake link is generated (e.g. `handshake.app/h/xyz123`)  
* [x] Sender shares this via email, chat, etc.

### 4. Monitor Submissions

* [x] Dashboard shows who has submitted, what’s missing  
* [ ] Optionally marks as “complete” manually

### 5. Manage Handshake

* [x] Can archive or delete a handshake  
* [x] Cannot edit content after link creation in v0.1

---

## 👥 Receiver Flow (Entity B)

> Completing a request via the shared handshake link

### 1. Open Link

* [x] Receiver opens `handshake.app/h/xyz123`  
* [x] Sees the title, description, and requested fields/files  
* [x] UI is fully responsive and optimized for desktop and mobile devices  
* [x] Sees optional **“Sign in to save this in your inbox”** link or button

> If signed in, this handshake will appear in the receiver's dashboard inbox after submission.

### 2. Submit Data

* [x] Fills out requested fields  
* [x] Uploads documents  
* [x] Real-time validation ensures all required fields are completed correctly before submission  
* [x] Clicks “Submit” (or Save as Draft if allowed — ❌ not in v0.1)

### 3. Success Screen

* [x] Confirmation message: “Your handshake is complete”  
* [ ] Optionally shows sender info/contact (e.g. HR email)

### 4. Re-submission (v0.1 supported ✅)

* [x] Receiver may re-upload a file before final submission  
* [x] No changes allowed after submission, including text inputs

---

## 📥 Inbox Flow (Optional, if Receiver Logs In)

> Enhances experience for recipients who want a dashboard overview

### When Logged In:
* [x] Public page offers login prompt ("Sign in to track this handshake")  
* [x] Upon submission, the handshake appears in `/dashboard/inbox`  
* [ ] Receiver can browse all submitted handshakes received while logged in  
* [ ] View details, download uploaded files, see timestamps, etc.

---

## 🔍 Edge Cases

| Situation                                     | v0.1 Handling                                |
| --------------------------------------------- | -------------------------------------------- |
| Receiver uploads wrong file                   | ✅ Can re-upload before submitting            |
| Receiver edits text responses before submission | ❌ Not supported                            |
| Handshake opened after expiry                 | ❌ Not implemented in v0.1                    |
| Sender deletes handshake                      | ✅ Show "Not found / deleted" message on open |
| Sender wants to duplicate or resend handshake | ❌ Tracked in `NOTNOW.md`                     |
| Receiver leaves page mid-fill                 | ❌ No autosave/draft in v0.1                  |
| Handshake link brute-forced                   | ✅ Hash is unguessable (e.g. `xyz123abc789`)  |
| Receiver logs in after submission             | ✅ Submission still counted and accessible    |
| Receiver opens link while logged in           | ✅ Submission links automatically to inbox    |

---

## Notes

* No login required for receivers — login is optional  
* Expired or deleted handshakes never show sender data  
* Submissions are not editable after hitting "Submit"  
* UI designed for simplicity and mobile responsiveness  
* Inbox support does not interfere with 1-way flows

---

## 📥 Inbox/Outbox Model

Each handshake link has a sender (“outbox”) and optionally a receiver (“inbox”).

- Every **sender** sees their created handshakes in their **Outbox** (dashboard).
- Every **receiver** can complete the handshake with **no login**.
- If the receiver logs in (or creates an account), the handshake is added to their **Inbox** automatically, enabling tracking and reuse later.

This model supports both:
- ✅ One-way, no-login flows (maximum simplicity)
- ✅ Two-way, account-based workflows (for power users or recurring use)




