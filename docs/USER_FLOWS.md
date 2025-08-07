# User Flows — Handshake

This file outlines the core interactions for two personas:

* **Sender (Entity A)**: Person or business requesting files/info/etc.  
* **Receiver (Entity B)**: Person responding to a handshake request

---

## 👤 Sender Flow (Entity A)

> Creating and managing a handshake link

### 1. Dashboard Access

* [ ] User signs up/logs in  
* [ ] Lands in dashboard showing all past handshakes

### 2. Create New Handshake

* [ ] Clicks “Create new handshake”  
* [ ] Chooses:  
  * Title / description  
  * What is being requested:  
    * [ ] File uploads  
    * [ ] Text input (e.g. name, comment)  
    * [ ] Dropdown/select options  
  * [ ] Dynamically add, reorder, and configure unlimited fields of various types (file, text, select, email, etc.) using intuitive UI controls

> ❌ Payment tracking, due dates, and advanced form logic are out of scope for v0.1

* [ ] Optionally selects a template (e.g. Freelance onboarding, HR form)

### 3. Generate & Share Link

* [ ] Handshake link is generated (e.g. `handshake.app/h/xyz123`)  
* [ ] Sender shares this via email, chat, etc.

### 4. Monitor Submissions

* [ ] Dashboard shows who has submitted, what’s missing  
* [ ] Optionally marks as “complete” manually

### 5. Manage Handshake

* [ ] Can archive or delete a handshake  
* [ ] Cannot edit content after link creation in v0.1

---

## 👥 Receiver Flow (Entity B)

> Completing a request via the shared handshake link

### 1. Open Link

* [ ] Receiver opens `handshake.app/h/xyz123`  
* [ ] Sees the title, description, and requested fields/files  
* [ ] UI is fully responsive and optimized for desktop and mobile devices

### 2. Submit Data

* [ ] Fills out requested fields  
* [ ] Uploads documents  
* [ ] Real-time validation ensures all required fields are completed correctly before submission  
* [ ] Clicks “Submit” (or Save as Draft if allowed — ❌ not in v0.1)

### 3. Success Screen

* [ ] Confirmation message: “Your handshake is complete”  
* [ ] Optionally shows sender info/contact (e.g. HR email)

### 4. Re-submission (v0.1 supported ✅)

* [ ] Receiver may re-upload a file before final submission  
* [ ] No changes allowed after submission, including text inputs

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

---

## Notes

* No login required for receivers  
* Expired or deleted handshakes never show sender data  
* Submissions are not editable after hitting "Submit"  
* UI designed for simplicity and mobile responsiveness  
