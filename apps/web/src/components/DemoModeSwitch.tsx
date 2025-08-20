import React, { useState, useEffect } from 'react';

interface DemoModeSwitchProps {
  onPremiumModeChange: (isPremium: boolean) => void;
}

const DemoModeSwitch: React.FC<DemoModeSwitchProps> = ({
  onPremiumModeChange,
}) => {
  const [isPremiumMode, setIsPremiumMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when URL contains 'demo'
    const isDemoEnv =
      import.meta.env.DEV ||
      window.location.hostname.includes('demo') ||
      window.location.hostname.includes('localhost') ||
      window.location.search.includes('demo=true');

    setIsVisible(isDemoEnv);
  }, []);

  const togglePremiumMode = () => {
    const newMode = !isPremiumMode;
    setIsPremiumMode(newMode);
    onPremiumModeChange(newMode);

    // Store in localStorage for persistence
    localStorage.setItem('demo_premium_mode', newMode.toString());
  };

  useEffect(() => {
    // Load from localStorage on mount
    const savedMode = localStorage.getItem('demo_premium_mode') === 'true';
    setIsPremiumMode(savedMode);
    onPremiumModeChange(savedMode);
  }, [onPremiumModeChange]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium">🎮 Demo Mode</div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={isPremiumMode}
              onChange={togglePremiumMode}
            />
            <div
              className={`
              w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
              ${isPremiumMode ? 'bg-yellow-400' : 'bg-gray-300'}
            `}
            >
              <div
                className={`
                w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                ${isPremiumMode ? 'translate-x-5' : 'translate-x-0'}
                mt-0.5 ml-0.5
              `}
              />
            </div>
          </label>
          <div className="text-sm">
            {isPremiumMode ? (
              <span className="flex items-center">
                <span className="text-yellow-300">💎</span>
                <span className="ml-1">Premium View</span>
              </span>
            ) : (
              <span className="flex items-center">
                <span className="text-gray-300">👤</span>
                <span className="ml-1">Free View</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 text-xs opacity-80">
          Toggle to see premium content without subscription
        </div>

        {isPremiumMode && (
          <div className="mt-2 text-xs bg-yellow-500 bg-opacity-20 rounded px-2 py-1">
            🔓 All premium content unlocked for demo
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoModeSwitch;
