// Basic types for SkillShareHub
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  isPremium: boolean;
}
