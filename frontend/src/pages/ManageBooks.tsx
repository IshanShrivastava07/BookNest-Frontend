import { useEffect, useState } from 'react';
import api from '../services/axios';

interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  price: number;
  stock: number;
  description: string;
}

const ManageBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch {
      setError('Failed to load books');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    try {
      await api.delete(`/books/${id}`);
      await load();
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Books</h1>
          <p className="text-muted">Admin-only catalog management</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <strong>DEPRECATED:</strong> This page is scheduled for removal. Please use the new <a href="/admin/books" style={{ textDecoration: 'underline', color: '#B91C1C' }}>Admin Panel</a> instead.
      </div>

      {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}
      <div className="card" style={{ padding: '1rem' }}>
        {books.map((b) => (
          <div key={b.bookId} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '0.6rem 0' }}>
            <span>{b.title} — {b.author}</span>
            <button className="cart-remove-btn" onClick={() => remove(b.bookId)}>Delete</button>
          </div>
        ))}
      </div>
    </>
  );
};

export default ManageBooks;
