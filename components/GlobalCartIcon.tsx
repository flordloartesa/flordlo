"use client";

import React from "react";
import { ShoppingBag } from "lucide-react"; 

// ⚠️ ATENÇÃO: Dependendo de como o teu carrinho funciona, o import abaixo pode ser diferente.
// Se usares a biblioteca 'use-shopping-cart', retira os comentários (//) destas duas linhas abaixo:
// import { useShoppingCart } from "use-shopping-cart";

export default function GlobalCartIcon() {
  
  // Se usares a biblioteca 'use-shopping-cart', retira os comentários desta linha:
  // const { cartCount, handleCartClick } = useShoppingCart();

  return (
    <button
      // Se usares a biblioteca 'use-shopping-cart', retira os comentários da linha abaixo para o clique funcionar:
      // onClick={() => handleCartClick()}
      className="fixed z-[60] bottom-24 right-6 bg-white p-4 rounded-full shadow-xl border border-[#9d6b73]/20 text-slate-700 hover:text-[#9d6b73] hover:scale-105 transition-all duration-300"
      aria-label="Ver Carrinho de Compras"
    >
      <ShoppingBag size={28} strokeWidth={1.5} />
      
      {/* Se usares o use-shopping-cart, podes usar a variável cartCount para mostrar o número */}
      {/* cartCount && cartCount > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-[#9d6b73] rounded-full shadow-sm">
          {cartCount}
        </span>
      ) */}
    </button>
  );
}