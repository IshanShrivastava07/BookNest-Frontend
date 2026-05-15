import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/axios';

interface UserInfo {
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const decodeToken = (jwt: string): UserInfo | null => {
    try {
      const base64Url = jwt.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return {
        userId: payload.userId,
        fullName: payload.fullName || '',
        email: payload.sub || payload.email || '',
        role: payload.role || 'ROLE_USER'
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        // Optimistically set decoded user first
        const decodedUser = decodeToken(token);
        if (decodedUser) {
          setUser(decodedUser);
        }

        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err: any) {
          // Only clear token on definitive 401 (token invalid/expired)
          // For network errors or service-down, keep the decoded token data
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
          // Otherwise keep using the decoded token data (already set above)
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decodedUser = decodeToken(newToken);
    if (decodedUser) {
      setUser(decodedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
