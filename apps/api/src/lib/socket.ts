import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class SocketManager {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware for WebSocket connections
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const payload = verifyToken(token);

        // Verify user exists
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ User connected: ${socket.user?.email} (${socket.id})`);

      // Join space room for Q&A
      socket.on('join_space', async (spaceId: string) => {
        try {
          // Verify user has access to this space
          const space = await prisma.space.findUnique({
            where: { id: spaceId },
            include: {
              memberships: {
                where: { userId: socket.user!.id },
              },
            },
          });

          if (!space) {
            socket.emit('error', { message: 'Space not found' });
            return;
          }

          // Check if user is owner or has membership
          const hasAccess =
            space.ownerId === socket.user!.id ||
            space.memberships.some(m => m.status === 'paid') ||
            space.memberships.length > 0; // Free access for now

          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to this space' });
            return;
          }

          await socket.join(`space:${spaceId}`);
          socket.emit('joined_space', { spaceId, spaceName: space.name });

          console.log(`📍 ${socket.user?.email} joined space: ${space.name}`);
        } catch (error) {
          console.error('Error joining space:', error);
          socket.emit('error', { message: 'Failed to join space' });
        }
      });

      // Handle Q&A message
      socket.on(
        'qa_message',
        async (data: {
          spaceId: string;
          threadId?: string;
          content: string;
          isAnswer?: boolean;
        }) => {
          try {
            const { spaceId, threadId, content, isAnswer = false } = data;

            if (!content.trim()) {
              socket.emit('error', {
                message: 'Message content cannot be empty',
              });
              return;
            }

            let thread;

            // If no threadId, create a new thread
            if (!threadId) {
              thread = await prisma.qAThread.create({
                data: {
                  spaceId,
                  createdBy: socket.user!.id,
                  title:
                    content.substring(0, 100) +
                    (content.length > 100 ? '...' : ''),
                  status: 'active',
                },
                include: {
                  creator: {
                    select: { id: true, email: true, role: true },
                  },
                },
              });
            } else {
              thread = await prisma.qAThread.findUnique({
                where: { id: threadId },
                include: {
                  creator: {
                    select: { id: true, email: true, role: true },
                  },
                },
              });

              if (!thread) {
                socket.emit('error', { message: 'Thread not found' });
                return;
              }
            }

            // Create the message
            const message = await prisma.qAMessage.create({
              data: {
                threadId: thread.id,
                userId: socket.user!.id,
                content: content.trim(),
                is_answer: isAnswer,
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

            // Broadcast to all users in the space
            this.io.to(`space:${spaceId}`).emit('new_qa_message', {
              thread: {
                id: thread.id,
                title: thread.title,
                creator: thread.creator,
                created_at: thread.created_at,
              },
              message: {
                id: message.id,
                content: message.content,
                is_answer: message.is_answer,
                is_accepted: message.is_accepted,
                created_at: message.created_at,
                user: message.user,
              },
            });

            console.log(
              `💬 New Q&A message in space ${spaceId} by ${socket.user?.email}`
            );
          } catch (error) {
            console.error('Error handling Q&A message:', error);
            socket.emit('error', { message: 'Failed to send message' });
          }
        }
      );

      // Accept an answer (creator only)
      socket.on('accept_answer', async (data: { messageId: string }) => {
        try {
          const message = await prisma.qAMessage.findUnique({
            where: { id: data.messageId },
            include: {
              thread: {
                include: {
                  space: true,
                },
              },
            },
          });

          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          // Check if user is the space owner
          if (message.thread.space.ownerId !== socket.user!.id) {
            socket.emit('error', {
              message: 'Only space owners can accept answers',
            });
            return;
          }

          // Update message as accepted
          await prisma.qAMessage.update({
            where: { id: data.messageId },
            data: { is_accepted: true },
          });

          // Broadcast the acceptance
          this.io
            .to(`space:${message.thread.spaceId}`)
            .emit('answer_accepted', {
              messageId: data.messageId,
              threadId: message.threadId,
            });

          console.log(`✅ Answer accepted in space ${message.thread.spaceId}`);
        } catch (error) {
          console.error('Error accepting answer:', error);
          socket.emit('error', { message: 'Failed to accept answer' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(
          `❌ User disconnected: ${socket.user?.email} (${socket.id})`
        );
      });
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
