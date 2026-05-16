'use client';
import { useRef, useEffect, useState } from 'react';

export default function TestimonialsCarousel({ testemunhos }: { testemunhos: any[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section 
      className="py-24 bg-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 max-w-2xl leading-tight">
            What experts are saying about this:
          </h2>
          <div className="flex gap-4">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-[#005C65] text-[#005C65] flex items-center justify-center hover:bg-[#005C65] hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-[#005C65] text-[#005C65] flex items-center justify-center hover:bg-[#005C65] hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div ref={carouselRef} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {testemunhos?.map((item, i) => (
            <div key={i} className="snap-start shrink-0 w-[85vw] md:w-[400px] lg:w-[450px] border border-[#005C65] rounded-[2rem] p-8 md:p-10 flex flex-col bg-white hover:shadow-lg transition-shadow">
              <div className="mb-6 flex justify-center">
                <img src={item.imagem} alt={item.nome} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
              </div>
              <h3 className="text-xl font-bold text-[#005C65] mb-4 text-center leading-snug">{item.titulo}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1 text-center">{item.texto}</p>
              <p className="text-sm font-bold italic text-[#005C65] text-center mt-auto">- {item.nome}</p>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; }`}} />
    </section>
  );
}