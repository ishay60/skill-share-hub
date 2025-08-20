import { z } from 'zod';

// Stripe checkout session creation
export const createCheckoutSchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  planId: z.string().cuid('Invalid plan ID'),
  successUrl: z.string().url('Invalid success URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
});

// Stripe webhook validation
export const stripeWebhookSchema = z.object({
  type: z.string().min(1, 'Event type is required'),
  data: z.object({
    object: z.record(z.any()),
  }),
  id: z.string().min(1, 'Event ID is required'),
  created: z.number().positive('Invalid timestamp'),
});

// Subscription status query
export const subscriptionQuerySchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
});

// Plan creation (for admin/creators)
export const createPlanSchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  name: z
    .string()
    .min(1, 'Plan name is required')
    .max(50, 'Plan name too long'),
  interval: z.enum(['month', 'year'], {
    errorMap: () => ({ message: 'Interval must be month or year' }),
  }),
  price_cents: z
    .number()
    .min(100, 'Minimum price is $1.00')
    .max(100000, 'Maximum price is $1,000.00'),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type StripeWebhookInput = z.infer<typeof stripeWebhookSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
