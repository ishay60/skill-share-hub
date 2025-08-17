import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface Plan {
  id: string;
  name: string;
  interval: 'month' | 'year';
  price_cents: number;
}

interface PricingProps {
  spaceId: string;
  spaceName: string;
  plans: Plan[];
  onSubscriptionChange?: () => void;
}

const Pricing: React.FC<PricingProps> = ({ spaceId, spaceName, plans, onSubscriptionChange }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasActiveSubscription: boolean;
    subscription?: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubscriptionStatus();
  }, [spaceId]);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await apiClient.getSubscriptionStatus(spaceId);
      if (response.error) {
        setError(response.error);
        return;
      }
      setSubscriptionStatus(response.data || null);
    } catch (err) {
      setError('Failed to load subscription status');
    }
  };

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.createCheckoutSession(spaceId, planId);
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError('Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionStatus?.subscription?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.cancelSubscription(subscriptionStatus.subscription.id);
      if (response.error) {
        setError(response.error);
        return;
      }

      // Reload subscription status
      await loadSubscriptionStatus();
      onSubscriptionChange?.();
    } catch (err) {
      setError('Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatInterval = (interval: string) => {
    return interval === 'month' ? 'month' : 'year';
  };

  if (subscriptionStatus?.hasActiveSubscription) {
    const subscription = subscriptionStatus.subscription;
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 border-green-200">
        <div className="text-center">
          <div className="text-green-600 text-2xl mb-2">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            You're subscribed to {spaceName}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Current plan: {subscription.plan.name} ({formatPrice(subscription.plan.price_cents)}/{formatInterval(subscription.plan.interval)})
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
          <button
            onClick={handleCancelSubscription}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
          >
            {isLoading ? 'Canceling...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Subscribe to {spaceName}
        </h3>
        <p className="text-sm text-gray-600">
          Get access to all premium content and exclusive updates
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
          >
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">{plan.name}</h4>
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {formatPrice(plan.price_cents)}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                per {formatInterval(plan.interval)}
              </div>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
