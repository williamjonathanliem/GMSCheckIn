# AOG Conference Asia 2025 — QR Check-In System (GMS KL Deployment)

A fast, volunteer-friendly QR check-in system used at **AOG Conference Asia 2025 (GMS KL)**.  
It provides a streamlined on-site flow for scanning attendee QR codes, verifying details, and recording attendance with instant, reliable feedback.

---

## What it does

- **On-site check-in**
  - Live camera scanning or image upload (mobile + desktop).
  - Human-readable review panel before updating.
  - Writes “Checked In” to the appropriate status column (Toolkit / Event).
  - Clear success, duplicate, and not-found messages for volunteers.

- **Payment validation**
  - Volunteers can mark an attendee with **Payment Mistaken**.
  - Payment field always displayed last for clarity.

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
                        ├─ Finds attendee row in Google Sheets (email-first)
                        └─ Updates status & returns JSON
```

- **Frontend**: Zero-framework HTML/CSS with `html5-qrcode` for in-browser decoding. Responsive dark UI, optimized for volunteers.  
- **API layer**: Lightweight Vercel function acting as proxy (CORS fix + secret guard).  
- **Backend**: Google Apps Script Web App connected to the event’s sheet for lookups and updates.  

---

## Data flow (simplified)

1. **Pre-event (QR email)**  
   - Each registrant receives a personalized QR via email.  
   - QR encodes attendee fields (timestamp, name, phone, uni, CG info, allergies, receipt, email).  

2. **On-site check-in**  
   - Volunteer scans QR with device camera or uploads an image.  
   - UI shows all relevant attendee details.  
   - On confirmation, backend matches the row and sets the chosen status to **CHECKED IN**.  

3. **Feedback**  
   - Volunteers immediately see:  
     - “Checked in row …”  
     - “Already checked in …”  
     - “QR not found …”  

---

## Matching strategy

- **Primary key:** Email (case-insensitive).  
- **Secondary check:** Name + phone combination.  
- **Objective:** High accuracy while preventing mismatches or accidental overwrites.  

---

## UX highlights

- **Quick volunteer workflow**: Big buttons, sticky action bar, instant toast feedback.  
- **Raw toggle**: Volunteers can view the raw QR payload when needed.  
- **Mobile friendly**: Works directly with phone cameras, supports image uploads.  
- **Accessibility**: High-contrast design, keyboard-focus states, large touch targets.  

---

## Reliability & security

- **No secrets in browser**: All sensitive data is kept server-side.  
- **Auth guard**: Backend requires a shared secret from the proxy.  
- **Lock + retry**: Prevents duplicate writes and reduces transient errors.  
- **Clear error messages**: Volunteers get easy-to-understand responses.  

---

## Limitations

- This build is **single-sheet, GMS KL only**.  
- QR payload assumes fixed field order ending with email.  
- Multi-GMS routing is available in another branch, but **out of scope for this deployment**.  

---

## Roadmap ideas

- Volunteer login with audit log (who checked in attendees).  
- Multi-GMS support with per-sheet configuration.  
- Admin dashboard with real-time counts.  
- Badge printing integration.  

---

## Credits

- **Frontend/UI**: In-house, dark gradient theme, volunteer-first design.  
- **Backend**: Google Apps Script (Sheets + MailApp).  
- **Proxy**: Vercel serverless function.  
- **Author**: *Made by William Jonathan, GMS KL*.  

---

## License & ownership

This deployment is internal to **GMS KL**.  
This document is provided for **portfolio documentation purposes only**.  
Sensitive identifiers (sheet IDs, secrets, deployment links) are intentionally excluded.  
