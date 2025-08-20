import { z } from 'zod';

// Q&A Thread schemas
export const createQAThreadSchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  title: z
    .string()
    .min(1, 'Thread title is required')
    .max(200, 'Title too long')
    .trim(),
});

export const updateQAThreadSchema = z.object({
  title: z
    .string()
    .min(1, 'Thread title is required')
    .max(200, 'Title too long')
    .trim()
    .optional(),
  status: z.enum(['active', 'closed']).optional(),
});

// Q&A Message schemas
export const createQAMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
  is_answer: z.boolean().default(false),
});

export const acceptAnswerSchema = z.object({
  messageId: z.string().cuid('Invalid message ID'),
});

// Query parameters for Q&A
export const qaThreadsQuerySchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  status: z.enum(['active', 'closed', 'all']).default('active'),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const qaMessagesQuerySchema = z.object({
  threadId: z.string().cuid('Invalid thread ID'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// URL parameters validation
export const qaParamsSchema = z.object({
  threadId: z.string().cuid('Invalid thread ID'),
  messageId: z.string().cuid('Invalid message ID'),
  spaceId: z.string().cuid('Invalid space ID'),
});

export type CreateQAThreadInput = z.infer<typeof createQAThreadSchema>;
export type UpdateQAThreadInput = z.infer<typeof updateQAThreadSchema>;
export type CreateQAMessageInput = z.infer<typeof createQAMessageSchema>;
export type AcceptAnswerInput = z.infer<typeof acceptAnswerSchema>;
