import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './lib/auth';
import { DashboardLayout } from './components/layout/dashboard-layout';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import StudentsPage from './pages/students';
import MappingsPage from './pages/mappings';
import TokensPage from './pages/tokens';
import BroadcastsPage from './pages/broadcasts';
import TeachersPage from './pages/teachers';
import ParentsPage from './pages/parents';
import UserManagementPage from './pages/user-management';
import AuditLogPage from './pages/audit-log';
import SystemStatusPage from './pages/system-status';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/mappings" element={<MappingsPage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/broadcasts" element={<BroadcastsPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/parents" element={<ParentsPage />} />

        {/* Superadmin-only routes */}
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/system-status" element={<SystemStatusPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
