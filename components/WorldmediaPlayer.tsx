"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, CheckCircle2, MonitorPlay, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toggleFavorite as toggleFavoriteAction } from "@/app/actions/updateCustomer";
import Link from '@/components/MyLink'; 

declare global {
  interface Window { onYouTubeIframeAPIReady: () => void; YT: any; }
}

export default function WorldmediaPlayer({ 
  courseModules = [], 
  standaloneTracks = [], 
  courseId = "biblioteca_livre",
  customGradient 
}: { 
  courseModules?: any[], 
  standaloneTracks?: any[], 
  courseId?: string,
  customGradient?: string 
}) {
  const { data: session, status } = useSession();
  
  // 🚨 REMOVIDO: O estado de 'hasAccess' foi eliminado daqui! 
  // O ficheiro page.tsx já tratou disso antes de renderizar este componente.

  const modulesToRender = useMemo(() => {
    const safeModules = Array.isArray(courseModules) ? courseModules : [];
    const safeStandalone = Array.isArray(standaloneTracks) ? standaloneTracks : [];
    
    const modules = [...safeModules];
    if (safeStandalone.length > 0) {
      modules.unshift({
        title: 'Faixas Individuais',
        content: safeStandalone
      });
    }
    return modules;
  }, [courseModules, standaloneTracks]);
  
  const allMediaItems = useMemo(() => {
    return modulesToRender.flatMap((m: any) => m.content || []);
  }, [modulesToRender]);
  
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
  
  const lastSavedTimeDB = useRef<number>(0);
  const hasMarked95Ref = useRef<string | null>(null);

  // Garante que não faz reset para a faixa 0 se a atual tiver apenas _ref
  useEffect(() => {
    const hasIdentifier = currentMedia?._id || currentMedia?._ref;
    if (!hasIdentifier && allMediaItems.length > 0) {
      setCurrentMedia(allMediaItems[0]);
    }
  }, [allMediaItems, currentMedia]);

  const isYT = currentMedia?.url?.includes("youtube.com") || currentMedia?.url?.includes("youtu.be");
  const totalTracksInCourse = allMediaItems.length;
  const courseCompletionPercentage = totalTracksInCourse > 0 ? Math.round((completedTracks.length / totalTracksInCourse) * 100) : 0;

  // 👇 MANTIDA A SINCRONIZAÇÃO APENAS PARA FAVORITOS E PROGRESSO (Sem bloqueios)
  useEffect(() => {
    const localFavs = localStorage.getItem(`meditt_favs_${session?.user?.email || 'guest'}`);
    const localCompleted = localStorage.getItem(`meditt_completed_${courseId}_${session?.user?.email || 'guest'}`);
    
    if (localFavs) setFavorites(JSON.parse(localFavs));
    if (localCompleted) setCompletedTracks(JSON.parse(localCompleted));

    if (status === "authenticated") {
      fetch('/api/customer-data') 
        .then(async res => {
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) return res.json();
          return null;
        })
        .then(data => {
          if (!data || !data.user) return;

          // Sincronização de Favoritos
          if (data?.user?.favorites?.length > 0) {
            const dbFavs = data.user.favorites.map((f: any) => f._id || f);
            setFavorites(dbFavs);
            localStorage.setItem(`meditt_favs_${session.user?.email}`, JSON.stringify(dbFavs));
          }
          // Sincronização de Progresso
          if (data?.user?.courseProgress?.length > 0) {
             const dbCompleted = data.user.courseProgress.filter((p: any) => p.isCompleted).map((p: any) => p.trackId);
             setCompletedTracks(dbCompleted);
             localStorage.setItem(`meditt_completed_${courseId}_${session.user?.email}`, JSON.stringify(dbCompleted));
          }
        })
        .catch(e => {
            console.warn("Sync: Falha a buscar favoritos da BD. Usando local.");
        });
    }
  }, [status, session?.user?.email, courseId, currentMedia]);

  const handleTrackPlay = async (track: any) => {
    if (!track?._id || track?._ref || track._id?.includes('ph-')) return;
    const trackTitle = track.title || track.name || "Prática Meditt";
    try {
      await fetch("/api/stats/track-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track._id, title: trackTitle }),
      });
    } catch (err) {
      console.error("Erro stats:", err);
    }
  };

  const saveProgressToDB = useCallback(async (time: number, completed: boolean) => {
    if (status !== "authenticated" || !currentMedia || currentMedia._ref) return;
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId: courseId, trackId: currentMedia._id, timeWatched: Math.floor(time), isCompleted: completed 
        })
      });
    } catch (e) { console.error("Erro ao sincronizar MongoDB:", e); }
  }, [currentMedia, courseId, status]);

  const handleToggleFavorite = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation(); 
    if (!trackId || trackId.includes('ph-')) return; 
    
    const isAdding = !favorites.includes(trackId);
    const newFavs = isAdding ? [...favorites, trackId] : favorites.filter(id => id !== trackId);
    setFavorites(newFavs);
    
    if (session?.user?.email) localStorage.setItem(`meditt_favs_${session.user.email}`, JSON.stringify(newFavs));

    const res = await toggleFavoriteAction(trackId);
    if (!res.success) {
      const revertedFavs = isAdding ? favorites.filter(id => id !== trackId) : [...favorites, trackId];
      setFavorites(revertedFavs);
      if (session?.user?.email) localStorage.setItem(`meditt_favs_${session.user.email}`, JSON.stringify(revertedFavs));
    }
  };

  const handlePlayNewTrack = (track: any) => {
    hasMarked95Ref.current = null;
    lastSavedTimeDB.current = 0;
    setCurrentMedia(track);
    handleTrackPlay(track);
  };

  useEffect(() => {
    const currentId = currentMedia?._id || currentMedia?._ref;
    if (!currentId) return;

    const moduleIndex = modulesToRender.findIndex((m: any) =>
      m.content?.some((track: any) => {
        const trackId = track._id || track._ref;
        return trackId === currentId;
      })
    );
    
    if (moduleIndex !== -1) {
      setActiveModuleIndex((prevIndex) => prevIndex !== moduleIndex ? moduleIndex : prevIndex);
    }
  }, [currentMedia, modulesToRender]);

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

  useEffect(() => {
    const isInitial = isFirstMount.current;
    if (isFirstMount.current) isFirstMount.current = false;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    clearInterval(intervalRef.current);
    setProgress(0);
    setCurrentTime(0);
    
    if (!isInitial) setIsPlaying(true); else setIsPlaying(false);
    
    if (isYT && window.YT && window.YT.Player) {
      initYT(!isInitial);
    } else {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      if (!isInitial) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch((err) => {
              console.log("Autoplay bloqueado", err);
              setIsPlaying(false);
            });
          }
        }, 100);
      }
    }
  }, [currentMedia]);

  const getYTStartTime = (url: string) => {
    if (!url) return 0;
    const match = url.match(/(?:t=|start=)([^&]+)/i);
    if (!match) return 0;

    const timeStr = match[1];
    if (!isNaN(Number(timeStr))) return Number(timeStr);

    let seconds = 0;
    const hMatch = timeStr.match(/(\d+)h/i);
    const mMatch = timeStr.match(/(\d+)m/i);
    const sMatch = timeStr.match(/(\d+)s/i);

    if (hMatch) seconds += parseInt(hMatch[1]) * 3600;
    if (mMatch) seconds += parseInt(mMatch[1]) * 60;
    if (sMatch) seconds += parseInt(sMatch[1]);

    return seconds;
  };

  const initYT = (shouldAutoplay = false) => {
    if (!isYT || !currentMedia?.url) return;
    if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') ytPlayerRef.current.destroy();
    
    const id = getYTId(currentMedia.url);
    const startTime = getYTStartTime(currentMedia.url); 

    if (!id) return;

    ytPlayerRef.current = new window.YT.Player('yt-motor', {
      videoId: id,
      playerVars: { 
        autoplay: shouldAutoplay ? 1 : 0, 
        controls: 0, 
        modestbranding: 1, 
        rel: 0, 
        enablejsapi: 1,
        start: startTime 
      },
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
            if (e.data === 0) playNext(); 
          }
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
        setCurrentTime(now);
        setDuration(dur);
        
        const curProg = (now / dur) * 100;
        setProgress(curProg);

        if (now - lastSavedTimeDB.current >= 10 && currentMedia?._id) {
          saveProgressToDB(now, false);
          lastSavedTimeDB.current = now;
        }
        if (curProg >= 95 && hasMarked95Ref.current !== currentMedia._id && currentMedia?._id) {
          hasMarked95Ref.current = currentMedia._id;
          const newCompleted = [...new Set([...completedTracks, currentMedia._id])];
          setCompletedTracks(newCompleted);
          if (session?.user?.email) localStorage.setItem(`meditt_completed_${courseId}_${session.user.email}`, JSON.stringify(newCompleted));
          saveProgressToDB(now, true);
        }
      }
    }, 1000);
  };

  const togglePlay = () => {
    if (!isPlaying && currentMedia && isFirstMount.current === false) handleTrackPlay(currentMedia);
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
    const currentIndex = allMediaItems.findIndex(item => (item._id || item._ref) === (currentMedia._id || currentMedia._ref));
    if (currentIndex < allMediaItems.length - 1) handlePlayNewTrack(allMediaItems[currentIndex + 1]);
  };

  const playPrevious = () => {
    const currentIndex = allMediaItems.findIndex(item => (item._id || item._ref) === (currentMedia._id || currentMedia._ref));
    if (currentIndex > 0) handlePlayNewTrack(allMediaItems[currentIndex - 1]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const seekTime = val * duration;
    setCurrentTime(seekTime);
    setProgress(val * 100);

    if (isYT && ytPlayerRef.current) ytPlayerRef.current.seekTo(seekTime, true);
    else if (audioRef.current) audioRef.current.currentTime = seekTime;
  };

  const getYTId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
    return match ? match[1] : null;
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs) || secs < 0) return "00:00";
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${min < 10 ? '0' + min : min}:${sec}`;
  };

  const getCoverImage = (item: any) => {
    if (!item) return "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=1920&q=80";
    if (item.imageSource && typeof item.imageSource === 'string' && item.imageSource.startsWith('http')) return item.imageSource;
    if (item.imageSource && item.imageSource.url) return item.imageSource.url;
    if (typeof item.thumbnail === 'string') return item.thumbnail;
    if (item.thumbnail?.asset?.url) return item.thumbnail.asset.url;
    if (item.thumbnailUrl && typeof item.thumbnailUrl === 'string' && item.thumbnailUrl.startsWith('http')) return item.thumbnailUrl;
    if (item.image) return item.image;
    if (item.coverUrl) return item.coverUrl;
    if (item.url && (item.url.includes("youtube.com") || item.url.includes("youtu.be"))) {
      const ytId = getYTId(item.url);
      if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg?v=1`;
    }
    return "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=1920&q=80";
  };

  const currentCover = getCoverImage(currentMedia);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src.includes('mqdefault.jpg')) {
      target.src = target.src.replace('mqdefault.jpg', 'default.jpg');
    }
  };

  // 🚨 REMOVIDOS OS BLOCOS IF(hasAccess === false) e IF(hasAccess === null) QUE RENDERIZAVAM A MODAL.

  // 👇 RENDERIZA O PLAYER LIVREMENTE!
  return (
    <div className="w-full flex-1 flex flex-col font-sans text-white pb-32">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spotify-marquee { 0%, 15% { transform: translateX(0); } 85%, 100% { transform: translateX(calc(-100% + 110px)); } }
        @media (max-width: 768px) { .mobile-marquee { display: inline-block; white-space: nowrap; animation: spotify-marquee 7s linear infinite alternate; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* MOTORES NATIVOS */}
      <div className="hidden">
        <div id="yt-motor"></div>
        <audio
          ref={audioRef}
          src={!isYT ? currentMedia?.url : undefined}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            if (!isYT) {
              const el = e.currentTarget;
              setCurrentTime(el.currentTime);
              if (el.duration) {
                const curProg = (el.currentTime / el.duration) * 100;
                setProgress(curProg);
                
                if (el.currentTime - lastSavedTimeDB.current >= 10 && currentMedia?._id) {
                  saveProgressToDB(el.currentTime, false);
                  lastSavedTimeDB.current = el.currentTime;
                }
                if (curProg >= 95 && hasMarked95Ref.current !== currentMedia?._id && currentMedia?._id) {
                  hasMarked95Ref.current = currentMedia._id;
                  const newCompleted = [...new Set([...completedTracks, currentMedia._id])];
                  setCompletedTracks(newCompleted);
                  if (session?.user?.email) localStorage.setItem(`meditt_completed_${courseId}_${session.user.email}`, JSON.stringify(newCompleted));
                  saveProgressToDB(el.currentTime, true);
                }
              }
            }
          }}
          onEnded={() => { setIsPlaying(false); playNext(); }}
        />
      </div>

      {/* HEADER HERO COM ANIMAÇÕES DE MUDANÇA DE FAIXA */}
      <div className="relative w-full min-h-[350px] flex flex-col justify-end pt-32 pb-4 bg-[#0a0a0a] overflow-hidden">
        
        <div className="absolute inset-0">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentCover}
              initial={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src={currentCover}
              alt="Cover do Módulo"
              className="absolute inset-0 w-full h-full object-cover"
              onError={handleImageError}
            />
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#121212]/50 to-black/30 backdrop-blur-[0px]" />
        
        <div className="relative z-10 px-4 md:px-12 w-full max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMedia?._id || currentMedia?._ref || 'loading'}
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)", y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg leading-tight">
                {currentMedia?.title || (currentMedia?._ref ? "⚠️ Falta -> na Query GROQ" : 'A carregar...')}
              </h1>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500" />
                <p className="text-lg font-medium text-white/90">
                  {currentMedia?.author || (currentMedia?._ref ? "Referência não desempacotada" : 'Author Name')}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {modulesToRender.length > 1 && (
            <div className="mt-8 flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
              {modulesToRender.map((modulo: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveModuleIndex(index)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-xs md:text-sm font-bold uppercase transition-all whitespace-nowrap
                    ${activeModuleIndex === index ? 'bg-white text-black shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}
                  `}
                >
                  {modulo.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DA PLAYLIST */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-2 md:px-12 py-4 md:py-8">
        <div className="bg-white/[0.03] rounded-3xl border border-white/10 p-4 md:p-6 backdrop-blur-xl min-h-[300px]">
          <div className="space-y-1">
            
            {modulesToRender[activeModuleIndex]?.content?.map((item: any, index: number) => {
              const trackId = item?._id || item?._ref || `track-${index}`;
              const isActive = (currentMedia?._id === trackId) || (currentMedia?._ref === trackId);
              const isDone = completedTracks.includes(trackId);
              const isFav = favorites.includes(trackId);

              const displayTitle = item?.title || (item?._ref ? "⚠️ Falta '->' na query GROQ" : "Sem título");
              const displayAuthor = item?.author || (item?._ref ? "Verificar ficheiro de dados" : "Desconhecido");

              return (
                <div 
                  key={trackId}
                  onClick={() => {
                    if (isActive) togglePlay();
                    else handlePlayNewTrack(item); 
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full group flex items-center justify-between p-3 md:p-4 rounded-2xl transition-all duration-300 cursor-pointer
                    ${isActive ? 'bg-white/10 text-white border border-white/20' : 'hover:bg-white/5 text-white/70 hover:text-white border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3 md:gap-4 text-left overflow-hidden flex-1">
                    <div className={`w-6 md:w-8 h-6 md:h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
                      ${isActive ? 'border-teal-400 bg-teal-400/10' : isDone ? 'border-[#2DD4BF] text-[#2DD4BF] bg-[#2DD4BF]/10' : 'border-transparent'}
                    `}>
                      {isActive ? (
                        isPlaying ? <div className="w-3 h-3 rounded-sm bg-teal-400 animate-pulse" /> : <Play size={12} className="text-teal-400 ml-0.5" fill="currentColor"/>
                      ) : isDone ? (
                        <CheckCircle2 size={16} className="text-teal-400" />
                      ) : (
                        <span className="text-white/40 group-hover:hidden font-medium text-xs md:text-sm">{index + 1}</span>
                      )}
                      {!isActive && !isDone && <Play size={12} className="hidden group-hover:block text-white ml-0.5" fill="currentColor" />}
                    </div>
                    
                    <div className="overflow-hidden flex-1 max-w-[140px] sm:max-w-[200px] md:max-w-md">
                      <h3 className={`text-[12px] md:text-[14px] font-medium md:truncate max-md:mobile-marquee ${isActive ? 'text-teal-400 font-bold' : ''}`}>
                        {displayTitle}
                      </h3>
                      <p className="text-[10px] md:text-xs text-white/40 mt-0.5 md:mt-1 truncate">{displayAuthor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-6 text-white/40 flex-shrink-0">
                    <span className="text-[10px] md:text-[10px] font-mono tracking-wider">
                      {item?.duration || formatTime(isActive ? duration : 0)} min
                    </span>
                    <div 
                      onClick={(e) => handleToggleFavorite(e, trackId)} 
                      className="p-2 -m-2 hover:scale-110 transition-transform"
                    >
                      {isFav ? <Heart size={16} fill="#ff4b4b" color="#ff4b4b" /> : <Heart size={16} className="hover:text-teal-400" />}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {(!modulesToRender[activeModuleIndex]?.content || modulesToRender[activeModuleIndex].content.length === 0) && (
               <p className="text-center text-white/40 py-10">Não existem faixas nesta secção.</p>
            )}

          </div>
        </div>
      </div>

      {/* STICKYBAR */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 150 }} transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-[#0a0a0a]/50 backdrop-blur-xl border-t border-white/10 px-4 md:px-8 flex items-center justify-center z-150 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 left-0 h-1 bg-white/10 w-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${courseCompletionPercentage}%` }} 
              transition={{ duration: 1 }} 
              className="h-full bg-[#2DD4BF] relative"
            />
          </div>

          <div className="absolute left-4 md:static md:w-1/3 flex items-center gap-4">
            <motion.img 
              key={currentCover}
              initial={{ opacity: 0, filter: "blur(5px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
              src={currentCover} 
              alt="Capa Faixa" 
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl object-cover shadow-lg border border-white/5 bg-zinc-900" 
              onError={handleImageError}
            />
            <div className="hidden md:block truncate">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMedia?._id || currentMedia?._ref}
                  initial={{ opacity: 0, x: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-white font-bold truncate">
                    {currentMedia?.title || (currentMedia?._ref ? "⚠️ Falta '->'" : "Sem título")}
                  </h4>
                  <p className="text-white/50 text-sm truncate">{currentMedia?.author}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full md:flex-1 max-w-2xl flex flex-col items-center justify-center pl-16 pr-2 md:px-0">
            <div className="flex items-center gap-4 md:gap-6 mb-2">
              <button onClick={playPrevious} className="text-white/50 hover:text-white transition">
                <SkipBack size={20} className="md:w-6 md:h-6" fill="currentColor" />
              </button>
              <button onClick={togglePlay} className="w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {isPlaying ? <Pause size={20} className="md:w-6 md:h-6" fill="currentColor"/> : <Play size={20} className="md:w-6 md:h-6 ml-1" fill="currentColor"/>}
              </button>
              <button onClick={playNext} className="text-white/50 hover:text-white transition">
                <SkipForward size={20} className="md:w-6 md:h-6" fill="currentColor" />
              </button>
            </div>
            
            <div className="w-full flex items-center gap-2 md:gap-3">
              <span className="text-[9px] md:text-xs text-white/50 font-mono w-8 md:w-auto text-right">{formatTime(currentTime)}</span>
              <input type="range" min={0} max={1} step="any" value={progress / 100 || 0} onChange={handleSeek} className="flex-1 h-1 md:h-1.5 bg-white/20 rounded-full appearance-none accent-teal-400 cursor-pointer" />
              <span className="text-[9px] md:text-xs text-white/50 font-mono w-8 md:w-auto text-left">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="w-1/3 flex items-center justify-end gap-4 hidden md:flex">
             <button 
               onClick={(e) => handleToggleFavorite(e, currentMedia?._id || currentMedia?._ref)} 
               className="p-3 hover:bg-white/10 rounded-full transition-all"
             >
               {favorites.includes(currentMedia?._id || currentMedia?._ref) ? <Heart size={20} fill="#ff4b4b" color="#ff4b4b" /> : <Heart size={20} className="text-white/50 hover:text-white" />}
             </button>
            <Volume2 size={20} className="text-white/50 hover:text-white cursor-pointer" />
            <div className="w-24 h-1.5 bg-white/20 rounded-full">
              <div className="w-2/3 h-full bg-white rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}