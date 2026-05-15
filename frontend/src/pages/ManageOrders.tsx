import { useEffect, useState } from 'react';
import api from '../services/axios';

interface Order {
  orderId: number;
  userId: number;
  orderStatus: string;
  amountPaid: number;
}

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      // Admin view can still inspect own orders if backend doesn't expose global listing.
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      setError('Failed to load orders');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, null, { params: { status } });
      await load();
    } catch {
      setError('Status update failed');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Orders</h1>
          <p className="text-muted">Admin-only order status updates</p>
        </div>
      </div>
      {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}
      <div className="card" style={{ padding: '1rem' }}>
        {orders.map((o) => (
          <div key={o.orderId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', padding: '0.6rem 0' }}>
            <span>#BN-{o.orderId} · ₹{o.amountPaid.toFixed(2)} · {o.orderStatus}</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-outline" onClick={() => setStatus(o.orderId, 'SHIPPED')}>Ship</button>
              <button className="btn-outline" onClick={() => setStatus(o.orderId, 'DELIVERED')}>Deliver</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ManageOrders;
