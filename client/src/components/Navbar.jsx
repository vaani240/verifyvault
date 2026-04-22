import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8h9M8 3.5 12.5 8 8 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="vv-navbar">
      <div className="vv-navbar-inner">
        <Link to="/" className="vv-navbar-brand">
          VerifyVault
        </Link>

        <div className="vv-navbar-links">

  {!user && (
    <>
      <Link to="/login" className="vv-navbar-link">Login</Link>
      <Link to="/register" className="vv-btn vv-btn-outline">
        Get Started <ArrowIcon />
      </Link>
    </>
  )}

  {user && user.role === 'issuer' && (
    <>
      <Link to="/issuer" className="vv-navbar-link">Issuer Dashboard</Link>
      <Link to="/upload" className="vv-navbar-link">Upload New Document</Link>
      <button onClick={handleLogout} className="vv-btn vv-btn-outline">
        Logout
      </button>
    </>
  )}

  {user && user.role === 'recipient' && (
    <>
      <Link to="/recipient" className="vv-navbar-link">Recipient Dashboard</Link>
      <button onClick={handleLogout} className="vv-btn vv-btn-outline">
        Logout
      </button>
    </>
  )}

</div>
      </div>
    </nav>
  );
};

export default Navbar;
