"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/app/context/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      // ✅ Estas duas linhas impedem o loop infinito de pedidos ao servidor
      refetchOnWindowFocus={false} 
      refetchInterval={0}          
    >
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}