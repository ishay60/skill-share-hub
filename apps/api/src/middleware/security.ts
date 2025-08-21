import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Enhanced security headers configuration
export const securityHeaders = helmet({
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Allow inline styles for React Quill and dynamic styling
        'https://fonts.googleapis.com',
        'https://cdn.quilljs.com',
      ],
      scriptSrc: [
        "'self'",
        // Only allow scripts from trusted CDNs if needed
      ],
      imgSrc: [
        "'self'",
        'data:', // Allow data URLs for images
        'https:', // Allow HTTPS images
        'blob:', // Allow blob URLs for uploaded images
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.quilljs.com',
      ],
      connectSrc: [
        "'self'",
        'https://api.stripe.com', // Stripe API
        'wss:', // WebSocket connections
        'ws:', // WebSocket connections (dev)
      ],
      frameSrc: [
        'https://js.stripe.com', // Stripe checkout
        'https://hooks.stripe.com', // Stripe webhooks
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests:
        process.env.NODE_ENV === 'production' ? [] : null,
    },
  },

  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disabled for compatibility with Stripe

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false, // Disable DNS prefetching for privacy
  },

  // Frameguard - prevents clickjacking
  frameguard: {
    action: 'deny', // Don't allow framing
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HSTS - Force HTTPS in production
  hsts:
    process.env.NODE_ENV === 'production'
      ? {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        }
      : false,

  // IE No Open
  ieNoOpen: true,

  // Don't sniff MIME types
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Note: Permissions Policy can be added via CSP or custom middleware if needed

  // Referrer Policy
  referrerPolicy: {
    policy: ['same-origin'],
  },

  // X-XSS-Protection
  xssFilter: true,
});

// Enhanced CORS configuration for production
export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.APP_URL || 'http://localhost:3000',
      'http://localhost:3001', // Alternative dev port
      'http://localhost:3002', // Another common dev port
      'https://skillsharehub.vercel.app', // Vercel deployment
      'https://skillsharehub.netlify.app', // Netlify deployment
    ];

    // In production, be more restrictive
    if (process.env.NODE_ENV === 'production') {
      // Remove localhost origins in production
      const productionOrigins = allowedOrigins.filter(
        origin => !origin.includes('localhost')
      );

      if (productionOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    } else {
      // Development - allow all configured origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    }
  },

  credentials: true, // Allow cookies

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-CSRF-Token',
  ],

  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],

  maxAge: 86400, // 24 hours
};

// Request ID middleware for tracking
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id =
    (req.headers['x-request-id'] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.id = id;
  res.setHeader('X-Request-ID', id);

  next();
};

// Security event logging
export const securityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log suspicious activity
  const suspiciousPatterns = [
    /script.*src/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /<.*>/,
    /union.*select/i,
    /drop.*table/i,
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(requestData)
  );

  if (isSuspicious) {
    console.warn('🚨 Suspicious request detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      data: requestData,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// IP geolocation and blocking (basic implementation)
export const ipSecurity = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Basic IP validation
  if (clientIp) {
    // Block obvious bad IPs (basic implementation)
    const blockedIPs = [
      '0.0.0.0',
      '127.0.0.1', // Only block loopback in production
    ];

    if (
      process.env.NODE_ENV === 'production' &&
      blockedIPs.includes(clientIp)
    ) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied from this IP address',
        type: 'IP_BLOCKED',
      });
    }
  }

  next();
};

// Enhanced error handling for security
export const securityErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log security-related errors
  if (
    err.message.includes('CORS') ||
    err.message.includes('CSP') ||
    err.message.includes('rate limit')
  ) {
    console.error('Security error:', {
      error: err.message,
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
  }

  // Don't expose sensitive error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
      type: 'SECURITY_ERROR',
    });
  }

  next(err);
};

// Environment-based security configuration
export const getSecurityConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isProduction,
    enforceHttps: isProduction,
    allowedOrigins: isProduction
      ? [
          'https://skillsharehub.vercel.app',
          'https://skillsharehub.netlify.app',
        ]
      : ['http://localhost:3000', 'http://localhost:3001'],
    cookieSecure: isProduction,
    hstsEnabled: isProduction,
  };
};
