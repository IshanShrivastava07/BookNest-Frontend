import { useEffect, useState } from 'react';
import api from '../services/axios';
import { Package, Calendar, CreditCard, ShoppingCart, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderItem {
  orderItemId: number;
  bookId: number;
  bookTitle: string;
  author: string;
  coverImage: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: number;
  userId: number;
  amountPaid: number;
  modeOfPayment: string;
  orderStatus: string;
  quantity: number;
  bookLineCount?: number;
  orderDate: string;
  estimatedDeliveryDate?: string;
  items: OrderItem[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.sort((a: Order, b: Order) => b.orderId - a.orderId));
      } catch {
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading orders...</p>;

  if (error) return <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-error)' }}>{error}</p>;

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <Package size={56} />
        <h2>No orders found</h2>
        <p className="text-muted">You haven't placed any orders yet.</p>
        <Link to="/books" className="btn-primary" style={{ marginTop: '1rem' }}>
          Browse Books
        </Link>
      </div>
    );
  }

  const formatDelivery = (o: Order) => {
    if (o.estimatedDeliveryDate) {
      return new Date(o.estimatedDeliveryDate).toLocaleDateString();
    }
    return new Date(new Date(o.orderDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
  };

  const bookCount = (o: Order) => (o.bookLineCount != null ? o.bookLineCount : o.items?.length ?? 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your Orders</h1>
          <p className="text-muted">Track and manage your book orders</p>
        </div>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.orderId} className="card order-card">
            <div className="order-card-header">
              <div className="order-info-group">
                <span className="order-label">Order ID</span>
                <span className="order-value">#BN-{order.orderId}</span>
              </div>
              <div className="order-info-group">
                <span className="order-label">Date</span>
                <span className="order-value">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="order-info-group">
                <span className="order-label">Books</span>
                <span className="order-value" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <BookOpen size={14} /> {bookCount(order)} title{bookCount(order) !== 1 ? 's' : ''} · {order.quantity} units
                </span>
              </div>
              <div className="order-info-group">
                <span className="order-label">Total Amount</span>
                <span className="order-value">₹{order.amountPaid.toFixed(2)}</span>
              </div>
              <div className="order-info-group">
                <span className="order-label">Status</span>
                <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            <div className="order-card-body">
              <div className="order-items-preview">
                {order.items.map((item) => (
                  <div key={item.orderItemId} className="order-item-mini">
                    <div className="order-item-img-mini">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.bookTitle} />
                      ) : (
                        <ShoppingCart size={14} />
                      )}
                    </div>
                    <div className="order-item-details-mini">
                      <div className="order-item-title-mini">{item.bookTitle}</div>
                      <div className="order-item-meta-mini">Qty: {item.quantity} • ₹{item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="payment-mode-info">
                  <CreditCard size={14} />
                  <span>Payment Mode: {order.modeOfPayment}</span>
                </div>
                <div className="delivery-estimate">
                  <Calendar size={14} />
                  <span>Estimated Delivery: {formatDelivery(order)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Orders;
