import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">Dashboard</span>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div>
            <div className="navbar-username">{user?.fullName || 'User'}</div>
            <div className="navbar-role">{user?.email || ''}</div>
          </div>
          <div className="navbar-avatar">
            {user?.fullName ? getInitials(user.fullName) : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
