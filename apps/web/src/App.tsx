import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SpacePage from './pages/SpacePage';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="spaces/:slug" element={<SpacePage />} />
      </Route>
    </Routes>
  );
}

export default App;
