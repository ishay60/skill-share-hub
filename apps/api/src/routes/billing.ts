import { Router } from 'express';
import { BillingController } from '../controllers/billingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Webhook endpoint (no auth required - Stripe calls this)
router.post('/webhook', BillingController.handleWebhook);

// Protected routes
router.post('/checkout', authenticateToken, BillingController.createCheckoutSession);
router.get('/subscription/:spaceId', authenticateToken, BillingController.getSubscriptionStatus);
router.post('/subscription/:subscriptionId/cancel', authenticateToken, BillingController.cancelSubscription);

export default router;
