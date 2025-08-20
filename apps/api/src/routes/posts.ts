import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { authenticateToken, requireCreator } from '../middleware/auth';
import { logPostView } from '../middleware/analytics';

const router = Router();

// Public routes
router.get('/:id', logPostView, PostController.getPost);
router.get('/space/:slug', PostController.getSpacePosts);

// Protected routes
router.post('/:spaceId', authenticateToken, requireCreator, PostController.createPost);
router.put('/:id', authenticateToken, requireCreator, PostController.updatePost);
router.delete('/:id', authenticateToken, requireCreator, PostController.deletePost);
router.patch('/:id/publish', authenticateToken, requireCreator, PostController.publishPost);

export default router;
