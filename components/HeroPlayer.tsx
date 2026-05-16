"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  image: string;
  audioUrl: string;
  title?: string;
  subtitle?: string;
  sectionTitle?: string;
  category?: string;
  durationLabel?: string;
  // NOVA PROPRIEDADE: Controla o formato
  variant?: 'landscape' | 'portrait';
}

export default function HeroPlayer({ 
  image, 
  audioUrl, 
  title, 
  subtitle, 
  sectionTitle, 
  category, 
  durationLabel,
  variant = 'landscape' // Padrão é horizontal
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Variável auxiliar para facilitar a leitura do código
  const isPortrait = variant === 'portrait';

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime += seconds;
  };

  const onTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
  const onLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  
  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden bg-[#2D2D3A] group select-none shadow-2xl 
        ${isFullScreen 
          ? 'w-full h-full flex items-center justify-center fixed inset-0 z-50' 
          : isPortrait 
            ? 'w-full aspect-[9/16] max-w-[400px] mx-auto rounded-3xl' // Estilo Portrait (Vertical)
            : 'w-full aspect-[16/10] md:aspect-video rounded-3xl'       // Estilo Landscape (Horizontal)
        }`}
    >
      {/* 1. IMAGEM */}
      <img 
        src={image} 
        className={`absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity duration-700 ${isFullScreen ? 'object-contain bg-black' : ''}`} 
        alt={title || "Meditation"} 
      />
      
      {/* 2. OVERLAYS */}
      <div className="absolute inset-0 bg-[#2D2D3A]/20 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F2C] via-transparent to-transparent opacity-80 pointer-events-none"></div>
      
      {/* 3. LOGO (Escondemos no modo Portrait para poupar espaço, mostramos no Landscape/Fullscreen) */}
      {(!isPortrait || isFullScreen) && (
        <div className="absolute top-6 left-8 z-30 flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
             <span className="text-[10px] text-white font-serif italic font-bold">m</span>
          </div>
          <span className="text-white/90 text-sm font-bold tracking-wide font-sans drop-shadow-md">
            meditt.space
          </span>
        </div>
      )}

      {/* 4. FULLSCREEN BUTTON */}
      <div className="absolute top-6 right-6 z-40">
        <button onClick={toggleFullScreen} className="text-white/80 hover:text-white transition bg-white/10 hover:bg-white/20 rounded-lg p-2 backdrop-blur-md">
          {isFullScreen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          )}
        </button>
      </div>

      {/* 5. ÁREA CENTRAL */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center z-30 px-4 pointer-events-none ${isPortrait ? 'pb-20' : ''}`}>
        
        {/* Título */}
        <div className="text-center mb-6 pointer-events-auto">
          <h2 className={`text-white font-bold tracking-tight drop-shadow-lg mb-2 ${isPortrait ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
            {title}
          </h2>
          <p className="text-white/80 text-sm md:text-base font-medium tracking-wide drop-shadow-md">
            {subtitle || "Mindfulness Practice"}
          </p>
        </div>

        {/* Controlos */}
        <div className="flex items-center gap-12 pointer-events-auto">
          <button onClick={() => skip(-15)} className="group/btn relative w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition hover:scale-105 active:scale-95">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-medium pt-1 pl-0.5">15</span>
          </button>

          <button onClick={togglePlay} className="relative z-50 w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-[#2D2D3A] hover:scale-105 transition shadow-2xl cursor-pointer">
            {isPlaying ? (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            ) : (
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <button onClick={() => skip(15)} className="group/btn relative w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition hover:scale-105 active:scale-95">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-medium pt-1 pr-0.5">15</span>
          </button>
        </div>
      </div>

      {/* 6. BARRA INFERIOR */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 pointer-events-auto ${isPortrait ? 'px-6 pb-8' : 'px-10 pb-8 pt-12'}`}>
        
        {/* Títulos da Barra (Omitir no Portrait se já estiverem no centro para não duplicar) */}
        {!isPortrait && (
          <div className="flex justify-between items-end mb-2 text-white/90 font-bold text-xs md:text-sm tracking-wide">
             <span className="drop-shadow-md pl-1">{sectionTitle || "Intro"}</span>
             <span className="uppercase text-white/60 text-[10px] md:text-xs tracking-widest">{category || "Meditation"}</span>
          </div>
        )}

        {/* Slider e Tempos */}
        <div className={`flex items-center gap-3 text-white/80 font-mono font-medium ${isPortrait ? 'text-[10px]' : 'text-xs'}`}>
           
           {/* No Portrait, tempos ao lado da barra */}
           {isPortrait && <span>{formatTime(currentTime)}</span>}

           <div className="relative flex-1 h-[3px] bg-white/20 rounded-full cursor-pointer group/slider hover:h-[5px] transition-all">
              <input type="range" min="0" max={duration || 100} value={currentTime} onChange={onSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
              <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 group-hover/slider:w-3 group-hover/slider:h-3 bg-white rounded-full shadow transition-all duration-200"></div>
              </div>
           </div>

           {isPortrait && <span>{duration > 0 ? formatTime(duration) : (durationLabel || "00:00")}</span>}
        </div>

        {/* No Landscape, tempos em baixo */}
        {!isPortrait && (
          <div className="flex justify-between text-white/60 text-[10px] md:text-xs font-mono font-medium mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : (durationLabel || "00:00")}</span>
          </div>
        )}
      </div>

      <audio ref={audioRef} src={audioUrl} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  );
}