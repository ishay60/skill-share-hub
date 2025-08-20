import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';

interface SpaceBranding {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  custom_domain?: string;
  logo_url?: string;
  brand_color?: string;
  accent_color?: string;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
}

interface BrandingUrls {
  subdomain?: string;
  custom?: string;
  default: string;
}

const BrandingPage: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  const [branding, setBranding] = useState<SpaceBranding | null>(null);
  const [urls, setUrls] = useState<BrandingUrls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    subdomain: '',
    custom_domain: '',
    brand_color: '#4F46E5',
    accent_color: '#10B981',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    if (spaceId) {
      loadBranding();
    }
  }, [spaceId]);

  const loadBranding = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getSpaceBranding(spaceId!);

      if (response.error) {
        setError(response.error);
        return;
      }

      setBranding(response.data.branding);
      setUrls(response.data.urls);

      // Update form data
      const brandingData = response.data.branding;
      setFormData({
        subdomain: brandingData.subdomain || '',
        custom_domain: brandingData.custom_domain || '',
        brand_color: brandingData.brand_color || '#4F46E5',
        accent_color: brandingData.accent_color || '#10B981',
        meta_title: brandingData.meta_title || '',
        meta_description: brandingData.meta_description || '',
      });
    } catch (err) {
      setError('Failed to load branding settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await apiClient.updateSpaceBranding(spaceId!, formData);

      if (response.error) {
        setError(response.error);
        return;
      }

      setSuccessMessage('Branding updated successfully!');
      loadBranding(); // Reload to get updated URLs
    } catch (err) {
      setError('Failed to update branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('URL copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading branding settings...</p>
        </div>
      </div>
    );
  }

  if (error && !branding) {
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
                Branding - {branding?.name}
              </h1>
              <p className="text-gray-600">
                Customize your space's appearance and domain settings
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{successMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Domain Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Domain Settings
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="subdomain"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subdomain
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          id="subdomain"
                          value={formData.subdomain}
                          onChange={e =>
                            handleInputChange('subdomain', e.target.value)
                          }
                          placeholder="myspace"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                          .skillsharehub.com
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Create a custom subdomain for your space
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="custom_domain"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Custom Domain
                      </label>
                      <input
                        type="text"
                        id="custom_domain"
                        value={formData.custom_domain}
                        onChange={e =>
                          handleInputChange('custom_domain', e.target.value)
                        }
                        placeholder="myawesome.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Use your own domain (requires DNS configuration)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Brand Colors
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="brand_color"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="brand_color"
                          value={formData.brand_color}
                          onChange={e =>
                            handleInputChange('brand_color', e.target.value)
                          }
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.brand_color}
                          onChange={e =>
                            handleInputChange('brand_color', e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="accent_color"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Accent Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="accent_color"
                          value={formData.accent_color}
                          onChange={e =>
                            handleInputChange('accent_color', e.target.value)
                          }
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.accent_color}
                          onChange={e =>
                            handleInputChange('accent_color', e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    SEO & Meta Tags
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="meta_title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Meta Title
                      </label>
                      <input
                        type="text"
                        id="meta_title"
                        value={formData.meta_title}
                        onChange={e =>
                          handleInputChange('meta_title', e.target.value)
                        }
                        placeholder="My Awesome Knowledge Space"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="meta_description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Meta Description
                      </label>
                      <textarea
                        id="meta_description"
                        value={formData.meta_description}
                        onChange={e =>
                          handleInputChange('meta_description', e.target.value)
                        }
                        placeholder="A description of your knowledge space for search engines and social media"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Branding'}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview & URLs */}
            <div className="space-y-6">
              {/* Color Preview */}
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Color Preview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Primary</span>
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formData.brand_color }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Accent</span>
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formData.accent_color }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* URLs */}
              {urls && (
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Your URLs
                  </h3>
                  <div className="space-y-3">
                    {urls.subdomain && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subdomain URL
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={urls.subdomain}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(urls.subdomain!)}
                            className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm hover:bg-gray-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {urls.custom && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Domain
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={urls.custom}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(urls.custom!)}
                            className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm hover:bg-gray-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default URL
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={urls.default}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(urls.default)}
                          className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm hover:bg-gray-200"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPage;
