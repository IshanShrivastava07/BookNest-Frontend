import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { items, total, loading, removeFromCart, updateQuantity } = useCart();

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading cart...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <ShoppingCart size={56} />
        <h2>Your cart is empty</h2>
        <p className="text-muted">Looks like you haven't added any books yet.</p>
        <Link to="/books" className="btn-primary" style={{ marginTop: '1rem' }}>
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your Cart</h1>
          <p className="text-muted">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.itemId} className="cart-item card">
              <div className="cart-item-img-wrap">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.bookTitle} className="cart-item-img" />
                ) : (
                  <div className="cart-item-img-placeholder">
                    <ShoppingCart size={24} />
                  </div>
                )}
              </div>
              <div className="cart-item-info">
                <h3 className="cart-item-title">{item.bookTitle}</h3>
                <p className="cart-item-author">{item.author}</p>
                <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-actions">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <button className="cart-remove-btn" onClick={() => removeFromCart(item.itemId)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="cart-item-subtotal">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary card">
          <h3 className="cart-summary-title">Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span className="text-gold">Free</span>
          </div>
          <div className="cart-summary-divider"></div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </>
  );
};

export default Cart;
