import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/landing/LandingPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages (Under construction by another developer)
// import LoginPage from './pages/auth/LoginPage';
// import SignupPage from './pages/auth/SignupPage';
// import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import CourseDashboard from './pages/dashboard/CourseDashboard';
import FaceEnrollment from './pages/dashboard/FaceEnrollment';
import LiveClassroom from './pages/dashboard/LiveClassroom';
import AttentionAnalysis from './pages/dashboard/AttentionAnalysis';
import ReportsLogs from './pages/dashboard/ReportsLogs';
import SystemSettings from './pages/dashboard/SystemSettings';
import StudentManagement from './pages/dashboard/StudentManagement';
import ProfilePage from './pages/dashboard/ProfilePage';

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium' }} />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes disabled temporarily while being built by another developer */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          {/* <Route path="/signup" element={<SignupPage />} /> */}
          {/* <Route path="/forgot-password" element={<ResetPasswordPage />} /> */}

          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="enrollment" element={<FaceEnrollment />} />
              <Route path="courses" element={<CourseDashboard />} />
              <Route path="live" element={<LiveClassroom />} />
              <Route path="attention" element={<AttentionAnalysis />} />
              <Route path="reports" element={<ReportsLogs />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}
