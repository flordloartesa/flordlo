"use client";

import Link from 'next/link';
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation"; 
import { Trash2, Minus, Plus } from 'lucide-react'; // 1. Importar os ícones!

export default function CartSidebar() {
  // 2. Trazer o decreaseQuantity e addToCart do contexto
  const { cart, isCartOpen, toggleCart, removeFromCart, decreaseQuantity, addToCart, total } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Overlay Escura */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart} 
      />
      
      {/* Painel Lateral */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-serif text-slate-900">O seu Carrinho</h2>
          <button 
            onClick={toggleCart} 
            className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-4xl opacity-50">🛒</span>
              <p className="text-slate-500 font-medium">O seu carrinho está vazio.</p>
              <button 
                onClick={() => {
                  toggleCart();
                  router.push('/');
                }}
                className="text-[#9d6b73] font-bold hover:underline cursor-pointer tracking-wide"
              >
                Explorar produtos
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div 
                  key={item._id || Math.random().toString()} 
                  className="flex gap-4 border-b border-slate-100 pb-6 group"
                >
                  {/* Imagem do Produto */}
                  <div className="w-24 h-24 bg-slate-50 rounded-sm overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={item.imageUrl || "/placeholder.jpg"} 
                      alt={item.title} 
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Detalhes do Produto */}
                  <div className="flex-1 flex flex-col justify-between">
                    
                    {/* Título e Ícone de Remover */}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-slate-800 text-sm leading-tight group-hover:text-[#9d6b73] transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors p-1"
                        title="Remover produto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {/* Controlo de Quantidade e Preço */}
                    <div className="flex justify-between items-end mt-4">
                      
                      {/* Seletor de Quantidade */}
                      <div className="flex items-center border border-slate-200 rounded-sm">
                        <button 
                          onClick={() => decreaseQuantity(item._id)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-slate-800">
                          {item.quantity || 1}
                        </span>
                        <button 
                          onClick={() => addToCart(item)} // O addToCart já sabe que se o item existir, apenas soma +1 à quantidade
                          className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Preço Total do Item (Preço * Quantidade) */}
                      <p className="text-[#9d6b73] font-bold text-sm">
                        {(item.price * (item.quantity || 1)).toFixed(2)}€
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        {cart.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
            <div className="flex justify-between items-center text-lg font-bold text-slate-900">
              <span>Subtotal:</span>
              <span className="text-2xl font-serif text-[#9d6b73]">{total.toFixed(2)}€</span>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest">
              Portes calculados na próxima etapa
            </p>

            <div className="space-y-3">
              <Link href="/checkout" onClick={toggleCart} className="block w-full">
                <button className="w-full py-4 bg-[#9d6b73] hover:bg-[#85585f] text-white rounded-sm font-bold text-sm tracking-widest uppercase transition-colors cursor-pointer">
                  Finalizar Compra
                </button>
              </Link>

              <button 
                onClick={() => {
                  toggleCart();
                  router.push('/');
                }}
                className="w-full py-3 text-slate-400 hover:text-slate-800 transition-colors font-medium text-xs tracking-widest uppercase cursor-pointer"
              >
                ← Continuar a comprar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}