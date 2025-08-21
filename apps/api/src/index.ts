import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { config } from 'dotenv';
import { SocketManager } from './lib/socket';
import { setupSwagger } from './lib/swagger';
import { resolveTenant } from './middleware/tenant';
import { logger, requestLogger } from './lib/logger';
import {
  globalRateLimit,
  authRateLimit,
  contentCreationRateLimit,
  apiRateLimit,
  billingRateLimit,
  heavyOperationSlowDown,
  searchRateLimit,
} from './middleware/rateLimiting';
import {
  securityHeaders,
  corsOptions,
  requestId,
  securityLogger,
  ipSecurity,
  securityErrorHandler,
} from './middleware/security';

// Import routes
import authRoutes from './routes/auth';
import spaceRoutes from './routes/spaces';
import postRoutes from './routes/posts';
import billingRoutes from './routes/billing';
import qaRoutes from './routes/qa';
import analyticsRoutes from './routes/analytics';
import tenantRoutes from './routes/tenant';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware stack
app.use(requestId); // Request tracking
app.use(requestLogger); // Structured logging
app.use(securityHeaders); // Enhanced Helmet config
app.use(ipSecurity); // IP validation and blocking
app.use(securityLogger); // Suspicious activity logging

// Global rate limiting for all requests
app.use(globalRateLimit);

// Enhanced CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Tenant resolution middleware
app.use(resolveTenant);

// Setup Swagger documentation (dev mode only)
setupSwagger(app);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// Liveness probe - simple endpoint to check if app is running
app.get('/health/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness probe - checks if app is ready to serve traffic
app.get('/health/ready', async (req, res) => {
  try {
    // Check database connectivity
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();

      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'healthy',
          uptime: process.uptime(),
        },
      });
    } catch (dbError) {
      await prisma.$disconnect();
      throw dbError;
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

// Detailed health check with all dependencies
app.get('/health/detailed', async (req, res) => {
  const checks = {
    database: 'unknown',
    redis: 'unknown',
    stripe: 'unknown',
  };

  let overallStatus = 'healthy';

  try {
    // Database check
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      checks.database = 'healthy';
    } catch (error) {
      checks.database = 'unhealthy';
      overallStatus = 'degraded';
    }

    // Redis check (if configured)
    if (process.env.REDIS_URL) {
      try {
        // Add Redis check here if needed
        checks.redis = 'not configured';
      } catch (error) {
        checks.redis = 'unhealthy';
        overallStatus = 'degraded';
      }
    } else {
      checks.redis = 'not configured';
    }

    // Stripe check
    if (process.env.STRIPE_SECRET_KEY) {
      checks.stripe = process.env.STRIPE_SECRET_KEY.startsWith('sk_')
        ? 'configured'
        : 'misconfigured';
    } else {
      checks.stripe = 'not configured';
    }

    const statusCode =
      overallStatus === 'healthy'
        ? 200
        : overallStatus === 'degraded'
          ? 200
          : 503;

    res.status(statusCode).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      checks,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks,
    });
  }
});

// Test billing endpoint
app.get('/test-billing', (req, res) => {
  res.json({
    message: 'Billing routes are working',
    timestamp: new Date().toISOString(),
    stripe_key_configured: !!process.env.STRIPE_SECRET_KEY,
    webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
});

// Temporary test signup endpoint (bypasses Prisma)
app.post('/test-signup', (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: 'Email, password, and role are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters long' });
    }

    // Simulate successful signup
    res.status(201).json({
      message: 'Test signup successful (database not connected)',
      user: {
        id: 'test-user-id',
        email,
        role,
      },
      token: 'test-token-123',
      note: 'This is a test endpoint. Database connection needs to be fixed for real signup.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Test signup failed' });
  }
});

// Simple in-memory user storage for testing
const inMemoryUsers = new Map();
const inMemoryTokens = new Map();

