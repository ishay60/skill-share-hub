import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Post title is required').max(200, 'Title too long'),
  content_md: z.string().min(1, 'Post content is required'),
  is_premium: z.boolean().default(false),
  published_at: z.string().datetime().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, 'Post title is required').max(200, 'Title too long').optional(),
  content_md: z.string().min(1, 'Post content is required').optional(),
  is_premium: z.boolean().optional(),
  published_at: z.string().datetime().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
