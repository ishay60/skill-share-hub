import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';

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
}

const SpacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  useEffect(() => {
    if (slug) {
      loadSpace();
    }
  }, [slug]);

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
          posts: response.data.posts,
        });
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Free
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Published{' '}
                      {new Date(post.published_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {premiumPosts.map(post => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm border p-6 border-indigo-200"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        Premium
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Published{' '}
                      {new Date(post.published_at).toLocaleDateString()}
                    </p>
                    <div className="mt-4 p-4 bg-indigo-50 rounded-md">
                      <p className="text-sm text-indigo-700">
                        🔒 This is premium content. Subscribe to access this
                        post and more exclusive content.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacePage;
