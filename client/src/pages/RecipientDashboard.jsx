import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

import { api } from '../context/AuthContext';

const DocumentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 2.75h5L12.5 6.75v6.5h-9V2.75Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M8.5 2.75v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

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

const getStatusTone = (status) => (status === 'revoked' ? 'vv-pill-danger' : 'vv-pill-success');

const RecipientDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/documents/recipient');
      setDocuments(response.data?.documents || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch recipient documents');
    } finally {
      setLoading(false);
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
            <h1 className="vv-page-title">Recipient Dashboard</h1>
            <p className="vv-page-copy">Review the documents issued to you and confirm their current verification status.</p>
          </div>
        </header>

        {loading ? <div className="vv-loading">Loading documents...</div> : null}
        {error ? <div className="vv-error">{error}</div> : null}

        <div className="vv-document-grid">
          {!loading && !error && documents.length === 0 ? (
            <div className="vv-document-grid-empty">
              No documents have been issued to your account yet.
            </div>
          ) : null}

          {documents.map((doc) => (
            <article key={doc._id} className="vv-document-card">
              {doc.status === 'revoked' ? (
                <div className="vv-banner vv-banner-danger vv-mb-18">
                  This document has been revoked by the issuer.
                </div>
              ) : null}

              <div className="vv-document-head">
                <div>
                  <h2 className="vv-document-title">{doc.title}</h2>
                  <p className="vv-document-subtitle">Stored securely and available for download.</p>
                </div>
                <span className={`vv-pill ${getStatusTone(doc.status)}`}>{doc.status === 'active' ? 'Active' : 'Revoked'}</span>
              </div>

              <div className="vv-meta-grid">
                <div className="vv-meta-item">
                  <span className="vv-meta-label">Verify Code</span>
                  <span className="vv-meta-value">{doc.verifyCode}</span>
                </div>
                <div className="vv-meta-item">
                  <span className="vv-meta-label">Issued By</span>
                  <span className="vv-meta-value">{doc?.issuedBy?.name || 'N/A'}</span>
                </div>
                <div className="vv-meta-item">
                  <span className="vv-meta-label">Date</span>
                  <span className="vv-meta-value">{formatDate(doc?.createdAt)}</span>
                </div>
                <div className="vv-meta-item">
                  <span className="vv-meta-label">Status</span>
                  <span className="vv-meta-value">{doc.status === 'active' ? 'Active' : 'Revoked'}</span>
                </div>
              </div>

              <div className="vv-document-actions">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="vv-btn vv-btn-outline">
                  <DocumentIcon /> View File
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecipientDashboard;
