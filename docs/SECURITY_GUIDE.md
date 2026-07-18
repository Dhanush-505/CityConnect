# CityConnect Security Architecture & Hardening Guide

## 1. Authentication & JWT Validation
- JSON Web Tokens (JWT) signed with secret key (`JWT_SECRET`).
- Tokens checked on every protected endpoint via `authMiddleware` or `adminAuthMiddleware`.
- Password hashing using `bcryptjs` with 10 salt rounds.

## 2. HTTP Security & Headers
- Customized Security Headers applied via `securityMiddleware`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - Strict Content Security Policy (CSP).

## 3. Rate Limiting & Abuse Prevention
- IP-based rate limiting via `rateLimiter.js`:
  - Global API Limiter: Max 200 requests per 15-minute window per IP.
  - Auth Limiter: Max 20 login attempts per 15-minute window per IP.

## 4. Input Sanitization & Attack Mitigation
- `sanitizeMiddleware.js` automatically strips dangerous HTML/Script tags (XSS mitigation) and removes MongoDB `$operator` key prefixes (NoSQL injection mitigation).

## 5. Audit Logging
- User activity and administrative operations recorded asynchronously in `AuditLog` collection and `logs/activity.log`.
