import { Request, Response } from 'express';
import { TenantService } from '../services/tenantService';
import { AuthenticatedRequest } from '../types/auth';
import { prisma } from '../lib/prisma';

export class TenantController {
  /**
   * Get tenant information from host
   * GET /api/tenant/info
   */
  static async getTenantInfo(req: Request, res: Response): Promise<void> {
    try {
      const host = req.get('host');
      
      if (!host) {
        res.status(400).json({ error: 'Host header required' });
        return;
      }

      const tenant = await TenantService.resolveTenant(host);
      
      if (!tenant) {
        res.status(404).json({ 
          error: 'Tenant not found',
          message: 'No space configured for this domain',
        });
        return;
      }

      res.json({
        tenant,
        host,
      });
    } catch (error) {
      console.error('Get tenant info error:', error);
      res.status(500).json({ error: 'Failed to get tenant information' });
    }
  }

  /**
   * Update space branding
   * PUT /api/tenant/spaces/:spaceId/branding
   */
  static async updateSpaceBranding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { spaceId } = req.params;
      const branding = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const updatedSpace = await TenantService.updateSpaceBranding(
        spaceId,
        req.user.id,
        branding
      );

      res.json({
        message: 'Space branding updated successfully',
        space: updatedSpace,
      });
    } catch (error: any) {
      console.error('Update space branding error:', error);
      
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('already taken') || error.message.includes('Invalid')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update space branding' });
      }
    }
  }

  /**
   * Get subdomain suggestions
   * GET /api/tenant/subdomain-suggestions?name=myspace
   */
  static async getSubdomainSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.query;

      if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Name parameter required' });
        return;
      }

      const suggestions = await TenantService.getSubdomainSuggestions(name);

      res.json({
        suggestions,
        available: suggestions.length > 0,
      });
    } catch (error) {
      console.error('Get subdomain suggestions error:', error);
      res.status(500).json({ error: 'Failed to get subdomain suggestions' });
    }
  }

  /**
   * Get space branding settings
   * GET /api/tenant/spaces/:spaceId/branding
   */
  static async getSpaceBranding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { spaceId } = req.params;

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const space = await prisma.space.findFirst({
        where: {
          id: spaceId,
          ownerId: req.user.id,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          subdomain: true,
          custom_domain: true,
          logo_url: true,
          brand_color: true,
          accent_color: true,
          meta_title: true,
          meta_description: true,
          og_image_url: true,
        },
      });

      if (!space) {
        res.status(404).json({ error: 'Space not found or access denied' });
        return;
      }

      res.json({
        branding: space,
        urls: {
          subdomain: space.subdomain ? `https://${space.subdomain}.skillsharehub.com` : null,
          custom: space.custom_domain ? `https://${space.custom_domain}` : null,
          default: `https://skillsharehub.com/spaces/${space.slug}`,
        },
      });
    } catch (error) {
      console.error('Get space branding error:', error);
      res.status(500).json({ error: 'Failed to get space branding' });
    }
  }

  /**
   * Generate theme CSS for a space
   * GET /api/tenant/spaces/:spaceId/theme.css
   */
  static async getSpaceThemeCSS(req: Request, res: Response): Promise<void> {
    try {
      const { spaceId } = req.params;

      const space = await prisma.space.findUnique({
        where: { id: spaceId },
        select: {
          brand_color: true,
          accent_color: true,
        },
      });

      if (!space) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      const mockTenant = {
        theme: {
          primary: space.brand_color || '#4F46E5',
          accent: space.accent_color || '#10B981',
        },
        space: {} as any,
        meta: {} as any,
      };

      const css = TenantService.generateThemeCSS(mockTenant);

      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.send(css);
    } catch (error) {
      console.error('Get space theme CSS error:', error);
      res.status(500).json({ error: 'Failed to generate theme CSS' });
    }
  }
}
