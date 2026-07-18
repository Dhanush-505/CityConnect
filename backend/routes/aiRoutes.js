import express from 'express';
import authMiddleware, { adminAuthMiddleware } from '../middlewares/authMiddleware.js';
import {
  classifyComplaint,
  predictPriority,
  generateSummary,
  chatAssistant,
  recommendWorker,
  detectDuplicate,
  getAIInsights,
  smartSearch,
  getMLDataset
} from '../controllers/aiController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/classify', classifyComplaint);
router.post('/priority', predictPriority);
router.post('/summary', generateSummary);
router.post('/chat', chatAssistant);
router.post('/recommend-worker', recommendWorker);
router.post('/detect-duplicate', detectDuplicate);
router.post('/smart-search', smartSearch);
router.get('/insights', getAIInsights);
router.get('/dataset', adminAuthMiddleware, getMLDataset);

export default router;
