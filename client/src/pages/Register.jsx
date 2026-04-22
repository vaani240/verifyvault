import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

import { useAuth } from '../context/AuthContext';

const AppLogo = () => <span className="vv-auth-brand">VerifyVault</span>;

const roleMeta = {
  issuer: {
    title: 'Issuer Account',
    copy: 'Create and issue tamper-resistant documents.',
    badgeClass: 'vv-role-badge-issuer',
  },
  recipient: {
    title: 'Recipient Account',
    copy: 'Access documents issued to your account.',
    badgeClass: 'vv-role-badge-recipient',
  },
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'issuer',
    organisation: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const data = await register(formData);
      if (data?.user?.role === 'issuer') {
        navigate('/issuer');
      } else {
        navigate('/recipient');
      }
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vv-page">
      <Navbar />
      <main className="vv-auth-page">
        <section className="vv-auth-card vv-auth-card-wide">
          <Link to="/" className="vv-auth-brand" aria-label="VerifyVault home">
            <AppLogo />
          </Link>

          <h1 className="vv-auth-title">Create your account</h1>
          <p className="vv-auth-copy">Set up a secure workspace for issuing or receiving verified documents.</p>

          <div className="vv-auth-role-tabs" role="tablist" aria-label="Account role selector">
            <button
              type="button"
              className={`vv-role-tab ${formData.role === 'issuer' ? 'vv-role-tab-active' : ''}`}
              onClick={() => setFormData((prev) => ({ ...prev, role: 'issuer' }))}
            >
              <div className="vv-role-tab-label">Issuer</div>
              <div className="vv-role-tab-copy">{roleMeta.issuer.copy}</div>
            </button>

            <button
              type="button"
              className={`vv-role-tab ${formData.role === 'recipient' ? 'vv-role-tab-active' : ''}`}
              onClick={() => setFormData((prev) => ({ ...prev, role: 'recipient' }))}
            >
              <div className="vv-role-tab-label">Recipient</div>
              <div className="vv-role-tab-copy">{roleMeta.recipient.copy}</div>
            </button>
          </div>

          <div className={`vv-role-badge ${roleMeta[formData.role].badgeClass} vv-mb-16`}>
            {roleMeta[formData.role].title}
          </div>

          <form onSubmit={handleSubmit} className="vv-form">
            <div className="vv-field">
              <label className="vv-label" htmlFor="register-name">
                Name
              </label>
              <input id="register-name" className="vv-input" name="name" type="text" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="vv-field">
              <label className="vv-label" htmlFor="register-email">
                Email
              </label>
              <input id="register-email" className="vv-input" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="vv-field">
              <label className="vv-label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                className="vv-input"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <input type="hidden" name="role" value={formData.role} readOnly />

            <div className="vv-field">
              <label className="vv-label" htmlFor="register-organisation">
                Organisation
              </label>
              <input id="register-organisation" className="vv-input" name="organisation" type="text" value={formData.organisation} onChange={handleChange} />
            </div>

            <button type="submit" disabled={submitting} className="vv-btn vv-btn-primary vv-btn-block">
              {submitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          {error ? <div className="vv-error vv-mt-16">{error}</div> : null}

          <p className="vv-auth-switch">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
