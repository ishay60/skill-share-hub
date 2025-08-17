import { z } from 'zod';

export const createSpaceSchema = z.object({
  name: z.string().min(1, 'Space name is required').max(100, 'Space name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const updateSpaceSchema = z.object({
  name: z.string().min(1, 'Space name is required').max(100, 'Space name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
