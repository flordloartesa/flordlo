"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Icons from "./Icons"; 
import { toggleFavorite as toggleFavoriteAction } from "@/app/actions/updateCustomer";
import YouTubePlayer from "./YouTubePlayer"; 

// ✅ FRASES INSPIRADORAS PARA O LOADING SCREEN
const INSPIRATIONAL_QUOTES = [
  "Para por uns segundos e entra em contacto com a tua respiração! Como ela está?",
  "A paz vem de dentro. Não a procures à tua volta.",
  "A mente é como a água. Quando está agitada, é difícil ver. Quando assenta, a resposta torna-se clara.",
  "O momento presente é o único momento sobre o qual temos domínio.",
  "Inspira confiança, expira a dúvida.",
  "Observa os teus pensamentos como nuvens a passar no céu, sem te apegares a eles.",
  "A tua respiração é a âncora que te traz de volta ao agora.",
  "Onde quer que estejas, estejas lá por inteiro."
];

// ✅ FUNÇÃO DE EXTRAÇÃO DE YOUTUBE INTELIGENTE E SEGURA
const getTrackYouTubeId = (track: any): string | null => {
  if (!track) return null;
  
  // 1. Procura primeiro nos campos que são EXCLUSIVOS de vídeo
  const explicitVideoFields = [track.youtubeUrl, track.videoUrl, track.codigo, track.video, track.youtube];
  for (const val of explicitVideoFields) {
    if (typeof val === 'string' && val.trim() !== '') {
      const str = val.trim().replace(/\\/g, '');
      if (str.length === 11 && !str.includes(' ') && !str.includes('/')) return str; // Código direto
      const match = str.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
      if (match && match[1]) return match[1];
    }
  }

  // 2. Se for o campo geral "url" ou "link", SÓ ACEITA se tiver a palavra "youtube" lá no meio.
  // (Isto impede que o teu link de MP3 da Cloudflare seja lido como vídeo!)
  const genericFields = [track.url, track.link];
  for (const val of genericFields) {
    if (typeof val === 'string' && (val.includes('youtube') || val.includes('youtu.be'))) {
      const match = val.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
      if (match && match[1]) return match[1];
    }
  }

  return null;
};

// ✅ FUNÇÃO VITAL PARA O ÁUDIO
const getValidAudioUrl = (track: any): string | null => {
  if (!track) return null;
  if (getTrackYouTubeId(track)) return null;

  const possibleValues = [track.cloudflareAudioUrl, track.url, track.audioUrl, track.audioFile?.asset?.url, track.link];
  for (const val of possibleValues) {
    if (typeof val === 'string' && val.trim() !== '') {
      return val;
    }
  }
  return null;
};

const formatSeconds = (secs: number) => {
  if (!secs || isNaN(secs) || !isFinite(secs) || secs < 0) return "00:00";
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
};

const AMBIENT_TRACKS = {
  forest: "https://pub-1658279070cc4b1b9e98c97054103002.r2.dev/freesound_community-forest-with-small-river-birds-and-nature-field-recording-6735.mp3",
  ocean: "https://pub-1658279070cc4b1b9e98c97054103002.r2.dev/prem_adhikary-relaxing-ocean-waves-high-quality-recorded-177004.mp3",
  rain: "https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3"
};

