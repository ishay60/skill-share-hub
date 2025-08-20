import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Validation target types
type ValidationTarget = 'body' | 'query' | 'params';

// Enhanced validation middleware with better error handling
export const validateRequest = (
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate;

      switch (target) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      // Validate and transform the data
      const validatedData = schema.parse(dataToValidate);

      // Replace the original data with validated/transformed data
      switch (target) {
        case 'body':
          req.body = validatedData;
          break;
        case 'query':
          req.query = validatedData;
          break;
        case 'params':
          req.params = validatedData;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          received: err.received,
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Request data is invalid',
          details: validationErrors,
          type: 'VALIDATION_ERROR',
        });
      }

      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during validation',
        type: 'INTERNAL_ERROR',
      });
    }
  };
};

// Multi-target validation (validate body AND query parameters)
export const validateMultiple = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: any[] = [];

      // Validate body if schema provided
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map(err => ({
                target: 'body',
                field: err.path.join('.'),
                message: err.message,
                received: err.received,
              }))
            );
          }
        }
      }

      // Validate query if schema provided
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map(err => ({
                target: 'query',
                field: err.path.join('.'),
                message: err.message,
                received: err.received,
              }))
            );
          }
        }
      }

      // Validate params if schema provided
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map(err => ({
                target: 'params',
                field: err.path.join('.'),
                message: err.message,
                received: err.received,
              }))
            );
          }
        }
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Request data is invalid',
          details: errors,
          type: 'VALIDATION_ERROR',
        });
      }

      next();
    } catch (error) {
      console.error('Multi-validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during validation',
        type: 'INTERNAL_ERROR',
      });
    }
  };
};

// Sanitization middleware to clean common XSS patterns
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;

    // Basic XSS prevention - remove common attack patterns
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// CUID validation helper
export const validateCUID = (id: string, fieldName: string = 'ID') => {
  const cuidRegex = /^c[a-z0-9]{24}$/;
  if (!cuidRegex.test(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return true;
};

// Common validation schemas for reuse
export const commonSchemas = {
  cuid: (fieldName: string = 'ID') => ({
    parse: (value: string) => {
      validateCUID(value, fieldName);
      return value;
    },
  }),

  pagination: {
    limit: (max: number = 100) => ({
      parse: (value: any) => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 1 || num > max) {
          throw new Error(`Limit must be between 1 and ${max}`);
        }
        return num;
      },
    }),

    offset: {
      parse: (value: any) => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0) {
          throw new Error('Offset must be 0 or greater');
        }
        return num;
      },
    },
  },
};
