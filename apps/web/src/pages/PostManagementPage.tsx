import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';

interface Post {
  id: string;
  title: string;
  content_md: string;
  is_premium: boolean;
  published_at: string | null;
  created_at: string;
}

interface Space {
  id: string;
  name: string;
  slug: string;
  posts: Post[];
}

const PostManagementPage: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [postForm, setPostForm] = useState({
    title: '',
    content_md: '',
    is_premium: false,
  });

  useEffect(() => {
    if (spaceId) {
      loadSpace();
    }
  }, [spaceId]);

  const loadSpace = async () => {
    try {
      setIsLoading(true);

      // Get space details first
      const spacesResponse = await apiClient.getUserSpaces();
      if (spacesResponse.error) {
        setError(spacesResponse.error);
        return;
      }

      const userSpace = spacesResponse.data?.spaces?.find(
        (s: any) => s.id === spaceId
      );
      if (!userSpace) {
        setError('Space not found or access denied');
        return;
      }

      // Get posts for this space
      const postsResponse = await apiClient.getSpacePosts(userSpace.slug);
      if (postsResponse.error) {
        setError(postsResponse.error);
        return;
      }

      setSpace({
        ...userSpace,
        posts: postsResponse.data?.posts || [],
      });
    } catch (err) {
      setError('Failed to load space data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postForm.title.trim() || !postForm.content_md.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setIsCreating(true);
      setError('');

      const response = await apiClient.createPost(spaceId!, postForm);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Reset form and reload
      setPostForm({ title: '', content_md: '', is_premium: false });
      setShowCreateForm(false);
      loadSpace();
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error && !space) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Posts - {space?.name}
              </h1>
              <p className="text-gray-600">
                Manage your content and engage your audience
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/spaces/${space?.slug}`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                View Space
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Create Post Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Content Management
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                {showCreateForm ? 'Cancel' : '+ Create Post'}
              </button>
            </div>

            {showCreateForm && (
              <form
                onSubmit={handleCreatePost}
                className="bg-white p-6 rounded-lg shadow-sm border mb-6"
              >
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Post Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={postForm.title}
                      onChange={e =>
                        setPostForm({ ...postForm, title: e.target.value })
                      }
                      placeholder="Enter an engaging title for your post"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Content (Markdown) *
                    </label>
                    <textarea
                      id="content"
                      value={postForm.content_md}
                      onChange={e =>
                        setPostForm({ ...postForm, content_md: e.target.value })
                      }
                      placeholder="Write your post content in Markdown format..."
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Use Markdown syntax: **bold**, *italic*, # headers, -
                      lists, etc.
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_premium"
                      checked={postForm.is_premium}
                      onChange={e =>
                        setPostForm({
                          ...postForm,
                          is_premium: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_premium"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Premium Content (requires subscription to view)
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? 'Publishing...' : 'Publish Post'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Published Posts ({space?.posts?.length || 0})
              </h3>
            </div>

            {!space?.posts || space.posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first post to start sharing knowledge with your
                  audience
                </p>
                {!showCreateForm && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {space.posts.map(post => (
                  <div key={post.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {post.title}
                          </h4>
                          {post.is_premium && (
                            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                              Premium
                            </span>
                          )}
                          {!post.is_premium && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Free
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {post.published_at
                            ? `Published ${formatDate(post.published_at)}`
                            : 'Draft'}
                        </p>
                        <div className="text-sm text-gray-700">
                          {post.content_md.length > 150
                            ? `${post.content_md.substring(0, 150)}...`
                            : post.content_md}
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => navigate(`/spaces/${space.slug}`)}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          View →
                        </button>
                      </div>
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

export default PostManagementPage;
