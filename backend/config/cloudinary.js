import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let uploadMiddlewares = {};

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const createCloudinaryStorage = (folderName) => {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: `CityConnect/${folderName}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
        resource_type: 'auto',
      },
    });
  };

  uploadMiddlewares = {
    isCloudinary: true,
    complaints: multer({ storage: createCloudinaryStorage('complaints'), limits: { fileSize: 5 * 1024 * 1024 } }),
    profiles: multer({ storage: createCloudinaryStorage('profiles'), limits: { fileSize: 2 * 1024 * 1024 } }),
    progress: multer({ storage: createCloudinaryStorage('progress'), limits: { fileSize: 5 * 1024 * 1024 } }),
    completion: multer({ storage: createCloudinaryStorage('completion'), limits: { fileSize: 5 * 1024 * 1024 } }),
    announcements: multer({ storage: createCloudinaryStorage('announcements'), limits: { fileSize: 10 * 1024 * 1024 } }),
    cloudinary: cloudinary,
  };
} else {
  console.warn('Cloudinary credentials not found in env. Setting up local uploads fallback.');

  const createLocalStorage = (folderName) => {
    const dir = path.join('uploads', folderName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    });
  };

  uploadMiddlewares = {
    isCloudinary: false,
    complaints: multer({ storage: createLocalStorage('complaints'), limits: { fileSize: 5 * 1024 * 1024 } }),
    profiles: multer({ storage: createLocalStorage('profiles'), limits: { fileSize: 2 * 1024 * 1024 } }),
    progress: multer({ storage: createLocalStorage('progress'), limits: { fileSize: 5 * 1024 * 1024 } }),
    completion: multer({ storage: createLocalStorage('completion'), limits: { fileSize: 5 * 1024 * 1024 } }),
    announcements: multer({ storage: createLocalStorage('announcements'), limits: { fileSize: 10 * 1024 * 1024 } }),
    cloudinary: null,
  };
}

export default uploadMiddlewares;
