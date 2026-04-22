import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import CreateEvent from './pages/admin/CreateEvent';
import ManageEvents from './pages/admin/ManageEvents';
import EventDetails from './pages/admin/EventDetails';
import Analytics from './pages/admin/Analytics';
import ParticipantDashboard from './pages/participant/Dashboard';
import BrowseEvents from './pages/participant/BrowseEvents';
import MyEvents from './pages/participant/MyEvents';

// Layout wrapper for authenticated pages
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// Auto-redirect based on role
const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/participant'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#1c1917',
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            },
            success: {
              iconTheme: { primary: '#059669', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Home Redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/create-event" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><CreateEvent /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><ManageEvents /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><EventDetails /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><Analytics /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Participant Routes */}
          <Route path="/participant" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <DashboardLayout><ParticipantDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/participant/browse" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <DashboardLayout><BrowseEvents /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/participant/my-events" element={
            <ProtectedRoute allowedRoles={['participant']}>
              <DashboardLayout><MyEvents /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
