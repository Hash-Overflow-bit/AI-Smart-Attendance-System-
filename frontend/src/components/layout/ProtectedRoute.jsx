import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  // Temporarily bypass authentication since the Auth pages are being built by another developer
  useEffect(() => {
    // Inject a mock user so the Dashboard Sidebar and Header don't crash looking for user data
    const existingUser = localStorage.getItem('smart_attendance_user');
    if (!existingUser) {
      localStorage.setItem('smart_attendance_user', JSON.stringify({
        id: 1,
        name: 'Demo Admin',
        email: 'admin@school.edu',
        role: 'admin'
      }));
      localStorage.setItem('smart_attendance_token', 'temporary_mock_token');
    }
  }, []);

  // Unconditionally allow access
  return <Outlet />;
}
