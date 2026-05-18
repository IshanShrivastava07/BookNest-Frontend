import { useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getApiErrorMessage } from '../utils/apiError';
import api from '../services/axios';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { items, loading, error, refreshWishlist, toggleWishlist } = useWishlist();
  const { refreshCart } = useCart();

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const remove = async (bookId: number, title: string, author?: string, coverImage?: string, price?: number) => {
    try {
      await toggleWishlist({ 
        bookId, 
        title, 
        author: author || '', 
        coverImage: coverImage || '', 
        price: price || 0 
      });
    } catch (err) {
      console.error('[WishlistPage] Failed to remove item:', err);
    }
  };

  const move = async (bookId: number) => {
    try {
      await api.post(`/wishlist/move-to-cart/${bookId}`);
      await refreshCart();
      await refreshWishlist();
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, 'Could not move to cart.'));
    }
  };

  if (loading && items.length === 0) {
    return <p style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading wishlist...</p>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your Wishlist</h1>
          <p className="text-muted">Save books for later</p>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <Heart size={56} style={{ color: '#6B7280' }} />
          <h2>Your wishlist is empty</h2>
          <p className="text-muted">Heart books from the catalog to see them here.</p>
          <Link to="/books" className="btn-primary" style={{ marginTop: '1rem' }}>
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="cart-layout" style={{ gridTemplateColumns: '1fr' }}>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.itemId} className="cart-item card">
                <div className="cart-item-img-wrap">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.bookTitle} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-img-placeholder">
                      <Heart size={24} />
                    </div>
                  )}
                </div>
                <div className="cart-item-info" style={{ flex: 1 }}>
                  <h3 className="cart-item-title">{item.bookTitle}</h3>
                  <p className="cart-item-author">{item.author || 'Unknown Author'}</p>
                  <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    className="btn-outline" 
                    onClick={() => move(item.bookId)} 
                    title="Move to cart"
                    style={{ padding: '0.5rem 0.65rem', minWidth: 'auto' }}
                  >
                    <ShoppingCart size={16} />
                  </button>
                  <button 
                    type="button" 
                    className="cart-remove-btn" 
                    onClick={() => remove(item.bookId, item.bookTitle, item.author, item.coverImage, item.price)} 
                    title="Remove from wishlist"
                    style={{ padding: '0.5rem 0.65rem', minWidth: 'auto' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Wishlist;
