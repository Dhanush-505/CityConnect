# CityConnect API Documentation & System Reference

## Base URL
`/api`

---

## Authentication Endpoints (`/api/auth`)
- **`POST /api/auth/register`**: Register new citizen or field worker.
- **`POST /api/auth/login`**: Authenticate user and return JWT bearer token.

---

## Complaint Management (`/api/complaints`)
- **`POST /api/complaints`**: Create new complaint (Citizen).
- **`GET /api/complaints/my`**: Fetch current citizen's complaints.
- **`GET /api/complaints/:id`**: Get single complaint details.
- **`PUT /api/complaints/:id/status`**: Update status with remarks.
- **`GET /api/complaints/:id/timeline`**: Fetch timeline progress history.

---

## Admin Operations (`/api/admin/complaints`)
- **`GET /api/admin/complaints`**: List all city-wide complaints.
- **`PUT /api/admin/complaints/:id/approve`**: Approve complaint submission.
- **`PUT /api/admin/complaints/:id/reject`**: Reject invalid complaint.
- **`PUT /api/admin/complaints/:id/assign`**: Assign or reassign field worker.
- **`PUT /api/admin/complaints/:id/verify`**: Verify completed work.
- **`PUT /api/admin/complaints/:id/reopen`**: Reopen closed/rejected complaint.

---

## Field Worker Endpoints (`/api/worker`)
- **`GET /api/worker/tasks`**: List assigned tasks for officer.
- **`PUT /api/worker/tasks/:id/accept`**: Accept task assignment.
- **`PUT /api/worker/tasks/:id/status`**: Update work status & progress evidence.

---

## Analytics Endpoints (`/api/analytics`)
- **`GET /api/analytics/dashboard`**: Overall KPI summary.
- **`GET /api/analytics/departments`**: Department scorecards & completion %.
- **`GET /api/analytics/workers`**: Field worker metrics & leaderboard.
- **`GET /api/analytics/citizens`**: Personal citizen history analytics.
- **`GET /api/analytics/trends`**: Monthly trends, daily activity, priorities, categories, and automated insights.
- **`GET /api/analytics/resolution-time`**: Fastest, slowest, and average resolution times.
- **`GET /api/analytics/satisfaction`**: Feedback rating distribution.

---

## Reports & Exports (`/api/reports`)
- **`GET /api/reports/daily`**: Today's complaint report.
- **`GET /api/reports/weekly`**: Weekly complaint report.
- **`GET /api/reports/monthly`**: Monthly complaint report.
- **`GET /api/reports/custom`**: Filtered complaint report.
- **`POST /api/reports/export`**: Export report to PDF, Excel, or CSV.
- **`POST /api/reports/schedule`**: Save automated report schedule.

---

## System Diagnostics (`/api/system`)
- **`GET /api/system/health`**: Real-time system health, uptime, DB status, active users, and API response time.
- **`GET /api/system/audit-logs`**: Audit trail activity logs (Admin only).
