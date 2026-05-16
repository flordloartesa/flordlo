"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ShopCard from "./ShopCard";

export default function AccessoriesCarousel({ items }: { items: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps"
  }, [
    Autoplay({ delay: 4000, stopOnInteraction: false })
  ]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, setScrollSnaps, onSelect]);

  return (
    <div className="relative group">
      <div className="overflow-hidden px-1" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-6">
          {items.map((item) => {
            
            // 🚨 TRUQUE DE DETETIVE: Isto vai imprimir os dados do produto no teu browser!
            console.log(`DADOS RECEBIDOS DO SANITY PARA: ${item.title}`, item);

            // A nossa lógica correta
            const precoReal = item.price || item.sizes?.[0]?.price || item.variations?.[0]?.price || item.variants?.[0]?.price || 0;
            const descontoReal = item.discountPrice || item.sizes?.[0]?.discountPrice || item.variations?.[0]?.discountPrice || item.variants?.[0]?.discountPrice || null;
            const safeSlug = item.slug?.current || item.slug;

            return (
              <div
                key={item._id || safeSlug}
                className="flex-[0_0_85%] min-w-0 pl-4 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] md:pl-6"
              >
                <ShopCard
                  {...item}
                  price={precoReal}
                  discountPrice={descontoReal}
                  buttonText="Ver Opções"
                  courseUrl={`/mindful-store/produto/${safeSlug}`}
                  hideInstructor={true}
                  isOverlay={true}
                  isAccessory={true}
                />
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={scrollPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg border border-slate-100 p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 hidden md:block">
        <ChevronLeft size={24} className="text-slate-700" />
      </button>

      <button onClick={scrollNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg border border-slate-100 p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-300 hidden md:block">
        <ChevronRight size={24} className="text-slate-700" />
      </button>

      <div className="flex justify-center gap-2 mt-8">
        {scrollSnaps.map((_, index) => (
          <button key={index} onClick={() => scrollTo(index)} className={`h-1.5 transition-all duration-300 rounded-full ${index === selectedIndex ? "w-8 bg-[#3D81F1]" : "w-2 bg-slate-200"}`} />
        ))}
      </div>
    </div>
  );
}