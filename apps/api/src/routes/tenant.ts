import { Router } from 'express';
import { TenantController } from '../controllers/tenantController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/info', TenantController.getTenantInfo);
router.get('/subdomain-suggestions', TenantController.getSubdomainSuggestions);
router.get('/spaces/:spaceId/theme.css', TenantController.getSpaceThemeCSS);

// Protected routes
router.get('/spaces/:spaceId/branding', authenticateToken, TenantController.getSpaceBranding);
router.put('/spaces/:spaceId/branding', authenticateToken, TenantController.updateSpaceBranding);

export default router;
