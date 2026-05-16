"use client";

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from '@/components/MyLink';

// --- DADOS DOS ESTUDOS ---
const studiesData = [
  {
    id: 1,
    title: "Lessons for the Health-care Practitioner from Buddhism",
    link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6330872/",
    bgColor: "#F0DFD1",
    bgHoverImage: "url('https://images.unsplash.com/photo-1597020976626-04261b0fac2a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
  },
  {
    id: 2,
    title: "Metta and Compassion Meditation: Potential for Psychological Interventions",
    link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3176989/",
    bgColor: "#EAF475",
    bgHoverImage: "url('https://images.unsplash.com/photo-1461766705442-58d58276121a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTIzfHxtZWRpdGF0aW9ufGVufDB8fDB8fHww')"
  },
  {
    id: 3,
    title: "Beyond kindness: a proposal for the flourishing of science and...",
    link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10663797/",
    bgColor: "#B9DDFF",
    bgHoverImage: "url('https://plus.unsplash.com/premium_photo-1688464907518-e050404f3a04?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8d2VsbCUyMGJlaW5nfGVufDB8fDB8fHww')"
  },
  {
    id: 4,
    title: "Buddhist-Derived Meditation Practices for Prosocial Behaviour",
    link: "https://link.springer.com/article/10.1007/s12671-024-02323-8",
    bgColor: "#FFB8B2",
    bgHoverImage: "url('https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
  },
  {
    id: 5,
    title: "Exploring tranquility: Eastern and Western perspectives",
    link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9376312/",
    bgColor: "#9DEAB2",
    bgHoverImage: "url('https://plus.unsplash.com/premium_photo-1712935717089-e962a231ca75?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDh8fHxlbnwwfHx8fHw%3D')"
  },
  {
    id: 6,
    title: "The health impact of residential retreats: a systematic review ",
    link: "https://pubmed.ncbi.nlm.nih.gov/29316909/",
    bgColor: "#C4CAEE",
    bgHoverImage: "url('https://images.unsplash.com/uploads/14122810486321888a497/1b0cc699?q=80&w=3200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
  },
  {
    id: 7,
    title: "Is Compassion Trainable? A Neuroscientific Perspective",
    link: "https://academic.oup.com/book/31723/chapter-abstract/265474473",
    bgColor: "#acf7eb",
    bgHoverImage: "url('https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fHJldHJlYXR8ZW58MHx8MHx8fDA%3D')"
  }
];

export default function StudiesSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      dragFree: true
    },
    [
      Autoplay({ 
        delay: 5000, // Play after 5s
        stopOnInteraction: false 
      })
    ]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section 
      className="py-16 w-full relative"
      style={{ background: 'url(https://meditt.space/img/assets/wave-pattern.svg) repeat' }}
    >
      <div className="container mx-auto px-2 max-w-[1000px]">
        
        {/* CABEÇALHO DO SLIDER DOS ESTUDOS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 pr-4 ml-4">
          <div className="max-w-[800px]">
            <h2 className="text-3xl md:text-[35px] font-bold text-[#005c65] mb-2 leading-tight font-exposure pt-5">
              Science validates these practices and retreats
            </h2>
    <p className="!text-[18px] !text-[#005c65] font-maax font-medium">
  in cultivating health and well-being
</p>
          </div>

          {/* BOTÕES DE NAVEGAÇÃO */}
          <div className="flex gap-3 flex-shrink-0 mt-4 md:mt-0">
            <button 
              onClick={scrollPrev} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-slate-200 transition-all text-[#005c65] shadow-md border border-slate-100 z-10"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button 
              onClick={scrollNext} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-slate-200 transition-all text-[#005c65] shadow-md border border-slate-100 z-10"
              aria-label="Seguinte"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ÁREA DO CAROUSEL (EMBLA) */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-4 py-4">
            
            {studiesData.map((study) => (
              <div 
                key={study.id} 
                // Responsividade: 90% mobile, 45% tablet, 32.5% desktop
                className="flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_32.5%] min-w-0 pl-4"
              >
                {/* CARTÃO INDIVIDUAL COM HOVER EFFECT */}
                <div 
                  className="study-card group relative h-[350px] rounded-[8px] p-5 overflow-hidden transition-all duration-700 ease-in-out border-0"
                  style={{ backgroundColor: study.bgColor }}
                >
                  {/* Overlay background on Hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out z-0"
                    style={{
                      background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), ${study.bgHoverImage}`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center center'
                    }}
                  />

                  {/* Conteúdo do Cartão */}
                  <div className="relative z-10 h-full flex flex-col">
                    <h1 className="study-title text-[#005c65] group-hover:text-white transition-colors duration-300 font-exposure text-[27px] leading-[31px] font-bold text-left mt-[20%]">
                      {study.title}
                    </h1>

                    <Link 
                      href={study.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="button-cta absolute bottom-[30px] left-[10%] w-[140px] h-[30px] rounded-[10px] text-white font-medium text-[14px] flex items-center justify-center transition-all duration-500 hover:shadow-[0_1px_40px_rgba(80,63,205,0.5)] z-20 outline-none border-none"
                      style={{
                        background: '#004654',
                        textShadow: '0px 3px 8px rgba(0,0,0,0.25)'
                      }}
                    >
                      Study
                    </Link>
                  </div>
                  
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

      <style jsx global>{`
        /* Importação da fonte Exposurevar */
        @font-face {
          font-family: 'Exposurevar';
          src: url('https://assets.website-files.com/607eeb97c99742640436520b/6627ab9e8f6d5957abe49572_ExposureVAR.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        /* Tipografia */
        .font-exposure { font-family: 'Exposurevar', 'Playfair Display', serif; }
        .font-maax { font-family: 'Maax', 'Roboto', sans-serif; }
        
        /* O hover effect sem sombra no texto */
        .study-card:hover .study-title {
          color: #fff !important;
        }
      `}</style>
    </section>
  );
}