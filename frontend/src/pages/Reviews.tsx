import { useEffect, useState } from 'react';
import api from '../services/axios';
import { getApiErrorMessage } from '../utils/apiError';
import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Book {
  bookId: number;
  title: string;
  author: string;
}

interface Review {
  reviewId: number;
  bookId: number;
  userId: number;
  rating: number;
  comment: string;
  reviewDate: string;
}

interface ReviewBookResponse {
  reviews: Review[];
  averageRating: number | null;
}

const Reviews = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [bookId, setBookId] = useState<number | ''>('');
  const [data, setData] = useState<ReviewBookResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await api.get('/books');
        setBooks(res.data);
        if (res.data.length && bookId === '') {
          setBookId(res.data[0].bookId);
        }
      } catch {
        setError('Could not load books.');
      }
    };
    loadBooks();
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      if (bookId === '') return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get<ReviewBookResponse>(`/reviews/book/${bookId}`);
        setData(res.data);
      } catch {
        setError('Could not load reviews.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [bookId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookId === '') return;
    setError('');
    try {
      await api.post('/reviews', { bookId, rating, comment });
      setComment('');
      const res = await api.get<ReviewBookResponse>(`/reviews/book/${bookId}`);
      setData(res.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not submit review (verified purchase required).'));
    }
  };

  const updateReview = async (r: Review) => {
    const nextRating = Math.min(5, Math.max(1, parseInt(prompt('Rating 1–5', String(r.rating)) || String(r.rating), 10)));
    const nextComment = prompt('Comment', r.comment) ?? r.comment;
    try {
      await api.put(`/reviews/${r.reviewId}`, { bookId: r.bookId, rating: nextRating, comment: nextComment });
      const res = await api.get<ReviewBookResponse>(`/reviews/book/${bookId}`);
      setData(res.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Update failed.'));
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      const res = await api.get<ReviewBookResponse>(`/reviews/book/${bookId}`);
      setData(res.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Delete failed.'));
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="text-muted">
            {user?.role === 'ROLE_ADMIN' ? 'Moderate reviews across all books' : 'View and write reviews for books you purchased'}
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <label className="input-label">Book</label>
        <select
          className="input-field"
          value={bookId === '' ? '' : String(bookId)}
          onChange={(e) => setBookId(e.target.value ? Number(e.target.value) : '')}
        >
          {books.map((b) => (
            <option key={b.bookId} value={b.bookId}>{b.title} — {b.author}</option>
          ))}
        </select>
      </div>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      {data && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={20} className="text-gold" />
            <span style={{ fontWeight: 600 }}>
              Avg rating: {data.averageRating != null ? data.averageRating.toFixed(1) : '—'} / 5
            </span>
            <span className="text-muted">({data.reviews.length} review{data.reviews.length !== 1 ? 's' : ''})</span>
          </div>
        </div>
      )}
      {user?.role !== 'ROLE_ADMIN' && (
        <form className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }} onSubmit={submit}>
          <h3 className="cart-summary-title">Add review</h3>
          <div className="input-group">
            <label className="input-label">Rating</label>
            <input className="input-field" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>
          <div className="input-group">
            <label className="input-label">Comment</label>
            <textarea className="input-field" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you think?" />
          </div>
          <button type="submit" className="btn-primary">Submit review</button>
        </form>
      )}
      {loading ? (
        <p className="text-muted">Loading reviews…</p>
      ) : data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.reviews.map((r) => (
            <div key={r.reviewId} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <p style={{ marginTop: '0.35rem' }}>{r.comment}</p>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(r.reviewDate).toLocaleString()}</div>
                </div>
                {(user?.role === 'ROLE_ADMIN' || user?.userId === r.userId) && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button type="button" className="btn-outline" onClick={() => updateReview(r)}>Edit</button>
                    <button type="button" className="cart-remove-btn" onClick={() => deleteReview(r.reviewId)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Reviews;
