import { useEffect, useState } from 'react';
import api from '../services/axios';
import { getApiErrorMessage } from '../utils/apiError';
import { Wallet, Plus } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Statement {
  id?: number;
  statementId?: number;
  type: string;
  amount: number;
  dateTime: string;
  timestamp?: string;
  description?: string;
  remarks?: string;
}

interface WalletData {
  id?: number;
  walletId?: number;
  userId: number;
  balance: number;
}

interface CreateTopupOrderResponse {
  orderId: string;
  amount: number;
  key: string;
}

const WalletPage = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const [wRes, sRes] = await Promise.all([api.get('/wallet'), api.get('/wallet/statements')]);
      setWallet(wRes.data);
      setStatements(sRes.data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not load wallet.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

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

  const startTopUp = async () => {
    const n = Number(amount);
    if (Number.isNaN(n) || n < 10) {
      setError('Minimum top-up is ₹10.');
      setSuccess('');
      return;
    }
    if (n > 10_000) {
      setError('Maximum top-up is ₹10,000 per transaction.');
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const { data } = await api.post<CreateTopupOrderResponse>('/wallet/create-topup-order', { amount: n });
      if (!window.Razorpay) {
        setError('Payment script is still loading. Please try again in a moment.');
        setBusy(false);
        return;
      }
      const amountPaise = Math.round(data.amount * 100);
      const options: Record<string, unknown> = {
        key: data.key,
        amount: amountPaise,
        currency: 'INR',
        name: 'BookNest',
        description: 'Wallet top-up',
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await api.post<{ message: string; balance: number }>('/wallet/verify-topup', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setAmount('');
            const msg = verifyRes.data?.message ?? 'Wallet updated successfully.';
            const bal = verifyRes.data?.balance;
            setSuccess(
              typeof bal === 'number' && !Number.isNaN(bal)
                ? `${msg} Current balance: ₹${bal.toFixed(2)}.`
                : msg,
            );
            await refresh();
          } catch (e: unknown) {
            setSuccess('');
            setError(getApiErrorMessage(e, 'Could not verify payment.'));
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not start top-up.'));
      setBusy(false);
    }
  };

  if (loading && !wallet) {
    return <p style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading wallet…</p>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Wallet</h1>
          <p className="text-muted">Add money via Razorpay; balance and transaction history</p>
        </div>
      </div>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#047857', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {success}
        </div>
      )}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Wallet size={28} />
          <div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Available balance</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹{(wallet?.balance ?? 0).toFixed(2)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input-field"
            type="number"
            min={10}
            max={10000}
            step={1}
            placeholder="Amount (₹10 – ₹10,000)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ maxWidth: '220px' }}
          />
          <button type="button" className="btn-primary" onClick={startTopUp} disabled={busy}>
            <Plus size={16} /> {busy ? 'Processing…' : 'Add money (Razorpay)'}
          </button>
        </div>
      </div>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="cart-summary-title" style={{ marginBottom: '1rem' }}>Statement</h3>
        {statements.length === 0 ? (
          <p className="text-muted">No transactions yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {statements.map((s, i) => {
              const isCredit = s.type === 'CREDIT' || s.type === 'DEPOSIT';
              const when = s.timestamp || s.dateTime;
              const desc = s.description ?? s.remarks ?? '';
              const key = s.id ?? s.statementId ?? i;
              return (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.type}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{desc}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(when).toLocaleString()}</div>
                </div>
                <div style={{ fontWeight: 600, color: isCredit ? 'var(--color-success)' : 'inherit' }}>
                  {isCredit ? '+' : '-'}₹{s.amount.toFixed(2)}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default WalletPage;
