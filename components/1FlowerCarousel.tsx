'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // 👈 IMPORTAÇÃO ADICIONADA

// ✅ Reativei e organizei as formas orgânicas (Border Radius)
const shapes = [
  '60% 40% 30% 70% / 60% 30% 70% 40%',
  '40% 60% 70% 30% / 40% 50% 60% 50%',
  '50% 50% 30% 70% / 60% 30% 70% 40%',
  '40% 60% 50% 50% / 50% 40% 60% 50%'
];

export default function FlowerCarousel({ data }: { data: any[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // 🛡️ ESTADO PARA EVITAR ERRO DE HYDRATION
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        
        // Se chegar ao fim, volta ao início
        if (scrollLeft + clientWidth >= scrollWidth - 50) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Ajuste de scroll: no mobile anda um card, no desktop anda 1/3 do ecrã
          const scrollAmount = clientWidth < 768 ? clientWidth : clientWidth / 3;
          carouselRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
        }
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [isMounted]);

  // Se os dados não existirem, não mostra nada
  if (!data || data.length === 0) return null;

  if (!isMounted) {
    return <div className="min-h-[400px]" />; // Espaço reservado vazio
  }

  // Duplicamos a lista para criar o efeito de scroll contínuo (opcional)
  const items = [...data, ...data];

  return (
    <div className="relative w-full max-w-[1600px] mx-auto px-4 py-12 mt-20">
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 lg:gap-12 pb-8 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => {
          // 👇 DETERMINA SE EXISTE UM LINK VÁLIDO PARA ENVOLVER O CARD 👇
          const href = item.linkUrl || item.link || null;
          
          const CardContent = (
            <>
              {/* CONTAINER DA IMAGEM COM FORMA ORGÂNICA */}
              <div 
                className="relative w-full aspect-square overflow-hidden transition-transform duration-700 group-hover:scale-105"
                style={{ 
                  borderRadius: shapes[index % shapes.length] // Aplica as formas sequencialmente
                }}
              >
                <Image 
                  src={item.imageUrl || '/placeholder.jpg'}
                  alt={item.title || "Flor.d.Ló"}
                  fill
                  sizes="(max-width: 768px) 75vw, (max-width: 1024px) 35vw, 25vw"
                  className="object-cover"
                />
              </div>

              {/* ETIQUETA COM O TÍTULO */}
              <div className="absolute top-4 -right-2 md:top-10 md:right-0 z-10 transition-transform duration-500 group-hover:scale-110">
                <div 
                  className="bg-[#D88A96] text-white px-5 py-2 text-base md:text-xl font-serif italic tracking-wide shadow-md"
                  style={{ 
                    borderRadius: '2px 16px 2px 14px', 
                    transform: 'rotate(-3deg)' 
                  }}
                >
                  {item.title}
                </div>
              </div>
            </>
          );

          return (
            <div 
              key={`${item._id}-${index}`} 
              className="relative min-w-[75%] md:min-w-[35%] lg:min-w-[25%] flex-shrink-0 snap-center group cursor-pointer"
            >
              {/* 👇 APLICA O LINK SE EXISTIR, SENÃO MANTÉM SÓ O HTML 👇 */}
              {href ? (
                <Link href={href} className="block w-full h-full">
                  {CardContent}
                </Link>
              ) : (
                <div className="block w-full h-full">
                  {CardContent}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}