// Working signup endpoint using in-memory storage
app.post('/api/auth/signup-working', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: 'Email, password, and role are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    if (inMemoryUsers.has(email)) {
      return res
        .status(400)
        .json({ error: 'An account with this email already exists' });
    }

    // Create user (in-memory)
    const userId = `user_${Date.now()}`;
    const user = {
      id: userId,
      email,
      role,
      password_hash: `hashed_${password}`, // In real app, this would be bcrypt hash
      created_at: new Date().toISOString(),
    };

    inMemoryUsers.set(email, user);

    // Generate simple token
    const token = `token_${Date.now()}`;
    inMemoryTokens.set(token, userId);

    res.status(201).json({
      message: 'Signup successful!',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
      note: 'This is using in-memory storage. Database connection needs to be fixed for persistence.',
    });

    console.log(`✅ User created: ${email} (${role})`);
    console.log(`📊 Total users in memory: ${inMemoryUsers.size}`);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Working login endpoint using in-memory storage
app.post('/api/auth/login-working', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = inMemoryUsers.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Simple password check (in real app, this would be bcrypt compare)
    if (user.password_hash !== `hashed_${password}`) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate simple token
    const token = `token_${Date.now()}`;
    inMemoryTokens.set(token, user.id);

    res.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
      note: 'This is using in-memory storage. Database connection needs to be fixed for persistence.',
    });

    console.log(`✅ User logged in: ${email}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// List all users (for testing)
app.get('/api/auth/users', (req, res) => {
  const users = Array.from(inMemoryUsers.values()).map(user => ({
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  }));

  res.json({
    message: 'Users in memory',
    count: users.length,
    users,
    note: 'This is in-memory storage. Users will be lost when server restarts.',
  });
});

// API routes with specific rate limiting
app.use('/api/auth', authRateLimit, resolveTenant, authRoutes);
app.use('/api/spaces', contentCreationRateLimit, resolveTenant, spaceRoutes);
app.use('/api/posts', contentCreationRateLimit, resolveTenant, postRoutes);
app.use('/api/billing', billingRateLimit, resolveTenant, billingRoutes);
app.use('/api/qa', apiRateLimit, resolveTenant, qaRoutes);
app.use(
  '/api/analytics',
  searchRateLimit,
  heavyOperationSlowDown,
  resolveTenant,
  analyticsRoutes
);
app.use('/api/tenant', apiRateLimit, resolveTenant, tenantRoutes);

// API version endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    api: 'v1',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SkillShareHub API',
    version: process.env.npm_package_version || '0.1.0',
    documentation:
      process.env.NODE_ENV !== 'production'
        ? '/api/docs'
        : 'Documentation available in development mode',
    health: '/health',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error('Global error handler:', err);

  // Handle specific error types
  if (err.message.includes('PrismaClientInitializationError')) {
    res.status(500).json({
      error: 'Service Temporarily Unavailable',
      message:
        "We're experiencing technical difficulties. Please try again in a few minutes.",
    });
    return;
  }

  if (err.message.includes('P1010')) {
    res.status(500).json({
      error: 'Service Temporarily Unavailable',
      message: "We're experiencing database issues. Please try again later.",
    });
    return;
  }

  // In development, show more details; in production, show generic message
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong. Please try again later.';

  res.status(500).json({
    error: 'Internal Server Error',
    message,
  });
});

// Security error handler
app.use(securityErrorHandler);

// Create HTTP server and initialize Socket.io
const httpServer = createServer(app);
const socketManager = new SocketManager(httpServer); // eslint-disable-line @typescript-eslint/no-unused-vars

// Start server
httpServer.listen(PORT, () => {
  logger.info('🚀 SkillShareHub API Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    demoMode: process.env.DEMO_MODE === 'true',
    rateLimitingDisabled:
      process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === 'true',
    features: ['WebSocket', 'Real-time Q&A', 'Analytics', 'Billing'],
  });

  console.log(`🚀 SkillShareHub API server running on port ${PORT}`);
  console.log(`📊 Health checks available:`);
  console.log(`   Basic: http://localhost:${PORT}/health`);
  console.log(`   Liveness: http://localhost:${PORT}/health/live`);
  console.log(`   Readiness: http://localhost:${PORT}/health/ready`);
  console.log(`   Detailed: http://localhost:${PORT}/health/detailed`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  }
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.DEMO_MODE === 'true'
  ) {
    console.log(`🔓 Rate limiting disabled for development/demo`);
  }
  console.log(`⚡ Socket.io server ready for real-time Q&A`);
});

export default app;
