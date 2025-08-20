import { z } from 'zod';

// Analytics query parameters
export const analyticsQuerySchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

// Real-time analytics query
export const realtimeAnalyticsSchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  last: z.coerce.number().min(1).max(1440).default(60), // Last N minutes, max 24 hours
});

// Snapshot generation request
export const generateSnapshotSchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  date: z.string().date('Invalid date (YYYY-MM-DD format)').optional(),
  force: z.boolean().default(false), // Force regeneration if exists
});

// Event logging (internal use)
export const eventLogSchema = z.object({
  userId: z.string().cuid('Invalid user ID').optional(),
  spaceId: z.string().cuid('Invalid space ID'),
  type: z.enum([
    'space_visit',
    'post_view',
    'qa_message',
    'subscription_created',
    'subscription_cancelled',
    'login',
    'signup',
    'post_created',
    'thread_created',
  ]),
  metadata: z.record(z.any()).optional(),
});

// Metrics export request
export const metricsExportSchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  format: z.enum(['json', 'csv']).default('json'),
  startDate: z.string().date('Invalid start date'),
  endDate: z.string().date('Invalid end date'),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type RealtimeAnalyticsInput = z.infer<typeof realtimeAnalyticsSchema>;
export type GenerateSnapshotInput = z.infer<typeof generateSnapshotSchema>;
export type EventLogInput = z.infer<typeof eventLogSchema>;