export default function UniversalPlayer({ course }: { course: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const idleAudioRef = useRef<HTMLAudioElement>(null); 
  const lastSavedTimeDB = useRef<number>(0);
  const hasMarked95Ref = useRef<string | null>(null);
  const ambientTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(true); 
  const [loadingQuote, setLoadingQuote] = useState(INSPIRATIONAL_QUOTES[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [isIdle, setIsIdle] = useState(false);
  const [idleVolume, setIdleVolume] = useState(0.2); 
  const [ambientSound, setAmbientSound] = useState<'forest' | 'ocean' | 'rain'>('forest');
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);
  const [participantsCount, setParticipantsCount] = useState<number>(0);

  const validAudioUrl = useMemo(() => getValidAudioUrl(currentTrack), [currentTrack]);
  const activeTrackYoutubeId = useMemo(() => getTrackYouTubeId(currentTrack), [currentTrack]);
  const isVideoTrack = !!activeTrackYoutubeId;

  useEffect(() => {
    if (isLoading) {
      const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
      setLoadingQuote(INSPIRATIONAL_QUOTES[randomIndex]);
    }
  }, [isLoading]);

  useEffect(() => {
    if (status !== "loading") {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [status]);


    // ✅ FUNÇÃO PARA TROCAR AMBIENTE COM LOADING SCREEN

  const handleAmbientChange = (sound: 'forest' | 'ocean' | 'rain') => {
    if (ambientSound === sound) return; 
    setAmbientSound(sound);
    setIsLoading(true); 
    if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
    ambientTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 10);
  };


  useEffect(() => {
    const storedParticipants = sessionStorage.getItem(`meditt_participants_${currentTrack?._id}`);
    if (storedParticipants && currentTrack) {
        setParticipantsCount(parseInt(storedParticipants, 10));
    } else if (currentTrack) {
        const randomCount = Math.floor(Math.random() * (80 - 5 + 1)) + 5;
        setParticipantsCount(randomCount);
        sessionStorage.setItem(`meditt_participants_${currentTrack._id}`, randomCount.toString());
    }

    const localFavs = localStorage.getItem(`meditt_favs_${session?.user?.email || 'guest'}`);
    const localCompleted = localStorage.getItem(`meditt_completed_${course?._id || course?.id}_${session?.user?.email || 'guest'}`);
    
    if (localFavs) setFavorites(JSON.parse(localFavs));
    if (localCompleted) setCompletedTracks(JSON.parse(localCompleted));

    if (status === "authenticated") {
      fetch('/api/customer-data') 
        .then(res => res.json())
        .then(data => {
          if (data?.user?.favorites && data.user.favorites.length > 0) {
            const dbFavs = data.user.favorites.map((f: any) => f._id || f);
            setFavorites(dbFavs);
            localStorage.setItem(`meditt_favs_${session.user?.email}`, JSON.stringify(dbFavs));
          }
          if (data?.user?.courseProgress && data.user.courseProgress.length > 0) {
             const dbCompleted = data.user.courseProgress
               .filter((p: any) => p.isCompleted)
               .map((p: any) => p.trackId);
             setCompletedTracks(dbCompleted);
             localStorage.setItem(`meditt_completed_${course?._id || course?.id}_${session.user?.email}`, JSON.stringify(dbCompleted));
          }
        })
        .catch(e => console.error("Erro ao sincronizar dados iniciais:", e));
    }
  }, [status, session?.user?.email, course?._id, course?.id, currentTrack]);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      if (isPlaying && !isVideoTrack) { 
        idleTimer = setTimeout(() => setIsIdle(true), 10000);
      }
    };
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keypress", handleActivity);
    window.addEventListener("click", handleActivity);
    handleActivity(); 
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keypress", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearTimeout(idleTimer);
    };
  }, [isPlaying, isVideoTrack]);

  const showArt = (isIdle || isExpanded) && !isVideoTrack;

  useEffect(() => {
    if (idleAudioRef.current) {
      idleAudioRef.current.volume = isAmbientMuted ? 0 : idleVolume;
      if (showArt && !isAmbientMuted) {
        idleAudioRef.current.play().catch(e => console.error("Erro Idle Audio:", e));
      } else {
        idleAudioRef.current.pause();
      }
    }
  }, [showArt, idleVolume, ambientSound, isAmbientMuted]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isVideoTrack) {
      audioRef.current.pause();
      audioRef.current.src = ""; 
      return;
    }

    if (!validAudioUrl) return;

    if (audioRef.current.src !== validAudioUrl) {
      audioRef.current.src = validAudioUrl;
      audioRef.current.load();
    }

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Erro ao reproduzir áudio:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, validAudioUrl, isVideoTrack]);

  const saveProgressToDB = useCallback(async (time: number, completed: boolean) => {
    if (status !== "authenticated" || !currentTrack) return;
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId: course?._id || course?.id, 
          trackId: currentTrack._id, 
          timeWatched: Math.floor(time), 
          isCompleted: completed 
        })
      });
    } catch (e) { console.error("Erro ao sincronizar MongoDB:", e); }
  }, [currentTrack, course, status]);

  useEffect(() => {
    if (isVideoTrack && isPlaying) {
      const timer = setTimeout(() => {
        if (currentTrack && hasMarked95Ref.current !== currentTrack._id) {
          hasMarked95Ref.current = currentTrack._id;
          const newCompleted = [...new Set([...completedTracks, currentTrack._id])];
          setCompletedTracks(newCompleted);
          if (session?.user?.email) {
            localStorage.setItem(`meditt_completed_${course?._id || course?.id}_${session.user?.email}`, JSON.stringify(newCompleted));
          }
          saveProgressToDB(100, true);
        }
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [isVideoTrack, isPlaying, currentTrack, completedTracks, session, course, saveProgressToDB]);

  const { groups, totalTracksInCourse } = useMemo(() => {
    let rawGroups: Record<string, any[]> = {};
    let totalTracks = 0;
    
    if (course?.modules?.length > 0) {
      course.modules.forEach((mod: any) => {
        rawGroups[mod.title || "Módulo"] = mod.content || [];
        totalTracks += (mod.content || []).length;
      });
    } else if (course?.courseContent) {
      ["nivel1", "nivel2", "nivel3"].forEach(lvl => {
        if (course.courseContent[lvl]?.length > 0) {
          rawGroups[lvl.replace("nivel", "Nível ")] = course.courseContent[lvl];
          totalTracks += course.courseContent[lvl].length;
        }
      });
    } else {
      rawGroups["Geral"] = course?.content || [];
      totalTracks += (course?.content || []).length;
    }
    return { groups: rawGroups, totalTracksInCourse: totalTracks };
  }, [course]);

  useEffect(() => {
    const keys = Object.keys(groups);
    if (keys.length > 0 && !activeGroup) setActiveGroup(keys[0]);
  }, [groups, activeGroup]);

  const handlePlay = (track: any) => {
    if (track.isLocked && !course.hasFullAccess) return;
    
    if (currentTrack?._id === track._id) {
      setIsPlaying(!isPlaying);
    } else {
      hasMarked95Ref.current = null;
      setCurrentTrack(track);
      setIsPlaying(true); 
    }
  };

  const playNext = () => {
    const currentList = groups[activeGroup];
    if (!currentList) return;
    const idx = currentList.findIndex((t: any) => t._id === currentTrack?._id);
    if (idx >= 0 && idx < currentList.length - 1) handlePlay(currentList[idx + 1]);
  };

  const playPrev = () => {
    const currentList = groups[activeGroup];
    if (!currentList) return;
    const idx = currentList.findIndex((t: any) => t._id === currentTrack?._id);
    if (idx > 0) handlePlay(currentList[idx - 1]);
  };

  const skip = (amount: number) => {
    if (audioRef.current && !isVideoTrack) {
      audioRef.current.currentTime += amount;
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation(); 
    
    const isAdding = !favorites.includes(trackId);
    const newFavs = isAdding ? [...favorites, trackId] : favorites.filter(id => id !== trackId);
    setFavorites(newFavs);
    
    if (session?.user?.email) {
      localStorage.setItem(`meditt_favs_${session.user.email}`, JSON.stringify(newFavs));
    }

    const res = await toggleFavoriteAction(trackId);
    if (!res.success) {
      console.error("Falha ao gravar favorito na DB. Revertendo.");
      const revertedFavs = isAdding ? favorites.filter(id => id !== trackId) : [...favorites, trackId];
      setFavorites(revertedFavs);
      if (session?.user?.email) localStorage.setItem(`meditt_favs_${session.user.email}`, JSON.stringify(revertedFavs));
    }
  };

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const courseCompletionPercentage = totalTracksInCourse > 0 
    ? Math.round((completedTracks.length / totalTracksInCourse) * 100) 
    : 0;

  // IMAGEM HERO SPOTIFY STYLE
  const heroImageSrc = course?.heroImageUrl || course?.heroImage?.asset?.url || course?.coverImageUrl || course?.coverImage?.asset?.url || "https://64.media.tumblr.com/12d2a1fb27beb5bcc4d8c93d834ee9d9/04801380bf115da1-40/s1280x1920/b956b0f0a664d7ebb4b25992f055099b9537e846.jpg";
  const bgImage = course?.playerBackgroundImage?.asset?.url || course?.backgroundImageUrl || "https://64.media.tumblr.com/12d2a1fb27beb5bcc4d8c93d834ee9d9/04801380bf115da1-40/s1280x1920/b956b0f0a664d7ebb4b25992f055099b9537e846.jpg";
  const idleGradient = course?.idleGradient || "linear-gradient(105deg, rgba(16, 16, 148, 0.7) 0%, rgba(11, 162, 217, 0.1) 100%)";

  const AMBIENT_MEDIA = {
    forest: course?.idleGifForest || "https://64.media.tumblr.com/b95ea67270ad37540c0b666fe7cd408c/885d4d0feb3dfde8-d7/s640x960/595e91ee982e71703601ae68232b78600bc300e9.gifv",
    ocean: course?.idleGifOcean || "https://i.pinimg.com/originals/fc/ed/f4/fcedf41d08fb2dbb5db65489cf2da4be.gif",
    rain: course?.idleGifRain || "https://i.pinimg.com/originals/e2/c8/a8/e2c8a84bae49d4c34bdcf9b21c756645.gif"
  };

  const idleMediaUrl = AMBIENT_MEDIA[ambientSound] || course?.idleGifUrl;
  
  // 🔥 NOVO: EXTRAÇÃO DE ID PARA O MODO ARTE (Caso venha link do youtube no idleMediaUrl)
  const idleYoutubeId = useMemo(() => {
    if (!idleMediaUrl) return null;
    const match = idleMediaUrl.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
    return match ? match[1] : null;
  }, [idleMediaUrl]);

  const isVideoMedia = idleMediaUrl ? 
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(idleMediaUrl) || 
    idleMediaUrl.toLowerCase().includes('.mp4') || 
    idleMediaUrl.toLowerCase().includes('pexels.com/video-files') ||
    idleMediaUrl.toLowerCase().includes('player.vimeo.com/external')
    : false;

  const instructorImageUrl = 
    (typeof course?.instructorPhoto === 'string' ? course.instructorPhoto : course?.instructorPhoto?.asset?.url) ||
    (typeof course?.instructor?.imageUrl === 'string' ? course.instructor.imageUrl : null) ||
    (typeof course?.instructor?.image === 'string' ? course.instructor.image : course?.instructor?.image?.asset?.url) ||
    null;

  const instructorName = course?.instructorName || course?.instructor?.name;
  const instructorRole = course?.instructorRole || course?.instructor?.role;

  return (
    <div className="relative min-h-screen bg-[#0A0B1E] text-white overflow-x-hidden font-sans md:-ml-[300px] md:w-[calc(100%+300px)] min-[1275px]:ml-0 min-[1275px]:w-full" style={{ fontSize: '14px' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseLogo {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.4) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          background-color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.8);
        }
      ` }} />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2147483647,
          background: 'linear-gradient(95deg, rgba(0,66,139,1) 45%, rgba(6,138,136,1) 100%)',
          display: 'flex',
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isLoading ? 1 : 0,
          pointerEvents: isLoading ? 'auto' : 'none',
          transition: 'opacity 0.8s ease-in-out',
          padding: '20px'
        }}
      >
        <img
          src="https://64.media.tumblr.com/a61f9037de0a73e8161bb4b2ba661d9c/d03a5d8c83d77852-db/s500x750/d45cd2861c043e93c9b5c2839ec42909e2c06b36.pnj"
          alt="Logo Meditt"
          style={{
            width: '180px',
            height: 'auto',
            objectFit: 'contain',
            animation: isLoading ? 'pulseLogo 2s infinite ease-in-out' : 'none',
            marginBottom: '30px' 
          }}
        />
        
        <p className="text-white text-center text-[15px] md:text-lg font-light italic tracking-wide max-w-md opacity-90 drop-shadow-md">
           "{loadingQuote}"
        </p>
      </div>

      <audio ref={idleAudioRef} src={AMBIENT_TRACKS[ambientSound]} preload="auto" loop />

      {/* BACKGROUND GLOBAL BLUR (MANTÉM O TOM ESCURO) */}
      <div className="fixed inset-0 z-0">
        <img 
          src={bgImage} 
          className="w-full h-full object-cover opacity-30 blur-[60px] scale-125" 
          alt="" 
        />
        {course?.customGradient ? (
          <div className="absolute inset-0 z-0" style={{ background: course.customGradient }} />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#12122b]/90 via-transparent to-[#12122b]/90 z-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0B1E] opacity-90 z-10" />
          </>
        )}
      </div>

      {!showArt && }

      <div className="fixed top-6 left-6 min-[1275px]:left-[300px] z-[60] flex items-center transition-opacity duration-500">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition border border-white/10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isExpanded ? <path d="M6 9l6 6 6-6"/> : <path d="M6 15l6-6 6 6"/>}
          </svg>
        </button>
      </div>

      {/* PAINEL MODO ARTE / SOM AMBIENTE */}


      {showArt && (
        <div className="fixed top-6 right-[120px] md:top-[80px] md:right-[120px] z-[60] flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            
            <button onClick={() => setIsAmbientMuted(!isAmbientMuted)} className="text-white/70 hover:text-white transition">
               {isAmbientMuted ? (
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
               ) : (
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
               )}
            </button>

            <div className="w-px h-3.5 bg-white/20"></div>

            <div className="flex items-center gap-1">
              <button onClick={() => handleAmbientChange('forest')} className={`p-1 rounded-full transition-all ${ambientSound === 'forest' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`} title="Floresta">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-8"/><path d="M12 14c-2.5 0-5-2-5-5s2-5 5-5 5 2 5 5-2.5 5-5 5z"/></svg>
              </button>
              <button onClick={() => handleAmbientChange('ocean')} className={`p-1 rounded-full transition-all ${ambientSound === 'ocean' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`} title="Oceano">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>
              </button>
              <button onClick={() => handleAmbientChange('rain')} className={`p-1 rounded-full transition-all ${ambientSound === 'rain' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`} title="Chuva">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
              </button>
            </div>

            <div className="w-px h-3.5 bg-white/20"></div>

            <input
               type="range"
               min="0"
               max="1"
               step="0.05"
               value={idleVolume}
               onChange={(e) => {
                 setIdleVolume(parseFloat(e.target.value));
                 if (isAmbientMuted) setIsAmbientMuted(false); 
               }}
               className="w-12 h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer"
               title="Volume"
            />
          </div>
        </div>
      )}

      {/* MODO ARTE (ECRÃ CHEIO) */}
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center transition-all duration-1000 z-[40]"
        style={{
           backdropFilter: showArt ? 'blur(15px)' : 'blur(0px)',
           opacity: showArt ? 1 : 0,
           pointerEvents: showArt ? 'auto' : 'none',
        }}
      >
         <div className="absolute inset-0 z-[-1] overflow-hidden w-full h-screen bg-black/40">
  {/* 🔥 NOVO: SE FOR YOUTUBE, RENDERIZA O IFRAME MUTADO E EM LOOP 🔥 */}
  {idleYoutubeId ? (
    <div className="absolute top-1/2 left-1/2 w-[105%] h-[105vh] md:w-[105vw] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <iframe
    className="absolute top-1/2 left-1/2 w-[105vw] h-[56.25vw] min-h-[105vh] min-w-[178vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
  
        style={{ border: 'none' }}
        src={`https://www.youtube.com/embed/${idleYoutubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${idleYoutubeId}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
        allow="autoplay; encrypted-media"
        frameBorder="0"
      />
    </div>
  ) : idleMediaUrl && isVideoMedia ? (
    <video 
      src={idleMediaUrl} 
      autoPlay loop muted playsInline 
      className="absolute inset-0 w-full h-full object-cover"
    />
  ) : idleMediaUrl ? (
    <div 
      className="absolute inset-0 w-full h-full"
      style={{ background: `url('${idleMediaUrl}') no-repeat center center / cover` }}
    />
  ) : null}
  <div 
    className="absolute inset-0 w-full h-full"
    style={{ background: idleGradient || 'transparent' }}
  />
</div>

         {showArt && currentTrack && (
           <div className="flex flex-col items-center justify-center -mt-20">
              <div className="flex flex-col items-center mb-12 text-center drop-shadow-md">
                 <h2 className="text-3xl font-light tracking-wide text-white drop-shadow-lg mb-1">
                    {currentTrack?.title}
                 </h2>
                 {participantsCount > 0 && (
                   <span className="text-[10px] font-light opacity-70 normal-case tracking-normal text-white mt-1">
                     {participantsCount} utilizadores também estão a praticar
                   </span>
                 )}
              </div>

              <div className="relative w-[260px] h-[260px] flex items-center justify-center">
                  <svg width="260" height="260" viewBox="0 0 260 260" className="absolute -rotate-90">
                      <circle cx="130" cy="130" r={radius} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="5" fill="transparent" />
                      <circle 
                        cx="130" cy="130" r={radius} stroke="#ffffff" strokeWidth="5" fill="transparent" 
                        strokeDasharray={circumference} 
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out', strokeLinecap: 'round' }} 
                      />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-5xl font-extralight text-white tracking-tighter drop-shadow-md">
                      {formatSeconds(duration - currentTime)}
                  </div>
              </div>
              
              {instructorName && (
                <div className="mt-10 flex flex-col items-center justify-center animate-fade-in opacity-80 text-center drop-shadow-md">
                  <div className="flex items-center gap-2">
                    {instructorImageUrl ? (
                      <img 
                        src={instructorImageUrl} 
                        alt={instructorName} 
                        className="w-[30px] h-[30px] rounded-full object-cover border border-white/20 shadow-md"
                      />
                    ) : (
                      <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center border border-white/20 shadow-md">
                        <span className="text-[10px] font-bold text-white">{instructorName.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-[11px] font-bold tracking-widest text-white">
                      <span className="tracking-normal">{instructorName}</span>
                    </span>
                    {instructorRole && (
                      <>
                        <span className="opacity-50">•</span>
                        <span className="text-[10px] font-light tracking-wide text-white/70">
                          {instructorRole}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

           </div>
         )}
      </div>

      {/* ✅ OVERLAY DE VÍDEO YOUTUBE SEGURO ✅ */}
      <AnimatePresence>
        {activeTrackYoutubeId && isPlaying && currentTrack && (
          <motion.div
            key={activeTrackYoutubeId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center bg-[#050C24]/98 backdrop-blur-2xl px-4 pt-16 pb-[120px]"
          >
            <div className="absolute inset-0 cursor-pointer z-0" onClick={() => { setIsPlaying(false); setCurrentTrack(null); }} />

            <button
              onClick={() => { setIsPlaying(false); setCurrentTrack(null); }}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white font-bold text-xs tracking-widest hover:text-white/70 z-[50] p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              FECHAR ✕
            </button>

            <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/10 relative z-10 pointer-events-auto">
              <YouTubePlayer
                videoId={activeTrackYoutubeId}
                isPlaying={isPlaying}
                onReady={(dur) => {
                  setDuration(dur);
                }}
                onProgress={(current, dur) => {
                  setCurrentTime(current);
                  setDuration(dur);
                  setProgress((current / dur) * 100);
                }}
                onEnd={() => {
                  setIsPlaying(false);
                  if (currentTrack) {
                    const newCompleted = [...new Set([...completedTracks, currentTrack._id])];
                    setCompletedTracks(newCompleted);
                    saveProgressToDB(100, true);
                  }
                }}
              />
            </div>
            
            <h3 className="mt-8 text-xl font-light tracking-wide text-white drop-shadow-md text-center px-4 z-10 pointer-events-none">
              {currentTrack?.title}
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ NOVO HERO BANNER SPOTIFY-STYLE ✅ */}
      <div 
        className={`relative w-full transition-opacity duration-700 z-10 ${showArt ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 h-[40vh] md:h-[40vh] w-full"
          style={{
            backgroundImage: `url(${heroImageSrc})`,
            backgroundPosition: 'center 50%',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* O gradiente faz a transição entre a imagem e o fundo escuro da lista */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-[#0A0B1E]/50 to-[#0A0B1E]"></div>
        </div>

        <div className="relative pt-[7vh] md:pt-[12vh] max-w-4xl mx-auto px-6 lg:px-8 flex flex-col items-start justify-end pb-8">
             <h1 className="text-5xl md:text-6xl min-[1275px]:text-3xl font-black mb-2 tracking-tighter drop-shadow-2xl text-white">{course.title}</h1>
           {course.subtitle && (
             <p className="text-sm md:text-base font-light opacity-80 drop-shadow-md max-w-2xl text-white/80">
               {course.subtitle}
             </p>
           )}
           
           {instructorName && (
             <div className="mt-4 flex items-center gap-3 opacity-90">
               {instructorImageUrl ? (
                 <img 
                   src={instructorImageUrl} 
                   alt={instructorName} 
                   className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-md"
                 />
               ) : (
                 <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center border border-white/20 shadow-md">
                    <span className="text-[10px] font-bold text-white">{instructorName.charAt(0)}</span>
                 </div>
               )}
               <span className="text-xs font-bold tracking-widest text-white/90">
                 <span className="tracking-normal">{instructorName}</span>
               </span>
               {instructorRole && (
                 <>
                   <span className="text-white/40">•</span>
                   <span className="font-light tracking-wide text-xs text-white/60">
                     {instructorRole}
                   </span>
                 </>
               )}
             </div>
           )}
        </div>
      </div>

      {/* ✅ LISTA PRINCIPAL ✅ */}
      <main className={`relative z-20 max-w-4xl mx-auto px-4 pb-40 transition-opacity duration-700 ${showArt ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
       
       {/* Seletor de Grupos */}
       <div 
          className="flex overflow-x-auto custom-scrollbar gap-3 mb-8 pb-3 w-full justify-start" 
          style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {Object.keys(groups).map(name => (
            <button 
              key={name} 
              onClick={() => setActiveGroup(name)} 
              className={`shrink-0 px-4 py-1 rounded-full text-[9px] font-bold uppercase transition-all whitespace-nowrap tracking-wider ${activeGroup === name ? "bg-white text-black shadow-lg" : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"}`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/0 p-4 md:p-6 shadow-2xl">
          {groups[activeGroup]?.map((track: any, index: number) => {
            const isActive = currentTrack?._id === track._id;
            const isDone = completedTracks.includes(track._id);
            const isFav = favorites.includes(track._id);
            const isLast = index === groups[activeGroup].length - 1;
            
            const trackYoutubeId = getTrackYouTubeId(track); 

            return (
              <div key={track._id} className="relative flex flex-col group">
                <div onClick={() => handlePlay(track)} className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 ${isActive ? "bg-white/20 border border-white/20 shadow-md" : "hover:bg-white/10 border border-transparent"}`}>
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center mr-4 text-[12px] font-bold shadow-inner ${isActive ? "border-white bg-white text-black" : isDone ? "border-[#2DD4BF] text-[#2DD4BF] bg-[#2DD4BF]/10" : "border-white/20 group-hover:border-white/40"}`}>
                    {isActive && isPlaying ? <Icons.Pause /> : isActive && !isPlaying ? <Icons.Play /> : isDone ? <Icons.Check /> : track.sessionNumber || "▶"}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-medium transition-colors ${isActive ? "text-white" : "text-white/90 group-hover:text-white"}`}>{track.title}</h3>
                    <p className="text-[11px] text-white/40 mt-1 tracking-widest">{trackYoutubeId ? "🎥 VÍDEO PRÁTICA" : `${track.duration || '--'} MIN`}</p>
                  </div>
                  <div className="flex items-center gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                     <button onClick={(e) => handleToggleFavorite(e, track._id)} className="p-2 -m-2 hover:scale-110 transition-transform">
                       {isFav ? <Icons.HeartFilled color="#ff4b4b" /> : <Icons.Heart />}
                     </button>
                     {track.isLocked ? <Icons.Lock /> : <Icons.Unlock />}
                  </div>
                </div>
                {!isLast && (
                  <div className="w-[85%] h-[1px] bg-white/5 mx-auto my-1" />
                )}
              </div>
            );
          })}
        </div>
      </main>

/* Sticky Bar*/
      <AnimatePresence>
        {currentTrack && !showArt && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 150 }} transition={{ duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 h-28 bg-[rgba(0,0,2,0.1)] backdrop-blur-xl border-t border-white/10 z-[999999] flex flex-col min-[1275px]:pl-[300px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute top-0 h-1 bg-white/10 left-0 w-full min-[1275px]:left-[300px] min-[1275px]:w-[calc(100%-300px)]">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${courseCompletionPercentage}%` }} 
                 transition={{ duration: 1 }}
                 className="h-full bg-[#2DD4BF] relative"
               >
                 <span className="absolute -top-[16px] right-0 text-[9px] font-bold opacity-80 whitespace-nowrap bg-[#2DD4BF] text-black px-1.5 rounded-sm">
                   {courseCompletionPercentage}%
                 </span>
               </motion.div>
            </div>

            <div className="flex items-center w-full h-full px-4 md:pr-8 pt-1">
              <div className="flex items-center w-1/4">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="mr-3 p-2 hover:bg-white/10 rounded-full transition"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     {isExpanded ? <path d="M6 9l6 6 6-6"/> : <path d="M6 15l6-6 6 6"/>}
                  </svg>
                </button>

                <img src={course.coverImageUrl || course.coverImage?.asset?.url || "https://assets.calm.com/1920x938/705311a1a0de50f1e48a752e88d46c1e.jpeg"} className="w-10 h-10 md:w-14 md:h-14 rounded-lg object-cover mr-3 shadow-lg" alt="" />
                
                <div className="hidden lg:block truncate">
                  <p className="font-bold text-sm leading-tight">{currentTrack.title}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">{course.title}</p>
                </div>
              </div>

              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center gap-6 mb-2">
                  <button onClick={playPrev} className="opacity-60 hover:opacity-100 transition"><Icons.Prev /></button>
                  <button onClick={() => skip(-30)} className="text-[11px] font-bold opacity-60 hover:opacity-100 transition w-8">-30s</button>
                  
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-white text-[#002152] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition transform">
                    {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                  </button>
                  
                  <button onClick={() => skip(30)} className="text-[11px] font-bold opacity-60 hover:opacity-100 transition w-8">+30s</button>
                  <button onClick={playNext} className="opacity-60 hover:opacity-100 transition"><Icons.Next /></button>
                  
                  <button onClick={() => { setIsPlaying(false); if(audioRef.current) audioRef.current.currentTime = 0; }} className="opacity-40 hover:opacity-100 transition ml-4">
                     <div className="w-3 h-3 bg-white rounded-none" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 w-full max-w-xs md:max-w-lg">
                  <span className="text-[10px] text-white/50 font-mono w-10 text-left">{formatSeconds(currentTime)}</span>
                  <input 
                    type="range" min="0" max={duration || 100} value={currentTime}
                    onChange={(e) => { if(audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
                    className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none accent-white cursor-pointer"
                    disabled={!!activeTrackYoutubeId}
                  />
                  <span className="text-[10px] text-white/50 font-mono w-10 text-right">{formatSeconds(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end w-1/4">
                <button 
                  onClick={(e) => handleToggleFavorite(e, currentTrack._id)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition"
                >
                  {favorites.includes(currentTrack._id) ? <Icons.HeartFilled color="#ff4b4b" /> : <Icons.Heart />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeTrackYoutubeId && (
        <audio 
          ref={audioRef}
          key={currentTrack?._id}
          src={validAudioUrl || undefined}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            setCurrentTime(el.currentTime);
            if (el.duration) {
              setDuration(el.duration);
              const curProg = (el.currentTime / el.duration) * 100;
              setProgress(curProg);
              
              if (el.currentTime - lastSavedTimeDB.current >= 10) {
                saveProgressToDB(el.currentTime, false);
                lastSavedTimeDB.current = el.currentTime;
              }
              if (curProg >= 95 && hasMarked95Ref.current !== currentTrack._id) {
                hasMarked95Ref.current = currentTrack._id;
                
                const newCompleted = [...new Set([...completedTracks, currentTrack._id])];
                setCompletedTracks(newCompleted);
                if (session?.user?.email) {
                  localStorage.setItem(`meditt_completed_${course?._id || course?.id}_${session.user.email}`, JSON.stringify(newCompleted));
                }

                saveProgressToDB(el.currentTime, true);
              }
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            playNext(); // This plays the next track automatically
          }}
        />
      )}
    </div>
  );
}