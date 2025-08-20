import { Request, Response, NextFunction } from 'express';
import { TenantService, TenantInfo } from '../services/tenantService';

// Extend Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantInfo;
    }
  }
}

/**
 * Middleware to resolve tenant information from host header
 */
export const resolveTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = req.get('host');
    
    if (!host) {
      return next();
    }

    const tenant = await TenantService.resolveTenant(host);
    
    if (tenant) {
      req.tenant = tenant;
      
      // Add tenant info to response headers for debugging
      res.set('X-Tenant-Space-Id', tenant.space.id);
      res.set('X-Tenant-Space-Name', tenant.space.name);
    }

    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    // Don't fail the request if tenant resolution fails
    next();
  }
};

/**
 * Middleware to require tenant context (for tenant-specific routes)
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return res.status(404).json({
      error: 'Tenant not found',
      message: 'This domain is not configured for any space',
    });
  }
  
  next();
};

/**
 * Middleware to inject tenant-specific theming into responses
 */
export const injectTenantTheme = (req: Request, res: Response, next: NextFunction) => {
  if (req.tenant) {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to inject theme data
    res.json = function(body: any) {
      // Add tenant theme to response if it's an object
      if (typeof body === 'object' && body !== null) {
        body.theme = req.tenant!.theme;
        body.meta = req.tenant!.meta;
      }
      
      return originalJson.call(this, body);
    };
  }
  
  next();
};
