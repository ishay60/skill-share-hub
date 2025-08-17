import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { SlugService } from '../services/slugService';
import { createSpaceSchema, updateSpaceSchema } from '../schemas/space';
import { AuthenticatedRequest } from '../middleware/auth';
import { PlanService } from '../services/planService';

export class SpaceController {
  static async createSpace(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const validatedData = createSpaceSchema.parse(req.body);

      // Generate unique slug
      const slug = await SlugService.generateUniqueSlug(validatedData.name);

      // Create space
      const space = await prisma.space.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          slug,
          ownerId: req.user.id,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Create default plans for the space
      await PlanService.createDefaultPlans(space.id);

      res.status(201).json({
        message: 'Space created successfully',
        space,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      console.error('Create space error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getSpaceBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const space = await prisma.space.findUnique({
        where: { slug },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          posts: {
            where: {
              published_at: { not: null },
            },
            orderBy: {
              published_at: 'desc',
            },
            select: {
              id: true,
              title: true,
              is_premium: true,
              published_at: true,
              created_at: true,
            },
          },
          plans: {
            orderBy: { price_cents: 'asc' },
            select: {
              id: true,
              name: true,
              interval: true,
              price_cents: true,
            },
          },
        },
      });

      if (!space) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      res.json({ space });
    } catch (error) {
      console.error('Get space error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateSpace(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const validatedData = updateSpaceSchema.parse(req.body);

      // Check if user owns the space
      const existingSpace = await prisma.space.findUnique({
        where: { id },
      });

      if (!existingSpace) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      if (existingSpace.ownerId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Not authorized to update this space' });
        return;
      }

      // Generate new slug if name changed
      let slug = existingSpace.slug;
      if (validatedData.name && validatedData.name !== existingSpace.name) {
        slug = await SlugService.generateUniqueSlug(validatedData.name);
      }

      // Update space
      const updatedSpace = await prisma.space.update({
        where: { id },
        data: {
          ...validatedData,
          slug,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      res.json({
        message: 'Space updated successfully',
        space: updatedSpace,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      console.error('Update space error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteSpace(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      // Check if user owns the space
      const existingSpace = await prisma.space.findUnique({
        where: { id },
      });

      if (!existingSpace) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      if (existingSpace.ownerId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Not authorized to delete this space' });
        return;
      }

      // Delete space (cascading will handle posts and memberships)
      await prisma.space.delete({
        where: { id },
      });

      res.json({ message: 'Space deleted successfully' });
    } catch (error) {
      console.error('Delete space error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserSpaces(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const spaces = await prisma.space.findMany({
        where: { ownerId: req.user.id },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              is_premium: true,
              published_at: true,
            },
          },
          _count: {
            select: {
              posts: true,
              memberships: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      res.json({ spaces });
    } catch (error) {
      console.error('Get user spaces error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
