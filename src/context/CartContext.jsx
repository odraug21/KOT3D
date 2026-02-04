import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "kot3d_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price) || 0,
          cover_url: product.cover_url || "",
          qty,
        },
      ];
    });
  };

  const removeFromCart = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  const setQty = (id, qty) => {
    const q = Math.max(1, Number(qty) || 1);
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: q } : x)));
  };

  const clearCart = () => setItems([]);

  const count = useMemo(() => items.reduce((acc, x) => acc + x.qty, 0), [items]);
  const total = useMemo(() => items.reduce((acc, x) => acc + x.price * x.qty, 0), [items]);

  const value = { items, addToCart, removeFromCart, setQty, clearCart, count, total };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
