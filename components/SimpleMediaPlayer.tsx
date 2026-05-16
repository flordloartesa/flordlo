"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Lock, CheckCircle2, MonitorPlay, Music } from "lucide-react";

declare global {
  interface Window { onYouTubeIframeAPIReady: () => void; YT: any; }
}

export default function CourseMediaPlayer({ mediaItems }: { mediaItems: any[] }) {
  const [currentMedia, setCurrentMedia] = useState(mediaItems[0] || {});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const isFirstMount = useRef(true); // ✅ Adicionado para evitar Autoplay no 1º load

  const isYT = currentMedia?.url?.includes("youtube.com") || currentMedia?.url?.includes("youtu.be");

  // ✅ 1. CARREGAR API DO YOUTUBE
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => initYT(false);
    } else {
      initYT(false);
    }
    return () => clearInterval(intervalRef.current);
  }, []);

  // ✅ 2. RESET TOTAL AO MUDAR DE FAIXA COM AUTOPLAY SEGURO
  useEffect(() => {
    const isInitial = isFirstMount.current;
    if (isFirstMount.current) isFirstMount.current = false;

    // 🛑 GARANTIR QUE O ÁUDIO ANTERIOR PARA SEMPRE ANTES DE MUDAR PARA YOUTUBE
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Parar intervalos e dar reset aos tempos da faixa anterior
    clearInterval(intervalRef.current);
    setProgress(0);
    setCurrentTime(0);
    
    // Forçar o play na nova faixa APENAS se não for o primeiro carregamento da página
    if (!isInitial) {
      setIsPlaying(true); 
    } else {
      setIsPlaying(false);
    }
    
    if (isYT && window.YT && window.YT.Player) {
      initYT(!isInitial); // Passa 'true' para autoplay só se não for mount inicial
    } else {
      // Se for áudio, destruímos o YT
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      
      // Dá play no áudio apenas se não for o primeiro carregamento
      if (!isInitial) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch((err) => {
              console.log("Autoplay bloqueado pelo browser", err);
              setIsPlaying(false);
            });
          }
        }, 100);
      }
    }
  }, [currentMedia]);

  const initYT = (shouldAutoplay = false) => {
    if (!isYT) return;
    
    if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
      ytPlayerRef.current.destroy();
    }

    const id = getYTId(currentMedia.url);
    if (!id) return;

    ytPlayerRef.current = new window.YT.Player('yt-motor', {
      videoId: id,
      playerVars: { autoplay: shouldAutoplay ? 1 : 0, controls: 0, modestbranding: 1, rel: 0, enablejsapi: 1 },
      events: {
        onReady: (e: any) => {
          setDuration(e.target.getDuration());
          if (shouldAutoplay) e.target.playVideo();
        },
        onStateChange: (e: any) => {
          if (e.data === 1) {
            setIsPlaying(true);
            startTimer();
          } else if (e.data === 2 || e.data === 0) { 
            setIsPlaying(false);
            clearInterval(intervalRef.current);
          }
        }
      }
    });
  };

  const stopEverything = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    
    if (audioRef.current) { 
      audioRef.current.pause(); 
      audioRef.current.currentTime = 0;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      ytPlayerRef.current.pauseVideo();
    }
    
    setProgress(0);
    setCurrentTime(0);
  };

  const startTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isYT && ytPlayerRef.current?.getCurrentTime) {
        const now = ytPlayerRef.current.getCurrentTime();
        const dur = ytPlayerRef.current.getDuration() || 1;
        setCurrentTime(now);
        setDuration(dur);
        setProgress(now / dur);
      }
    }, 1000);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (isYT && ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
      else if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (isYT && ytPlayerRef.current) ytPlayerRef.current.playVideo();
      else if (audioRef.current) audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    const currentIndex = mediaItems.findIndex(item => item._id === currentMedia._id);
    if (currentIndex < mediaItems.length - 1) setCurrentMedia(mediaItems[currentIndex + 1]);
  };

  const playPrevious = () => {
    const currentIndex = mediaItems.findIndex(item => item._id === currentMedia._id);
    if (currentIndex > 0) setCurrentMedia(mediaItems[currentIndex - 1]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    const seekTime = val * duration;
    setCurrentTime(seekTime);

    if (isYT && ytPlayerRef.current) ytPlayerRef.current.seekTo(seekTime, true);
    else if (audioRef.current) audioRef.current.currentTime = seekTime;
  };

  const getYTId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
    return match ? match[1] : null;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "00:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const getCoverImage = (item: any) => {
    if (item.image) return item.image;
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (item.coverUrl) return item.coverUrl;
    if (item.url && (item.url.includes("youtube.com") || item.url.includes("youtu.be"))) {
      return `https://img.youtube.com/vi/${getYTId(item.url)}/maxresdefault.jpg`;
    }
    return "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=800&q=80";
  };

  const currentCover = getCoverImage(currentMedia);

  return (
    <div 
      className="min-h-[100dvh] flex flex-col font-sans text-white pb-32"
      style={{ background: 'linear-gradient(175deg, rgba(0,0,0,0.8) 50%, rgba(105, 97, 116, 1) 80%, rgba(21, 207, 240, 0.7) 100%)' }}
    >
      
      {/* CSS Embutido para o Efeito Marquee do Mobile */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spotify-marquee {
          0%, 15% { transform: translateX(0); }
          85%, 100% { transform: translateX(calc(-100% + 110px)); }
        }
        @media (max-width: 768px) {
          .mobile-marquee {
            display: inline-block;
            white-space: nowrap;
            animation: spotify-marquee 7s linear infinite alternate;
          }
        }
      `}} />

      {/* MOTORES NATIVOS OCULTOS */}
      <div className="hidden">
        <div id="yt-motor"></div>
        {/* ✅ O 'undefined' abaixo corrige o erro de consola "Empty string src" */}
        <audio
          ref={audioRef}
          src={!isYT ? currentMedia.url : undefined}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            if (!isYT) {
              setCurrentTime(e.currentTarget.currentTime);
              setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1));
            }
          }}
          onEnded={playNext}
        />
      </div>

      {/* HEADER GIGANTE TIPO SPOTIFY / MASTERCLASS */}
      <div className="relative w-full h-[45vh] min-h-[350px] flex items-end">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${currentCover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-black/30 backdrop-blur-[2px]" />
        
        <div className="relative z-10 p-8 md:p-12 w-full max-w-5xl mx-auto">
          <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-white/70 mb-3 flex items-center gap-2">
            {isYT ? <MonitorPlay size={16} /> : <Music size={16} />}
            {isYT ? 'Video Lesson' : 'Audio Session'}
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg leading-tight">
            {currentMedia.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500" />
            <p className="text-lg font-medium text-white/90">{currentMedia.author || 'Author Name'}</p>
          </div>
        </div>
      </div>

      {/* ÁREA DA PLAYLIST */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-2 md:px-12 py-8">
        <div className="bg-white/[0.03] rounded-3xl border border-white/10 p-4 md:p-6 backdrop-blur-xl">
          <div className="space-y-1">
            {mediaItems.map((item, index) => {
              const isActive = currentMedia._id === item._id;
              return (
                <button 
                  key={item._id}
                  onClick={() => {
                    if (isActive) togglePlay();
                    else setCurrentMedia(item);
                  }}
                  className={`w-full group flex items-center justify-between p-3 md:p-4 rounded-2xl transition-all duration-300
                    ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/70 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3 md:gap-4 text-left overflow-hidden flex-1">
                    {/* Ícone à esquerda (Menor em Mobile) */}
                    <div className="w-6 md:w-8 flex items-center justify-center flex-shrink-0">
                      {isActive ? (
                        isPlaying ? 
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-teal-400 animate-pulse" /> : 
                          <CheckCircle2 className="text-teal-400" size={20} />
                      ) : (
                        <span className="text-white/40 group-hover:hidden font-medium text-xs md:text-base">{index + 1}</span>
                      )}
                      {!isActive && <Play size={16} className="hidden group-hover:block text-white md:w-5 md:h-5" fill="currentColor" />}
                    </div>
                    
                    {/* Textos da Faixa (Fontes ~30% menores em Mobile e Efeito Marquee) */}
                    <div className="overflow-hidden flex-1 max-w-[140px] sm:max-w-[200px] md:max-w-md">
                      <h3 className={`text-[12px] md:text-lg font-medium md:truncate max-md:mobile-marquee ${isActive ? 'text-teal-400 font-bold' : ''}`}>
                        {item.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-white/40 mt-0.5 md:mt-1 truncate">{item.author}</p>
                    </div>
                  </div>

                  {/* Informação à direita */}
                  <div className="flex items-center gap-3 md:gap-6 text-white/40 flex-shrink-0">
                    <span className="text-[10px] md:text-sm font-mono tracking-wider">
                      {item.duration || formatTime(isActive ? duration : 0)} MIN
                    </span>
                    <Heart size={14} className="md:w-[18px] md:h-[18px] hover:text-teal-400 transition" />
                    <Lock size={14} className="md:w-[18px] md:h-[18px]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* STICKYBAR COM COMANDOS CENTRADOS E IMAGEM À ESQUERDA */}
      <div className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-[#0a0a0a] border-t border-white/10 px-4 md:px-8 flex items-center justify-center z-50">
        
        {/* Lado Esquerdo - Imagem (Absoluto no mobile para não estragar o centro) */}
        <div className="absolute left-4 md:static md:w-1/3 flex items-center gap-4">
          <img src={currentCover} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl object-cover shadow-lg border border-white/5" />
          <div className="hidden md:block truncate">
            <h4 className="text-white font-bold truncate">{currentMedia.title}</h4>
            <p className="text-white/50 text-sm truncate">{currentMedia.author}</p>
          </div>
        </div>

        {/* Centro - Controlos e Barra */}
        {/* Adicionado padding left no mobile (pl-14) para os controlos não sobreporem a foto */}
        <div className="w-full md:flex-1 max-w-2xl flex flex-col items-center justify-center pl-16 pr-2 md:px-0">
          <div className="flex items-center gap-4 md:gap-6 mb-2">
            <button onClick={playPrevious} className="text-white/50 hover:text-white transition">
              <SkipBack size={20} className="md:w-6 md:h-6" fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition"
            >
              {isPlaying ? <Pause size={20} className="md:w-6 md:h-6" fill="currentColor"/> : <Play size={20} className="md:w-6 md:h-6 ml-1" fill="currentColor"/>}
            </button>
            <button onClick={playNext} className="text-white/50 hover:text-white transition">
              <SkipForward size={20} className="md:w-6 md:h-6" fill="currentColor" />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-2 md:gap-3">
            <span className="text-[9px] md:text-xs text-white/50 font-mono w-8 md:w-auto text-right">{formatTime(currentTime)}</span>
            <input 
              type="range" min={0} max={1} step="any"
              value={progress || 0}
              onChange={handleSeek}
              className="flex-1 h-1 md:h-1.5 bg-white/20 rounded-full appearance-none accent-teal-400 cursor-pointer"
            />
            <span className="text-[9px] md:text-xs text-white/50 font-mono w-8 md:w-auto text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Lado Direito - Volume (Apenas Desktop) */}
        <div className="w-1/3 flex items-center justify-end gap-4 hidden md:flex">
          <Volume2 size={20} className="text-white/50 hover:text-white cursor-pointer" />
          <div className="w-24 h-1.5 bg-white/20 rounded-full">
            <div className="w-2/3 h-full bg-white rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
}