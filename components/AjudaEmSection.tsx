'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from '@/components/MyLink';

const ajudaItems = [
  "Aprender Mindfulness", "Relacionamentos", "Gestão da reatividade e fúria", "TOC",
  "Ansiedade & stress", "Transtornos do humor", "Doenças crónicas", "Aprenda a viver",
  "Stress ocupacional ou académico", "Perturbações do sono e/ou vigília", "Desordens alimentares", "Mais..."
];

const slides = [
  {
    tag: "Mindfulness e TCC",
    title: "Aprenda a gerir o impacto do stress e da reatividade",
    footer: "na doença, saúde e cura.",
    img: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=800&q=80"
  },
  {
    tag: "Auto-regulação",
    title: "A Psicologia contemporânea considera a auto-regulação central",
    footer: "na saúde mental.",
    img: "https://images.unsplash.com/photo-1551847533-7d438a3c15da?auto=format&fit=crop&w=800&q=80"
  },
    {
    tag: "Mindfulness e TCC",
    title: "Auto-regulação: os seus desequilíbrios estão subjacentes a várias",
    footer: "vulnerabilidades mentais.",
    img: "https://plus.unsplash.com/premium_photo-1672743593121-ddc2fee0e62b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80"
  },
    {
    tag: "Mindfulness e TCC",
    title: "Desenvolva uma prática formal",
    footer: "de mindfulness e de breathwork.",
    img: "https://images.unsplash.com/photo-1581088660160-9f29ea4969af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1365&q=80"
  }


  
];

export default function AjudaEmSection({ item }: { item?: any }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 bg-white font-sans"> {/* font-sans aplica Inter */}
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        
        {/* LADO ESQUERDO: O SLIDER */}
        <div className="w-full lg:w-1/3">
          <div className="relative">
            <div className="overflow-hidden rounded-[20px] shadow-[20px_20px_60px_rgba(169,180,207,0.4)]" ref={emblaRef}>
              <div className="flex">
                {slides.map((slide, index) => (
                  <div key={index} className="flex-[0_0_100%] relative h-[450px]">
                    <img src={slide.img} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <p className="text-[10px] uppercase font-bold tracking-widest mb-2 opacity-80">{slide.tag}</p>
                      <h3 className="text-xl font-bold leading-tight mb-2">{slide.title}</h3>
                      <p className="text-xs font-medium text-emerald-400">
                        <span className="mr-1">✓</span> {slide.footer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BULLETS (INDICADORES) EM #2490EB */}
            <div className="flex justify-center gap-2 mt-6">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex ? 'w-8 bg-[#2490EB]' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: TEXTO E LISTA */}
<div className="w-full lg:w-2/3 mt-5"> {/* ✅ Adicionado mt-5 para 20px de margin-top */}
  <h2 className="text-[42px] text-[#265ACC] mb-2 font-sans font-semibold leading-tight">
    Ajuda em
  </h2>
  <p className="text-gray-500 mb-10 font-medium">
    Maior regulação cognitiva e emocional!
  </p>
  
  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4 mb-10">
    {ajudaItems.map((itemText, idx) => (
      <li key={idx} className="flex items-start gap-2 text-[14px] font-bold text-[#186C82]">
        <span className="text-[emerald]-500 mt-0.5 flex-shrink-0">✓</span>
        <span className={itemText === "Mais..." ? "text-gray-400 italic font-normal" : ""}>
          {itemText}
        </span>
      </li>
    ))}
  </ul>

  {/* BOTÃO EM GRADIENTE */}
  <Link 
    href={`/marcacao?id=${item?._id}&nome=${item?.title}`} 
    className="inline-flex items-center justify-center text-white px-12 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#265ACC] to-[#0000FF] hover:brightness-110 shadow-xl transition-all"
  >
    Agendar
  </Link>
</div>

      </div>
    </section>
  );
}