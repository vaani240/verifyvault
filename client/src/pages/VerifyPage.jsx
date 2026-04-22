import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../context/AuthContext';

const isPdf = (url = '') => url.toLowerCase().includes('.pdf');

const isImage = (url = '') => /\.(jpg|jpeg|png)$/i.test(url);

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatParty = (value) => value?.name || value?.email || value || 'N/A';

const renderRows = (document) => [
  ['Title', document?.title || 'N/A'],
  ['Document Type', document?.documentType || 'N/A'],
  ['Issued By', formatParty(document?.issuedBy)],
  ['Issued To', formatParty(document?.issuedTo)],
  ['Date', formatDate(document?.createdAt)],
];

const VerifyPage = () => {
  const { verifyCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/verify/${verifyCode}`);
        setData(response.data);
      } catch (error) {
        setData({ result: 'NOT_FOUND' });
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [verifyCode]);

  if (loading) {
    return (
      <section className="vv-verify-page vv-verify-loading">
        <div className="vv-verify-loading-inner">
          <div className="vv-spinner" />
          <h1>Verifying document authenticity...</h1>
        </div>
      </section>
    );
  }

  const result = data?.result;
  const document = data?.document;

  if (result === 'GENUINE') {
    return (
      <section className="vv-verify-page vv-verify-genuine">
        <div className="vv-verify-state">
          <article className="vv-verify-card">
            <div className="vv-verify-emoji" aria-hidden="true">
              ✅
            </div>
            <h1 className="vv-verify-title vv-verify-title-success">Document Verified</h1>

            <dl className="vv-verify-details">
              {renderRows(document).map(([label, value]) => (
                <div className="vv-verify-row" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div
              className="vv-verify-actions"
              style={{
                width: '100%',
                marginTop: '24px',
                borderTop: '1px solid #E2E8F0',
                paddingTop: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  color: '#1E293B',
                  marginBottom: '12px',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Original Document on Record
              </p>
              {isPdf(document?.fileUrl) ? (
                <iframe
                  title="Original verified document"
                  src={document?.fileUrl}
                  style={{ width: '100%', height: '400px', border: '0', borderRadius: '8px', display: 'block' }}
                />
              ) : isImage(document?.fileUrl) ? (
                <img
                  className="vv-verify-preview"
                  src={document?.fileUrl}
                  alt="Original verified document"
                  style={{ maxWidth: '100%', borderRadius: '8px', alignSelf: 'center' }}
                />
              ) : (
                <a href={document?.fileUrl} target="_blank" rel="noreferrer" className="vv-btn vv-btn-primary">
                  View Original File
                </a>
              )}
            </div>

            <div className="vv-verify-note">Please visually confirm this matches the document in your hand.</div>
          </article>
        </div>
      </section>
    );
  }

  if (result === 'REVOKED') {
    return (
      <section className="vv-verify-page vv-verify-revoked">
        <div className="vv-verify-state">
          <article className="vv-verify-card">
            <div className="vv-verify-emoji" aria-hidden="true">
              🚫
            </div>
            <h1 className="vv-verify-title vv-verify-title-warning">Document Revoked</h1>

            {document ? (
              <dl className="vv-verify-details">
                {renderRows(document).map(([label, value]) => (
                  <div className="vv-verify-row" key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="vv-verify-page vv-verify-failed">
      <div className="vv-verify-state">
        <article className="vv-verify-card">
          <div className="vv-verify-emoji" aria-hidden="true">
            ❌
          </div>
          <h1 className="vv-verify-title vv-verify-title-danger">Document Not Found</h1>

          <dl className="vv-verify-details" style={{ marginBottom: '18px' }}>
            <div className="vv-verify-row">
              <dt>Verification Code</dt>
              <dd>{verifyCode}</dd>
            </div>
          </dl>

          <div className="vv-banner vv-banner-danger">This document does not exist in our system. Do not accept it.</div>
        </article>
      </div>
    </section>
  );
};

export default VerifyPage;
