"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  _id: string;
  id?: string; // Adicionado por segurança para a função getItemId
  title: string;
  price: number;
  imageUrl?: string;
  slug?: string;
  weight?: number;
  _type?: string;
  quantity?: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  decreaseQuantity: (id: string | number) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Função auxiliar para ter a certeza absoluta de qual é o ID do produto
  const getItemId = (item: CartItem) => item._id || item.id;

  // 1. HIDRATAÇÃO
  useEffect(() => {
    const saved = localStorage.getItem('flordlo_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar o carrinho", e);
      }
    }
  }, []);

  // 2. PERSISTÊNCIA
  useEffect(() => {
    localStorage.setItem('flordlo_cart', JSON.stringify(cart));
  }, [cart]);

  // 3. ADICIONAR (AGORA SOMA AS QUANTIDADES CORRETAMENTE!)
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const itemId = getItemId(item);
      const exists = prev.find((i) => String(getItemId(i)) === String(itemId));
      
      // Capturamos a quantidade que o cliente escolheu (se não escolheu, assume 1)
      const quantityToAdd = item.quantity || 1;
      
      if (exists) {
        // Se já existe no carrinho, SOMAMOS a quantidade existente com a quantidade nova
        return prev.map((i) => 
          String(getItemId(i)) === String(itemId)
            ? { ...i, quantity: (i.quantity || 1) + quantityToAdd } 
            : i
        );
      }
      
      // Se é novo no carrinho, adicionamos com a quantidade que o cliente escolheu
      return [...prev, { ...item, quantity: quantityToAdd }];
    });
    setIsCartOpen(true);
  };

  // 4. DIMINUIR QUANTIDADE 
  const decreaseQuantity = (id: string | number) => {
    setCart((prev) => prev.map(item => {
      if (String(getItemId(item)) === String(id)) {
        const newQuantity = Math.max(1, (item.quantity || 1) - 1);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // 5. REMOVER 
  const removeFromCart = (id: string | number) => {
    setCart((prev) => prev.filter(item => String(getItemId(item)) !== String(id)));
  };

  const clearCart = () => setCart([]);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const total = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        isCartOpen, 
        addToCart, 
        decreaseQuantity,
        removeFromCart, 
        clearCart, 
        toggleCart, 
        total 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de um CartProvider");
  return context;
};