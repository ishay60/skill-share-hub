import { z } from 'zod';

// HTML content validation with security considerations
const htmlContentSchema = z.string()
  .min(1, 'Post content is required')
  .max(50000, 'Content is too long (max 50,000 characters)')
  .refine(
    (content) => !content.includes('<script'), 
    'Script tags are not allowed for security reasons'
  );

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Post title is required')
    .max(200, 'Title too long')
    .trim(),
  content_md: htmlContentSchema, // Accept content_md from frontend but store as content_html
  is_premium: z.boolean().default(false),
  published_at: z.string().datetime().optional(),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Post title is required')
    .max(200, 'Title too long')
    .trim()
    .optional(),
  content_md: htmlContentSchema.optional(),
  is_premium: z.boolean().optional(),
  published_at: z.string().datetime().optional(),
});

// Query parameters validation
export const getPostsQuerySchema = z.object({
  premium: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
