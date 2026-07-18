# CityConnect Production Deployment Guide

## 1. Prerequisites
- **Frontend Host**: Vercel or Netlify.
- **Backend Host**: Render, Railway, DigitalOcean, or AWS.
- **Database**: MongoDB Atlas Cluster.
- **Media Hosting**: Cloudinary Account.

---

## 2. MongoDB Atlas Configuration
1. Create a MongoDB Cluster on MongoDB Atlas.
2. In **Database Access**, create a user with ReadWrite permissions.
3. In **Network Access**, allow IP access (e.g. `0.0.0.0/0` for cloud deployment).
4. Copy the connection string into `MONGO_URI`.

---

## 3. Backend Deployment (Render / Railway)
1. Connect GitHub repository to Render/Railway.
2. Root directory: `backend`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=your_mongodb_atlas_uri`
   - `JWT_SECRET=your_jwt_secret`
   - `FRONTEND_URL=https://your-frontend-domain.vercel.app`
   - `CLOUDINARY_CLOUD_NAME=your_name`
   - `CLOUDINARY_API_KEY=your_key`
   - `CLOUDINARY_API_SECRET=your_secret`

---

## 4. Frontend Deployment (Vercel / Netlify)
1. Import GitHub repository into Vercel/Netlify.
2. Root directory: `frontend`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Set Environment Variables:
   - `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api`
   - `VITE_SOCKET_SERVER_URL=https://your-backend-api.onrender.com`
