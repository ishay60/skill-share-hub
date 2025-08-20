import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AuthenticatedRequest } from '../types/auth';
import { prisma } from '../lib/prisma';

/**
 * Middleware to log events for analytics
 * This should be used sparingly and only for key user actions
 */
export const logEvent = (eventType: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Skip analytics for health checks and non-user requests
      if (req.path.includes('/health') || req.path.includes('/api/v1')) {
        return next();
      }

      const userId = req.user?.id;
      let spaceId: string | null = null;

      // Extract spaceId from different possible locations
      if (req.params.spaceId) {
        spaceId = req.params.spaceId;
      } else if (req.params.slug) {
        // For space slug routes, we need to look up the space
        const space = await prisma.space.findUnique({
          where: { slug: req.params.slug },
          select: { id: true },
        });
        spaceId = space?.id || null;
      } else if (req.body.spaceId) {
        spaceId = req.body.spaceId;
      }

      // Only log if we have a spaceId
      if (spaceId) {
        // Build metadata based on the request
        const metadata: Record<string, any> = {};

        if (req.params.threadId) metadata.threadId = req.params.threadId;
        if (req.params.postId) metadata.postId = req.params.postId;
        if (req.body.title) metadata.title = req.body.title;
        if (req.method) metadata.method = req.method;
        if (req.path) metadata.path = req.path;

        // Log the event asynchronously (don't block the request)
        setImmediate(() => {
          AnalyticsService.logEvent({
            userId,
            spaceId: spaceId!,
            type: eventType as any,
            metadata,
          });
        });
      }
    } catch (error) {
      // Don't let analytics errors break the main flow
      console.error('Analytics logging error:', error);
    }

    next();
  };
};

/**
 * Specific middleware for different types of events
 */
export const logSpaceVisit = logEvent('space_visit');
export const logPostView = logEvent('post_view');
export const logQAMessage = logEvent('qa_message');
export const logSubscription = logEvent('subscribe');

/**
 * Response interceptor to log events after successful operations
 */
export const logAfterSuccess = (eventType: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json;

    res.json = function (body: any) {
      // Only log if the response was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        let spaceId: string | null = null;

        // Extract spaceId from response body or request
        if (body?.space?.id) {
          spaceId = body.space.id;
        } else if (body?.spaceId) {
          spaceId = body.spaceId;
        } else if (req.params.spaceId) {
          spaceId = req.params.spaceId;
        }

        if (spaceId) {
          // Log the event asynchronously
          setImmediate(() => {
            AnalyticsService.logEvent({
              userId,
              spaceId: spaceId!,
              type: eventType as any,
              metadata: {
                method: req.method,
                path: req.path,
                responseBody: body,
              },
            });
          });
        }
      }

      return originalSend.call(this, body);
    };

    next();
  };
};
