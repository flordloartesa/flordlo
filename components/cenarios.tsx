"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, CheckCircle2, MonitorPlay, Music, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toggleFavorite as toggleFavoriteAction } from "@/app/actions/updateCustomer";

declare global {
  interface Window { onYouTubeIframeAPIReady: () => void; YT: any; }
}

export default function WorldmediaPlayer({ 
  courseModules = [], 
  standaloneTracks = [], 
  courseId = "biblioteca_livre",
  cenariosDisponiveis = [] 
}: { 
  courseModules?: any[], 
  standaloneTracks?: any[], 
  courseId?: string,
  cenariosDisponiveis?: any[]
}) {
  const { data: session, status } = useSession();
  
  // ==========================================
  // 1. ESTADOS DO PLAYER PRINCIPAL
  // ==========================================
  const modulesToRender = useMemo(() => {
    const safeModules = Array.isArray(courseModules) ? courseModules : [];
    const safeStandalone = Array.isArray(standaloneTracks) ? standaloneTracks : [];
    const modules = [...safeModules];
    if (safeStandalone.length > 0) modules.unshift({ title: 'Práticas', content: safeStandalone });
    return modules;
  }, [courseModules, standaloneTracks]);
  
  const allMediaItems = useMemo(() => modulesToRender.flatMap((m: any) => m.content || []), [modulesToRender]);
  
  const [currentMedia, setCurrentMedia] = useState(allMediaItems[0] || {});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const isFirstMount = useRef(true);

  // ==========================================
  // 2. ESTADOS DOS CENÁRIOS
  // ==========================================
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [scenarioVolume, setScenarioVolume] = useState(0.5);
  const [isVideoScenarioEnabled, setIsVideoScenarioEnabled] = useState(true);
  const ambientAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (ambientAudioRef.current) ambientAudioRef.current.volume = scenarioVolume;
  }, [scenarioVolume, activeScenario]);

  // ==========================================
  // 3. SEGURANÇA E IMAGENS
  // ==========================================
  const getYTId = (url: string) => {
    if (!url) return null;
    if (!url.includes('http') && url.length === 11) return url;
    const match = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
    return match ? match[1] : null;
  };

  const getCoverImage = (item: any) => {
    if (!item) return "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=1920&q=80";
    if (item.imageSource && typeof item.imageSource === 'string' && item.imageSource.startsWith('http')) return item.imageSource;
    if (item.imageSource && item.imageSource.url) return item.imageSource.url;
    if (typeof item.thumbnail === 'string') return item.thumbnail;
    if (item.thumbnail?.asset?.url) return item.thumbnail.asset.url;
    if (item.thumbnailUrl && typeof item.thumbnailUrl === 'string' && item.thumbnailUrl.startsWith('http')) return item.thumbnailUrl;
    if (item.url && (item.url.includes("youtube.com") || item.url.includes("youtu.be"))) {
      const ytId = getYTId(item.url);
      if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg?v=1`;
    }
    return "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=1920&q=80";
  };

  const currentCover = getCoverImage(currentMedia);
  const isYT = currentMedia?.url?.includes("youtube.com") || currentMedia?.url?.includes("youtu.be");

  // ==========================================
  // 4. LÓGICA DE PLAYER
  // ==========================================
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => initYT(false);
    } else initYT(false);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const isInitial = isFirstMount.current;
    if (isFirstMount.current) isFirstMount.current = false;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    clearInterval(intervalRef.current);
    setProgress(0); setCurrentTime(0);
    if (!isInitial) setIsPlaying(true); else setIsPlaying(false);
    
    if (isYT && window.YT?.Player) {
      initYT(!isInitial);
    } else {
      if (ytPlayerRef.current?.destroy) { ytPlayerRef.current.destroy(); ytPlayerRef.current = null; }
      if (!isInitial) setTimeout(() => audioRef.current?.play().catch(() => setIsPlaying(false)), 100);
    }
  }, [currentMedia]);

  const initYT = (shouldAutoplay = false) => {
    if (!isYT || !currentMedia?.url) return;
    if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy();
    const id = getYTId(currentMedia.url);
    if (!id) return;
    ytPlayerRef.current = new window.YT.Player('yt-motor', {
      videoId: id,
      playerVars: { autoplay: shouldAutoplay ? 1 : 0, controls: 0, modestbranding: 1, rel: 0 },
      events: {
        onReady: (e: any) => { setDuration(e.target.getDuration()); if (shouldAutoplay) e.target.playVideo(); },
        onStateChange: (e: any) => {
          if (e.data === 1) { setIsPlaying(true); startTimer(); }
          else if (e.data === 2 || e.data === 0) { setIsPlaying(false); clearInterval(intervalRef.current); if (e.data === 0) playNext(); }
        }
      }
    });
  };

  const startTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isYT && ytPlayerRef.current?.getCurrentTime) {
        const now = ytPlayerRef.current.getCurrentTime();
        const dur = ytPlayerRef.current.getDuration() || 1;
        setCurrentTime(now); setDuration(dur); setProgress((now / dur) * 100);
      }
    }, 1000);
  };

  const togglePlay = () => {
    if (isPlaying) { isYT ? ytPlayerRef.current?.pauseVideo() : audioRef.current?.pause(); setIsPlaying(false); } 
    else { isYT ? ytPlayerRef.current?.playVideo() : audioRef.current?.play(); setIsPlaying(true); }
  };

  const playNext = () => {
    const idx = allMediaItems.findIndex(i => (i._id || i._ref) === (currentMedia._id || currentMedia._ref));
    if (idx < allMediaItems.length - 1) setCurrentMedia(allMediaItems[idx + 1]);
  };

  const playPrevious = () => {
    const idx = allMediaItems.findIndex(i => (i._id || i._ref) === (currentMedia._id || currentMedia._ref));
    if (idx > 0) setCurrentMedia(allMediaItems[idx - 1]);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "00:00";
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${min < 10 ? '0' + min : min}:${sec}`;
  };

  // ==========================================
  // 5. RENDERIZAÇÃO
  // ==========================================
  return (
    <div className="w-full flex-1 flex flex-col font-sans text-white pb-32">
      
      <div className="hidden">
        <div id="yt-motor"></div>
        <audio
          ref={audioRef} src={!isYT ? currentMedia?.url : undefined}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => { if (!isYT) { setCurrentTime(e.currentTarget.currentTime); setProgress((e.currentTarget.currentTime / (e.currentTarget.duration || 1)) * 100); } }}
          onEnded={() => { setIsPlaying(false); playNext(); }}
        />
      </div>

      {/* ✅ FUNDO DO CENÁRIO ATUALIZADO (MP4 + YOUTUBE + IMAGEM EXTERNA) */}
      {activeScenario && (
        <div className="fixed inset-0 z-[-10] w-full h-full overflow-hidden bg-black pointer-events-none">
          {isVideoScenarioEnabled ? (
            activeScenario.videoType === 'direct' && activeScenario.directVideoUrl ? (
              <video 
                src={activeScenario.directVideoUrl} 
                autoPlay loop muted playsInline 
                className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 opacity-40 md:opacity-60 object-cover" 
              />
            ) : activeScenario.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYTId(activeScenario.youtubeId)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYTId(activeScenario.youtubeId)}&playsinline=1`}
                className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 opacity-40 md:opacity-60"
                allow="autoplay"
              />
            ) : (
              <img src={activeScenario.img || currentCover} alt="Cenário" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            )
          ) : (
            <img src={activeScenario.img || currentCover} alt="Cenário" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          )}
          <audio ref={ambientAudioRef} src={activeScenario.audioUrl} loop autoPlay />
        </div>
      )}

      {/* CABEÇALHO HERO */}
      <div className={`relative w-full min-h-[350px] flex flex-col justify-end pt-32 pb-4 overflow-hidden ${activeScenario ? 'bg-transparent' : 'bg-[#0a0a0a]'}`}>
        {!activeScenario && (
          <div className="absolute inset-0">
            <AnimatePresence mode="popLayout">
              <motion.img key={currentCover} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} src={currentCover} className="absolute inset-0 w-full h-full object-cover blur-xl scale-105 opacity-60" />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] to-black/30" />
          </div>
        )}
        <div className="relative z-10 px-4 md:px-12 w-full max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg leading-tight">
             {currentMedia?.title || (currentMedia?._ref ? "⚠️ Erro Sanity: Falta o '->'" : 'A carregar...')}
          </h1>
          <p className="text-lg font-medium text-white/90 mb-8">{currentMedia?.author || ''}</p>
          {modulesToRender.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
              {modulesToRender.map((modulo: any, idx: number) => (
                <button key={idx} onClick={() => setActiveModuleIndex(idx)} className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeModuleIndex === idx ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{modulo.title}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE FAIXAS */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-2 md:px-12 py-4">
        <div className="bg-white/5 rounded-3xl border border-white/10 p-4 backdrop-blur-xl min-h-[300px] space-y-1">
          {modulesToRender[activeModuleIndex]?.content?.map((item: any, index: number) => {
            const trackId = item?._id || item?._ref || `track-${index}`;
            const isActive = (currentMedia?._id === trackId) || (currentMedia?._ref === trackId);
            return (
              <div key={trackId} onClick={() => { isActive ? togglePlay() : setCurrentMedia(item) }} className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl cursor-pointer transition-colors ${isActive ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}`}>
                <div className="flex items-center gap-4 text-left overflow-hidden">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${isActive ? 'border-[#2DD4BF] bg-[#2DD4BF]/10 text-[#2DD4BF]' : 'border-transparent text-white/40'}`}>
                    {isActive ? (isPlaying ? <div className="w-3 h-3 bg-[#2DD4BF] rounded-sm animate-pulse"/> : <Play size={12} fill="currentColor"/>) : <span className="text-sm font-medium">{index + 1}</span>}
                  </div>
                  <div className="truncate pr-4">
                    <h3 className={`text-sm font-medium truncate ${isActive ? 'text-[#2DD4BF]' : 'text-white'}`}>{item?.title || 'Faixa Desconhecida'}</h3>
                    <p className="text-xs text-white/50 truncate">{item?.author}</p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-white/40">{item?.duration || formatTime(isActive ? duration : 0)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STICKY BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-[#0a0a0a]/80 backdrop-blur-2xl border-t border-white/10 px-4 md:px-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-4 w-1/3">
          <img src={currentCover} alt="Cover" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
          <div className="hidden md:block truncate pr-4">
            <h4 className="font-bold text-sm truncate">{currentMedia?.title}</h4>
            <p className="text-white/50 text-xs truncate">{currentMedia?.author}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full md:w-1/3 max-w-md gap-3">
          <div className="flex items-center gap-6">
            <button onClick={playPrevious} className="text-white/50 hover:text-white"><SkipBack size={20} fill="currentColor" /></button>
            <button onClick={togglePlay} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg">
              {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} className="ml-1" fill="currentColor"/>}
            </button>
            <button onClick={playNext} className="text-white/50 hover:text-white"><SkipForward size={20} fill="currentColor" /></button>
          </div>
          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] font-mono text-white/50">{formatTime(currentTime)}</span>
            <input type="range" min={0} max={1} step="any" value={progress / 100 || 0} onChange={(e) => { const seek = parseFloat(e.target.value) * duration; setCurrentTime(seek); if (isYT) ytPlayerRef.current?.seekTo(seek, true); else if (audioRef.current) audioRef.current.currentTime = seek; }} className="flex-1 h-1 bg-white/20 rounded-full appearance-none accent-[#2DD4BF] cursor-pointer" />
            <span className="text-[10px] font-mono text-white/50">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 w-1/3 hidden md:flex">
          <button onClick={() => setShowScenarioModal(true)} className={`p-3 rounded-full transition-all ${activeScenario ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}>
            <Music size={20} />
          </button>
          <button onClick={() => {}} className="p-3 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><Heart size={20} /></button>
        </div>
      </div>

      {/* ✅ MODAL DE CENÁRIOS ATUALIZADA (LIGAÇÃO REAL AO SANITY) */}
      <AnimatePresence>
        {showScenarioModal && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-[200] bg-[#2A3B69] text-white flex flex-col p-6 md:p-12 overflow-hidden">
            <button onClick={() => setShowScenarioModal(false)} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition"><X size={20} /></button>
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-12">Seleção de cenário</h2>
            <div className="max-w-xl mx-auto w-full space-y-8 mb-16">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3 w-1/3"><Volume2 size={20} className="opacity-70" /><span className="text-sm font-medium">Volume do cenário</span></div>
                <div className="flex-1 flex items-center gap-3">
                  <Volume2 size={14} className="opacity-50" /><input type="range" min="0" max="1" step="0.01" value={scenarioVolume} onChange={(e) => setScenarioVolume(parseFloat(e.target.value))} className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none accent-white cursor-pointer" /><Volume2 size={20} />
                </div>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><MonitorPlay size={20} className="opacity-70" /><span className="text-sm font-medium">Tocar vídeo do cenário</span></div>
                <div onClick={() => setIsVideoScenarioEnabled(!isVideoScenarioEnabled)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isVideoScenarioEnabled ? 'bg-white' : 'bg-white/30'}`}>
                  <motion.div layout className={`w-4 h-4 rounded-full shadow-md ${isVideoScenarioEnabled ? 'bg-[#2A3B69]' : 'bg-white'}`} animate={{ x: isVideoScenarioEnabled ? 24 : 0 }} />
                </div>
              </div>
            </div>

            <div className="w-full mt-auto">
              <div className="flex items-center gap-2 mb-6">
                <Music size={18} /><h3 className="font-semibold">Seleção de cenário</h3>
                {activeScenario && <button onClick={() => setActiveScenario(null)} className="ml-auto text-sm bg-black/20 px-4 py-2 rounded-full hover:bg-black/40 transition">Remover cenário ativo</button>}
              </div>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                {cenariosDisponiveis.map((cenario: any, i: number) => {
                  // Thumbnail de fallback (YouTube mqdefault) se não houver imagem no Sanity
                  const thumb = cenario.img || (cenario.youtubeId ? `https://img.youtube.com/vi/${getYTId(cenario.youtubeId)}/mqdefault.jpg` : "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=800");
                  return (
                    <div key={cenario._id || i} onClick={() => setActiveScenario(cenario)} className={`relative shrink-0 w-64 md:w-80 h-36 md:h-44 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${activeScenario?.title === cenario.title ? 'border-white' : 'border-transparent hover:border-white/50'}`}>
                      <img src={thumb} alt={cenario.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition" />
                      <p className="absolute bottom-3 text-center w-full text-sm font-medium drop-shadow-md">{cenario.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}