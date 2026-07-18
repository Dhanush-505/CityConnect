# CityConnect System Architecture & Technical Overview

## System Architecture

```text
                                  ┌──────────────────────────┐
                                  │    Browser / Web User    │
                                  └────────────┬─────────────┘
                                               │ HTTP / WebSockets
                                               ▼
                                  ┌──────────────────────────┐
                                  │   React 18 Frontend UI   │
                                  └────────────┬─────────────┘
                                               │ Axios REST / Socket.IO
                                               ▼
                                  ┌──────────────────────────┐
                                  │ Express Node.js Backend  │
                                  └──────┬────────────┬──────┘
                                         │            │
                         MongoDB Protocol│            │Cloudinary API
                                         ▼            ▼
                              ┌──────────────┐    ┌──────────────┐
                              │ MongoDB Atlas│    │  Cloudinary  │
                              └──────────────┘    └──────────────┘
```

## System Workflow & Lifecycle Engine
1. **Grievance Submission**: Citizen logs in, selects location on Leaflet map, describes issue, uploads photos, and submits complaint.
2. **Admin Review & Assignment**: Municipal Admin views new submissions in Command Inbox, approves request, and assigns an officer from Electricity, Water Supply, or Drainage departments.
3. **Field Worker Execution**: Field Officer receives instant notification, accepts task, navigates to location, updates status to "Work Started" / "In Progress", and uploads completion evidence.
4. **Verification & Closure**: Admin or Citizen verifies completion evidence and closes complaint.
5. **Feedback & Analytics**: Resident submits 1–5 star feedback; analytics pipelines auto-update KPIs, trends, and department scorecards.
