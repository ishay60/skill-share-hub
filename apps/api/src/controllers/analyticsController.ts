import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AuthenticatedRequest } from '../types/auth';
import { prisma } from '../lib/prisma';

export class AnalyticsController {
  /**
   * Get analytics dashboard data for a space
   * GET /api/analytics/spaces/:spaceId/dashboard
   */
  static async getSpaceDashboard(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { spaceId } = req.params;
      const { days = '30' } = req.query;

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify user owns this space
      const space = await prisma.space.findFirst({
        where: {
          id: spaceId,
          ownerId: req.user.id,
        },
      });

      if (!space) {
        res.status(404).json({ error: 'Space not found or access denied' });
        return;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(days as string));

      const analytics = await AnalyticsService.getSpaceAnalytics(
        spaceId,
        startDate,
        endDate
      );

      res.json({
        space: {
          id: space.id,
          name: space.name,
          slug: space.slug,
        },
        analytics,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: parseInt(days as string),
        },
      });
    } catch (error) {
      console.error('Analytics dashboard error:', error);
      res.status(500).json({ error: 'Failed to load analytics dashboard' });
    }
  }

  /**
   * Get overview analytics for all user's spaces
   * GET /api/analytics/overview
   */
  static async getOverview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get all user's spaces with basic metrics
      const spaces = await prisma.space.findMany({
        where: {
          ownerId: req.user.id,
        },
        include: {
          subscriptions: {
            where: {
              status: 'active',
            },
            include: {
              plan: true,
            },
          },
          qaThreads: {
            select: {
              id: true,
              _count: {
                select: {
                  messages: true,
                },
              },
            },
          },
          _count: {
            select: {
              posts: true,
              subscriptions: true,
            },
          },
        },
      });

      if (!spaces) {
        res.json({
          spaces: [],
          summary: { totalRevenue: 0, totalSubscribers: 0, totalSpaces: 0 },
        });
        return;
      }

      // Calculate summary metrics
      let totalRevenue = 0;
      let totalSubscribers = 0;

      const spaceSummaries = spaces.map(space => {
        const activeSubscriptions = space.subscriptions;
        const spaceRevenue = activeSubscriptions.reduce((sum, sub) => {
          if (!sub.plan) return sum;
          const monthlyAmount =
            sub.plan.interval === 'year'
              ? Math.round(sub.plan.price_cents / 12)
              : sub.plan.price_cents;
          return sum + monthlyAmount;
        }, 0);

        totalRevenue += spaceRevenue;
        totalSubscribers += activeSubscriptions.length;

        return {
          id: space.id,
          name: space.name,
          slug: space.slug,
          subscribers: activeSubscriptions.length,
          monthlyRevenue: spaceRevenue,
          totalPosts: space._count.posts,
          totalQAThreads: space.qaThreads.length,
          totalQAMessages: space.qaThreads.reduce(
            (sum, thread) => sum + thread._count.messages,
            0
          ),
        };
      });

      res.json({
        spaces: spaceSummaries,
        summary: {
          totalRevenue,
          totalSubscribers,
          totalSpaces: spaces.length,
        },
      });
    } catch (error) {
      console.error('Analytics overview error:', error);
      res.status(500).json({ error: 'Failed to load analytics overview' });
    }
  }

  /**
   * Generate daily snapshots manually (for testing/backfill)
   * POST /api/analytics/snapshots/generate
   */
  static async generateSnapshots(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { date } = req.body;
      const targetDate = date ? new Date(date) : new Date();

      await AnalyticsService.generateDailySnapshots(targetDate);

      res.json({
        message: 'Daily snapshots generated successfully',
        date: targetDate.toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Generate snapshots error:', error);
      res.status(500).json({ error: 'Failed to generate snapshots' });
    }
  }

  /**
   * Get real-time metrics for a space
   * GET /api/analytics/spaces/:spaceId/realtime
   */
  static async getRealtimeMetrics(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { spaceId } = req.params;

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify user owns this space
      const space = await prisma.space.findFirst({
        where: {
          id: spaceId,
          ownerId: req.user.id,
        },
      });

      if (!space) {
        res.status(404).json({ error: 'Space not found or access denied' });
        return;
      }

      const metrics = await AnalyticsService.calculateDayMetrics(
        spaceId,
        new Date()
      );

      res.json({
        metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Realtime metrics error:', error);
      res.status(500).json({ error: 'Failed to load realtime metrics' });
    }
  }
}
