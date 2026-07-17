import express from 'express';
import { createIssue, getAllIssues } from '../controllers/issueController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllIssues);
router.post('/', authMiddleware, upload.single('image'), createIssue);

export default router;
