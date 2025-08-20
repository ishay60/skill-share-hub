import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';

interface MetricSnapshot {
  id: string;
  date: string;
  active_subs: number;
  mrr_cents: number;
  total_revenue_cents: number;
  churn_rate: number;
  new_subs: number;
  canceled_subs: number;
  post_views: number;
  qa_messages: number;
  unique_visitors: number;
  created_at: string;
}

interface RecentActivity {
  id: string;
  type: string;
  created_at: string;
  metadata?: any;
  user?: {
    email: string;
  };
}

interface AnalyticsData {
  space: {
    id: string;
    name: string;
    slug: string;
  };
  analytics: {
    snapshots: MetricSnapshot[];
    currentMetrics: {
      spaceId: string;
      date: string;
      active_subs: number;
      mrr_cents: number;
      total_revenue_cents: number;
      churn_rate: number;
      new_subs: number;
      canceled_subs: number;
      post_views: number;
      qa_messages: number;
      unique_visitors: number;
    };
    recentActivity: RecentActivity[];
    summary: {
      totalSubscribers: number;
      monthlyRevenue: number;
      totalRevenue: number;
      churnRate: number;
    };
  };
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    if (spaceId) {
      loadAnalytics();
    }
  }, [spaceId, selectedDays]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getSpaceAnalytics(spaceId!, selectedDays);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setAnalyticsData(response.data);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'view':
      case 'space_visit':
        return '👀';
      case 'post_view':
        return '📖';
      case 'qa_message':
        return '💬';
      case 'subscribe':
        return '💳';
      case 'login':
        return '🔑';
      case 'signup':
        return '👋';
      default:
        return '📊';
    }
  };

  const getEventDescription = (activity: RecentActivity) => {
    const userEmail = activity.user?.email || 'Anonymous';
    
    switch (activity.type) {
      case 'space_visit':
        return `${userEmail} visited the space`;
      case 'post_view':
        return `${userEmail} viewed a post`;
      case 'qa_message':
        return `${userEmail} sent a Q&A message`;
      case 'subscribe':
        return `${userEmail} subscribed`;
      case 'login':
        return `${userEmail} signed in`;
      case 'signup':
        return `${userEmail} signed up`;
      default:
        return `${userEmail} performed ${activity.type}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (!analyticsData) {
    return null;
  }

  const { space, analytics } = analyticsData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics - {space.name}
              </h1>
              <p className="text-gray-600">
                Performance insights for your knowledge space
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedDays}
                onChange={e => setSelectedDays(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="text-green-600 font-semibold">$</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(analytics.summary.monthlyRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Subscribers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics.summary.totalSubscribers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">💬</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Q&A Messages Today</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics.currentMetrics.qa_messages}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">👀</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unique Visitors Today</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics.currentMetrics.unique_visitors}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart Placeholder */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Over Time
              </h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">📈 Chart Coming Soon</p>
                  <p className="text-sm text-gray-400">
                    Total Revenue: {formatCurrency(analytics.summary.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {analytics.recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No recent activity to show
                  </p>
                ) : (
                  analytics.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-lg">{getEventIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {getEventDescription(activity)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.currentMetrics.post_views}
                </p>
                <p className="text-sm text-gray-500">Post Views Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.currentMetrics.new_subs}
                </p>
                <p className="text-sm text-gray-500">New Subscribers Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.currentMetrics.churn_rate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">Churn Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.snapshots.length}
                </p>
                <p className="text-sm text-gray-500">Days of Data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
