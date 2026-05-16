'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import EspecialidadeCard from '@/app/especialidades/EspecialidadeCard';

export default function EspecialidadesCarousel({ items }: { items: any[] }) {
  // 1. Estados para os bullets
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  // 2. Função para navegar ao clicar no bullet
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  // 3. Atualizar o estado dos bullets quando o carrossel move
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, setScrollSnaps, onSelect]);

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full z-20  mb-20 isolate">
      <div className="w-full max-w-[1640px] mx-auto relative px-6">
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-[25px]">
            {items.map((item) => (
              <div 
                key={item._id} 
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_25.00%] min-w-0 pl-[25px]"
              >
                <EspecialidadeCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* 4. BULLETS MODERNOS */}
        <div className="flex justify-center items-center gap-3 mt-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${index === selectedIndex 
                  ? 'w-8 bg-blue-600' // Bullet ativo: Formato de "Pill" e cor de destaque
                  : 'w-2 bg-gray-300 hover:bg-gray-400' // Bullet inativo: Círculo cinza
                }
              `}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}