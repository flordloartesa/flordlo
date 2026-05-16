"use client";

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- DADOS DO SLIDER ---
const topicsData = [
  {
    id: 1,
    badge: "Weekend",
    subtitle: "Foundations",
    title: "Why mindfulness is relevant?",
    items: [
      "What is mindfulness",
      "To support and strengthen the practice of mindfulness",
      "To reflect on and discuss the importance of embodying the attitudinal foundations of mindfulness",
      "Developing embodied mindfulness"
    ]
  },
  {
    id: 2,
    badge: "Full Retreat",
    subtitle: "The Four Brahmaviharas",
    title: "The four immeasurables",
    items: [
      "The four divine abodes, also known as the four immeasurables, or brahmaviharas in Sanskrit, are the supreme emotions or mental states. They are: loving-kindness, compassion, empathetic joy, and equanimity.",
      "These four give us a framework to cultivate positive behaviors and minimize harmful ones."
    ]
  },
  {
    id: 3,
    badge: "1st Quality",
    subtitle: "1. Loving-Kindness",
    title: "Metta",
    items: [
      "Loving-kindness is the sincere wish for the well-being, happiness, and safety of all beings, including oneself",
      "Loving-kindness, or metta, involves cultivating a boundless and unconditional love that transcends personal biases, boundaries, and preferences",
      "We'll practice extending loving-kindness towards all beings, regardless of your relationship or behavior."
    ]
  },
  {
    id: 4,
    badge: "2nd Quality",
    subtitle: "2. Compassion",
    title: "Karuna",
    items: [
      "Compassion is our empathetic response to the suffering of ourselves and others",
      "It is the heartfelt desire to alleviate all suffering and the commitment to actively help all beings and support them in their difficulties",
      "Compassion arises from recognizing the interconnectedness and shared vulnerability of all beings"
    ]
  },
  {
    id: 5,
    badge: "3rd Quality",
    subtitle: "3. Empathetic Joy",
    title: "Mudita",
    items: [
      "which comes from the root moon which means to rejoice. Empathetic joy is genuinely rejoicing in the happiness, success, and well-being of others",
      "Mudita is commonly considered to be the vaccine that prevents the arising of envy and jealousy because when you are happy about the good fortune of sentient beings",
      "Practice empathetic joy will allow us to share in the happiness of others without self-centeredness"
    ]
  },
  {
    id: 6,
    badge: "4th Quality",
    subtitle: "4. Equanimity",
    title: "Upekkha",
    items: [
      "Equanimity is the state of balance, calmness, and non-reactivity toward the changing conditions of life",
      "Why equanimity is the balancing point which keeps us from falling into the sadness of the world",
      "Equanimity is a balancing factor which keeps us from falling into attachment and aversion",
      "It involves accepting all that happens to us — pleasure and pain, gain and loss, success and failure — with an even-minded attitude. Equanimity allows us to respond to situations with clarity, wisdom, and impartiality"
    ]
  },
  {
    id: 7,
    badge: "Integration",
    subtitle: "Why practice these qualities?",
    title: "The antidotes",
    items: [
      "These four divine abodes are considered virtuous qualities that contribute to personal happiness, harmonious relationships, and the welfare of all beings",
      "We will practice and cultivate these qualities through meditation, reflection, and daily mindfulness practices, aiming to expand our capacity for love, compassion, joy, and equanimity.",
      "How to integrate into daily life"
    ]
  },
  {
    id: 8,
    badge: "Conclusion",
    subtitle: "How to keep the practice alive",
    title: "Integration and next steps",
    items: [
      "Reflect on the importance of continuous mindfulness practice in daily life",
      "Explore tools and resources to maintain the practice of mindfulness and self-care",
      "Celebrating achievements and learning",
      "Closing and sharing experiences (optional)"
    ]
  }
];

export default function TopicsSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      dragFree: true
    },
    [
      Autoplay({ 
        delay: 7000, 
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
    <section className="py-16 w-full relative bg-white">
      <div className="container mx-auto px-6 max-w-[1500px]">
        
        {/* CABEÇALHO COM TÍTULOS E BOTÕES DE NAVEGAÇÃO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-[35px] font-bold text-[#005c65] mb-4 leading-tight font-exposure">
              This Retreat will include Mindfulness, Chi-Kung & some Yoga Practices, Contact with Nature + Psychoeducation
            </h2>
            <p className="text-lg text-[#005c65] font-maax font-medium">
              Some of the topics that will be covered
            </p>
          </div>
          
          <div className="flex gap-3 flex-shrink-0">
            <button 
              onClick={scrollPrev} 
              className="w-12 h-12 flex items-center justify-center rounded-full border border-[#005c65] bg-white hover:bg-slate-100 hover:scale-105 transition-all text-[#005c65] shadow-sm"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <button 
              onClick={scrollNext} 
              className="w-12 h-12 flex items-center justify-center rounded-full border border-[#005c65] bg-white hover:bg-slate-100 hover:scale-105 transition-all text-[#005c65] shadow-sm"
              aria-label="Seguinte"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ÁREA DO CAROUSEL (EMBLA) */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          {/* Wrapper flex que contém os slides */}
          <div className="flex -ml-6 py-4">
            
            {topicsData.map((topic) => (
              <div 
                key={topic.id} 
                // Responsivo: 95% no telemóvel, 50% em tablets, 30% em ecrãs grandes
                className="flex-[0_0_95%] md:flex-[0_0_50%] lg:flex-[0_0_30%] min-w-0 pl-6"
              >
                {/* CARTÃO INDIVIDUAL */}
                <div className="border border-[#005c65] rounded-[25px] p-8 md:p-12 h-[520px] flex flex-col bg-white card-conteudos">
                  
                  <div className="flex-shrink-0">
                    <span className="inline-block border border-[#005c65] rounded-[20px] px-5 py-1 text-[#005c65] font-serif text-[16px] mb-6">
                      {topic.badge}
                    </span>
                    
                    <h5 className="text-[#005c65] font-maax font-medium text-[16px] mb-1">
                      {topic.subtitle}
                    </h5>
                    
                    <h3 className="text-[#005c65] font-exposure text-2xl md:text-[1.6rem] font-medium leading-tight mb-6">
                      {topic.title}
                    </h3>
                  </div>

                  {/* Lista de Items com scrollbar escondida */}
                  <div className="overflow-y-auto flex-grow hide-scrollbar pr-2">
                    <ul className="list-disc pl-5 space-y-3">
                      {topic.items.map((item, idx) => (
                        <li 
                          key={idx} 
                          className="text-[#005c65] font-maax text-[16px] leading-[1.5rem]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

      <style jsx global>{`
        /* Tipografias extra baseadas nas tuas regras */
        .font-exposure { font-family: 'Exposurevar', 'Playfair Display', serif; }
        .font-maax { font-family: 'Maax', 'Roboto', sans-serif; }
        
        /* Ocultar Scrollbars dentro do cartão */
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
        
        /* Efeito de hover suave no cartão */
        .card-conteudos {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-conteudos:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px -10px rgba(0, 92, 101, 0.15);
        }
      `}</style>
    </section>
  );
}