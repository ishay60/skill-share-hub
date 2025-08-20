import { prisma } from '../lib/prisma';

export interface TenantInfo {
  space: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    brand_color?: string;
    accent_color?: string;
    meta_title?: string;
    meta_description?: string;
    og_image_url?: string;
    owner: {
      id: string;
      email: string;
    };
  };
  theme: {
    primary: string;
    accent: string;
    logo?: string;
  };
  meta: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

export class TenantService {
  /**
   * Resolve tenant information from host header
   */
  static async resolveTenant(host: string): Promise<TenantInfo | null> {
    try {
      // Remove port if present (localhost:3000 -> localhost)
      const cleanHost = host.split(':')[0];

      let space = null;

      // Check for custom domain first
      space = await prisma.space.findUnique({
        where: { custom_domain: cleanHost },
        include: {
          owner: {
            select: { id: true, email: true },
          },
        },
      });

      // If not found, check for subdomain
      if (!space) {
        // Extract subdomain from host (e.g., myspace.skillsharehub.com -> myspace)
        const parts = cleanHost.split('.');
        if (parts.length >= 3) {
          const subdomain = parts[0];
          space = await prisma.space.findUnique({
            where: { subdomain },
            include: {
              owner: {
                select: { id: true, email: true },
              },
            },
          });
        }
      }

      // If still not found, try slug-based resolution for development
      if (
        !space &&
        (cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1'))
      ) {
        // For development, we can use query params or path-based resolution
        // This will be handled in the controller layer
        return null;
      }

      if (!space) {
        return null;
      }

      return {
        space: {
          id: space.id,
          name: space.name,
          slug: space.slug,
          description: space.description || undefined,
          logo_url: space.logo_url || undefined,
          brand_color: space.brand_color || '#4F46E5',
          accent_color: space.accent_color || '#10B981',
          meta_title: space.meta_title || undefined,
          meta_description: space.meta_description || undefined,
          og_image_url: space.og_image_url || undefined,
          owner: space.owner,
        },
        theme: {
          primary: space.brand_color || '#4F46E5',
          accent: space.accent_color || '#10B981',
          logo: space.logo_url || undefined,
        },
        meta: {
          title: space.meta_title || space.name,
          description:
            space.meta_description ||
            space.description ||
            `Welcome to ${space.name}`,
          ogImage: space.og_image_url || undefined,
        },
      };
    } catch (error) {
      console.error('Error resolving tenant:', error);
      return null;
    }
  }

  /**
   * Update space branding
   */
  static async updateSpaceBranding(
    spaceId: string,
    ownerId: string,
    branding: {
      subdomain?: string;
      custom_domain?: string;
      logo_url?: string;
      brand_color?: string;
      accent_color?: string;
      meta_title?: string;
      meta_description?: string;
      og_image_url?: string;
    }
  ) {
    try {
      // Verify ownership
      const space = await prisma.space.findFirst({
        where: {
          id: spaceId,
          ownerId,
        },
      });

      if (!space) {
        throw new Error('Space not found or access denied');
      }

      // Validate subdomain format
      if (branding.subdomain) {
        const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
        if (!subdomainRegex.test(branding.subdomain)) {
          throw new Error(
            'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.'
          );
        }

        // Check if subdomain is already taken
        const existingSubdomain = await prisma.space.findUnique({
          where: { subdomain: branding.subdomain },
        });

        if (existingSubdomain && existingSubdomain.id !== spaceId) {
          throw new Error('Subdomain is already taken');
        }
      }

      // Validate custom domain format
      if (branding.custom_domain) {
        const domainRegex =
          /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
        if (!domainRegex.test(branding.custom_domain)) {
          throw new Error('Invalid domain format');
        }

        // Check if domain is already taken
        const existingDomain = await prisma.space.findUnique({
          where: { custom_domain: branding.custom_domain },
        });

        if (existingDomain && existingDomain.id !== spaceId) {
          throw new Error('Domain is already taken');
        }
      }

      // Validate color format
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (branding.brand_color && !colorRegex.test(branding.brand_color)) {
        throw new Error(
          'Invalid brand color format. Use hex color format #RRGGBB'
        );
      }
      if (branding.accent_color && !colorRegex.test(branding.accent_color)) {
        throw new Error(
          'Invalid accent color format. Use hex color format #RRGGBB'
        );
      }

      const updatedSpace = await prisma.space.update({
        where: { id: spaceId },
        data: {
          subdomain: branding.subdomain,
          custom_domain: branding.custom_domain,
          logo_url: branding.logo_url,
          brand_color: branding.brand_color,
          accent_color: branding.accent_color,
          meta_title: branding.meta_title,
          meta_description: branding.meta_description,
          og_image_url: branding.og_image_url,
        },
        include: {
          owner: {
            select: { id: true, email: true },
          },
        },
      });

      return this.formatSpaceForResponse(updatedSpace);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available subdomains suggestions
   */
  static async getSubdomainSuggestions(baseName: string): Promise<string[]> {
    const sanitized = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const suggestions = [
      sanitized,
      `${sanitized}hq`,
      `${sanitized}official`,
      `${sanitized}space`,
      `${sanitized}hub`,
    ];

    const existingSubdomains = await prisma.space.findMany({
      where: {
        subdomain: {
          in: suggestions,
        },
      },
      select: { subdomain: true },
    });

    const taken = new Set(existingSubdomains.map(s => s.subdomain));
    return suggestions.filter(s => !taken.has(s));
  }

  /**
   * Format space for API response
   */
  private static formatSpaceForResponse(space: any) {
    return {
      id: space.id,
      name: space.name,
      slug: space.slug,
      description: space.description,
      subdomain: space.subdomain,
      custom_domain: space.custom_domain,
      logo_url: space.logo_url,
      brand_color: space.brand_color,
      accent_color: space.accent_color,
      meta_title: space.meta_title,
      meta_description: space.meta_description,
      og_image_url: space.og_image_url,
      owner: space.owner,
      created_at: space.created_at,
      updated_at: space.updated_at,
    };
  }

  /**
   * Generate CSS variables for theming
   */
  static generateThemeCSS(tenant: TenantInfo): string {
    return `
      :root {
        --brand-primary: ${tenant.theme.primary};
        --brand-accent: ${tenant.theme.accent};
        --brand-primary-rgb: ${this.hexToRgb(tenant.theme.primary)};
        --brand-accent-rgb: ${this.hexToRgb(tenant.theme.accent)};
      }
    `;
  }

  /**
   * Convert hex color to RGB values
   */
  private static hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '79, 70, 229'; // Default indigo

    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ].join(', ');
  }
}
