import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/axios';
import BookCard from '../components/BookCard';

interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  price: number;
  stock: number;
  description: string;
  coverImage: string;
}

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/books');
        setBooks(res.data);
      } catch {
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="page-title">Explore Collection</h1>
          <p className="text-muted">Browse our collection of {books.length} curated books</p>
        </motion.div>
        <motion.div 
          className="search-box"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input-field search-input glass"
            placeholder="Search by title, author or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading books...</p>}

      {error && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-error)' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
          {search ? 'No books match your search.' : 'No books available yet.'}
        </p>
      )}

      <motion.div 
        className="books-grid"
        layout
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((book) => (
            <BookCard key={book.bookId} {...book} />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Books;
