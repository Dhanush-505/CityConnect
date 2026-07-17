import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './dashboard/pages/DashboardPage.jsx';
import MyComplaintsPage from './dashboard/pages/MyComplaintsPage.jsx';
import ProfilePage from './dashboard/pages/ProfilePage.jsx';
import ComplaintTrackerPage from './dashboard/pages/ComplaintTrackerPage.jsx';
import NotificationsPage from './dashboard/pages/NotificationsPage.jsx';
import FeedbackPage from './dashboard/pages/FeedbackPage.jsx';
import SettingsPage from './dashboard/pages/SettingsPage.jsx';
import AdminDashboardPage from './admin/pages/AdminDashboardPage.jsx';
import AdminLoginPage from './admin/pages/AdminLoginPage.jsx';
import RaiseComplaintPage from './pages/RaiseComplaint.jsx';
import FieldWorkerDashboardPage from './fieldworker/pages/FieldWorkerDashboardPage.jsx';
import FieldWorkerTasksPage from './fieldworker/pages/FieldWorkerTasksPage.jsx';
import FieldWorkerTrackerPage from './fieldworker/pages/FieldWorkerTrackerPage.jsx';
import FieldWorkerNotificationsPage from './fieldworker/pages/FieldWorkerNotificationsPage.jsx';
import FieldWorkerProfilePage from './fieldworker/pages/FieldWorkerProfilePage.jsx';
import FieldWorkerSettingsPage from './fieldworker/pages/FieldWorkerSettingsPage.jsx';
import './styles/global.css';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/citizen/') || location.pathname.startsWith('/field-worker') || location.pathname.startsWith('/admin');

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('cityconnect-user') || 'null');
    } catch {
      return null;
    }
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = getStoredUser();
    const token = localStorage.getItem('authToken');

    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <SocketProvider>
      <div className="app-container">
        {!isDashboard && <Navbar />}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Forgot password page coming soon.</div>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['citizen']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/citizen/raise-complaint" element={<ProtectedRoute allowedRoles={['citizen']}><RaiseComplaintPage /></ProtectedRoute>} />
            <Route path="/citizen/my-complaints" element={<ProtectedRoute allowedRoles={['citizen']}><MyComplaintsPage /></ProtectedRoute>} />
            <Route path="/citizen/profile" element={<ProtectedRoute allowedRoles={['citizen']}><ProfilePage /></ProtectedRoute>} />
            <Route path="/citizen/tracker" element={<ProtectedRoute allowedRoles={['citizen']}><ComplaintTrackerPage /></ProtectedRoute>} />
            <Route path="/citizen/notifications" element={<ProtectedRoute allowedRoles={['citizen']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/citizen/feedback" element={<ProtectedRoute allowedRoles={['citizen']}><FeedbackPage /></ProtectedRoute>} />
            <Route path="/citizen/settings" element={<ProtectedRoute allowedRoles={['citizen']}><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/field-worker" element={<ProtectedRoute allowedRoles={['field_worker']}><FieldWorkerDashboardPage /></ProtectedRoute>} />
            <Route path="/field-worker/tasks" element={<ProtectedRoute allowedRoles={['field_worker']}><FieldWorkerTasksPage /></ProtectedRoute>} />
            <Route path="/field-worker/tracker" element={<ProtectedRoute allowedRoles={['field_worker']}><FieldWorkerTrackerPage /></ProtectedRoute>} />
            <Route path="/field-worker/notifications" element={<ProtectedRoute allowedRoles={['field_worker']}><FieldWorkerNotificationsPage /></ProtectedRoute>} />
            <Route path="/field-worker/profile" element={<ProtectedRoute allowedRoles={['field_worker']}><FieldWorkerProfilePage /></ProtectedRoute>} />
            <Route path="/field-worker/settings" element={<ProtectedRoute allowedRoles={['field_worker']}><FieldWorkerSettingsPage /></ProtectedRoute>} />
          </Routes>
        </main>
        {!isDashboard && <Footer />}
      </div>
    </SocketProvider>
  );
}

export default App;
