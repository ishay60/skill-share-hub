import { Router } from 'express';
import { QAController } from '../controllers/qaController';
import { authenticateToken } from '../middleware/auth';
import { logQAMessage } from '../middleware/analytics';

const router = Router();

// Public routes
router.get('/spaces/:spaceSlug/threads', QAController.getThreads);
router.get('/threads/:threadId', QAController.getThread);

// Protected routes
router.post(
  '/spaces/:spaceSlug/threads',
  authenticateToken,
  QAController.createThread
);
router.post(
  '/threads/:threadId/messages',
  authenticateToken,
  logQAMessage,
  QAController.addMessage
);
router.post(
  '/messages/:messageId/accept',
  authenticateToken,
  QAController.acceptAnswer
);
router.put(
  '/threads/:threadId/close',
  authenticateToken,
  QAController.closeThread
);

export default router;
