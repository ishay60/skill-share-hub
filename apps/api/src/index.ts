import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import spaceRoutes from './routes/spaces';
import postRoutes from './routes/posts';
import billingRoutes from './routes/billing';

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/billing', billingRoutes);

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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Handle specific error types
  if (err.message.includes('PrismaClientInitializationError')) {
    res.status(500).json({
      error: 'Service Temporarily Unavailable',
      message: 'We\'re experiencing technical difficulties. Please try again in a few minutes.',
    });
    return;
  }
  
  if (err.message.includes('P1010')) {
    res.status(500).json({
      error: 'Service Temporarily Unavailable',
      message: 'We\'re experiencing database issues. Please try again later.',
    });
    return;
  }
  
  // In development, show more details; in production, show generic message
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Something went wrong. Please try again later.';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkillShareHub API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
