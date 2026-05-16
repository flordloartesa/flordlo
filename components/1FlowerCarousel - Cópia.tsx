'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

// As 4 imagens originais
const baseItems = [
  {
    id: 1,
    title: 'arranjos em vaso',
    img: 'https://64.media.tumblr.com/9fb8c820e74ba26be07e2ade48410eca/661c0dd2be822f90-f8/s540x810/1ca63ca04c84bd811b6bc23ae98a07e6cbef09c6.webp',
    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' 
  },
  {
    id: 2,
    title: 'bouquets',
    img: 'https://64.media.tumblr.com/8447a732bf5b3a9bcff78f98ed7f1cca/661c0dd2be822f90-1b/s540x810/4750b646f8557b1ac6cbea38244fa034b3eb7562.webp',
    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%'
  },
  {
    id: 3,
    title: 'presentes',
    img: 'https://64.media.tumblr.com/27f1a9c41c6b401698036275e8ff0f0b/661c0dd2be822f90-c6/s540x810/37fe358e6c183d5722b97af4bb7103881d49b633.webp',
    borderRadius: '50% 50% 30% 70% / 60% 30% 70% 40%'
  },
  {
    id: 4,
    title: 'redomas',
    img: 'https://64.media.tumblr.com/d76a0642ec6283ded2acc3c0e838819a/661c0dd2be822f90-c8/s540x810/1b93b1c9ff642150e2698cba962a5794a2132f10.webp',
    borderRadius: '40% 60% 50% 50% / 50% 40% 60% 50%'
  }
];

// Duplicamos a lista para criar um efeito de scroll contínuo
const items = [...baseItems, ...baseItems.map(item => ({ ...item, id: item.id + 4 }))];

export default function FlowerCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        
        if (scrollLeft + clientWidth >= scrollWidth - 50) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const scrollAmount = clientWidth < 768 ? clientWidth : clientWidth / 3;
          carouselRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
        }
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[1600px] mx-auto px-4 py-12">
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 lg:gap-12 pb-8 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="relative min-w-[75%] md:min-w-[35%] lg:min-w-[25%] flex-shrink-0 snap-center group cursor-pointer"
          >
            <div 
              className="relative w-full aspect-square  overflow-hidden transition-transform duration-700 group-hover:scale-105"
              style={{ borderRadius: item.borderRadius }}
            >
              <Image 
                src={item.img}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>

            <div className="absolute top-4  -right-2  md:top-10 md:right-10 z-10 transition-transform duration-500 group-hover:scale-110">
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
          </div>
        ))}
      </div>
    </div>
  );
}