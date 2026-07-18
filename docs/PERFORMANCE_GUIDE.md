# CityConnect Performance Optimization & Scalability Guide

## 1. Database Indexing
- High-frequency query fields indexed in MongoDB:
  - `Complaint`: `{ complaintId: 1 }`, `{ department: 1, status: 1 }`, `{ assignedFieldWorker: 1, status: 1 }`, `{ citizenId: 1, createdAt: -1 }`.
  - `Notification`: `{ userId: 1, isRead: 1 }`.
  - `AuditLog`: `{ timestamp: -1 }`, `{ user: 1, timestamp: -1 }`.

## 2. In-Memory Response Caching
- `cacheMiddleware.js` provides response caching with Time-To-Live (TTL) for semi-static GET endpoints to reduce database load.

## 3. Database Aggregation Pipelines
- Server-side aggregation pipelines (`analyticsController.js`) process KPI counts, departmental metrics, worker leaderboards, and trend series in single database passes.

## 4. Frontend Optimization
- React Component Code-Splitting and Lazy Loading (`React.lazy` and `Suspense`).
- Memoization via `useMemo` and `useCallback` for dynamic table rows and chart options.
