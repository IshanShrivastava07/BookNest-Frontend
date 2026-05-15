import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, CreditCard, Truck, ArrowRight, ShoppingCart, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/axios';
import { getApiErrorMessage } from '../utils/apiError';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Checkout = () => {
  const { items, total, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    mobile: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMode, setPaymentMode] = useState<'COD' | 'RAZORPAY' | 'WALLET'>('COD');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    const nameRegex = /^[A-Za-z ]{2,50}$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    const pincodeRegex = /^\d{6}$/;

    if (!address.fullName.trim()) { setError('Full name is required.'); return false; }
    if (!nameRegex.test(address.fullName.trim())) { setError('Name must contain only alphabets and spaces (2-50 characters).'); return false; }
    
    if (!address.mobile.trim()) { setError('Mobile number is required.'); return false; }
    if (!mobileRegex.test(address.mobile.trim())) { setError('Please enter a valid 10-digit Indian mobile number.'); return false; }
    
    if (!address.city.trim()) { setError('City is required.'); return false; }
    
    if (!address.state.trim()) { setError('Please select a state.'); return false; }
    
    if (!address.pincode.trim()) { setError('Pincode is required.'); return false; }
    if (!pincodeRegex.test(address.pincode.trim())) { setError('Please enter a valid 6-digit pincode.'); return false; }
    
    return true;
  };

  const placeOrderPayload = (extra: Record<string, unknown> = {}) => ({
    amount: total,
    paymentMode,
    quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    ...address,
    ...extra,
  });

  const handlePlaceOrder = async () => {
    setError('');
    if (!validateForm()) return;

    setPlacing(true);

    if (paymentMode === 'RAZORPAY') {
      try {
        const res = await api.post(`/orders/create-payment?amount=${total}`);
        const { orderId: rzpOrderId, amount: rzpAmount, currency, key } = res.data;

        const options = {
          key,
          amount: rzpAmount,
          currency,
          name: 'BookNest',
          description: 'Payment for your book order',
          order_id: rzpOrderId,
          handler: async (response: any) => {
            try {
              await api.post('/orders/place', placeOrderPayload({
                paymentMode: 'RAZORPAY',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }));
              await refreshCart();
              navigate('/orders');
            } catch (err: unknown) {
              setError(getApiErrorMessage(err, 'Could not complete order after payment. Contact support with your payment ID.'));
            }
          },
          prefill: {
            name: address.fullName,
            email: user?.email || '',
            contact: address.mobile,
          },
          theme: { color: '#D4AF37' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to initiate payment.'));
      } finally {
        setPlacing(false);
      }
      return;
    }

    try {
      await api.post('/orders/place', placeOrderPayload());
      await refreshCart();
      navigate('/orders');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to place order.'));
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <ShoppingCart size={56} />
        <h2>Nothing to checkout</h2>
        <p className="text-muted">Your cart is empty. Add some books first.</p>
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
          <h1 className="page-title">Checkout</h1>
          <p className="text-muted">Complete your order</p>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div className="checkout-layout">
        <div className="checkout-forms">
          <div className="card checkout-section">
            <div className="checkout-section-header">
              <MapPin size={20} />
              <h3>Shipping Address</h3>
            </div>
            <div className="checkout-form-grid">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input-field" name="fullName" placeholder="John Doe" value={address.fullName} onChange={handleAddressChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">Mobile</label>
                <input className="input-field" name="mobile" placeholder="9876543210" value={address.mobile} onChange={handleAddressChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">City</label>
                <input className="input-field" name="city" placeholder="Mumbai" value={address.city} onChange={handleAddressChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">State</label>
                <select 
                  className="input-field" 
                  name="state" 
                  value={address.state} 
                  onChange={handleAddressChange} 
                  required
                  style={{ backgroundColor: 'white' }}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Pincode</label>
                <input className="input-field" name="pincode" placeholder="400001" value={address.pincode} onChange={handleAddressChange} required />
              </div>
            </div>
          </div>

          <div className="card checkout-section">
            <div className="checkout-section-header">
              <CreditCard size={20} />
              <h3>Payment Method</h3>
            </div>
            <div className="payment-options">
              <label className={`payment-option ${paymentMode === 'COD' ? 'payment-option-active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMode === 'COD'} onChange={() => setPaymentMode('COD')} />
                <Truck size={20} />
                <div>
                  <div className="payment-option-title">Cash on Delivery</div>
                  <div className="payment-option-desc">Pay when your order arrives</div>
                </div>
              </label>
              <label className={`payment-option ${paymentMode === 'WALLET' ? 'payment-option-active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMode === 'WALLET'} onChange={() => setPaymentMode('WALLET')} />
                <Wallet size={20} />
                <div>
                  <div className="payment-option-title">BookNest Wallet</div>
                  <div className="payment-option-desc">Pay from your wallet balance</div>
                </div>
              </label>
              <label className={`payment-option ${paymentMode === 'RAZORPAY' ? 'payment-option-active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMode === 'RAZORPAY'} onChange={() => setPaymentMode('RAZORPAY')} />
                <CreditCard size={20} />
                <div>
                  <div className="payment-option-title">Pay Online (Razorpay)</div>
                  <div className="payment-option-desc">UPI, Cards, Netbanking</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="card cart-summary">
          <h3 className="cart-summary-title">Order Summary</h3>
          <div className="checkout-items-list">
            {items.map((item) => (
              <div key={item.itemId} className="checkout-item">
                <div className="checkout-item-img-wrap">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.bookTitle} className="checkout-item-img" />
                  ) : (
                    <div className="cart-item-img-placeholder"><ShoppingCart size={16} /></div>
                  )}
                </div>
                <div className="checkout-item-info">
                  <div className="checkout-item-title">{item.bookTitle}</div>
                  <div className="checkout-item-qty">Qty: {item.quantity}</div>
                </div>
                <div className="checkout-item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="cart-summary-divider"></div>
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
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? 'Processing...' : paymentMode === 'RAZORPAY' ? `Pay Now — ₹${total.toFixed(2)}` : `Place Order — ₹${total.toFixed(2)}`}
            {!placing && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default Checkout;
