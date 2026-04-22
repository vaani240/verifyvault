import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

import { api } from '../context/AuthContext';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3.25v9.5M3.25 8h9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.5v6M5.25 6.75 8 9.5l2.75-2.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 2.75h5L12.5 6.75v6.5h-9V2.75Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M8.5 2.75v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const getStatusTone = (status) => (status === 'revoked' ? 'vv-pill-danger' : 'vv-pill-success');

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const IssuerDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/documents/issuer');
      setDocuments(response.data?.documents || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch issuer documents');
    } finally {
      setLoading(false);
    }
  };

  const revokeDocument = async (id) => {
    try {
      await api.patch(`/documents/revoke/${id}`);
      fetchDocuments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to revoke document');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="vv-page">
      <Navbar />
      <main className="vv-main">
        <header className="vv-page-header">
          <div>
            <h1 className="vv-page-title">Issuer Dashboard</h1>
            <p className="vv-page-copy">Manage issued documents, track verification codes, and revoke access when needed.</p>
          </div>

          <Link to="/upload" className="vv-btn vv-btn-primary">
            <PlusIcon /> Upload New Document
          </Link>
        </header>

        {loading ? <div className="vv-loading">Loading documents...</div> : null}
        {error ? <div className="vv-error">{error}</div> : null}

        <div className="vv-document-grid">
          {!loading && !error && documents.length === 0 ? (
            <div className="vv-document-grid-empty">
              No documents issued yet. Click Upload New Document to create your first verified file.
            </div>
          ) : null}

          {documents.map((doc) => (
            <article key={doc._id} className="vv-document-card">
              <div className="vv-document-head">
                <div>
                  <h2 className="vv-document-title">{doc.title}</h2>
                  <p className="vv-document-subtitle">Securely issued and ready for verification.</p>
                </div>
                <span className={`vv-pill ${getStatusTone(doc.status)}`}>{doc.status === 'active' ? 'Active' : 'Revoked'}</span>
              </div>

              <div className="vv-meta-grid">
                <div className="vv-meta-item">
                  <span className="vv-meta-label">Verify Code</span>
                  <span className="vv-meta-value">{doc.verifyCode}</span>
                </div>
                <div className="vv-meta-item">
                  <span className="vv-meta-label">Status</span>
                  <span className="vv-meta-value">{doc.status === 'active' ? 'Active' : 'Revoked'}</span>
                </div>
                <div className="vv-meta-item">
                  <span className="vv-meta-label">Issued To</span>
                  <span className="vv-meta-value">{doc?.issuedTo?.name || doc?.issuedTo?.email || 'N/A'}</span>
                </div>
                <div className="vv-meta-item">
                  <span className="vv-meta-label">Date</span>
                  <span className="vv-meta-value">{formatDate(doc?.createdAt)}</span>
                </div>
              </div>

              <div className="vv-document-actions">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="vv-inline-link">
                  <DocumentIcon /> View File
                </a>

                <div className="vv-qr-block">
                  <Link to={`/verify/${doc.verifyCode}`} className="vv-inline-link" aria-label={`Open verify page for ${doc.verifyCode}`}>
                    <img src={doc.qrCodeUrl} alt={`QR-${doc.verifyCode}`} className="vv-qr" />
                  </Link>
                  <Link to={`/verify/${doc.verifyCode}`} className="vv-qr-link">
                    Open Verify Page
                  </Link>
                  <span className="vv-file-name vv-code-caption">
                    {doc.verifyCode}
                  </span>
                  <a href={doc.qrCodeUrl} download={`qr-${doc.verifyCode}.png`} className="vv-qr-link">
                    <DownloadIcon /> Download QR
                  </a>
                </div>

                {doc.status === 'active' ? (
                  <button type="button" onClick={() => revokeDocument(doc._id)} className="vv-btn vv-btn-danger">
                    Revoke
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IssuerDashboard;
