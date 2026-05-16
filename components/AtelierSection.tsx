'use client';
import Image from 'next/image';

export default function AtelierSection({ data }: { data: any }) {
  if (!data) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Layout: Em Mobile a imagem fica em cima. Em Desktop ficam lado a lado */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
          
          {/* Lado Esquerdo: A Imagem Orgânica */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div 
              className="relative w-full max-w-[400px] aspect-square overflow-hidden shadow-lg"
              // Esta é a magia CSS que corta a imagem tal como na foto que me mostrou!
              style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} 
            >
              <Image 
                src={data.imageUrl || '/placeholder.jpg'} 
                alt={data.title || 'Atelier Flor de Ló'} 
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Lado Direito: O Texto */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-6">
                {data.title}
              </h2>
            )}
            
            {data.text && (
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-8 whitespace-pre-line">
                {data.text}
              </p>
            )}

            {data.signature && (
              <div className="text-sm md:text-base font-serif italic text-slate-500 whitespace-pre-line">
                {data.signature}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}