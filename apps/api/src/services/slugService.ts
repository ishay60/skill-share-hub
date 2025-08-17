import { prisma } from '../lib/prisma';

export class SlugService {
  static async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
      const existingSpace = await prisma.space.findUnique({
        where: { slug: uniqueSlug }
      });
      
      if (!existingSpace) {
        return uniqueSlug;
      }
      
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }
  
  static async isSlugAvailable(slug: string): Promise<boolean> {
    const existingSpace = await prisma.space.findUnique({
      where: { slug }
    });
    
    return !existingSpace;
  }
}
