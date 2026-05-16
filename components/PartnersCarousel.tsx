"use client";

import React from 'react';

interface Partner {
  name: string;
  logoUrl: string;
  website?: string;
}

export default function PartnersCarousel({ partners }: { partners: Partner[] }) {
  if (!partners || partners.length === 0) return null;

  // 🎯 "Duplicar a referência": o teu truque para o loop infinito perfeito!
  // Juntamos a lista a ela própria. Quando a primeira metade acaba de deslizar, a segunda já lá está.
  const duplicatedPartners = [...partners, ...partners];

  return (
    <div className="w-full overflow-hidden py-6 relative">
      
      {/* w-max: Garante que a div estica o suficiente para caber todos os logos lado a lado
        animate-marquee: Chama a nossa animação CSS
        hover:[animation-play-state:paused]: Pára o carrossel quando o rato passa por cima!
      */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {duplicatedPartners.map((p, i) => (
          <div key={i} className="w-[150px] md:w-[250px] flex-shrink-0 px-4 flex justify-center items-center">
            {p.website ? (
              <a 
                href={p.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-110"
              >
                <img src={p.logoUrl} alt={p.name} className="h-30 md:h-54 w-auto object-contain mx-auto" />
              </a>
            ) : (
              <img 
                src={p.logoUrl} 
                alt={p.name} 
                className="h-30 md:h-54 w-auto object-contain mx-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" 
              />
            )}
          </div>
        ))}
      </div>

      <style jsx global>{`
        /* A magia do movimento */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* Anda exatamente metade do tamanho (a lista original) */
        }
        
        .animate-marquee {
          /* 30s é a velocidade. Se quiseres mais rápido, baixa para 20s. Mais lento, sobe para 40s */
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}