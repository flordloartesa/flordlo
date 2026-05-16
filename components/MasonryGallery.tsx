'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ShareButton from './ShareButton'; // Importar o botão novo!

export default function MasonryGallery({ data }: { data: any }) {
  const IMAGES_PER_PAGE = 8;
  const [loadedCount, setLoadedCount] = useState(IMAGES_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  if (!data || !data.images || data.images.length === 0) return null;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && loadedCount < data.images.length) {
        setLoadedCount((prev) => Math.min(prev + IMAGES_PER_PAGE, data.images.length));
      }
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadedCount, data.images.length]);

  const visibleImages = data.images.slice(0, loadedCount);

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          {data.title && <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{data.title}</h2>}
          {data.description && <p className="text-sm md:text-base text-slate-500 leading-relaxed">{data.description}</p>}
        </div>

        <div className="columns-2 md:columns-4 gap-4 space-y-4">
          {visibleImages.map((img: any, index: number) => (
            <div key={index} className="break-inside-avoid relative group overflow-hidden rounded-sm">
              <img 
                src={img.url} 
                alt={img.alt || `Galeria ${index + 1}`} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {loadedCount < data.images.length && (
          <div ref={loaderRef} className="w-full h-20 flex items-center justify-center mt-8">
            <span className="text-slate-400 text-sm tracking-widest uppercase">A carregar mais...</span>
          </div>
        )}

        {/* 👉 NOVOS BOTÕES EMPILHADOS NO FUNDO */}
        <div className="mt-16 flex flex-col items-center gap-4">
          {data.buttons?.showContact && (
            <Link 
              href="/contacto" 
              className="mb-10 border border-[#9d6b73] text-[#9d6b73] hover:bg-[#9d6b73] hover:text-white px-8 py-3 text-sm font-bold tracking-widest uppercase rounded-sm transition-colors duration-300 text-center w-full md:w-auto"
            >
              Saber mais, contacte-nos
            </Link>
          )}

          {data.buttons?.showShare && (
            <ShareButton 
              title={data.buttons?.shareTitle} 
              message={data.buttons?.shareMessage} 
            />
          )}
        </div>

      </div>
    </section>
  );
}