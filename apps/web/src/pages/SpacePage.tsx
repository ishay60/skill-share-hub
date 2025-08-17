import React from 'react';
import { useParams } from 'react-router-dom';

const SpacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Space'}
            </h1>
            <p className="text-gray-600">
              Coming soon in Phase 1 - Space content and premium posts
            </p>
          </div>
          
          <div className="card mb-6">
            <h2 className="text-2xl font-semibold mb-4">About This Space</h2>
            <p className="text-gray-600">
              This space will showcase premium content, posts, and real-time Q&A sessions.
              Content management and subscription features will be implemented in Phase 1.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Public Posts</h3>
              <p className="text-gray-600 mb-4">
                Free content available to all visitors
              </p>
              <div className="text-sm text-gray-500">
                <p>✅ Free articles</p>
                <p>✅ Public resources</p>
                <p>✅ Community content</p>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Premium Content</h3>
              <p className="text-gray-600 mb-4">
                Exclusive content for subscribers
              </p>
              <div className="text-sm text-gray-500">
                <p>🔒 Premium posts</p>
                <p>🔒 Exclusive courses</p>
                <p>🔒 Advanced tutorials</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Q&A Sessions</h3>
            <p className="text-gray-600 mb-4">
              Real-time question and answer sessions with the creator
            </p>
            <div className="text-sm text-gray-500">
              <p>💬 Live Q&A (Phase 3)</p>
              <p>💬 Message persistence</p>
              <p>💬 Creator moderation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacePage;
