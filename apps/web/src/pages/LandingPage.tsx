import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            SkillShareHub
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A SaaS knowledge spaces platform where creators can monetize knowledge 
            through premium content and real-time Q&A sessions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/auth"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/dashboard"
              className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              View Demo
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Content</h3>
              <p className="text-gray-600">
                Create and monetize your knowledge with premium posts and courses.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Q&A</h3>
              <p className="text-gray-600">
                Engage with your audience through live question and answer sessions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">
                Track your growth with detailed analytics and insights.
              </p>
            </div>
          </div>

          <div className="mt-16 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">🚀 Phase 0 Complete!</h2>
            <p className="text-gray-600 mb-4">
              This landing page is now live and ready for the next phase of development.
            </p>
            <div className="text-sm text-gray-500">
              <p>✅ Monorepo with pnpm workspaces</p>
              <p>✅ Docker Compose setup</p>
              <p>✅ CI/CD pipeline</p>
              <p>✅ Basic landing page</p>
              <p>✅ Health check endpoints</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
