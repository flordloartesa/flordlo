'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

export default function ProductGrid({ products }: { products: any[] }) {
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = (product: any) => {
    setAddingToCart(product._id);
    
    // Adiciona o produto real ao nosso Carrinho!
    addToCart({
      _id: product._id,
      title: product.title,
      price: product.price,
      imageUrl: product.image1 || '/placeholder.jpg',
      quantity: 1,
      weight: product.weight
    });
    
    setTimeout(() => {
      setAddingToCart(null);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
      {products.map((product) => (
        <div key={product._id} className="flex flex-col group">
          
          <Link href={`/produto/${product.slug}`} className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 mb-4 rounded-sm">
            <Image 
              src={product.image1 || '/placeholder.jpg'} 
              alt={product.title} 
              fill 
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-opacity duration-500 ease-in-out opacity-100 group-hover:opacity-0"
            />
            
            {product.image2 && (
              <Image 
                src={product.image2} 
                alt={`${product.title} - Detalhe`} 
                fill 
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100"
              />
            )}

            {/* 👉 AQUI ESTÁ A ALTERAÇÃO: Removi as classes de animação e de esconder no mobile */}
            <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
              <p className="text-white text-center text-sm font-medium tracking-wide">Ver Detalhes</p>
            </div>
          </Link>

          <div className="text-center px-2 flex flex-col flex-grow">
            <Link href={`/produto/${product.slug}`}>
              <h3 className="text-sm md:text-base font-serif text-slate-800 hover:text-[#9d6b73] transition-colors mb-1 line-clamp-1">
                {product.title}
              </h3>
            </Link>
            <p className="text-sm font-medium text-slate-500 mb-4">
              €{product.price?.toFixed(2)}
            </p>
            
            <button 
              onClick={() => handleAddToCart(product)}
              disabled={addingToCart === product._id || product.status === 'Esgotado'}
              className="mt-auto w-full py-2.5 md:py-3 border border-[#9d6b73] text-[#9d6b73] hover:bg-[#9d6b73] hover:text-white transition-colors text-xs md:text-sm font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
            >
              {product.status === 'Esgotado' 
                ? 'Esgotado' 
                : addingToCart === product._id 
                  ? 'Adicionado ✓' 
                  : 'Adicionar'}
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}