import { Router } from 'express';
import { SpaceController } from '../controllers/spaceController';
import { authenticateToken, requireCreator } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/:slug', SpaceController.getSpaceBySlug);

// Protected routes
router.get('/user/spaces', authenticateToken, SpaceController.getUserSpaces);
router.post('/', authenticateToken, requireCreator, SpaceController.createSpace);
router.put('/:id', authenticateToken, requireCreator, SpaceController.updateSpace);
router.delete('/:id', authenticateToken, requireCreator, SpaceController.deleteSpace);

export default router;
