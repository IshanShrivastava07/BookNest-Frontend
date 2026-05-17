import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LayoutDashboard, Library, PlusSquare, MessageSquare } from 'lucide-react';
import '../styles/global.css';
import '../styles/components.css';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
          <BookOpen size={28} className="text-gold" />
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Book<span className="text-gold">Nest</span> Admin</span>
        </div>
        
        <nav style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link 
            to="/admin" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '0.5rem', 
              backgroundColor: isActive('/admin') && location.pathname === '/admin' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              color: isActive('/admin') && location.pathname === '/admin' ? 'var(--color-gold)' : 'var(--color-text)',
              fontWeight: isActive('/admin') && location.pathname === '/admin' ? 600 : 400
            }}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/admin/books" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '0.5rem', 
              backgroundColor: isActive('/admin/books') ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              color: isActive('/admin/books') ? 'var(--color-gold)' : 'var(--color-text)',
              fontWeight: isActive('/admin/books') ? 600 : 400
            }}
          >
            <Library size={20} />
            All Books
          </Link>
          <Link 
            to="/admin/books/new" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '0.5rem', 
              backgroundColor: isActive('/admin/books/new') ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              color: isActive('/admin/books/new') ? 'var(--color-gold)' : 'var(--color-text)',
              fontWeight: isActive('/admin/books/new') ? 600 : 400
            }}
          >
            <PlusSquare size={20} />
            Add Book
          </Link>
          <Link 
            to="/admin/reviews" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '0.5rem', 
              backgroundColor: isActive('/admin/reviews') ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              color: isActive('/admin/reviews') ? 'var(--color-gold)' : 'var(--color-text)',
              fontWeight: isActive('/admin/reviews') ? 600 : 400
            }}
          >
            <MessageSquare size={20} />
            Manage Reviews
          </Link>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              width: '100%', background: 'none', border: 'none', color: 'var(--color-error)', 
              cursor: 'pointer', fontWeight: 500, fontSize: '1rem', borderRadius: '0.5rem',
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
