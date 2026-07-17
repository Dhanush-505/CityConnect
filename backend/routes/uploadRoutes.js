import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import uploadMiddlewares from '../config/cloudinary.js';
import {
  uploadComplaintImages,
  uploadProfileImage,
  uploadProgressImages,
  uploadCompletionImages,
  uploadAnnouncementAttachments,
  deleteUploadedFile
} from '../controllers/uploadController.js';

const router = express.Router();

// Complaint Images (Max 5)
router.post(
  '/complaints',
  authMiddleware,
  uploadMiddlewares.complaints.array('images', 5),
  uploadComplaintImages
);

// Profile avatar (Single)
router.post(
  '/profile',
  authMiddleware,
  uploadMiddlewares.profiles.single('image'),
  uploadProfileImage
);

// Progress Images (Max 10)
router.post(
  '/progress',
  authMiddleware,
  uploadMiddlewares.progress.array('images', 10),
  uploadProgressImages
);

// Completion Evidence Images (Max 10)
router.post(
  '/completion',
  authMiddleware,
  uploadMiddlewares.completion.array('images', 10),
  uploadCompletionImages
);

// Announcement Attachments (Max 5)
router.post(
  '/announcement',
  authMiddleware,
  uploadMiddlewares.announcements.array('attachments', 5),
  uploadAnnouncementAttachments
);

// Delete file
router.delete(
  '/:publicId(*)',
  authMiddleware,
  deleteUploadedFile
);

export default router;
