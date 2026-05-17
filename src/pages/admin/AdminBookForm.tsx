import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../services/axios';

const AdminBookForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    price: '',
    stock: '',
    description: '',
    coverImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchBook = async () => {
        try {
          const res = await api.get(`/books/${id}`);
          const b = res.data;
          setFormData({
            title: b.title || '',
            author: b.author || '',
            genre: b.genre || '',
            price: b.price?.toString() || '',
            stock: b.stock?.toString() || '',
            description: b.description || '',
            coverImage: b.coverImage || ''
          });
        } catch {
          setError('Failed to load book details.');
        }
      };
      fetchBook();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title: formData.title,
      author: formData.author,
      genre: formData.genre,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      description: formData.description,
      coverImage: formData.coverImage
    };

    // Debug: log the token being used
    const currentToken = localStorage.getItem('token');
    console.log('[AdminBookForm] Token present:', !!currentToken);
    console.log('[AdminBookForm] Token preview:', currentToken?.substring(0, 50) + '...');

    try {
      if (isEditMode) {
        await api.put(`/books/admin/update/${id}`, payload);
      } else {
        await api.post('/books/admin/create', payload);
      }
      navigate('/admin/books');
    } catch (err: any) {
      console.error('[AdminBookForm] Submit error:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
        hasResponse: !!err.response
      });
      setError(err.response?.data?.message || 'Failed to save book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/admin/books')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">{isEditMode ? 'Edit Book' : 'Add New Book'}</h1>
          <p className="text-muted">{isEditMode ? 'Update the details of an existing catalog entry.' : 'Add a new book to the store catalog.'}</p>
        </div>
      </div>

      {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Title</label>
              <input type="text" name="title" className="input-field" value={formData.title} onChange={handleChange} required placeholder="e.g. The Great Gatsby" />
            </div>
            <div className="input-group">
              <label className="input-label">Author</label>
              <input type="text" name="author" className="input-field" value={formData.author} onChange={handleChange} required placeholder="e.g. F. Scott Fitzgerald" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Category / Genre</label>
              <input type="text" name="genre" className="input-field" value={formData.genre} onChange={handleChange} required placeholder="e.g. Fiction" />
            </div>
            <div className="input-group">
              <label className="input-label">Price (₹)</label>
              <input type="number" name="price" step="0.01" className="input-field" value={formData.price} onChange={handleChange} required placeholder="0.00" />
            </div>
            <div className="input-group">
              <label className="input-label">Stock Quantity</label>
              <input type="number" name="stock" className="input-field" value={formData.stock} onChange={handleChange} required placeholder="0" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Image URL</label>
            <input type="url" name="coverImage" className="input-field" value={formData.coverImage} onChange={handleChange} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea name="description" className="input-field" value={formData.description} onChange={handleChange} required rows={5} placeholder="Enter book description..."></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => navigate('/admin/books')} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBookForm;
