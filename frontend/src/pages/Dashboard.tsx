import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Library, ShoppingCart, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/axios';
import BookCard from '../components/BookCard';

interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  price: number;
  stock: number;
  description: string;
  coverImage: string;
}

const quickActions = [
  {
    title: 'Browse Books',
    desc: 'Explore our curated collection of books across genres.',
    icon: Library,
    color: '#D4AF37',
    bg: 'rgba(212, 175, 55, 0.1)',
    path: '/books',
  },
  {
    title: 'View Cart',
    desc: 'Check the items you have added and proceed to checkout.',
    icon: ShoppingCart,
    color: '#1A1A1A',
    bg: 'rgba(26, 26, 26, 0.06)',
    path: '/cart',
  },
  {
    title: 'Your Orders',
    desc: 'Track your past and current orders in one place.',
    icon: Package,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    path: '/orders',
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const firstName = user?.fullName?.split(' ')[0] || 'User';

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/books');
        // Just take the first 4 as "featured"
        setFeaturedBooks(res.data.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch featured books", err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="book-card-genre" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', display: 'block' }}>
              Welcome back, {firstName}
            </span>
            <h1 className="hero-title">Discover Your Next Great Adventure</h1>
            <p className="hero-subtitle">
              Explore thousands of books, from timeless classics to modern masterpieces. 
              Your journey into the world of literature starts here.
            </p>
            <div className="hero-actions">
              <Link to="/books" className="btn-gold">
                Explore Collection <ArrowRight size={18} />
              </Link>
              <Link to="/orders" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                Track Orders
              </Link>
            </div>
          </motion.div>
        </div>
        <motion.div 
          className="hero-floating-book" 
          style={{ padding: 0, overflow: 'hidden' }}
          animate={{ 
            y: [ -160, -180, -160 ],
            rotate: [ 10, 12, 10 ]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <img 
            src="/hero-book.png" 
            alt="Featured Book" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </motion.div>
      </section>

      {/* ── Quick Actions ── */}
      <div className="section-header">
        <h2 className="section-title">Quick Actions</h2>
      </div>
      <div className="dash-grid" style={{ marginBottom: '4rem' }}>
        {quickActions.map((action, index) => (
          <motion.div 
            className="card card-hover" 
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            <div
              className="dash-card-icon"
              style={{ backgroundColor: action.bg, color: action.color }}
            >
              <action.icon size={22} />
            </div>
            <div className="dash-card-title">{action.title}</div>
            <div className="dash-card-desc">{action.desc}</div>
            <Link to={action.path} className="dash-card-link">
              Go to {action.title} <ArrowRight size={14} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Featured Books ── */}
      {featuredBooks.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">Featured for You</h2>
            <Link to="/books" className="text-gold" style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="books-grid">
            {featuredBooks.map((book) => (
              <BookCard key={book.bookId} {...book} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
