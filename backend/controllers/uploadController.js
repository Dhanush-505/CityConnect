import fs from 'fs';
import path from 'path';
import uploadMiddlewares from '../config/cloudinary.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Helper to format response data for a single file upload
const formatFileResponse = (file, folderName) => {
  if (uploadMiddlewares.isCloudinary) {
    return {
      publicId: file.filename || file.public_id,
      url: file.path || file.secure_url
    };
  } else {
    // Local storage file properties
    const relativePath = path.join('uploads', folderName, file.filename).replace(/\\/g, '/');
    return {
      publicId: relativePath,
      url: `/${relativePath}`
    };
  }
};

// Citizen: Upload multiple complaint images (max 5)
export const uploadComplaintImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded.', 400);
    }
    const data = req.files.map((file) => formatFileResponse(file, 'complaints'));
    return sendSuccess(res, 'Complaint images uploaded successfully.', data);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Profile: Upload single user avatar
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded.', 400);
    }
    const data = formatFileResponse(req.file, 'profiles');
    return sendSuccess(res, 'Profile image uploaded successfully.', data);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Progress: Upload task progress images (max 10)
export const uploadProgressImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded.', 400);
    }
    const data = req.files.map((file) => formatFileResponse(file, 'progress'));
    return sendSuccess(res, 'Progress images uploaded successfully.', data);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Completion: Upload work completion images (max 10)
export const uploadCompletionImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded.', 400);
    }
    const data = req.files.map((file) => formatFileResponse(file, 'completion'));
    return sendSuccess(res, 'Completion evidence uploaded successfully.', data);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Admin: Upload announcement attachments (max 5)
export const uploadAnnouncementAttachments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded.', 400);
    }
    const data = req.files.map((file) => {
      const response = formatFileResponse(file, 'announcements');
      return {
        ...response,
        fileType: file.mimetype.includes('pdf') ? 'pdf' : 'image'
      };
    });
    return sendSuccess(res, 'Announcement attachments uploaded successfully.', data);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Delete uploaded resource (either local filepath or Cloudinary public ID)
export const deleteUploadedFile = async (req, res) => {
  try {
    // publicId is passed in the URL path parameters
    const publicId = decodeURIComponent(req.params.publicId);
    if (!publicId) {
      return sendError(res, 'Public ID is required.', 400);
    }

    if (uploadMiddlewares.isCloudinary) {
      // Delete from Cloudinary
      const result = await uploadMiddlewares.cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok') {
        return sendSuccess(res, 'File deleted from Cloudinary.', {});
      } else {
        return sendError(res, `Failed to delete from Cloudinary: ${result.result}`, 400);
      }
    } else {
      // Local fallback file deletion
      const localPath = path.resolve(publicId);
      
      // Safety check: prevent deleting files outside of the local uploads directory
      if (!localPath.includes('uploads')) {
        return sendError(res, 'Access denied.', 403);
      }

      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        return sendSuccess(res, 'File deleted from local storage.', {});
      } else {
        return sendError(res, 'File not found on local storage.', 404);
      }
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
