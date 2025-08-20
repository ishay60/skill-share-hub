import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config } from 'dotenv';
import { SocketManager } from './lib/socket';

// Import routes
import authRoutes from './routes/auth';
import spaceRoutes from './routes/spaces';
import postRoutes from './routes/posts';
import billingRoutes from './routes/billing';
import qaRoutes from './routes/qa';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/qa', qaRoutes);

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
    documentation: '/api/docs',
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

// Create HTTP server and initialize Socket.io
const httpServer = createServer(app);
const socketManager = new SocketManager(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 SkillShareHub API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Socket.io server ready for real-time Q&A`);
});

export default app;
