import { prisma } from '../lib/prisma';

export interface EventData {
  userId?: string;
  spaceId: string;
  type:
    | 'view'
    | 'subscribe'
    | 'cancel'
    | 'post_view'
    | 'qa_message'
    | 'login'
    | 'signup'
    | 'space_visit';
  metadata?: Record<string, any>;
}

export interface DayMetrics {
  spaceId: string;
  date: Date;
  active_subs: number;
  mrr_cents: number;
  total_revenue_cents: number;
  churn_rate: number;
  new_subs: number;
  canceled_subs: number;
  post_views: number;
  qa_messages: number;
  unique_visitors: number;
}

export class AnalyticsService {
  /**
   * Log an event for analytics tracking
   */
  static async logEvent(eventData: EventData): Promise<void> {
    try {
      await prisma.eventLog.create({
        data: {
          userId: eventData.userId || null,
          spaceId: eventData.spaceId,
          type: eventData.type,
          metadata: eventData.metadata || undefined,
        },
      });
    } catch (error) {
      console.error('Failed to log event:', error);
      // Don't throw - analytics shouldn't break the main flow
    }
  }

  /**
   * Calculate metrics for a specific space and date
   */
  static async calculateDayMetrics(
    spaceId: string,
    date: Date
  ): Promise<DayMetrics> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get active subscriptions count
    const activeSubs = await prisma.subscription.count({
      where: {
        spaceId,
        status: 'active',
        current_period_end: {
          gte: endOfDay,
        },
      },
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        spaceId,
        status: 'active',
        current_period_end: {
          gte: endOfDay,
        },
      },
      include: {
        plan: true,
      },
    });

    const mrr_cents = activeSubscriptions.reduce((total, sub) => {
      if (!sub.plan) return total;

      // Convert yearly to monthly
      const monthlyAmount =
        sub.plan.interval === 'year'
          ? Math.round(sub.plan.price_cents / 12)
          : sub.plan.price_cents;

      return total + monthlyAmount;
    }, 0);

    // Get new subscriptions for the day
    const newSubs = await prisma.subscription.count({
      where: {
        spaceId,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Get canceled subscriptions for the day
    const canceledSubs = await prisma.subscription.count({
      where: {
        spaceId,
        status: 'canceled',
        updated_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Calculate churn rate (simplified: cancellations / active at start of period)
    const churnRate =
      activeSubs > 0 ? (canceledSubs / (activeSubs + canceledSubs)) * 100 : 0;

    // Get event-based metrics for the day
    const [postViews, qaMessages, uniqueVisitors] = await Promise.all([
      // Post views
      prisma.eventLog.count({
        where: {
          spaceId,
          type: 'post_view',
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      // Q&A messages
      prisma.eventLog.count({
        where: {
          spaceId,
          type: 'qa_message',
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      // Unique visitors
      prisma.eventLog
        .groupBy({
          by: ['userId'],
          where: {
            spaceId,
            created_at: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _count: {
            userId: true,
          },
        })
        .then(groups => groups.length),
    ]);

    // Calculate total revenue to date
    const allCompletedSubs = await prisma.subscription.findMany({
      where: {
        spaceId,
        status: {
          in: ['active', 'canceled'],
        },
      },
      include: {
        plan: true,
      },
    });

    const totalRevenueCents = allCompletedSubs.reduce((total, sub) => {
      if (!sub.plan) return total;

      // Calculate how many billing periods this subscription has been active
      const now = new Date();
      const subStart = new Date(sub.current_period_start);
      const monthsActive = Math.max(
        1,
        Math.floor(
          (now.getTime() - subStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      );

      const periodsActive =
        sub.plan.interval === 'year'
          ? Math.max(1, Math.floor(monthsActive / 12))
          : monthsActive;

      return total + sub.plan.price_cents * periodsActive;
    }, 0);

    return {
      spaceId,
      date,
      active_subs: activeSubs,
      mrr_cents,
      total_revenue_cents: totalRevenueCents,
      churn_rate: Math.round(churnRate * 100) / 100, // Round to 2 decimal places
      new_subs: newSubs,
      canceled_subs: canceledSubs,
      post_views: postViews,
      qa_messages: qaMessages,
      unique_visitors: uniqueVisitors,
    };
  }

  /**
   * Create or update a daily metric snapshot
   */
  static async createDaySnapshot(spaceId: string, date: Date): Promise<void> {
    const metrics = await this.calculateDayMetrics(spaceId, date);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    await prisma.metricSnapshot.upsert({
      where: {
        spaceId_date: {
          spaceId,
          date: dateOnly,
        },
      },
      update: {
        active_subs: metrics.active_subs,
        mrr_cents: metrics.mrr_cents,
        total_revenue_cents: metrics.total_revenue_cents,
        churn_rate: metrics.churn_rate,
        new_subs: metrics.new_subs,
        canceled_subs: metrics.canceled_subs,
        post_views: metrics.post_views,
        qa_messages: metrics.qa_messages,
        unique_visitors: metrics.unique_visitors,
      },
      create: {
        spaceId,
        date: dateOnly,
        active_subs: metrics.active_subs,
        mrr_cents: metrics.mrr_cents,
        total_revenue_cents: metrics.total_revenue_cents,
        churn_rate: metrics.churn_rate,
        new_subs: metrics.new_subs,
        canceled_subs: metrics.canceled_subs,
        post_views: metrics.post_views,
        qa_messages: metrics.qa_messages,
        unique_visitors: metrics.unique_visitors,
      },
    });
  }

  /**
   * Get analytics data for a space over a date range
   */
  static async getSpaceAnalytics(
    spaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    const snapshots = await prisma.metricSnapshot.findMany({
      where: {
        spaceId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get current real-time metrics
    const currentMetrics = await this.calculateDayMetrics(spaceId, new Date());

    // Get recent activity (last 10 events)
    const recentActivity = await prisma.eventLog.findMany({
      where: {
        spaceId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 10,
    });

    return {
      snapshots,
      currentMetrics,
      recentActivity,
      summary: {
        totalSubscribers: currentMetrics.active_subs,
        monthlyRevenue: currentMetrics.mrr_cents,
        totalRevenue: currentMetrics.total_revenue_cents,
        churnRate: currentMetrics.churn_rate,
      },
    };
  }

  /**
   * Generate snapshots for all spaces for a given date
   * This would typically be run by a cron job
   */
  static async generateDailySnapshots(date: Date = new Date()): Promise<void> {
    const spaces = await prisma.space.findMany({
      select: { id: true },
    });

    for (const space of spaces) {
      try {
        await this.createDaySnapshot(space.id, date);
        console.log(
          `✅ Created snapshot for space ${space.id} on ${date.toISOString().split('T')[0]}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to create snapshot for space ${space.id}:`,
          error
        );
      }
    }
  }
}
