import { ShoppingCart, Check, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import api from '../services/axios';

interface BookCardProps {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  price: number;
  stock: number;
  coverImage: string;
}

const BookCard = ({ bookId, title, author, genre, price, stock, coverImage }: BookCardProps) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const handleWishlist = async () => {
    setWishLoading(true);
    try {
      await api.post(`/wishlist/add/${bookId}`);
    } catch {
      // duplicate / errors — optional toast
    } finally {
      setWishLoading(false);
    }
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart({ bookId, title, price });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // error handled globally
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div 
      className="book-card card premium-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="book-card-img-wrap">
        {coverImage ? (
          <img src={coverImage} alt={title} className="book-card-img" />
        ) : (
          <div className="book-card-img-placeholder">
            <ShoppingCart size={32} />
          </div>
        )}
      </div>
      <div className="book-card-body">
        <span className="book-card-genre">{genre}</span>
        <h3 className="book-card-title">{title}</h3>
        <p className="book-card-author">{author}</p>
        <div className="book-card-footer">
          <span className="book-card-price">₹{price.toFixed(2)}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="btn-outline"
              style={{ padding: '0.5rem 0.65rem', minWidth: 'auto' }}
              onClick={handleWishlist}
              disabled={wishLoading}
              title="Add to wishlist"
            >
              <Heart size={16} className={wishLoading ? 'animate-pulse' : ''} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`book-card-btn ${added ? 'book-card-btn-added' : ''}`}
              onClick={handleAdd}
              disabled={adding || stock <= 0}
            >
              {added ? <><Check size={14} /> Added</> : adding ? 'Adding...' : stock <= 0 ? 'Out of Stock' : <><ShoppingCart size={14} /> Add</>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
