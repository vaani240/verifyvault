import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

import { api } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M5.5 5.5V3.75A1.25 1.25 0 0 1 6.75 2.5h5A1.25 1.25 0 0 1 13 3.75v5A1.25 1.25 0 0 1 11.75 10H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6.75A1.25 1.25 0 0 1 4.25 5.5h5A1.25 1.25 0 0 1 10.5 6.75v5A1.25 1.25 0 0 1 9.25 13H4.25A1.25 1.25 0 0 1 3 11.75v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadDocument = () => {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('General Document');
  const [issuedTo, setIssuedTo] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [copyState, setCopyState] = useState('Copy');

  const fileName = file?.name || 'No file selected';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('documentType', documentType);
      formData.append('issuedTo', issuedTo);
      formData.append('file', file);

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Document uploaded successfully');
      setVerifyCode(response.data?.verifyCode || response.data?.document?.verifyCode || '');
      setTitle('');
      setDocumentType('General Document');
      setIssuedTo('');
      setFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!verifyCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(verifyCode);
      setCopyState('Copied');
      window.setTimeout(() => setCopyState('Copy'), 1500);
    } catch {
      setCopyState('Copy failed');
      window.setTimeout(() => setCopyState('Copy'), 1500);
    }
  };

  return (
    <div className="vv-page">
      <Navbar />
      <main className="vv-upload-page">
        <section className="vv-upload-card">
          <h1 className="vv-auth-title">Upload New Document</h1>
          <p className="vv-auth-copy">Issue a new verification-ready document with a secure code and QR payload.</p>

          <form onSubmit={handleSubmit} className="vv-form">
            <div className="vv-field">
              <label className="vv-label" htmlFor="document-title">
                Document Title
              </label>
              <input id="document-title" className="vv-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="vv-field">
              <label className="vv-label" htmlFor="document-type">
                Document Type
              </label>
              <select
  id="document-type"
  className="vv-input"
  value={documentType}
  onChange={(e) => setDocumentType(e.target.value)}
>
  <option value="General Document">General Document</option>
  <option value="Medical Certificate">Medical Certificate</option>
  <option value="Experience Letter">Experience Letter</option>
  <option value="Degree Certificate">Degree Certificate</option>
  <option value="Internship Certificate">Internship Certificate</option>
  <option value="Identity Document">Identity Document</option>
  <option value="Other">Other</option>
</select>
            </div>

            <div className="vv-field">
              <label className="vv-label" htmlFor="recipient-email">
                Recipient Email
              </label>
              <input id="recipient-email" className="vv-input" type="email" value={issuedTo} onChange={(e) => setIssuedTo(e.target.value)} required />
            </div>

            <div className="vv-field">
              <label className="vv-label" htmlFor="document-file">
                Upload File
              </label>
              <div className="vv-file-picker">
                <span className="vv-file-name">{fileName}</span>
                <label className="vv-btn vv-btn-outline" htmlFor="document-file">
                  Choose File
                </label>
              </div>
              <input id="document-file" className="vv-file-input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            </div>

            <button type="submit" disabled={submitting} className="vv-btn vv-btn-primary" style={{ width: '100%' }}>
              {submitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>

          {message ? (
            <div className="vv-success-card">
              <div className="vv-status-success">{message}</div>
              <div>
                <div className="vv-label" style={{ marginBottom: '8px' }}>
                  Verify Code
                </div>
                <div className="vv-code-box">{verifyCode || 'Pending'}</div>
              </div>
              <div className="vv-success-row">
                <span className="vv-status-success">Share this code with the recipient.</span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleCopy} className="vv-btn vv-btn-outline">
                    <CopyIcon /> {copyState}
                  </button>
                  {verifyCode ? (
                    <Link to={`/verify/${verifyCode}`} className="vv-btn vv-btn-primary">
                      Open Verify Page
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {error ? <div className="vv-error" style={{ marginTop: '16px' }}>{error}</div> : null}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UploadDocument;
