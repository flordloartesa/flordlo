"use client";

import { useState, useEffect } from 'react';
import ShopCard from '@/components/ShopCard';

export default function CoursesCarousel({ courses, purchasedIds }: { courses: any[], purchasedIds: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isMounted, setIsMounted] = useState(false);

  // Responsividade: Define quantos cartões aparecem por ecrã
  useEffect(() => {
    setIsMounted(true);
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) setItemsPerView(1); // Mobile
      else if (window.innerWidth < 1024) setItemsPerView(2); // Tablet
      else setItemsPerView(4); // Desktop
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, courses.length - itemsPerView);

  // Autoplay de 5 segundos
  useEffect(() => {
    if (!isMounted || maxIndex <= 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [maxIndex, isMounted]);

  // Evita erros de hidratação (SSR vs Client)
  if (!isMounted) return null; 
  if (!courses || courses.length === 0) return null;

  // Matemática exata para o Track deslizar corretamente
  const trackWidth = (courses.length / itemsPerView) * 100;
  const itemWidth = 100 / courses.length;
  const transformX = currentIndex * (100 / courses.length);

  return (
    <div className="w-full relative">
      {/* Track do Carrossel */}
      <div className="overflow-hidden w-full pb-4 -mx-4 px-4 md:-mx-5 md:px-5">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            width: `${trackWidth}%`,
            transform: `translateX(-${transformX}%)`
          }}
        >
          {courses.map((item: any) => (
            <div key={item._id} style={{ width: `${itemWidth}%` }} className="px-4 md:px-5">
              <ShopCard
                {...item}
                isPurchased={purchasedIds.includes(item._id)}
                courseUrl={`/mindful-store/${item.slug}`}
                isOverlay={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bullets de Navegação */}
      {maxIndex > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === index ? "bg-[#2A2A32] w-8" : "bg-slate-300 w-2.5 hover:bg-slate-400"
              }`}
              aria-label={`Ver slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}