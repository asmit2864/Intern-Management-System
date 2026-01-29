import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CandidateDetail from './pages/CandidateDetail';
import PortalLayout from './layouts/PortalLayout';
import OnboardingHome from './pages/portal/OnboardingHome';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'sonner';

import TrackingDashboard from './pages/manager/TrackingDashboard';
import TrainingBoard from './features/intern/TrainingBoard';
import InternPerformanceDetail from './pages/manager/InternPerformanceDetail';
import PerformancePage from './features/intern/PerformancePage';
import NotificationsPage from './features/intern/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" expand={true} richColors closeButton />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Manager Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <TrackingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <InternPerformanceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <CandidateDetail />
              </ProtectedRoute>
            }
          />

          {/* Intern Portal Routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['intern']}>
              <NotificationProvider>
                <PortalLayout />
              </NotificationProvider>
            </ProtectedRoute>
          }>
            <Route path="/portal" element={<OnboardingHome />} />
            <Route path="/portal/training" element={<TrainingBoard />} />
            <Route path="/portal/performance" element={<PerformancePage />} />
            <Route path="/portal/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
