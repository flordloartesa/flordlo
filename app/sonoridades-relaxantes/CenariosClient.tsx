"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, MonitorPlay, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CenariosClient({ cenarios }: { cenarios: any[] }) {
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [volume, setVolume] = useState(0.5);
  const [showVideo, setShowVideo] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeScenario) return;

    audio.volume = volume;
    
    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.log("Aguardando interação para tocar áudio...");
      }
    };

    playAudio();
  }, [volume, activeScenario, showVideo]);

  const getSafeYTId = (url: string) => {
    if (!url) return null;
    if (!url.includes('http') && url.length === 11) return url;
    const match = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
    return match ? match[1] : null; 
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* 1. ECRÃ DE SELEÇÃO */}
      {!activeScenario && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-4 md:mt-8"
        >
          {/* Comandos de Áudio e Vídeo */}
          <div className="max-w-2xl mx-auto w-full space-y-6 md:space-y-8 mb-12 md:mb-16 px-4 md:px-0">
            
            {/* Controlo de Volume */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <Volume2 size={20} className="opacity-70 md:w-6 md:h-6" />
                <span className="text-base md:text-lg font-medium">Volume do cenário</span>
              </div>
              <div className="flex w-full sm:flex-1 items-center justify-end gap-3 md:gap-4 max-w-sm ml-auto">
                <Volume2 size={14} className="opacity-50" />
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none accent-white cursor-pointer"
                />
                <Volume2 size={18} />
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* Controlo de Vídeo (CORRIGIDO) */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <MonitorPlay size={20} className="opacity-70 md:w-6 md:h-6" />
                <span className="text-base md:text-lg font-medium">Reproduzir vídeo do cenário</span>
              </div>
              
              {/* Switch Estilizado e Funcional */}
              <div
                onClick={() => setShowVideo(!showVideo)}
                className={`w-11 h-6 flex items-center rounded-full px-1 cursor-pointer transition-colors duration-300 ${
                  showVideo ? 'bg-white' : 'bg-white/20'
                } ${showVideo ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`w-4 h-4 rounded-full shadow-md ${
                    showVideo ? 'bg-[#2A3B69]' : 'bg-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Título da Grelha */}
          <div className="flex items-center gap-2 mb-4 md:mb-6 opacity-80 px-4 md:px-0 max-w-2xl mx-auto">
            <ImageIcon size={18} />
            <h3 className="text-base md:text-lg font-semibold">Seleção de cenário</h3>
          </div>

          {/* Lista Horizontal de Cenários */}
          <div className="w-full px-4 md:px-0">
            <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-8 snap-x">
              {cenarios.map((cenario, i) => (
                <div
                  key={cenario._id || i}
                  onClick={() => setActiveScenario(cenario)}
                  className="relative shrink-0 w-60 md:w-80 aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-white/50 transition-all shadow-lg snap-start group"
                >
                  <img
                    src={cenario.img || (cenario.youtubeId ? `https://img.youtube.com/vi/${getSafeYTId(cenario.youtubeId)}/mqdefault.jpg` : "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=800")}
                    alt={cenario.title}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition" />
                  <h3 className="absolute bottom-4 left-4 right-4 text-white font-semibold text-sm md:text-lg drop-shadow-md">
                    {cenario.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. ECRÃ TOTAL */}
      <AnimatePresence>
        {activeScenario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] bg-black overflow-hidden"
          >
            <button
              onClick={() => setActiveScenario(null)}
              className="absolute top-4 left-4 md:top-6 md:left-6 z-[110] w-10 h-10 md:w-12 md:h-12 bg-black/30 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-black/50 hover:scale-105 transition-all shadow-2xl"
            >
              <X size={20} />
            </button>

            <div className="absolute inset-0 pointer-events-none">
              {showVideo ? (
                activeScenario.videoType === 'direct' && activeScenario.directVideoUrl ? (
                  <video 
                    src={activeScenario.directVideoUrl} 
                    autoPlay loop muted playsInline 
                    className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 opacity-100 object-cover" 
                  />
                ) : 
                getSafeYTId(activeScenario.youtubeId) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getSafeYTId(activeScenario.youtubeId)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getSafeYTId(activeScenario.youtubeId)}&playsinline=1`}
                    className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 opacity-100"
                    allow="autoplay; fullscreen"
                  />
                ) : (
                  <img src={activeScenario.img || "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920"} className="absolute inset-0 w-full h-full object-cover" />
                )
              ) : (
                <img src={activeScenario.img || "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920"} className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
            <audio ref={audioRef} src={activeScenario.audioUrl} loop autoPlay />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}