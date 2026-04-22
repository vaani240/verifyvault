import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import IssuerDashboard from './pages/IssuerDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import UploadDocument from './pages/UploadDocument';
import VerifyPage from './pages/VerifyPage';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

import Navbar from './components/Navbar';

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'issuer') {
    return <Navigate to="/issuer" replace />;
  }

  if (user.role === 'recipient') {
    return <Navigate to="/recipient" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:verifyCode" element={<VerifyPage />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route element={<ProtectedRoute allowedRoles={['issuer']} />}>
          <Route path="/issuer" element={<IssuerDashboard />} />
          <Route path="/upload" element={<UploadDocument />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['recipient']} />}>
          <Route path="/recipient" element={<RecipientDashboard />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
