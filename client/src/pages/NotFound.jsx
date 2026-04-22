import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const NotFound = () => {
  return (
    <div className="vv-page">
      <Navbar />
      <main className="vv-auth-page">
        <section className="vv-auth-card" style={{ textAlign: 'center' }}>
          <h1 className="vv-auth-title">404 - Page Not Found</h1>
          <p className="vv-auth-copy">The page you are looking for does not exist.</p>
          <Link to="/" className="vv-btn vv-btn-primary" style={{ width: '100%' }}>
            Go to Home
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
