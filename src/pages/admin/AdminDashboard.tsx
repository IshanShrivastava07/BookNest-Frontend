import { useAuth } from '../../context/AuthContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Admin';

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="text-muted">Welcome back, <span className="text-gold">{firstName}</span>. Here is your system overview.</p>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card card-hover" style={{ padding: '1.5rem' }}>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}>
            <BookOpen size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Catalog Management</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Manage all books, update pricing, and adjust stock levels.</p>
          <Link to="/admin/books" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            Go to Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
