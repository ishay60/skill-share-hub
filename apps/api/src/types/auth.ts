import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  tenantId?: string;
}

export interface RequiredAuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
  tenantId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'creator' | 'user';
  iat?: number;
  exp?: number;
}
