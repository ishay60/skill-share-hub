const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
}

interface Plan {
  id: string;
  name: string;
  interval: 'month' | 'year';
  price_cents: number;
}

interface Post {
  id: string;
  title: string;
  is_premium: boolean;
  published_at: string;
  created_at: string;
}

interface Space {
  id: string;
  name: string;
  slug: string;
  description?: string;
  posts: Post[];
  plans: Plan[];
  _count: {
    posts: number;
    memberships: number;
  };
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  plan: Plan;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get token from localStorage
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async signup(userData: { email: string; password: string; role: string }) {
    return this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // Space endpoints
  async getSpaceBySlug(slug: string) {
    return this.request(`/api/spaces/${slug}`);
  }

  async createSpace(spaceData: { name: string; description?: string }) {
    return this.request('/api/spaces', {
      method: 'POST',
      body: JSON.stringify(spaceData),
    });
  }

  async getUserSpaces() {
    return this.request<Space[]>('/api/spaces/user/spaces');
  }

  // Post endpoints
  async getSpacePosts(slug: string, premium?: boolean) {
    const params = premium !== undefined ? `?premium=${premium}` : '';
    return this.request<{ space: Space; posts: Post[] }>(
      `/api/posts/space/${slug}${params}`
    );
  }

  async createPost(
    spaceId: string,
    postData: {
      title: string;
      content_md: string;
      is_premium: boolean;
    }
  ) {
    return this.request(`/api/posts/${spaceId}`, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Billing endpoints
  async createCheckoutSession(spaceId: string, planId: string) {
    return this.request<{ sessionId: string; url: string }>(
      '/api/billing/checkout',
      {
        method: 'POST',
        body: JSON.stringify({ spaceId, planId }),
      }
    );
  }

  async getSubscriptionStatus(spaceId: string) {
    return this.request<{
      hasActiveSubscription: boolean;
      subscription?: Subscription;
    }>(`/api/billing/subscription/${spaceId}`);
  }

  async cancelSubscription(subscriptionId: string) {
    return this.request(`/api/billing/subscription/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
