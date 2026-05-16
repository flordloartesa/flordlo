"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import TrackCard from "./TrackCard";
// Importamos o MyLink para o card "Ver Mais"
import Link from "@/components/MyLink"; 

export default function HomepageCarousel({ title, tracks }: { title: string, tracks: any[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayedTracks = tracks.slice(0, 10);
  const hasMore = tracks.length > 10;
  const courseSlug = tracks[0]?.courseSlug;
  
  const totalItems = displayedTracks.length + (hasMore ? 1 : 0);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" 
        ? -sliderRef.current.offsetWidth * 0.7 
        : sliderRef.current.offsetWidth * 0.7;
      
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollToIndex = (index: number) => {
    if (sliderRef.current) {
      const targetSlide = sliderRef.current.children[index] as HTMLElement;
      if (targetSlide) {
        sliderRef.current.scrollTo({
          left: targetSlide.offsetLeft,
          behavior: "smooth"
        });
      }
    }
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    const scrollPercentage = scrollLeft / maxScroll;
    const newIndex = Math.round(scrollPercentage * (totalItems - 1));
    
    // Otimização: Só atualiza o estado se o index realmente mudou
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  if (!tracks || tracks.length === 0) return null;

  return (
    <section className="mb-15 relative group/section px-2">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-[#1E293B] tracking-normal">
          {title}
        </h2>
        <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100 flex-shrink-0 ml-2">
          {tracks.length} Áudios
        </span>
      </div>
      
      <button 
        onClick={() => scroll("left")}
        className="hidden lg:flex absolute left-[-25px] top-[40%] -translate-y-1/2 w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-slate-100 items-center justify-center z-30 text-slate-800 transition-all hover:scale-110 active:scale-90"
      >
        <ChevronLeft className="w-8 h-8" strokeWidth={3} />
      </button>

      <div 
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth px-2"
      >
        {displayedTracks.map((track) => (
          <div key={track._id} className="snap-start">
            <TrackCard track={track} />
          </div>
        ))}

        {/* 🎯 CORREÇÃO: "VER MAIS" agora usa o MyLink para evitar prefetch e window.open */}
        {hasMore && (
          <Link 
            href={`/cursos/${courseSlug}`}
            className="snap-start flex-none w-[200px] md:w-[250px] group/more no-underline"
          >
            <div className="w-full aspect-[3/4] rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center group-hover/more:border-blue-400 group-hover/more:bg-blue-50/50 transition-all duration-500">
              <div className="bg-blue-100 p-6 rounded-full group-hover/more:scale-110 transition-transform mb-6">
                <Plus className="w-8 h-8 text-blue-600" strokeWidth={3} />
              </div>
              <span className="text-xl font-black text-slate-800 uppercase italic text-center leading-tight">
                Ver Mais<br/>
                <span className="text-xs italic lowercase font-medium text-slate-500">
                  +{tracks.length - 10} práticas
                </span>
              </span>
            </div>
            <div className="h-[70px] w-full"></div> 
          </Link>
        )}
      </div>

      <button 
        onClick={() => scroll("right")}
        className="hidden lg:flex absolute right-[-25px] top-[40%] -translate-y-1/2 w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-slate-100 items-center justify-center z-30 text-slate-800 transition-all hover:scale-110 active:scale-90"
      >
        <ChevronRight className="w-8 h-8" strokeWidth={3} />
      </button>

      <div className="flex lg:hidden justify-center items-center gap-2 -mt-2">
        {Array.from({ length: totalItems }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Ir para o item ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeIndex === idx ? "w-6 bg-[#009ca6]" : "w-2 bg-slate-200 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}