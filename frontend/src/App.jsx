import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardPage from './pages/DashboardPage';
import PipelinePage from './pages/PipelinePage';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import InterviewsPage from './pages/InterviewsPage';
import TeamPage from './pages/TeamPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
        Authenticating HireFlow Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Interviewers land directly on /interviews
  if (user?.role === 'interviewer' && location.pathname === '/') {
    return <Navigate to="/interviews" replace />;
  }

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Recruitment Operations Dashboard', subtitle: 'Real-time candidate funnel & performance metrics' };
      case '/pipeline':
        return { title: 'Applicant Screening Pipeline', subtitle: '9-stage Kanban & state machine workflow' };
      case '/jobs':
        return { title: 'Job Requisitions & Headcount', subtitle: 'Screening criteria, salary bands & hiring managers' };
      case '/candidates':
        return { title: 'Candidate Talent Pool & Dossiers', subtitle: 'Audited applicant profiles & match scoring' };
      case '/interviews':
        return { title: 'Interview Rounds & Scorecards', subtitle: 'Technical panel scheduling & competency evaluation' };
      case '/team':
        return { title: 'Team & Security Administration', subtitle: 'User accounts, role authorization & session control' };
      default:
        return { title: 'HireFlow ATS', subtitle: 'Applicant Screening & Interview Management' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="app-container">
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, isAuthenticated, loading } = useAuth();

  const getHomeRedirect = () => {
    if (user?.role === 'interviewer') return '/interviews';
    return '/';
  };

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/login"
          element={!loading && isAuthenticated ? <Navigate to={getHomeRedirect()} replace /> : <LoginPage />}
        />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </ToastProvider>
  );
}
