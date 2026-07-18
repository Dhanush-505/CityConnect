# CityConnect Technical Troubleshooting & Operational Guide

## Common Issues & Resolutions

### 1. Database Connection Timeout
- **Symptom**: `MongoNetworkError` or `connection timed out`.
- **Solution**: Verify MongoDB connection string in `.env` (`MONGO_URI`). Ensure IP whitelist permits local or cluster connections.

### 2. JWT Authentication Failure (401 / 403)
- **Symptom**: `Invalid token` or `Access denied for this role`.
- **Solution**: Ensure `Authorization` header contains `Bearer <TOKEN>`. Check `JWT_SECRET` in `.env`.

### 3. Rate Limit Exceeded (429)
- **Symptom**: `Too many requests from this IP`.
- **Solution**: Wait for rate-limit reset window (15 minutes) or adjust limits in `rateLimiter.js` for development environments.

### 4. Media Upload Error
- **Symptom**: Image upload fails or returns Cloudinary error.
- **Solution**: Check Cloudinary credentials (`CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`). Local fallback will store in `backend/uploads`.
