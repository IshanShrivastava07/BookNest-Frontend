import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/axios';

export interface WishlistItem {
  itemId: number;
  wishlistId: number;
  bookId: number;
  bookTitle: string;
  author?: string;
  coverImage?: string;
  price: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  error: string;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (bookId: number) => boolean;
  toggleWishlist: (book: { bookId: number; title: string; author: string; coverImage: string; price: number; genre?: string }) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshWishlist = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.get('/wishlist');
      setItems(res.data);
    } catch (err: any) {
      console.error('[WishlistContext] Failed to load wishlist:', err);
      // Silence 401/403 as they are handled by auth interceptors
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync wishlist on mount and token changes
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // High-speed lookup for Heart visual active states
  const isInWishlist = useCallback((bookId: number) => {
    return items.some((item) => item.bookId === bookId);
  }, [items]);

  const toggleWishlist = async (book: { bookId: number; title: string; author: string; coverImage: string; price: number; genre?: string }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to manage your wishlist.');
      return;
    }

    const alreadyInWishlist = isInWishlist(book.bookId);
    const previousItems = [...items];

    if (alreadyInWishlist) {
      // 1. OPTIMISTIC REMOVE: instantly filter out of UI state
      setItems((prev) => prev.filter((item) => item.bookId !== book.bookId));

      try {
        await api.delete(`/wishlist/remove/${book.bookId}`);
        // Refresh silently from backend to synchronize absolute state
        const res = await api.get('/wishlist');
        setItems(res.data);
      } catch (err) {
        console.error('[WishlistContext] Failed to remove item:', err);
        // Rollback state on failure
        setItems(previousItems);
        alert('Failed to update wishlist. Reverting change.');
      }
    } else {
      // 2. OPTIMISTIC ADD: instantly append temporary item to UI state
      const tempItem: WishlistItem = {
        itemId: -Date.now(), // negative temporary ID
        wishlistId: 0,
        bookId: book.bookId,
        bookTitle: book.title,
        author: book.author,
        coverImage: book.coverImage,
        price: book.price,
      };
      setItems((prev) => [...prev, tempItem]);

      try {
        await api.post(`/wishlist/add/${book.bookId}`);
        // Refresh silently from backend to get the real DB generated item IDs
        const res = await api.get('/wishlist');
        setItems(res.data);
      } catch (err) {
        console.error('[WishlistContext] Failed to add item:', err);
        // Rollback state on failure
        setItems(previousItems);
        alert('Failed to add book to wishlist. Reverting change.');
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ items, loading, error, refreshWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
