"use client";

import React from 'react';
import Image from 'next/image';
import Link from '@/components/MyLink';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      
      {/* SECÇÃO 1: MENSAGEM 404 */}
      <section className="relative w-full h-[70vh] min-h-[550px] md:min-h-[750px] flex flex-col items-center justify-center text-white overflow-hidden bg-slate-900">
        
        {/* Fundo com Imagem Floral e Overlay escuro para ler bem o texto */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1508610048659-a06b669e3321?q=80&w=2070&auto=format&fit=crop" 
            alt="Fundo de flores escuras e elegantes"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Conteúdo 404 (Texto e Botão) Centrados sobre a imagem */}
        <div className="relative z-10 text-center px-6 max-w-3xl flex flex-col items-center mt-[-50px]">
          <p className="text-sm md:text-base font-medium mb-4 tracking-wide uppercase">
            Ops! Erro 404
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight">
            A página que procura não floresceu por aqui.
          </h1>
          <p className="text-lg text-slate-200 mb-10 max-w-xl">
            Parece que o link que seguiu está quebrado ou a página foi movida. Mas não se preocupe, o nosso jardim tem muito mais para explorar.
          </p>
          

          <Link href="/" passHref>
            <button className="bg-white hover:bg-gray-100 text-[#9d6b73] font-bold py-3 px-8 mb-10 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-lg">
              Voltar ao Início
            </button>
          </Link>
       
        </div>

        {/* ONDA BRANCA DE TRANSIÇÃO */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[150px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 C250,100 350,0 650,0 C900,0 1050,80 1200,80 L1200,120 L0,120 Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </section>

      {/* SECÇÃO 2: PROMO (A ENCAMINHAR PARA A LOJA) */}
      <section className="bg-transparent py-20 overflow-hidden flex-grow z-50 relative mt-[-70px] md:mt-[-150px]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-[#9d6b73]">Descubra as Nossas Criações</h2>
            <p className="text-slate-600 leading-relaxed">
              Aproveite para conhecer as nossas coleções feitas à mão com todo o amor e dedicação.
            </p>
            <ul className="space-y-3 text-slate-500 text-sm font-medium">
              <li className="flex items-center gap-2">🌸 Arranjos Florais Exclusivos</li>
              <li className="flex items-center gap-2">🎁 Presentes Personalizados</li>
              <li className="flex items-center gap-2">🔮 Redomas com Flores Secas</li>
              <li className="flex items-center gap-2">🌿 Grinaldas Artesanais</li>
              <li className="flex items-center gap-2">💍 Decoração para Casamentos e Eventos</li>
            </ul>
            
            {/* BOTÃO PARA A LOJA */}
            <Link href="/loja" passHref>
              <button className="mt-6 bg-[#9d6b73] hover:bg-[#865961] text-white font-bold py-3 px-10 rounded-full transition-all shadow-md active:scale-95">
                Visitar a Loja
              </button>
            </Link>
          </div>

          <div className="relative flex justify-center md:justify-end">
            {/* Ajustei o tamanho da moldura da imagem para um formato retrato fotográfico elegante */}
            <div className="relative w-[320px] h-[480px] md:w-[400px] md:h-[550px]">
              <Image 
                src="https://images.unsplash.com/photo-1542995096-2e8bc2e739ba?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Arranjo floral da Flor de Ló"
                fill
                className="object-cover rounded-xl shadow-2xl"
              />
            </div>
          </div>
          
        </div>
      </section>

    </main>
  );
}