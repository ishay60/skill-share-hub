import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';

interface Space {
  id: string;
  name: string;
  slug: string;
  description?: string;
  posts: Array<{
    id: string;
    title: string;
    is_premium: boolean;
    published_at: string;
  }>;
  _count: {
    posts: number;
    memberships: number;
  };
}

const Dashboard: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSpace, setNewSpace] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadSpaces();
  }, []);

    const loadSpaces = async () => {
      try {
        const response = await apiClient.getUserSpaces();

        if (response.error) {
          setError(response.error);
          return;
        }

        setSpaces((response.data as any)?.spaces || []);
      } catch (err) {
        setError('Failed to load spaces');
      } finally {
        setIsLoading(false);
      }
    };

    const handleCreateSpace = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSpace.name.trim()) return;

      try {
        const response = await apiClient.createSpace(newSpace);
        if (response.error) {
          setError(response.error);
          return;
        }

        setNewSpace({ name: '', description: '' });
        setShowCreateForm(false);
        loadSpaces();
      } catch (err) {
        setError('Failed to create space');
      }
    };

    const handleLogout = async () => {
      try {
        await apiClient.logout();
        localStorage.removeItem('token');
        navigate('/');
      } catch (err) {
        console.error('Logout failed:', err);
      }
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

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Manage your knowledge spaces</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Logout
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Spaces
                </h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                >
                  {showCreateForm ? 'Cancel' : 'Create Space'}
                </button>
              </div>

              {showCreateForm && (
                <form
                  onSubmit={handleCreateSpace}
                  className="bg-white p-6 rounded-lg shadow-sm border mb-6"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Space Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={newSpace.name}
                        onChange={e =>
                          setNewSpace({ ...newSpace, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter space name"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Description
                      </label>
                      <input
                        type="text"
                        id="description"
                        value={newSpace.description}
                        onChange={e =>
                          setNewSpace({
                            ...newSpace,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter description"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                    >
                      Create Space
                    </button>
                  </div>
                </form>
              )}

              {spaces.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <p className="text-gray-500 mb-4">
                    You haven't created any spaces yet.
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                  >
                    Create Your First Space
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spaces.map(space => (
                    <div
                      key={space.id}
                      className="bg-white rounded-lg shadow-sm border p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {space.name}
                      </h3>
                      {space.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {space.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 mb-4">
                        <p>{space._count.posts} posts</p>
                        <p>{space._count.memberships} members</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/spaces/${space.slug}`)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
                        >
                          View Space
                        </button>
                        <button
                          onClick={() => navigate(`/posts/${space.id}`)}
                          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                          title="Manage Posts"
                        >
                          📝
                        </button>
                        <button
                          onClick={() => navigate(`/analytics/${space.id}`)}
                          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                          title="View Analytics"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => navigate(`/branding/${space.id}`)}
                          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                          title="Customize Branding"
                        >
                          🎨
                        </button>
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

export default Dashboard;
