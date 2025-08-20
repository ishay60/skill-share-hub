import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createPostSchema, updatePostSchema } from '../schemas/post';
import { AuthenticatedRequest } from '../middleware/auth';

export class PostController {
  static async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const { spaceId } = req.params;
      const validatedData = createPostSchema.parse(req.body);
      
      // Check if user owns the space or is admin
      const space = await prisma.space.findUnique({
        where: { id: spaceId }
      });
      
      if (!space) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }
      
      if (space.ownerId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Not authorized to create posts in this space' });
        return;
      }
      
      // Create post
      const post = await prisma.post.create({
        data: {
          title: validatedData.title,
          content_html: validatedData.content_md, // Accept content_md from frontend but store as content_html
          is_premium: validatedData.is_premium,
          published_at: validatedData.published_at ? new Date(validatedData.published_at) : new Date(),
          spaceId,
          authorId: req.user.id,
        },
        include: {
          space: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        }
      });
      
      res.status(201).json({
        message: 'Post created successfully',
        post,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      
      console.error('Create post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          space: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        }
      });
      
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      
      // Check if post is published
      if (!post.published_at) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      
      res.json({ post });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async getSpacePosts(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const { premium } = req.query;
      
      // Get space with posts
      const space = await prisma.space.findUnique({
        where: { slug },
        include: {
          posts: {
            where: {
              published_at: { not: null },
              ...(premium === 'true' && { is_premium: true }),
            },
            orderBy: {
              published_at: 'desc',
            },
            select: {
              id: true,
              title: true,
              content_html: true,
              is_premium: true,
              published_at: true,
              created_at: true,
            },
          },
        },
      });
      
      if (!space) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }
      
      res.json({ 
        space: {
          id: space.id,
          name: space.name,
          slug: space.slug,
          description: space.description,
        },
        posts: space.posts 
      });
    } catch (error) {
      console.error('Get space posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async updatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const { id } = req.params;
      const validatedData = updatePostSchema.parse(req.body);
      
      // Check if post exists and user can edit it
      const existingPost = await prisma.post.findUnique({
        where: { id },
        include: {
          space: true,
        }
      });
      
      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      
      if (existingPost.authorId !== req.user.id && 
          existingPost.space.ownerId !== req.user.id && 
          req.user.role !== 'admin') {
        res.status(403).json({ error: 'Not authorized to update this post' });
        return;
      }
      
      // Update post
      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          ...validatedData,
          ...(validatedData.published_at && { published_at: new Date(validatedData.published_at) }),
        },
        include: {
          space: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        }
      });
      
      res.json({
        message: 'Post updated successfully',
        post: updatedPost,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      
      console.error('Update post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const { id } = req.params;
      
      // Check if post exists and user can delete it
      const existingPost = await prisma.post.findUnique({
        where: { id },
        include: {
          space: true,
        }
      });
      
      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      
      if (existingPost.authorId !== req.user.id && 
          existingPost.space.ownerId !== req.user.id && 
          req.user.role !== 'admin') {
        res.status(403).json({ error: 'Not authorized to delete this post' });
        return;
      }
      
      // Delete post
      await prisma.post.delete({
        where: { id }
      });
      
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async publishPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const { id } = req.params;
      
      // Check if post exists and user can publish it
      const existingPost = await prisma.post.findUnique({
        where: { id },
        include: {
          space: true,
        }
      });
      
      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      
      if (existingPost.authorId !== req.user.id && 
          existingPost.space.ownerId !== req.user.id && 
          req.user.role !== 'admin') {
        res.status(403).json({ error: 'Not authorized to publish this post' });
        return;
      }
      
      // Publish post
      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          published_at: new Date(),
        },
        include: {
          space: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        }
      });
      
      res.json({
        message: 'Post published successfully',
        post: updatedPost,
      });
    } catch (error) {
      console.error('Publish post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
