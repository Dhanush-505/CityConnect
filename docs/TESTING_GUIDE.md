# CityConnect Testing & Quality Assurance Guide

## 1. Test Directory Structure
- `tests/unit/`: Utility and model logic tests.
- `tests/integration/`: API route and authentication tests.
- `tests/e2e/`: End-to-end user workflow simulations.

## 2. Automated Quality Assurance Script
Run the automated verification script:
```bash
node backend/verify_part9_security_qa.js
```

### Checks Performed:
1. Security Headers (`x-content-type-options`, `x-frame-options`, `x-xss-protection`).
2. Input Sanitization (XSS and NoSQL injection payloads).
3. Rate Limiter headers and behavior.
4. System Health API (`GET /api/system/health`).
5. Audit Log generation (`GET /api/system/audit-logs`).
6. End-to-End Workflow (Citizen -> Admin -> Field Worker -> Feedback -> Analytics).
