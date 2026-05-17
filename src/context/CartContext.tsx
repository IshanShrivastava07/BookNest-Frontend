import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/axios';

interface CartItem {
  itemId: number;
  cartId: number;
  bookId: number;
  bookTitle: string;
  author: string;
  coverImage: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  count: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (book: { bookId: number; title: string; price: number }) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await api.get('/cart');
      setItems(res.data);
    } catch {
      // 401 is handled by the axios interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (book: { bookId: number; title: string; price: number }) => {
    await api.post(`/cart/add/${book.bookId}`, null, { params: { quantity: 1 } });
    await refreshCart();
  };

  const removeFromCart = async (itemId: number) => {
    const item = items.find((i) => i.itemId === itemId);
    if (item) {
      await api.delete(`/cart/remove/${item.bookId}`);
    } else {
      await api.delete(`/cart/item/${itemId}`);
    }
    await refreshCart();
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    const item = items.find((i) => i.itemId === itemId);
    if (quantity <= 0) {
      if (item) {
        await api.delete(`/cart/remove/${item.bookId}`);
      } else {
        await api.delete(`/cart/item/${itemId}`);
      }
      await refreshCart();
      return;
    }
    if (item) {
      await api.put(`/cart/update/${item.bookId}`, null, { params: { quantity } });
    } else {
      await api.put(`/cart/item/${itemId}`, null, { params: { quantity } });
    }
    await refreshCart();
  };

  return (
    <CartContext.Provider value={{ items, total, count, loading, refreshCart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
