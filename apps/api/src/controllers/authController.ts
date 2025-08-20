import { Request, Response } from 'express';
import { comparePassword, generateToken, hashPassword } from '../lib/auth';
import { loginSchema, signupSchema } from '../schemas/auth';
import { prisma } from '../lib/prisma';

// Define proper types for Prisma errors and request user
interface PrismaError {
  code: string;
  message?: string;
  meta?: {
    target?: string[];
  };
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        res.status(409).json({ error: 'Email already in use.' });
        return;
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);

      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password_hash: hashedPassword,
          role: validatedData.role.toUpperCase(),
        },
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set token in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error('Signup error:', error);

      // Handle specific Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as PrismaError;

        if (prismaError.code === 'P2002') {
          // Check if it's an email constraint violation
          if (prismaError.meta?.target?.includes('email')) {
            res.status(409).json({ error: 'Email already in use.' });
          } else {
            res
              .status(400)
              .json({ error: 'A record with this information already exists' });
          }
          return;
        }

        if (prismaError.code === 'P1010') {
          res.status(500).json({
            error: 'Database connection issue. Please try again later.',
          });
          return;
        }
      }

      // Handle validation errors
      if (error instanceof Error) {
        if (error.message.includes('Required')) {
          res.status(400).json({ error: 'Please fill in all required fields' });
          return;
        }

        if (error.message.includes('Invalid email')) {
          res.status(400).json({ error: 'Please enter a valid email address' });
          return;
        }

        if (error.message.includes('password')) {
          res
            .status(400)
            .json({ error: 'Password must be at least 6 characters long' });
          return;
        }
      }

      // Generic error for unexpected issues (SIGNUP)
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed signup error:', error);
        res.status(500).json({
          error: 'Something went wrong. Please try again.',
          debug: error instanceof Error ? error.message : String(error),
        });
      } else {
        res
          .status(500)
          .json({ error: 'Something went wrong. Please try again.' });
      }
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValidPassword = await comparePassword(
        validatedData.password,
        user.password_hash
      );

      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set token in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as PrismaError;

        if (prismaError.code === 'P1010') {
          res.status(500).json({
            error: 'Database connection issue. Please try again later.',
          });
          return;
        }
      }

      // Handle validation errors
      if (error instanceof Error) {
        if (error.message.includes('Required')) {
          res.status(400).json({ error: 'Please fill in all required fields' });
          return;
        }

        if (error.message.includes('Invalid email')) {
          res.status(400).json({ error: 'Please enter a valid email address' });
          return;
        }
      }

      // Generic error for unexpected issues
      res
        .status(500)
        .json({ error: 'Something went wrong. Please try again.' });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      // This endpoint requires authentication middleware
      const authenticatedReq = req as AuthenticatedRequest;
      const user = authenticatedReq.user;

      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Me endpoint error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
