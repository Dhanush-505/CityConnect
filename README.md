#  CityConnect — Smart Municipal Grievance Management Platform

**CityConnect v1.0.0** is an enterprise-grade, full-stack Smart City Grievance Management System designed to streamline urban complaint reporting, real-time tracking, field officer dispatch, location intelligence, and municipal analytics.

---

##  Key Features Across Modules

###  Citizen Portal
- **Role-Based Authentication**: Secure JWT login with password hashing.
- **Geo-Tagged Complaint Registration**: Leaflet/OpenStreetMap location picker with address auto-completion.
- **Media Uploads**: Initial photo evidence uploads backed by Cloudinary & local storage.
- **Real-Time Lifecycle Tracking**: Track complaint progression (*Submitted → Under Review → Assigned → In Progress → Completed → Verified → Closed*).
- **Instant Notifications**: Socket.IO real-time alert notifications for status changes.
- **Citizen Feedback System**: Rate completed resolutions (1 to 5 stars) and submit feedback comments.

###  Municipal Admin Command Panel
- **Executive Command Center**: Live grievance queue with department filters and priority indicators.
- **System Health Diagnostics**: Real-time server uptime, DB status, API response speed, and active user metrics.
- **Workflow & Reassignment Control**: Approve submissions, reject invalid requests, set expected completion dates, and reassign officers.
- **Verification Engine**: Review completion proof photos uploaded by field workers before final closure.
- **Broadcast Announcements**: Send city-wide notifications for maintenance, safety alerts, or public service updates.

###  Field Officer Portal
- **Task List Workspace**: Department-specific assigned task queue (Electricity, Water Supply, Drainage & Waste Management).
- **Mobile-Friendly Workflow**: Quick status updates (*Accepted → Travelling → Work Started → In Progress → Completed*).
- **Progress & Completion Evidence**: Upload work progress photos and final completion proof.

###  Analytics, Reports & Intelligence
- **10 Executive KPI Cards**: Total Complaints, Open, Assigned, In Progress, Completed, Closed, Rejected, Avg Resolution Time, Active Officers, Citizen Satisfaction Rate.
- **7 Interactive Chart.js Visualizations**: Status Pie Chart, Department Bar Chart, Monthly Trend Line Chart (12 Months), Daily Activity Area Chart (30 Days), Priority Doughnut Chart, Top Categories Horizontal Bar Chart, Department Stacked Performance.
- **Geographic Density Heatmaps**: Leaflet map displaying complaint hotspots and priority intensity clusters.
- **Downloadable Reports & Multi-Format Exporter**: Export filtered reports to **PDF**, **Excel (.xls/.xlsx)**, or **CSV**.
- **Automated Report Scheduler**: Schedule daily, weekly, or monthly report dispatches.

---

##  System Architecture & Technology Stack

```text
Internet Users ──► React 18 SPA (Vite) ──► Node.js / Express API ──► MongoDB Atlas Cluster
                        │                           │                    │
                        ▼                           ▼                    ▼
                    Leaflet Maps              Socket.IO Server   Cloudinary Storage
```

- **Frontend**: React 18, Vite, React Router v6, Chart.js, Leaflet, Socket.IO Client, CSS Modules.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose ODM), JWT, bcryptjs, Socket.IO.
- **Security & Quality**: Security Headers, IP Rate Limiter, XSS & NoSQL Sanitization, Winston/Morgan Logger, Audit Logs, System Health API.

---

## 🔑 Demo Accounts

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@cityconnect.com` | `Admin@123` | Full Command Panel, Workflow, Analytics, Reports, System Health |
| **Resident Citizen** | `citizen@cityconnect.com` | `Citizen@123` | Raise Complaints, Track History, View Notifications, Feedback |
| **Field Officer (Electricity)** | `electric.worker@cityconnect.com` | `Worker@123` | Assigned Tasks, Status Updates, Upload Progress/Completion Proof |
| **Field Officer (Water)** | `water.worker@cityconnect.com` | `Worker@123` | Water Supply Tasks & Completion Evidence |
| **Field Officer (Drainage)** | `drainage.worker@cityconnect.com` | `Worker@123` | Drainage & Waste Management Tasks |

---

## ⚡ Local Setup & Installation

### 1. Clone & Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Project Repository Structure

```text
CityConnect/
├── .github/workflows/          # CI/CD GitHub Actions Workflows (Frontend, Backend, Tests)
├── backend/                    # Node.js + Express MVC Server
│   ├── config/                 # DB Connection Setup
│   ├── controllers/            # Auth, Complaint, Admin, Analytics, Reports, System Controllers
│   ├── middlewares/            # Auth, Security, RateLimiter, Sanitize, Cache, ErrorHandler
│   ├── models/                 # Complaint, User, Department, Feedback, Notification, AuditLog
│   ├── routes/                 # Express Route Definitions
│   ├── utils/                  # Logger, AuditLogger, Exporter, Socket.io
│   ├── logs/                   # Access, Error, and Activity Logs
│   └── server.js               # Express Server Entry Point
├── frontend/                   # React 18 + Vite Web Application
│   ├── src/
│   │   ├── admin/              # Admin Command Panel & System Health Widget
│   │   ├── components/         # Reusable Common & Analytics Chart Components
│   │   ├── dashboard/          # Citizen Portal & Grievance Tracker
│   │   ├── fieldworker/        # Field Officer Task Management Workspace
│   │   └── App.jsx             # React Router Setup
├── docs/                       # Technical Manuals & Guides
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SECURITY_GUIDE.md
│   ├── PERFORMANCE_GUIDE.md
│   ├── USER_MANUAL_CITIZEN.md
│   ├── USER_MANUAL_ADMIN.md
│   ├── USER_MANUAL_FIELD_WORKER.md
│   ├── BACKUP_RECOVERY_PLAN.md
│   ├── FUTURE_ROADMAP.md
│   └── FINAL_PRESENTATION.md
├── scripts/                    # Backup, Restore, and Production Verification Scripts
├── tests/                      # Unit, Integration, and E2E Test Suites
├── CHANGELOG.md                # Release Notes & Semantic Versioning
└── LICENSE                     # MIT License
```

---

