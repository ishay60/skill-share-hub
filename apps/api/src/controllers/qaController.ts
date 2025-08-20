import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export class QAController {
  // Get Q&A threads for a space
  static async getThreads(req: Request, res: Response): Promise<void> {
    try {
      const { spaceSlug } = req.params;
      const { limit = '20', offset = '0' } = req.query;

      // Find space by slug
      const space = await prisma.space.findUnique({
        where: { slug: spaceSlug },
      });

      if (!space) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      // Get threads with messages
      const threads = await prisma.qAThread.findMany({
        where: { spaceId: space.id },
        include: {
          creator: {
            select: { id: true, email: true, role: true },
          },
          messages: {
            include: {
              user: {
                select: { id: true, email: true, role: true },
              },
            },
            orderBy: { created_at: 'asc' },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updated_at: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      res.json({
        threads,
        space: { id: space.id, name: space.name, slug: space.slug },
      });
    } catch (error) {
      console.error('Get threads error:', error);
      res.status(500).json({ error: 'Failed to get Q&A threads' });
    }
  }

  // Get a specific Q&A thread
  static async getThread(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;

      const thread = await prisma.qAThread.findUnique({
        where: { id: threadId },
        include: {
          creator: {
            select: { id: true, email: true, role: true },
          },
          space: {
            select: { id: true, name: true, slug: true },
          },
          messages: {
            include: {
              user: {
                select: { id: true, email: true, role: true },
              },
            },
            orderBy: { created_at: 'asc' },
          },
        },
      });

      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      res.json({ thread });
    } catch (error) {
      console.error('Get thread error:', error);
      res.status(500).json({ error: 'Failed to get thread' });
    }
  }

  // Create a new Q&A thread
  static async createThread(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { spaceSlug } = req.params;
      const { title, content } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      // Find space by slug
      const space = await prisma.space.findUnique({
        where: { slug: spaceSlug },
      });

      if (!space) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      // Create thread with initial message
      const thread = await prisma.qAThread.create({
        data: {
          spaceId: space.id,
          createdBy: req.user.id,
          title: title.trim(),
          status: 'active',
        },
        include: {
          creator: {
            select: { id: true, email: true, role: true },
          },
        },
      });

      // Create initial message
      const message = await prisma.qAMessage.create({
        data: {
          threadId: thread.id,
          userId: req.user.id,
          content: content.trim(),
          is_answer: false,
        },
        include: {
          user: {
            select: { id: true, email: true, role: true },
          },
        },
      });

      res.status(201).json({
        message: 'Thread created successfully',
        thread: {
          ...thread,
          messages: [message],
        },
      });
    } catch (error) {
      console.error('Create thread error:', error);
      res.status(500).json({ error: 'Failed to create thread' });
    }
  }

  // Add a message to a thread
  static async addMessage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { threadId } = req.params;
      const { content, isAnswer = false } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ error: 'Message content is required' });
        return;
      }

      // Verify thread exists
      const thread = await prisma.qAThread.findUnique({
        where: { id: threadId },
        include: {
          space: {
            select: { id: true, ownerId: true },
          },
        },
      });

      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      // Only space owners can mark messages as answers
      const canMarkAsAnswer = thread.space.ownerId === req.user.id;
      const finalIsAnswer = canMarkAsAnswer ? isAnswer : false;

      // Create message
      const message = await prisma.qAMessage.create({
        data: {
          threadId,
          userId: req.user.id,
          content: content.trim(),
          is_answer: finalIsAnswer,
        },
        include: {
          user: {
            select: { id: true, email: true, role: true },
          },
          thread: {
            select: { id: true, title: true, spaceId: true },
          },
        },
      });

      // Update thread's updated_at
      await prisma.qAThread.update({
        where: { id: threadId },
        data: { updated_at: new Date() },
      });

      res.status(201).json({
        message: 'Message added successfully',
        qaMessage: message,
      });
    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  }

  // Accept an answer (space owner only)
  static async acceptAnswer(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { messageId } = req.params;

      const message = await prisma.qAMessage.findUnique({
        where: { id: messageId },
        include: {
          thread: {
            include: {
              space: {
                select: { id: true, ownerId: true },
              },
            },
          },
        },
      });

      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      // Only space owner can accept answers
      if (message.thread.space.ownerId !== req.user.id) {
        res.status(403).json({ error: 'Only space owners can accept answers' });
        return;
      }

      // Update message as accepted
      const updatedMessage = await prisma.qAMessage.update({
        where: { id: messageId },
        data: { is_accepted: true },
        include: {
          user: {
            select: { id: true, email: true, role: true },
          },
        },
      });

      res.json({
        message: 'Answer accepted successfully',
        qaMessage: updatedMessage,
      });
    } catch (error) {
      console.error('Accept answer error:', error);
      res.status(500).json({ error: 'Failed to accept answer' });
    }
  }

  // Close a thread (space owner only)
  static async closeThread(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { threadId } = req.params;

      const thread = await prisma.qAThread.findUnique({
        where: { id: threadId },
        include: {
          space: {
            select: { id: true, ownerId: true },
          },
        },
      });

      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      // Only space owner can close threads
      if (thread.space.ownerId !== req.user.id) {
        res.status(403).json({ error: 'Only space owners can close threads' });
        return;
      }

      const updatedThread = await prisma.qAThread.update({
        where: { id: threadId },
        data: { status: 'closed' },
      });

      res.json({
        message: 'Thread closed successfully',
        thread: updatedThread,
      });
    } catch (error) {
      console.error('Close thread error:', error);
      res.status(500).json({ error: 'Failed to close thread' });
    }
  }
}
