import { prisma } from '../lib/prisma';

export class SlugService {
  static async generateUniqueSlug(baseSlug: string): Promise<string> {
    const slug = baseSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let uniqueSlug = slug;
    let counter = 1;
    const maxAttempts = 100; // Prevent infinite loops

    while (counter <= maxAttempts) {
      const existingSpace = await prisma.space.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existingSpace) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // If we reach here, append a timestamp to ensure uniqueness
    return `${slug}-${Date.now()}`;
  }
  
  static async isSlugAvailable(slug: string): Promise<boolean> {
    const existingSpace = await prisma.space.findUnique({
      where: { slug }
    });
    
    return !existingSpace;
  }
}
