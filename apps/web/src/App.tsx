import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SpacePage from './pages/SpacePage';
import AuthPage from './pages/AuthPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BrandingPage from './pages/BrandingPage';
import PostManagementPage from './pages/PostManagementPage';
import Layout from './components/Layout';

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics/:spaceId" element={<AnalyticsPage />} />
        <Route path="branding/:spaceId" element={<BrandingPage />} />
        <Route path="posts/:spaceId" element={<PostManagementPage />} />
        <Route path="spaces/:slug" element={<SpacePage />} />
      </Route>
    </Routes>
  );
}

export default App;
