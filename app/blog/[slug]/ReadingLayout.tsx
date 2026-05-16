'use client';

import { useState, useEffect } from 'react';

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentScroll = window.scrollY;
      // Calcula a altura total da página menos a altura do ecrã visível
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollHeight) {
        setProgress(Number((currentScroll / scrollHeight).toFixed(2)) * 100);
      }
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Corre logo ao abrir a página

    return () => {
      window.removeEventListener('scroll', updateProgress);
    };
  }, []);

  return (
    <>
      {/* --- A BARRA DE PROGRESSO --- */}
      {/* ATENÇÃO: O valor "top-[80px]" deve ser ajustado para a altura exata da tua Navbar! 
          Se a tua Navbar tiver 70px, muda para top-[70px]. 
          Mudei a cor para o azul do teu site (#3D81F1), mas podes trocar! */}
      {/* --- A BARRA DE PROGRESSO (NO TOPO DO ECRÃ) --- */}
      <div 
        className="fixed top-0 left-0 h-[4px] bg-[#3D81F1] z-[110] transition-all duration-75 ease-out" 
        style={{ width: `${progress}%` }} 
      />

      {/* --- O ARTIGO CENTRADO --- */}
      <div className="max-w-3xl mx-auto w-full">
        {children}
      </div>
    </>
  );
}