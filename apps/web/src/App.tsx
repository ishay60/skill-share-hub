import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SpacePage from './pages/SpacePage';
import AuthPage from './pages/AuthPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BrandingPage from './pages/BrandingPage';
import PostManagementPage from './pages/PostManagementPage';
import Layout from './components/Layout';
import ErrorBoundary, { RouteErrorBoundary } from './components/ErrorBoundary';

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <RouteErrorBoundary>
                <LandingPage />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="auth"
            element={
              <RouteErrorBoundary>
                <AuthPage />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="dashboard"
            element={
              <RouteErrorBoundary>
                <Dashboard />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="analytics/:spaceId"
            element={
              <RouteErrorBoundary>
                <AnalyticsPage />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="branding/:spaceId"
            element={
              <RouteErrorBoundary>
                <BrandingPage />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="posts/:spaceId"
            element={
              <RouteErrorBoundary>
                <PostManagementPage />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="spaces/:slug"
            element={
              <RouteErrorBoundary>
                <SpacePage />
              </RouteErrorBoundary>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
