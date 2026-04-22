import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

import { useAuth } from '../context/AuthContext';

const AppLogo = () => <span className="vv-auth-brand">VerifyVault</span>;

const roleCopy = {
  issuer: {
    title: 'Sign in as an Issuer',
    copy: 'Access document issuance tools, upload flows, and verification controls.',
    badge: 'Issuer Access',
    badgeClass: 'vv-role-badge-issuer',
  },
  recipient: {
    title: 'Sign in as a Recipient',
    copy: 'Open the documents issued to you and review their verification status.',
    badge: 'Recipient Access',
    badgeClass: 'vv-role-badge-recipient',
  },
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('issuer');

  useEffect(() => {
    const role = new URLSearchParams(location.search).get('role');
    setSelectedRole(role === 'recipient' ? 'recipient' : 'issuer');
  }, [location.search]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await login(formData);
      if (data?.user?.role === 'issuer') {
        navigate('/issuer');
      } else {
        navigate('/recipient');
      }
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vv-page">
      <Navbar />
      <main className="vv-auth-page">
        <section className="vv-auth-card">
          <Link to="/" className="vv-auth-brand" aria-label="VerifyVault home">
            <AppLogo />
          </Link>

          <div className="vv-auth-subtabs" role="tablist" aria-label="Login role selector">
            <button
              type="button"
              className={`vv-subtab ${selectedRole === 'issuer' ? 'vv-subtab-active' : ''}`}
              onClick={() => setSelectedRole('issuer')}
            >
              Issuer Login
            </button>
            <button
              type="button"
              className={`vv-subtab ${selectedRole === 'recipient' ? 'vv-subtab-active' : ''}`}
              onClick={() => setSelectedRole('recipient')}
            >
              Recipient Login
            </button>
          </div>

          <h1 className="vv-auth-title">{roleCopy[selectedRole].title}</h1>
          <p className="vv-auth-copy">{roleCopy[selectedRole].copy}</p>

          <div className={`vv-role-badge ${roleCopy[selectedRole].badgeClass}`}>
            {roleCopy[selectedRole].badge}
          </div>

          <div className="vv-auth-panel">
            <div className="vv-auth-panel-head">
              <div className="vv-auth-panel-title">Use the same email and password you registered with</div>
            </div>
            <p className="vv-auth-panel-copy">
              Your account role is resolved automatically after sign in, so this screen simply makes the issuer and recipient entry points clearer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="vv-form">
            <div className="vv-field">
              <label className="vv-label" htmlFor="login-email">
                Email
              </label>
              <input id="login-email" className="vv-input" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="vv-field">
              <label className="vv-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className="vv-input"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="vv-btn vv-btn-primary vv-btn-block">
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {error ? <div className="vv-error vv-mt-16">{error}</div> : null}

          <p className="vv-auth-switch">
            No account? <Link to="/register">Create one</Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
