import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BadgeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 1.5 3 3.75v3.5c0 2.75 1.8 5.03 5 7.25 3.2-2.22 5-4.5 5-7.25v-3.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="m5.75 8.25 1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 16V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="m8 9 4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 3.75h6.5L18 8.25V20.25H7V3.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M13.5 3.75v4.5H18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9.5 12h5M9.5 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 7.5 10.25 17.25 4 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const Landing = () => {
  const navigate = useNavigate();
  const [verifyCode, setVerifyCode] = useState('');

  const handleVerify = () => {
    const normalizedCode = verifyCode.trim();

    if (!normalizedCode) {
      alert('Please enter a verify code.');
      return;
    }

    navigate(`/verify/${normalizedCode}`);
  };

  return (
    <div className="vv-page vv-landing">
      <Navbar />
      <main className="vv-main vv-hero">
        <section className="vv-hero-inner">
          <div className="vv-hero-badge">
            <BadgeIcon /> Trusted Document Verification
          </div>

          <div className="vv-hero-copy">
            <h1 className="vv-hero-title">Verify Any Document. Instantly.</h1>
            <p className="vv-hero-subtitle">
              VerifyVault lets institutions issue tamper-proof documents and anyone verify their authenticity in seconds — no login required.
            </p>
          </div>

          <section className="vv-search-card">
            <div className="vv-form">
              <div className="vv-field">
                <label className="vv-label" htmlFor="verify-code">
                  Verification Code
                </label>
                <input
                  id="verify-code"
                  className="vv-input"
                  type="text"
                  placeholder="Enter verify code e.g. A1B2C3D4"
                  value={verifyCode}
                  onChange={(event) => setVerifyCode(event.target.value)}
                />
              </div>

              <button type="button" className="vv-btn vv-btn-primary" onClick={handleVerify}>
                Verify Document
              </button>
            </div>

            <div className="vv-auth-shortcuts" style={{ marginTop: '10px' }}>
              <Link to="/login?role=issuer" className="vv-auth-chip vv-auth-chip-primary">
                Sign in as Issuer
              </Link>
              <Link to="/login?role=recipient" className="vv-auth-chip">
                Sign in as Recipient
              </Link>
              <Link to="/register" className="vv-auth-chip">
                Create Account
              </Link>
            </div>
          </section>

          <section className="vv-feature-grid" aria-label="VerifyVault features">
            <article className="vv-feature-card">
              <div className="vv-feature-icon">
                <UploadIcon />
              </div>
              <h2 className="vv-feature-title">For Issuers</h2>
              <p className="vv-feature-copy">Upload and distribute secure documents with QR-backed verification built in from the start.</p>
            </article>

            <article className="vv-feature-card">
              <div className="vv-feature-icon">
                <DocumentIcon />
              </div>
              <h2 className="vv-feature-title">For Recipients</h2>
              <p className="vv-feature-copy">Keep every issued file organized, accessible, and instantly verifiable when it matters.</p>
            </article>

            <article className="vv-feature-card">
              <div className="vv-feature-icon">
                <CheckIcon />
              </div>
              <h2 className="vv-feature-title">For Verifiers</h2>
              <p className="vv-feature-copy">Check authenticity in seconds with a simple code lookup and a clear trust signal.</p>
            </article>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
