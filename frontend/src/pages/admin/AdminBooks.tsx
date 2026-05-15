import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, BookOpen } from 'lucide-react';
import api from '../../services/axios';

interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  price: number;
  stock: number;
  coverImage?: string;
}

const AdminBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch {
      setError('Failed to load books from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      try {
        await api.delete(`/books/admin/delete/${id}`);
        setSuccess('Book deleted successfully!');
        setBooks(books.filter(b => b.bookId !== id));
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        setError('Failed to delete book.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Manage Books</h1>
          <p className="text-muted">View, edit, or delete books in the catalog.</p>
        </div>
        <Link to="/admin/books/new" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
          <Plus size={18} /> Add Book
        </Link>
      </div>

      {success && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{success}</div>}
      {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Loading books...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#6B7280', fontSize: '0.875rem' }}>IMAGE</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#6B7280', fontSize: '0.875rem' }}>TITLE</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#6B7280', fontSize: '0.875rem' }}>AUTHOR</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#6B7280', fontSize: '0.875rem' }}>CATEGORY</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#6B7280', fontSize: '0.875rem' }}>PRICE</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#6B7280', fontSize: '0.875rem' }}>STOCK</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.bookId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ width: '40px', height: '60px', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', overflow: 'hidden' }}>
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                            <BookOpen size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{book.title}</td>
                    <td style={{ padding: '1rem', color: '#4B5563' }}>{book.author}</td>
                    <td style={{ padding: '1rem', color: '#4B5563' }}>{book.genre}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-gold)' }}>₹{book.price}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: book.stock > 10 ? '#D1FAE5' : book.stock > 0 ? '#FEF3C7' : '#FEE2E2',
                        color: book.stock > 10 ? '#065F46' : book.stock > 0 ? '#92400E' : '#991B1B'
                      }}>
                        {book.stock} left
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link to={`/admin/books/edit/${book.bookId}`} style={{ padding: '0.5rem', color: '#3B82F6', backgroundColor: '#EFF6FF', borderRadius: '0.25rem' }}>
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(book.bookId)}
                          style={{ padding: '0.5rem', color: '#EF4444', backgroundColor: '#FEF2F2', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                      No books found in the catalog.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBooks;
