// Global type extensions for Express and other libraries

declare global {
  namespace Express {
    interface Request {
      id?: string;
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: Date;
      };
      user?: {
        id: string;
        email: string;
        role: string;
      };
      tenantId?: string;
    }
  }
}

// Ensure this file is treated as a module
export {};
