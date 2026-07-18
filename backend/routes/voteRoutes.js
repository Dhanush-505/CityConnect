import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { castVote } from '../controllers/voteController.js';

const router = express.Router();

router.post('/', authMiddleware, castVote);

export default router;
