
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import AnalyzeRulesPage from './pages/AnalyzeRulesPage';
import PrepareChecklistPage from './pages/PrepareChecklistPage';
import RiskDetectionPage from './pages/RiskDetectionPage';
import ReviewSafetyPlanPage from './pages/ReviewSafetyPlanPage';
import CreateReportPage from './pages/CreateReportPage';
import DraftEmailPage from './pages/DraftEmailPage';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analyze-rules" element={<AnalyzeRulesPage />} />
        <Route path="/prepare-checklist" element={<PrepareChecklistPage />} />
        <Route path="/risk-detection" element={<RiskDetectionPage />} />
        <Route path="/review-plan" element={<ReviewSafetyPlanPage />} />
        <Route path="/create-report" element={<CreateReportPage />} />
        <Route path="/draft-email" element={<DraftEmailPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
