interface LogContext {
  userId?: string;
  spaceId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: any;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ) {
    const timestamp = new Date().toISOString();

    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...context,
    };

    if (this.isDevelopment) {
      // Pretty print for development
      const colorCodes = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        fatal: '\x1b[35m', // Magenta
      };

      const resetCode = '\x1b[0m';
      const color = colorCodes[level];

      console.log(
        `${color}[${timestamp}] ${level.toUpperCase()}${resetCode}: ${message}`,
        context ? `\n  Context: ${JSON.stringify(context, null, 2)}` : ''
      );
    } else {
      // JSON format for production (easier for log aggregation)
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: LogContext) {
    this.formatMessage('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.formatMessage('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.formatMessage('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.formatMessage('error', message, context);
  }

  fatal(message: string, context?: LogContext) {
    this.formatMessage('fatal', message, context);
  }

  // Helper methods for common scenarios
  request(method: string, path: string, context?: LogContext) {
    this.info(`${method} ${path}`, {
      type: 'REQUEST',
      method,
      path,
      ...context,
    });
  }

  response(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) {
    const level =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    this[level](`${method} ${path} - ${statusCode} (${duration}ms)`, {
      type: 'RESPONSE',
      method,
      path,
      statusCode,
      duration,
      ...context,
    });
  }

  security(event: string, context?: LogContext) {
    this.warn(`Security Event: ${event}`, {
      type: 'SECURITY',
      event,
      ...context,
    });
  }

  business(event: string, context?: LogContext) {
    this.info(`Business Event: ${event}`, {
      type: 'BUSINESS',
      event,
      ...context,
    });
  }

  performance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 5000 ? 'warn' : 'info'; // Warn if operation takes >5s

    this[level](`Performance: ${operation} took ${duration}ms`, {
      type: 'PERFORMANCE',
      operation,
      duration,
      ...context,
    });
  }

  database(query: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? 'warn' : 'debug'; // Warn if query takes >1s

    this[level](`Database: ${query} (${duration}ms)`, {
      type: 'DATABASE',
      query,
      duration,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  const requestId = req.id || 'unknown';

  // Log incoming request
  logger.request(req.method, req.path, {
    requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.response(req.method, req.path, res.statusCode, duration, {
      requestId,
      ip: req.ip,
      userId: req.user?.id,
    });
  });

  next();
};

// Performance monitoring helper
export const withPerformanceLogging = <
  T extends (...args: any[]) => Promise<any>,
>(
  operation: string,
  fn: T
): T => {
  return (async (...args: any[]) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.performance(operation, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`${operation} failed after ${duration}ms`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }) as T;
};

// Health check logging
export const logHealthCheck = (
  service: string,
  status: 'healthy' | 'unhealthy',
  details?: any
) => {
  const level = status === 'healthy' ? 'info' : 'error';
  logger[level](`Health Check: ${service} is ${status}`, {
    type: 'HEALTH_CHECK',
    service,
    status,
    details,
  });
};

export default logger;
