import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import Pricing from '../components/Pricing';
import { QAWidget } from '../components/QAWidget';
import SafeHTMLContent from '../components/SafeHTMLContent';
import DemoModeSwitch from '../components/DemoModeSwitch';

interface Post {
  id: string;
  title: string;
  content_html: string;
  is_premium: boolean;
  published_at: string;
  created_at: string;
}

interface Space {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  posts: Post[];
  plans: Array<{
    id: string;
    name: string;
    interval: 'month' | 'year';
    price_cents: number;
  }>;
}

const SpacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [demoPremiumMode, setDemoPremiumMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'qa'>('posts');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    if (slug) {
      loadSpace();
    }
    // Load user token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadCurrentUser();
    }
  }, [slug]);

  const loadCurrentUser = async () => {
    try {
      const response = await apiClient.getMe();
      if (response.data) {
        setCurrentUser((response.data as any).user);
      }
    } catch (err) {
      console.log('Not authenticated');
    }
  };

  const loadSpace = async () => {
    try {
      const response = await apiClient.getSpacePosts(slug!, showPremiumOnly);
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.data) {
        setSpace({
          ...response.data.space,
          ownerId:
            (response.data.space as any).creator_id ||
            (response.data.space as any).ownerId ||
            '',
          posts: response.data.posts as Post[],
        } as Space);
      }
    } catch (err) {
      setError('Failed to load space');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumToggle = () => {
    setShowPremiumOnly(!showPremiumOnly);
    loadSpace();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Space Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'The requested space could not be found.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const publicPosts = space.posts.filter(post => !post.is_premium);
  const premiumPosts = space.posts.filter(post => post.is_premium);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {space.name}
                </h1>
                {space.description && (
                  <p className="text-lg text-gray-600">{space.description}</p>
                )}
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* Pricing Section */}
          {space.plans && space.plans.length > 0 && (
            <div id="pricing-section" className="mb-8">
              <Pricing
                spaceId={space.id}
                spaceName={space.name}
                plans={space.plans}
                onSubscriptionChange={loadSpace}
              />
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'posts'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📝 Posts
                </button>
                <button
                  onClick={() => setActiveTab('qa')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'qa'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💬 Q&A
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Posts</h2>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPremiumOnly}
                      onChange={handlePremiumToggle}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Show premium only
                    </span>
                  </label>
                </div>
              </div>

              {publicPosts.length === 0 && premiumPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <p className="text-gray-500">No posts available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publicPosts.map(post => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg shadow-sm border p-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {post.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Free
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Published{' '}
                        {new Date(post.published_at).toLocaleDateString()}
                      </p>
                      <div className="post-content">
                        <SafeHTMLContent
                          content={post.content_html}
                          type="html"
                          allowInteractive={true}
                          className="text-gray-700"
                        />
                      </div>
                    </div>
                  ))}

                  {premiumPosts.map(post => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg shadow-sm border p-6 border-indigo-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {post.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                          Premium
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Published{' '}
                        {new Date(post.published_at).toLocaleDateString()}
                      </p>

                      {/* Content - Full if demo premium mode, preview otherwise */}
                      <div className="mb-4 relative">
                        {demoPremiumMode ? (
                          <div className="post-content">
                            <SafeHTMLContent
                              content={post.content_html}
                              type="html"
                              allowInteractive={true}
                              className="text-gray-700"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="max-h-24 overflow-hidden">
                              <SafeHTMLContent
                                content={
                                  post.content_html.substring(0, 200) + '...'
                                }
                                type="html"
                                allowInteractive={false}
                                className="text-gray-600 text-sm"
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                          </>
                        )}
                      </div>

                      {!demoPremiumMode && (
                        <div className="p-4 bg-indigo-50 rounded-md">
                          <p className="text-sm text-indigo-700 mb-3">
                            🔒 This is premium content. Subscribe to access the
                            full post and more exclusive content.
                          </p>
                          {space.plans && space.plans.length > 0 && (
                            <button
                              onClick={() =>
                                document
                                  .getElementById('pricing-section')
                                  ?.scrollIntoView({ behavior: 'smooth' })
                              }
                              className="text-sm text-indigo-700 hover:text-indigo-800 font-medium underline"
                            >
                              View subscription plans →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qa' && token && (
            <div className="bg-white rounded-lg shadow-sm border">
              <QAWidget
                spaceId={space.id}
                spaceSlug={space.slug}
                spaceName={space.name}
                currentUserId={currentUser?.id}
                isSpaceOwner={currentUser?.id === space.ownerId}
                token={token}
              />
            </div>
          )}

          {/* Q&A Tab - Not Authenticated */}
          {activeTab === 'qa' && !token && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <div className="text-gray-400 text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-4">
                Please sign in to participate in Q&A discussions.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Demo Mode Switch for development/demo environments */}
      <DemoModeSwitch onPremiumModeChange={setDemoPremiumMode} />
    </div>
  );
};

export default SpacePage;
