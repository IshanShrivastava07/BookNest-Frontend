import { useEffect, useState } from 'react';
import api from '../services/axios';
import { Bell } from 'lucide-react';

interface NotificationRow {
  notificationId: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setRows(res.data.sort((a: NotificationRow, b: NotificationRow) => b.notificationId - a.notificationId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const mark = async (id: number) => {
    await api.put(`/notifications/${id}/read`);
    await load();
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading…</p>;

  const unread = rows.filter((r) => !r.read).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-muted">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">
          <Bell size={56} />
          <h2>No notifications</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rows.map((r) => (
            <div key={r.notificationId} className="card" style={{ padding: '1rem', opacity: r.read ? 0.75 : 1, borderLeft: r.read ? undefined : '3px solid var(--color-gold, #D4AF37)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem' }}>{r.message}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                {!r.read && (
                  <button type="button" className="btn-outline" style={{ whiteSpace: 'nowrap', alignSelf: 'flex-start' }} onClick={() => mark(r.notificationId)}>
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Notifications;
