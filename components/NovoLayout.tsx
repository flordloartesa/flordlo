"use client";

import Image from 'next/image';
import { PortableText } from "@portabletext/react";
import TestimonialsCarouselEvents from "@/components/TestimonialsCarouselEvents";



// Array de testemunhos (Mantido conforme o teu código)
const testemunhos = [
  { id: 1, nome: "Susan Kaiser Greenland, JD.", imagem: "https://via.placeholder.com/150", titulo: "What a gem!", texto: "Chris Willard’s advice is jam packed..." },
  { id: 2, nome: "Amy Saltzman M.D.", imagem: "https://via.placeholder.com/150", titulo: "Wonderful practices", texto: "Which can be shared by parents..." },
];

export default function NovoLayout({ course }: { course: any }) {
  // Normalização de variáveis para evitar erros de campos com nomes diferentes no Sanity
  const displayImage = course.image || course.imagemUrlExterna;
  const displayPrice = course.price || course.preco;
  const displayInstructor = course.instructorName || course.autor;

  return (
    <main className="min-h-screen bg-white font-sans text-gray-800">
      

      {/* 1. HERO SECTION (Estilo SalesLayout) */}
      <header
        className="relative pt-32 pb-24 px-4 text-center bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${displayImage}')` }}
      >
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-gray-300 font-bold tracking-widest uppercase mb-6 text-sm md:text-base">
            {course.subtitulo || "Event Details"}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-widest uppercase mb-10 drop-shadow-lg leading-tight">
            {course.title}
          </h1>
          <p className="text-white text-lg font-light tracking-wide">
            Led by <strong className="font-bold">{displayInstructor}</strong>
          </p>
        </div>
      </header>

      {/* 2. OVERVIEW & INFO (Estilo SalesLayout com Video/Imagem à esquerda) */}
      <section className="py-20 px-4 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-700 mb-12">{course.title}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="relative h-[300px] md:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl group">
              <a href={course.youtubeUrl || "#"} target="_blank" rel="noopener" className="block w-full h-full">
                <Image src={displayImage} alt="Overview" fill className="object-cover" />
                {course.youtubeUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                        </div>
                    </div>
                )}
              </a>
            </div>

            <div className="space-y-6 lg:pl-10">
              <div className="text-gray-600 leading-relaxed text-justify text-sm md:text-base">
                <PortableText value={course.corpo} />
              </div>
              
              <ul className="space-y-4 mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <li className="flex items-center gap-4 text-gray-700 text-sm">
                  <span className="text-[#5E67FC]">●</span> {course.data || "Data a definir"}
                </li>
                <li className="flex items-center gap-4 text-gray-700 text-sm">
                   <span className="text-[#5E67FC]">●</span> Investment: {displayPrice}€
                </li>
                <li className="flex items-center gap-4 text-gray-700 text-sm">
                   <span className="text-[#5E67FC]">●</span> {course.local || "Online"}
                </li>
              </ul>
              
              <a href="#tickets" className="block w-full text-center bg-[#5E67FC] text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#4a54e1] transition-all">
                Ver Opções de Inscrição
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY COMPONENTS (Mantido do Novo/NovoLayout) */}
      <section className="py-24 px-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 leading-snug">
              Key components and intentions of this training include:
            </h2>
          </div>

          <div className="flex flex-col">
            {course.componentesChave?.map((item: any, index: number) => (
              <div 
                key={index} 
                className={`flex flex-col md:flex-row gap-6 md:gap-10 py-8 ${index !== course.componentesChave.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex-shrink-0">
                  <span className="text-4xl md:text-5xl font-light text-[#005C65]">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 mt-2 md:mt-1">
                  <h3 className="text-[16px] font-bold text-[#005C65] mb-2 uppercase tracking-wide">
                    {item.titulo}
                  </h3>
                  <p className="text-gray-600 text-[13px] md:text-[14px] leading-relaxed">
                    {item.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TESTEMUNHOS (Mantido do Novo/NovoLayout) */}
      <TestimonialsCarouselEvents testemunhos={testemunhos} />

      {/* 5. TICKETS & CHECKOUT (Estilo SalesLayout) */}
      <section id="tickets" className="bg-[#5E67FC] py-24 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-widest text-white">Inscrição e Pagamento</h2>
            <p className="opacity-80 max-w-2xl mx-auto">
              Escolha a opção que melhor se adapta a si.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Opção Early Bird */}
            <div className="bg-white rounded-3xl p-8 text-gray-800 flex flex-col shadow-xl border-4 border-yellow-400 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-xs font-bold py-1 px-4 rounded-full uppercase">Mais Popular</div>
              <h3 className="text-xl font-bold mb-2">Early-Bird</h3>
              <p className="text-gray-500 text-xs mb-6 italic">Válido até {course.dataLimiteEarlyBird}</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-[#5E67FC]">{course.precoEarlyBird}€</span>
              </div>
              <button className="w-full bg-[#5E67FC] text-white font-bold py-4 rounded-2xl hover:bg-[#4a54e1] transition-all">Add to Cart</button>
            </div>

            {/* Opção Standard */}
            <div className="bg-white rounded-3xl p-8 text-gray-800 flex flex-col shadow-lg">
              <h3 className="text-xl font-bold mb-2">Standard</h3>
              <p className="text-gray-500 text-xs mb-6">Inscrição regular</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-gray-800">{displayPrice}€</span>
              </div>
              <button className="w-full border-2 border-[#5E67FC] text-[#5E67FC] font-bold py-4 rounded-2xl hover:bg-[#5E67FC] hover:text-white transition-all">Add to Cart</button>
            </div>

            {/* Opção Reserva */}
            <div className="bg-indigo-900/40 rounded-3xl p-8 text-white flex flex-col border border-white/20">
              <h3 className="text-xl font-bold mb-2 text-white">Sinal / Reserva</h3>
              <p className="text-indigo-200 text-xs mb-6 italic text-white/80">Garanta o seu lugar agora</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">{course.precoReserva}€</span>
              </div>
              <button className="w-full bg-white text-[#5E67FC] font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all">Reserva Agora</button>
            </div>
          </div>
        </div>
      </section>

    
    </main>
  );
}