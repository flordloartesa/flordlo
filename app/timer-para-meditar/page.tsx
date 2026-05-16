"use client"; // Obrigatório no Next.js ao usar useState/useEffect

import { useState, useEffect } from 'react';
import SidebarCursos from '@/components/SidebarCursos';
import MeditationTimer from '@/components/MeditationTimer';
// import Footer from '@/components/Footer'; // Mantive o teu comentário original

export default function Home() {
  // 1. Estado para controlar se a sidebar está visível
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // 2. Lógica do temporizador de inatividade
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Função que reinicia o temporizador
    const resetTimer = () => {
      setIsSidebarVisible(true); // Mostra a sidebar
      clearTimeout(timeoutId);   // Limpa o tempo anterior
      
      // Esconde a sidebar após 30 segundos sem atividade
      timeoutId = setTimeout(() => {
        setIsSidebarVisible(false);
      }, 10000); 
    };

    // Iniciar o temporizador assim que a página carrega
    resetTimer();

    // Adicionar "escutas" para acordar a interface
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('keydown', resetTimer);

    // Limpeza ao sair da página
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black/90 text-white">
      
      {/* 3. A tua Sidebar envolvida na div com as animações de opacidade */}
      <div 
        className={`transition-opacity duration-700 ease-in-out z-50 ${
          isSidebarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <SidebarCursos />
      </div>
      
      {/* 4. O teu conteúdo principal intocado */}
      <main className="flex-grow">
        <MeditationTimer />
      </main>

     
    </div>
  );
}