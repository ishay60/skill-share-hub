import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class BillingController {
  static async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { spaceId, planId } = req.body;
      const userId = (req as any).user.userId;

      if (!spaceId || !planId) {
        res.status(400).json({ error: 'Space ID and Plan ID are required' });
        return;
      }

      // Verify the space and plan exist
      const space = await prisma.space.findUnique({
        where: { id: spaceId },
        include: { plans: true },
      });

      if (!space) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      const plan = space.plans.find(p => p.id === planId);
      if (!plan) {
        res.status(404).json({ error: 'Plan not found' });
        return;
      }

      // Check if user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          spaceId,
          status: 'active',
        },
      });

      if (existingSubscription) {
        res.status(400).json({ error: 'User already has an active subscription' });
        return;
      }

      // Get or create Stripe customer
      let user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${space.name} - ${plan.name}`,
                description: `Access to premium content in ${space.name}`,
              },
              unit_amount: plan.price_cents,
              recurring: {
                interval: plan.interval as 'month' | 'year',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.APP_URL}/spaces/${space.slug}?success=true`,
        cancel_url: `${process.env.APP_URL}/spaces/${space.slug}?canceled=true`,
        metadata: {
          userId,
          spaceId,
          planId,
        },
        subscription_data: {
          metadata: {
            userId,
            spaceId,
            planId,
          },
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }

  static async getSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { spaceId } = req.params;

      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          spaceId,
          status: 'active',
        },
        include: {
          plan: true,
        },
      });

      if (!subscription) {
        res.json({ hasActiveSubscription: false });
        return;
      }

      res.json({
        hasActiveSubscription: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          plan: subscription.plan,
        },
      });
    } catch (error) {
      console.error('Get subscription status error:', error);
      res.status(500).json({ error: 'Failed to get subscription status' });
    }
  }

  static async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { subscriptionId } = req.params;

      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId,
        },
      });

      if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      // Cancel at period end in Stripe
      await stripe.subscriptions.update(subscription.stripe_sub_id, {
        cancel_at_period_end: true,
      });

      // Update local subscription status
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'canceled' },
      });

      res.json({ message: 'Subscription will be canceled at the end of the current period' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
}

// Webhook handlers
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const { userId, spaceId, planId } = session.metadata!;
  const subscription = session.subscription as string;

  try {
    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
    const customer = await stripe.customers.retrieve(stripeSubscription.customer as string);

    // Create or update subscription in database
    await prisma.subscription.upsert({
      where: { stripe_sub_id: subscription },
      update: {
        status: stripeSubscription.status,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      },
      create: {
        userId,
        spaceId,
        planId,
        stripe_customer_id: customer.id as string,
        stripe_sub_id: subscription,
        status: stripeSubscription.status,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      },
    });

    // Update membership status
    await prisma.membership.upsert({
      where: { userId_spaceId: { userId, spaceId } },
      update: { status: 'paid' },
      create: {
        userId,
        spaceId,
        status: 'paid',
      },
    });

    console.log(`Subscription created for user ${userId} in space ${spaceId}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  try {
    await prisma.subscription.updateMany({
      where: { stripe_sub_id: subscription.id },
      data: {
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
      },
    });

    // Update membership status based on subscription status
    if (subscription.status === 'active') {
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripe_sub_id: subscription.id },
      });

      if (dbSubscription) {
        await prisma.membership.upsert({
          where: { 
            userId_spaceId: { 
              userId: dbSubscription.userId, 
              spaceId: dbSubscription.spaceId 
            } 
          },
          update: { status: 'paid' },
          create: {
            userId: dbSubscription.userId,
            spaceId: dbSubscription.spaceId,
            status: 'paid',
          },
        });
      }
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripe_sub_id: subscription.id },
      });

      if (dbSubscription) {
        await prisma.membership.updateMany({
          where: { 
            userId: dbSubscription.userId, 
            spaceId: dbSubscription.spaceId 
          },
          data: { status: 'none' },
        });
      }
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  try {
    await prisma.subscription.updateMany({
      where: { stripe_sub_id: subscription.id },
      data: { status: 'canceled' },
    });

    // Update membership status
    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripe_sub_id: subscription.id },
    });

    if (dbSubscription) {
      await prisma.membership.updateMany({
        where: { 
          userId: dbSubscription.userId, 
          spaceId: dbSubscription.spaceId 
        },
        data: { status: 'none' },
      });
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}
