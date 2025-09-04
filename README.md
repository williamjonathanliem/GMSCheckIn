# AOG Conference Asia 2025 — QR Check-In System (Overview)

A fast, volunteer-friendly QR check-in system used at AOG Conference Asia 2025. It provides a streamlined on-site flow for scanning attendee QR codes, verifying details, and recording attendance with instant, reliable feedback. The same system also powers automated pre-event emails that deliver each registrant’s personalized QR code.

---

## What it does

- **On-site check-in**
  - Live camera scanning or image upload (mobile + desktop).
  - Human-readable review panel before updating.
  - Writes “Checked In” to the appropriate status column (e.g., Toolkit / Event).
  - Clear success, duplicate, and not-found messages for volunteers.

- **Email delivery**
  - On form submission, attendees receive a branded HTML email.
  - The email body is managed as a Google Doc template with merge tags.
  - A QR image (encodes the attendee’s key fields) is embedded in the message.

- **Resilience & diagnostics**
  - Health endpoint to verify deployment status.
  - Locking + retry to reduce transient storage errors.
  - Graceful handling of camera permissions, slow networks, and repeated scans.

---

## High-level architecture

```
Browser UI (QR scan / upload)
        │
        └─> Serverless API (Vercel)
               │
               └─> Google Apps Script Web App
                        ├─ Validates request & payload
                        ├─ Finds the attendee row in Google Sheets (email-first)
                        └─ Updates status & returns JSON
```

- **Frontend**: Zero-framework HTML/CSS with `html5-qrcode` for in-browser decoding. Responsive dark UI, optimized for quick volunteer use.
- **API layer**: A lightweight serverless function acts as a proxy between the browser and the backend to keep secrets off the client and avoid CORS issues.
- **Backend**: Google Apps Script (Web App) talks to a Sheets-based datastore and exposes a minimal JSON interface. An installable trigger handles the email sending workflow using MailApp and a Google Doc template.

> All identifiers (sheet IDs, deployment URLs, secrets) are kept private and are **not** included in this overview.

---

## Data flow (simplified)

1. **Email phase (pre-event):**  
   When a registration is recorded, the system merges attendee fields into the email template and sends a personalized message with a QR that encodes the same fields.

2. **Check-in phase (on-site):**  
   The volunteer scans a QR or uploads a photo. The UI parses and shows the key info. On confirmation, the API forwards the payload to the backend, which matches the correct row (email-first) and sets the chosen status to **CHECKED IN**.

3. **Feedback:**  
   The API responds with a concise message (“Checked in row …”, “Already checked in …”, or “QR not found …”). The UI displays that status immediately.

---

## Matching strategy (row resolution)

- **Primary key:** Email (case-insensitive).
- **Disambiguation:** Name + phone (tolerant comparison) and a light scoring fallback across other fields.
- **Goal:** High confidence matches even with minor input inconsistencies, while preventing accidental updates to the wrong attendee.

---

## UX highlights

- **One-glance review:** Name, phone, university, CG info, allergies, and receipt link are surfaced; full raw payload can be toggled.
- **Volunteer-friendly controls:** Big buttons, sticky action bar, optimistic toasts.
- **Mobile ready:** Works with device cameras and supports image upload if camera permission is denied.

---

## Reliability & security

- **No secrets in the browser:** All sensitive configuration stays server-side.
- **Request authentication:** The backend requires a shared secret from the API layer.
- **Lock + retry:** Mitigates transient “reading from storage” errors in Apps Script.
- **Timeout guards:** The API aborts long upstream calls to avoid hanging sessions.

---

## Accessibility & performance

- Respectful focus states, large hit targets, and clear color contrast.
- Camera config favors rear cameras when available; falls back gracefully.
- Minimal external dependencies, efficient rendering, and bounded scan rates.

---

## Operational notes

- **Healthcheck:** A diagnostic endpoint confirms version and function availability without exposing internals.
- **Observability:** Clear text responses make it easy for volunteers to articulate issues quickly (“Unauthorized”, “Not found”, etc.).
- **Extensibility:** The design is modular—additional status columns, dashboards, or export routines can be layered without reworking the core flow.

---

## Limitations (by design)

- **Portfolio redactions:** Identifiers (sheet IDs, URLs, secrets) and operational links are intentionally omitted.
- **Single-sheet scope:** The reference deployment targets a specific event sheet; multi-event routing is possible but out of scope here.
- **QR payload contract:** Matching assumes a consistent field order including an email field.

---

## Roadmap ideas

- Admin dashboard with live counts & filters.  
- Self-serve re-send of QR emails.  
- Badge printing / label integration.  
- Audit log tab (who checked in whom, when, and where).  
- Alternative QR generator and attachment support for compliance-heavy contexts.

---

## Credits

- **html5-qrcode** for robust in-browser QR scanning.  
- **Google Apps Script** (Sheets, MailApp, Doc HTML export) for a pragmatic serverless backend.  
- **Vercel** for hosting the API layer with fast global edge.

---

## License & ownership

This implementation, configuration, and content are internal to the organization.  
This document is an **overview for portfolio purposes** and intentionally excludes sensitive details.
