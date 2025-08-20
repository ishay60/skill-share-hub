import { z } from 'zod';

// Branding update schema
export const updateBrandingSchema = z.object({
  logo_url: z.string().url('Invalid logo URL').optional(),
  brand_color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'Brand color must be a valid hex color (e.g., #4F46E5)'
    )
    .optional(),
  accent_color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'Accent color must be a valid hex color (e.g., #10B981)'
    )
    .optional(),
  custom_domain: z
    .string()
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/,
      'Invalid domain format'
    )
    .optional(),
  subdomain: z
    .string()
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?$/,
      'Invalid subdomain format'
    )
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be less than 63 characters')
    .optional(),
  meta_title: z
    .string()
    .max(60, 'Meta title should be under 60 characters for SEO')
    .optional(),
  meta_description: z
    .string()
    .max(160, 'Meta description should be under 160 characters for SEO')
    .optional(),
  og_image_url: z.string().url('Invalid OG image URL').optional(),
});

// Subdomain suggestions query
export const subdomainSuggestionsSchema = z.object({
  base: z
    .string()
    .min(3, 'Base name must be at least 3 characters')
    .max(20, 'Base name must be less than 20 characters')
    .regex(
      /^[a-zA-Z0-9-]+$/,
      'Base name can only contain letters, numbers, and hyphens'
    ),
  count: z.coerce.number().min(1).max(10).default(5),
});

// Tenant info query (from host header)
export const tenantInfoSchema = z.object({
  host: z.string().min(1, 'Host header is required'),
});

// Space theming CSS generation
export const themeCSSSchema = z.object({
  spaceId: z.string().cuid('Invalid space ID'),
  variant: z.enum(['light', 'dark']).default('light'),
});

// Domain validation schema
export const domainValidationSchema = z.object({
  domain: z
    .string()
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/,
      'Invalid domain format. Must be a valid domain like example.com'
    ),
});

// Subdomain validation schema
export const subdomainValidationSchema = z.object({
  subdomain: z
    .string()
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?$/,
      'Invalid subdomain. Can only contain letters, numbers, and hyphens'
    )
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be less than 63 characters')
    .refine(
      subdomain =>
        !['www', 'api', 'admin', 'app', 'mail', 'email'].includes(
          subdomain.toLowerCase()
        ),
      'This subdomain is reserved and cannot be used'
    ),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type SubdomainSuggestionsInput = z.infer<
  typeof subdomainSuggestionsSchema
>;
export type DomainValidationInput = z.infer<typeof domainValidationSchema>;
export type SubdomainValidationInput = z.infer<
  typeof subdomainValidationSchema
>;
