import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Finances from './pages/Finances';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Topbar */}
        <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 shrink-0">
          <h1 className="font-bold text-blue-600">TransitOps</h1>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vehicles" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Vehicles />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/drivers" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Drivers />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trips" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Trips />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/maintenance" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Maintenance />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/finances" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Finances />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
