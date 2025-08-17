import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Coming soon in Phase 1 - User authentication and space management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">My Spaces</h3>
              <p className="text-gray-600 mb-4">
                Create and manage your knowledge spaces
              </p>
              <div className="text-sm text-gray-500">
                <p>✅ Space creation</p>
                <p>✅ Content management</p>
                <p>✅ Member management</p>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Analytics</h3>
              <p className="text-gray-600 mb-4">
                Track your growth and engagement
              </p>
              <div className="text-sm text-gray-500">
                <p>✅ Subscriber metrics</p>
                <p>✅ Revenue tracking</p>
                <p>✅ Content performance</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 card">
            <h3 className="text-lg font-semibold mb-4">Phase 0 Status</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600">✅ Infrastructure</p>
                <p className="text-gray-500">Monorepo, Docker, CI/CD</p>
              </div>
              <div>
                <p className="font-medium text-yellow-600">🔄 Frontend</p>
                <p className="text-gray-500">Basic pages, routing</p>
              </div>
              <div>
                <p className="font-medium text-blue-600">🔄 Backend</p>
                <p className="text-gray-500">Health checks, basic setup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
