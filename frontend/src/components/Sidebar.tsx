import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Library,
  ShoppingCart,
  Package,
  Heart,
  Wallet,
  Bell,
  Star,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Books', icon: Library, path: '/books' },
  { label: 'Cart', icon: ShoppingCart, path: '/cart' },
  { label: 'Orders', icon: Package, path: '/orders' },
  { label: 'Wishlist', icon: Heart, path: '/wishlist' },
  { label: 'Wallet', icon: Wallet, path: '/wallet' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Reviews', icon: Star, path: '/reviews' },
];

const adminNavItems = [
  { label: 'Manage Books', icon: Shield, path: '/manage-books' },
  { label: 'Manage Orders', icon: Settings, path: '/manage-orders' },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <BookOpen size={24} />
          <span>Book<span className="text-gold">Nest</span></span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="sidebar-section" style={{ marginTop: '1rem' }}>Admin</div>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
