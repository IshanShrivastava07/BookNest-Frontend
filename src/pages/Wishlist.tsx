import { useEffect, useState } from 'react';
import api from '../services/axios';
import { getApiErrorMessage } from '../utils/apiError';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface WishlistItem {
  itemId: number;
  bookId: number;
  bookTitle: string;
  price: number;
}

const Wishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refreshCart } = useCart();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/wishlist');
      setItems(res.data);
    } catch {
      setError('Could not load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (bookId: number) => {
    await api.delete(`/wishlist/remove/${bookId}`);
    await load();
  };

  const move = async (bookId: number) => {
    try {
      await api.post(`/wishlist/move-to-cart/${bookId}`);
      await refreshCart();
      await load();
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not move to cart.'));
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading…</p>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Wishlist</h1>
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
          <Heart size={56} />
          <h2>Your wishlist is empty</h2>
          <p className="text-muted">Heart books from the catalog to see them here.</p>
        </div>
      ) : (
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.itemId} className="cart-item card">
              <div className="cart-item-info" style={{ flex: 1 }}>
                <h3 className="cart-item-title">{item.bookTitle}</h3>
                <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn-outline" onClick={() => move(item.bookId)} title="Move to cart">
                  <ShoppingCart size={16} />
                </button>
                <button type="button" className="cart-remove-btn" onClick={() => remove(item.bookId)} title="Remove">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Wishlist;
