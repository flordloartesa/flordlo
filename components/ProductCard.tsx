'use client';

import Link from "next/link";
import SiteImage from "@/components/SiteImage";
import { useCart } from '@/app/context/CartContext'; 

export default function ProductCard({ produto }: { produto: any }) {
  const { addToCart } = useCart();

  // 🛡️ Defesa anti-crash: Se o produto não chegar aqui, não faz nada.
  if (!produto) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    // Impede que o clique no botão abra a página do produto (ativa só o carrinho)
    e.preventDefault(); 
    
    if (produto.status === 'Esgotado') return;

    addToCart({
      _id: produto._id,
      title: produto.title,
      price: produto.price,
      imageUrl: produto.imageUrl || '/placeholder.jpg',
      quantity: 1,
      weight: produto.weight || 0
    });
  };

  return (
    <Link 
      href={`/produto/${produto.slug}`} 
      className="group flex flex-col"
    >
      <div className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden mb-4 rounded-sm">
        
        {/* Badge de Esgotado */}
        {produto.status === 'Esgotado' && (
          <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 z-30 rounded-sm">
            Esgotado
          </span>
        )}

        {/* 1️⃣ Imagem Principal */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 z-10 ${produto.hoverImageUrl ? 'group-hover:opacity-0' : ''}`}>
          <SiteImage
            src={produto.imageUrl || '/placeholder.jpg'}
            alt={produto.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* 2️⃣ Segunda Imagem (Aparece no Hover/Touch) */}
        {produto.hoverImageUrl && (
          <div className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-700 group-hover:opacity-100 z-0">
            <SiteImage
              src={produto.hoverImageUrl}
              alt={`${produto.title} detalhe`}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        )}

        {/* 3️⃣ Overlay de Interatividade (Add to Cart + Ver detalhes) */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end overflow-hidden">
          
          {/* Botão Add to Cart no Centro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={handleAddToCart}
              disabled={produto.status === 'Esgotado'}
              className="bg-white text-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#9d6b73] hover:text-white transition-colors rounded-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {produto.status === 'Esgotado' ? 'Esgotado' : 'Adicionar'}
            </button>
          </div>

          {/* Barra "Ver detalhes" a subir do fundo */}
          <div className="w-full bg-white/95 backdrop-blur-sm text-center py-2.5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
              Ver detalhes
            </span>
          </div>
        </div>

      </div>

      {/* Detalhes de Texto */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-[#9d6b73] transition-colors line-clamp-2 mb-1">
          {produto.title}
        </h3>
        <p className="text-sm text-[#9d6b73] font-medium mt-auto">
          €{produto.price?.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}