import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken, requireCreator } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication and creator role
router.use(authenticateToken);
router.use(requireCreator);

// Overview analytics for all user's spaces
router.get('/overview', AnalyticsController.getOverview);

// Space-specific analytics
router.get('/spaces/:spaceId/dashboard', AnalyticsController.getSpaceDashboard);
router.get('/spaces/:spaceId/realtime', AnalyticsController.getRealtimeMetrics);

// Admin/testing routes
router.post('/snapshots/generate', AnalyticsController.generateSnapshots);

export default router;
