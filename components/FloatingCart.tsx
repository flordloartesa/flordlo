"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function FloatingCart() {
  const pathname = usePathname();
  const { cart, toggleCart } = useCart();

  // 1. FILTROS DE VISIBILIDADE
  const isStorePage = pathname.startsWith('/mindful-store');
  
  const isHiddenPage = 
    pathname.includes("/auth/") || 
    pathname.includes("/dashboard") || 
    pathname.includes("-player");

  if (cart.length === 0 || !isStorePage || isHiddenPage) return null;

  return (
    <div className="fixed top-24 right-6 z-[100]">
      
      <button 
        onClick={toggleCart}
        className="relative group cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-95"
        aria-label="Ver Carrinho"
      >
        {/* Botão Círculo Principal - Dark para contraste */}
        <div className="bg-[#1a1a2e] text-white p-3.5 rounded-full shadow-2xl border border-white/10 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        
        {/* ✅ BADGE ATUALIZADO: De verde para Azulão (#3D81F1) */}
        <span className="absolute -top-1 -right-1 bg-[#3D81F1] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black shadow-md animate-in zoom-in duration-300">
          {cart.length}
        </span>

        {/* Tooltip */}
        <div className="absolute right-0 mt-3 hidden group-hover:block bg-white text-[#1a1a2e] text-[11px] py-2 px-3 rounded-xl shadow-xl whitespace-nowrap border border-gray-100 font-bold animate-in fade-in slide-in-from-top-2">
          Ver Carrinho
        </div>
      </button>
    </div>
  );
}