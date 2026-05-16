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

// Fallback padrão para imagens mortas
const FALLBACK_IMAGE = "https://64.media.tumblr.com/12d2a1fb27beb5bcc4d8c93d834ee9d9/04801380bf115da1-40/s1280x1920/b956b0f0a664d7ebb4b25992f055099b9537e846.jpg";

// ✅ FUNÇÃO DE EXTRAÇÃO DE YOUTUBE
const getTrackYouTubeId = (track: any): string | null => {
  if (!track) return null;
  const explicitVideoFields = [track.youtubeUrl, track.videoUrl, track.codigo, track.video, track.youtube];
  for (const val of explicitVideoFields) {
    if (typeof val === 'string' && val.trim() !== '') {
      const str = val.trim().replace(/\\/g, '');
      if (str.length === 11 && !str.includes(' ') && !str.includes('/')) return str; 
      const match = str.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
      if (match && match[1]) return match[1];
    }
  }
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
    if (typeof val === 'string' && val.trim() !== '') return val;
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
  
  // ✅ ESTADOS DE PROTEÇÃO DE IMAGEM
  const [heroImgError, setHeroImgError] = useState(false);
  const [squareImgError, setSquareImgError] = useState(false);
  const [customImgError, setCustomImgError] = useState(false);

  const [customImageUrl, setCustomImageUrl] = useState<string>("https://64.media.tumblr.com/af837cfbc16af732721f10c3ea2a8ad9/5256344e6d325feb-4d/s400x600/1895eb64953d4ea78da7a64a1566238451b6d34e.pnj");
  const [imageError, setImageError] = useState<boolean>(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const idleAudioRef = useRef<HTMLAudioElement>(null); 
  const lastSavedTimeDB = useRef<number>(0);
  const hasMarked95Ref = useRef<string | null>(null);
  const ambientTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(false); 
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
  const [showStoreModal, setShowStoreModal] = useState(false); 
  
  const [storeModalLink, setStoreModalLink] = useState<string>("/mindful-store");
  
  const [isIdle, setIsIdle] = useState(false);
  const [idleVolume, setIdleVolume] = useState(0.2); 
  const [ambientSound, setAmbientSound] = useState<'forest' | 'ocean' | 'rain'>('forest');
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);
  const [participantsCount, setParticipantsCount] = useState<number>(0);

  const validAudioUrl = useMemo(() => getValidAudioUrl(currentTrack), [currentTrack]);
  const activeTrackYoutubeId = useMemo(() => getTrackYouTubeId(currentTrack), [currentTrack]);
  const isVideoTrack = !!activeTrackYoutubeId;

  const handleTrackPlay = async (track: any) => {
    if (!track?._id || track._id.includes('ph-')) return;
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

  const togglePlay = () => {
    if (!isPlaying && currentTrack) {
      handleTrackPlay(currentTrack);
    }
    setIsPlaying(!isPlaying);
  };

  const handleMainPlay = () => {
    if (currentTrack) {
      togglePlay();
    } else {
      const firstGroupName = Object.keys(groups)[0];
      if (firstGroupName && groups[firstGroupName].length > 0) {
        handlePlay(groups[firstGroupName][0]);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isLoading) {
      const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
      setLoadingQuote(INSPIRATIONAL_QUOTES[randomIndex]);
    }
  }, [isLoading]);

  useEffect(() => {
    if (status !== "loading") {
      const timer = setTimeout(() => setIsLoading(false), 1); 
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleAmbientChange = (sound: 'forest' | 'ocean' | 'rain') => {
    if (ambientSound === sound) return; 
    setAmbientSound(sound);
    setIsLoading(true); 
    if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
    ambientTimerRef.current = setTimeout(() => setIsLoading(false), 1);
  };

  // ✅ SYNC DE DADOS OTIMIZADO PARA EVITAR LOOPS DE EDGE REQUESTS
  useEffect(() => {
    const storedParticipants = sessionStorage.getItem(`meditt_participants_${currentTrack?._id}`);
    if (storedParticipants && currentTrack) {
        setParticipantsCount(parseInt(storedParticipants, 10));
    } else if (currentTrack) {
        const randomCount = Math.floor(Math.random() * (40 - 5 + 1)) + 5;
        setParticipantsCount(randomCount);
        sessionStorage.setItem(`meditt_participants_${currentTrack._id}`, randomCount.toString());
    }

    const localFavs = localStorage.getItem(`meditt_favs_${session?.user?.email || 'guest'}`);
    const localCompleted = localStorage.getItem(`meditt_completed_${course?._id || course?.id}_${session?.user?.email || 'guest'}`);
    
    if (localFavs) setFavorites(JSON.parse(localFavs));
    if (localCompleted) setCompletedTracks(JSON.parse(localCompleted));

    // Proteção: Só faz o fetch se estiver autenticado E não houver favs (ou for o init inicial)
    if (status === "authenticated" && favorites.length === 0) {
      fetch('/api/customer-data') 
        .then(async res => {
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) return res.json();
          return null;
        })
        .then(data => {
          if (!data) return;
          if (data?.user?.favorites?.length > 0) {
            const dbFavs = data.user.favorites.map((f: any) => f._id || f);
            setFavorites(dbFavs);
            localStorage.setItem(`meditt_favs_${session.user?.email}`, JSON.stringify(dbFavs));
          }
          if (data?.user?.courseProgress?.length > 0) {
             const dbCompleted = data.user.courseProgress.filter((p: any) => p.isCompleted).map((p: any) => p.trackId);
             setCompletedTracks(dbCompleted);
             localStorage.setItem(`meditt_completed_${course?._id || course?.id}_${session.user?.email}`, JSON.stringify(dbCompleted));
          }
        })
        .catch(e => console.warn("Sync: Usando dados locais."));
    }
  }, [status, session?.user?.email, course?._id, course?.id, currentTrack]); // Removido 'favorites' para não causar loop

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      if (isPlaying && !isVideoTrack) { 
        idleTimer = setTimeout(() => setIsIdle(false), 10000);
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

  // ✅ AUDIO: Usa preload="metadata" no JSX para poupar edge requests, aqui apenas gere o play/pause
// ✅ AUDIO: Usa preload="metadata" no JSX para poupar edge requests, aqui apenas gere o play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isVideoTrack) {
      audioRef.current.pause();
      return;
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
  }, [isPlaying, isVideoTrack, currentTrack]); // 👈 A CORREÇÃO ESTÁ AQUI: Adicionado 'currentTrack' ao array


  const saveProgressToDB = useCallback(async (time: number, completed: boolean) => {
    if (status !== "authenticated" || !currentTrack) return;
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId: course?._id || course?.id, trackId: currentTrack._id, timeWatched: Math.floor(time), isCompleted: completed 
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
          if (session?.user?.email) localStorage.setItem(`meditt_completed_${course?._id || course?.id}_${session.user.email}`, JSON.stringify(newCompleted));
          saveProgressToDB(100, true);
        }
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [isVideoTrack, isPlaying, currentTrack, completedTracks, session, course, saveProgressToDB]);

  const { groups, totalTracksInCourse } = useMemo(() => {
    let rawGroups: Record<string, any[]> = {};
    let totalTracks = 0;
    
    const titleStr = String(course?.title || "").toLowerCase();
    const slugStr = String(course?.slug?.current || course?.slug || (typeof window !== 'undefined' ? window.location.pathname : '')).toLowerCase();
    const fullIdentifier = `${titleStr} ${slugStr}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const isMindfulness = fullIdentifier.includes('mindfulness') && !fullIdentifier.includes('pranayama') && !fullIdentifier.includes('stress');

    if (isMindfulness) {
      let n1 = course?.courseContent?.nivel1 || course?.nivel1 || [];
      let n2 = course?.courseContent?.nivel2 || course?.nivel2 || [];
      let n3 = course?.courseContent?.nivel3 || course?.nivel3 || [];

      if (n1.length > 0) {
        rawGroups["Nível 1"] = n1.map((t: any) => ({ ...t, isLocked: t.isLocked === true }));
        totalTracks += rawGroups["Nível 1"].length;
      }
      if (n2.length > 0) {
        rawGroups["Nível 2"] = n2.map((t: any) => ({ ...t, isLocked: t.isLocked === true }));
        totalTracks += rawGroups["Nível 2"].length;
      }
      if (n3.length > 0) {
        rawGroups["Nível 3"] = n3.map((t: any) => ({ ...t, isLocked: t.isLocked === true }));
        totalTracks += rawGroups["Nível 3"].length;
      }

    } else {
      if (course?.modules?.length > 0) {
        course.modules.forEach((mod: any) => { 
          rawGroups[mod.title || "Módulo"] = (mod.content || []).map((t: any) => ({ ...t, isLocked: t.isLocked === true })); 
          totalTracks += (mod.content || []).length;
        });
      } else if (course?.courseContent) {
        Object.keys(course.courseContent).forEach(k => {
          if (Array.isArray(course.courseContent[k])) {
            rawGroups[k] = course.courseContent[k].map((t: any) => ({ ...t, isLocked: t.isLocked === true }));
            totalTracks += course.courseContent[k].length;
          }
        });
      } else {
        rawGroups["Geral"] = (course?.content || []).map((t: any) => ({ ...t, isLocked: t.isLocked === true }));
        totalTracks += (course?.content || []).length;
      }
    }

    return { groups: rawGroups, totalTracksInCourse: totalTracks };
  }, [course]);

  useEffect(() => {
    const keys = Object.keys(groups);
    if (keys.length > 0 && !activeGroup) setActiveGroup(keys[0]);
  }, [groups, activeGroup]);

  const handlePlay = (track: any) => {
    if (track.isLocked || track.isPlaceholder) {
      setStoreModalLink(track.storeLink || "/mindful-store");
      setShowStoreModal(true);
      return;
    }
    
    if (currentTrack?._id === track._id) {
      togglePlay();
    } else {
      hasMarked95Ref.current = null;
      setCurrentTrack(track);
      setIsPlaying(true);
      handleTrackPlay(track); 
    }
  };

  const playNext = () => {
    const currentList = groups[activeGroup];
    if (!currentList) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * currentList.length);
      handlePlay(currentList[randomIndex]);
      return;
    }

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
    if (audioRef.current && !isVideoTrack) audioRef.current.currentTime += amount;
  };

  const handleToggleFavorite = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation(); 
    if (trackId.includes('ph-')) return; 
    
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

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const courseCompletionPercentage = totalTracksInCourse > 0 ? Math.round((completedTracks.length / totalTracksInCourse) * 100) : 0;

  // ✅ RESOLUÇÃO DE IMAGENS COM FALLBACK SEGURO (Evita Log Loops)
  const heroBgImageSrc = useMemo(() => {
    if (heroImgError) return FALLBACK_IMAGE;
    return course?.heroImageUrl || course?.heroImage?.asset?.url || course?.playerBackgroundImage?.asset?.url || FALLBACK_IMAGE;
  }, [course, heroImgError]);

  const squareCoverSrc = useMemo(() => {
    if (squareImgError) return FALLBACK_IMAGE;
    return course?.squareImageUrl || course?.squareImage?.asset?.url || course?.coverImageUrl || course?.coverImage?.asset?.url || heroBgImageSrc;
  }, [course, squareImgError, heroBgImageSrc]);
  
  const heroBgColor = course?.heroColor || '#0d326b'; 
  
  const bgImage = course?.playerBackgroundImage?.asset?.url || course?.backgroundImageUrl || FALLBACK_IMAGE;
  const idleGradient = course?.idleGradient || "linear-gradient(105deg, rgba(16, 16, 148, 0.7) 0%, rgba(11, 162, 217, 0.1) 100%)";

  const AMBIENT_MEDIA = {
    forest: course?.idleGifForest || "https://va.media.tumblr.com/tumblr_te7uz9tJ0T1vfm7m2.mp4",
    ocean: course?.idleGifOcean || "https://i.pinimg.com/originals/fc/ed/f4/fcedf41d08fb2dbb5db65489cf2da4be.gif",
    rain: course?.idleGifRain || "https://i.pinimg.com/originals/e2/c8/a8/e2c8a84bae49d4c34bdcf9b21c756645.gif"
  };

  const idleMediaUrl = AMBIENT_MEDIA[ambientSound] || course?.idleGifUrl;
  
  const idleYoutubeId = useMemo(() => {
    if (!idleMediaUrl) return null;
    const match = idleMediaUrl.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|\&v=|\?v=|shorts\/)([^#\&\?]{11})/i);
    return match ? match[1] : null;
  }, [idleMediaUrl]);

  const isVideoMedia = idleMediaUrl ? /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(idleMediaUrl) || idleMediaUrl.toLowerCase().includes('.mp4') || idleMediaUrl.toLowerCase().includes('pexels.com/video-files') || idleMediaUrl.toLowerCase().includes('player.vimeo.com/external') : false;

  const instructorImageUrl = (typeof course?.instructorPhoto === 'string' ? course.instructorPhoto : course?.instructorPhoto?.asset?.url) || (typeof course?.instructor?.imageUrl === 'string' ? course.instructor.imageUrl : null) || (typeof course?.instructor?.image === 'string' ? course.instructor.image : course?.instructor?.image?.asset?.url) || null;
  const instructorName = course?.instructorName || course?.instructor?.name;
  const instructorRole = course?.instructorRole || course?.instructor?.role;
console.log("Cores do Sanity:", course?.heroColor, course?.customGradient);

  return (
    <div className="relative min-h-screen bg-[#0A0B1E] text-white overflow-x-hidden font-sans min-[1275px]:-mt-20 md:-ml-[300px] md:w-[calc(100%+300px)] min-[1275px]:ml-0 min-[1275px]:w-full" style={{ fontSize: '14px' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseLogo { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.4) transparent; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; background-color: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.8); }
        #WhatsAppButton, .WhatsAppButton, [id*="WhatsAppButton"], [class*="WhatsAppButton"], [id*="whatsapp"], [class*="whatsapp"], div[style*="z-index: 2147483647"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; width: 0 !important; height: 0 !important; }
       

        /* Animação Marquee Suave */
  @keyframes marquee-infinito {
    /* 0% a 25%: Fica parado no início (5s de 20s) */
    0%, 25% { transform: translateX(0); }
    /* Move-se até metade (onde o segundo texto começa) */
    100% { transform: translateX(-50%); }
  }

  .marquee-container {
    display: flex;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    /* Gradiente suave nas bordas para o texto não "cortar" seco */
    mask-image: linear-gradient(to right, transparent, black 10%, black 95%, transparent);
  }

  .marquee-content {
    display: flex;
    /* 20s total | linear | corre sempre para o mesmo lado */
    animation: marquee-infinito 20s linear infinite;
  }

  .marquee-item {
    padding-right: 10px; /* Espaço entre o fim de um texto e o início do próximo no loop */
  }
      ` }} />

      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2147483647,
          background: 'linear-gradient(95deg, rgba(0,66,139,1) 45%, rgba(6,138,136,1) 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'auto' : 'none', transition: 'opacity 0.8s ease-in-out', padding: '20px'
        }}
      >
        <img src="https://64.media.tumblr.com/a61f9037de0a73e8161bb4b2ba661d9c/d03a5d8c83d77852-db/s500x750/d45cd2861c043e93c9b5c2839ec42909e2c06b36.pnj" alt="Logo Meditt" style={{ width: '180px', height: 'auto', objectFit: 'contain', animation: isLoading ? 'pulseLogo 2s infinite ease-in-out' : 'none', marginBottom: '30px' }} />
        <p className="text-white text-center text-[15px] md:text-lg font-light italic tracking-wide max-w-md opacity-90 drop-shadow-md">"{loadingQuote}"</p>
      </div>

      <audio ref={idleAudioRef} src={AMBIENT_TRACKS[ambientSound]} preload="auto" loop />

      <div className="fixed top-0 left-0 w-full h-[100vh] z-0 overflow-hidden bg-[#0A0B1E]">
  {/* A Imagem agora é absolute e z-0 para ficar lá no fundo */}
  <img 
    src={bgImage} 
    className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[60px] scale-125 z-0" 
    alt="" 
  />
  
  {course?.customGradient ? (
    // ✅ Se houver gradiente no Sanity, fica por cima da imagem (z-10)
    <div 
      className="absolute inset-0 z-10" 
      style={{ background: course.customGradient }} 
    />
  ) : (
    // ❌ Fallback caso o Sanity esteja vazio (z-10 e z-20)
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#12122b]/90 via-transparent to-[#12122b]/90 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0B1E] opacity-90 z-20" />
    </>
  )}
</div>

  

      {showArt && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[260] flex flex-col gap-2 animate-fade-in">
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
              <button onClick={() => handleAmbientChange('forest')} className={`p-1 rounded-full transition-all ${ambientSound === 'forest' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-8"/><path d="M12 14c-2.5 0-5-2-5-5s2-5 5-5 5 2 5 5-2.5 5-5 5z"/></svg></button>
              <button onClick={() => handleAmbientChange('ocean')} className={`p-1 rounded-full transition-all ${ambientSound === 'ocean' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg></button>
              <button onClick={() => handleAmbientChange('rain')} className={`p-1 rounded-full transition-all ${ambientSound === 'rain' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg></button>
            </div>
            <div className="w-px h-3.5 bg-white/20"></div>
            <input type="range" min="0" max="1" step="0.05" value={idleVolume} onChange={(e) => { setIdleVolume(parseFloat(e.target.value)); if (isAmbientMuted) setIsAmbientMuted(false); }} className="w-12 h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer" />
          </div>
        </div>
      )}

      <div className="fixed inset-0 flex flex-col items-center justify-center transition-all duration-1000 z-[250]" style={{ backdropFilter: showArt ? 'blur(15px)' : 'blur(0px)', opacity: showArt ? 1 : 0, pointerEvents: showArt ? 'auto' : 'none' }}>
         <div className="absolute inset-0 z-[-1] overflow-hidden w-full h-screen bg-black/40">
            {idleYoutubeId ? (
              <div className="absolute top-1/2 left-1/2 w-[105%] h-[105vh] md:w-[105vw] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <iframe className="absolute top-1/2 left-1/2 w-[105vw] h-[56.25vw] min-h-[105vh] min-w-[178vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ border: 'none' }} src={`https://www.youtube.com/embed/${idleYoutubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${idleYoutubeId}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`} allow="autoplay; encrypted-media" frameBorder="0" />
              </div>
            ) : idleMediaUrl && isVideoMedia ? (
              <video src={idleMediaUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
            ) : idleMediaUrl ? (
              <div className="absolute inset-0 w-full h-full" style={{ background: `url('${idleMediaUrl}') no-repeat center center / cover` }} />
            ) : null}
            <div className="absolute inset-0 w-full h-full" style={{ background: idleGradient || 'transparent' }} />
        </div>

         {showArt && currentTrack && (
           <div className="flex flex-col items-center justify-center -mt-20">
              <div className="flex flex-col items-center mb-12 text-center drop-shadow-md">
                 <h2 className="text-[20px] font-light tracking-wide text-white drop-shadow-lg mb-1">{currentTrack?.title}</h2>
                 {participantsCount > 0 && <span className="text-[10px] font-light opacity-70 normal-case tracking-normal text-white mt-1">{participantsCount} pessoas estão a meditar contigo</span>}
              </div>

              <div className="relative w-[180px] h-[180px] md:w-[260px] md:h-[260px] flex items-center justify-center">
                  <svg width="100%" height="100%" viewBox="0 0 260 260" className="absolute -rotate-90">
                      <circle cx="130" cy="130" r={radius} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="5" fill="transparent" />
                      <circle cx="130" cy="130" r={radius} stroke="#ffffff" strokeWidth="5" fill="transparent" strokeDasharray={circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out', strokeLinecap: 'round' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl md:text-5xl font-extralight text-white tracking-tighter drop-shadow-md">
                      {formatSeconds(duration - currentTime)}
                  </div>
              </div>
              
              {instructorName && (
                <div className="mt-10 flex flex-col items-center justify-center animate-fade-in opacity-80 text-center drop-shadow-md">
                  <div className="flex items-center gap-2">
                    {instructorImageUrl ? (
                      <img src={instructorImageUrl} alt={instructorName} className="w-[30px] h-[30px] rounded-full object-cover border border-white/20 shadow-md" />
                    ) : (
                      <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center border border-white/20 shadow-md">
                        <span className="text-[10px] font-bold text-white">{instructorName.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-[11px] font-bold tracking-widest text-white"><span className="tracking-normal">{instructorName}</span></span>
                    {instructorRole && <><span className="opacity-50">•</span><span className="text-[10px] font-light tracking-wide text-white/70">{instructorRole}</span></>}
                  </div>
                </div>
              )}
           </div>
         )}
      </div>

      {activeTrackYoutubeId && currentTrack && (
        <div className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center bg-[#050C24]/40 backdrop-blur-[10px] px-4 pt-16 pb-[120px]">
          <div className="absolute inset-0 cursor-pointer z-0" onClick={() => { setIsPlaying(false); setCurrentTrack(null); }} />
          <button onClick={() => { setIsPlaying(false); setCurrentTrack(null); }} className="absolute top-6 right-6 md:top-10 md:right-10 text-white font-bold text-xs tracking-widest hover:text-white/70 z-[50] p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all shadow-lg flex items-center gap-2 cursor-pointer" style={{ pointerEvents: 'auto' }}>FECHAR ✕</button>
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/10 relative z-10 pointer-events-auto bg-black flex items-center justify-center">
            <YouTubePlayer
              key={`yt-${activeTrackYoutubeId}`} videoId={activeTrackYoutubeId} isPlaying={isPlaying}
              onReady={(dur) => setDuration(dur)}
              onProgress={(current, dur) => { setCurrentTime(current); setDuration(dur); setProgress((current / dur) * 100); }}
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
          <h3 className="mt-8 text-xl font-light tracking-wide text-white drop-shadow-md text-center px-4 z-10 pointer-events-none">{currentTrack?.title}</h3>
        </div>
      )}

{/* ✅ ZONA DO HERO: IMAGEM QUADRADA + FUNDO SPOTIFY */}
      <div className={`relative w-full transition-opacity duration-700 z-10 ${showArt ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* 1. Background do Hero (Apenas a imagem de fundo) */}
        <div 
          className="absolute inset-0 h-[45vh] md:h-[50vh] w-full z-0" 
          style={{ background: `url(${heroBgImageSrc}) center 30% / cover no-repeat` }}
        />

       {/* 2. O Overlay de Cor/Gradiente do HERO (Agora SÓ olha para o heroColor!) */}
        {course?.heroColor ? (
          <div 
            className="absolute inset-0 h-[45vh] md:h-[50vh] w-full z-10" 
            style={{ 
              background: course.heroColor.includes('gradient') 
                ? course.heroColor.replace(';', '') 
                : `linear-gradient(to bottom, ${course.heroColor.replace(';', '')} -20%, #0A0B1E 100%)`,
              opacity: course.heroColor.includes('gradient') ? 1 : 0.85 
            }}
          />
        ) : (

        // SE O SANITY ESTIVER VAZIO, USA O TEU HARDCODED ORIGINAL (z-10):
          <div className="absolute inset-0 h-[45vh] md:h-[50vh] w-full z-10 bg-gradient-to-b from-black/40 via-[#0A0B1E]/80 to-[#0A0B1E] mix-blend-overlay"></div>
        )}
        

        {/* 3. Escurecimento na base para ligar suavemente ao resto do player escuro */}
        <div className="absolute inset-0 h-[45vh] md:h-[50vh] w-full z-20 bg-gradient-to-b from-transparent via-[#0A0B1E]/60 to-[#0A0B1E] "></div>

        {/* ✅ AJUSTE MOBILE (O conteúdo do Hero começa aqui) */}
        <div className="relative pt-[8vh] md:pt-[18vh] max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6 pb-6 z-30">
          <div className="flex items-center md:items-end gap-4 w-full">
            <div className="w-[80px] h-[80px] sm:w-[140px] sm:h-[140px] md:w-[232px] md:h-[232px] shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)] rounded-md overflow-hidden bg-black/20 z-10">
              <img 
                src={squareCoverSrc} 
                alt={course.title} 
                className="w-full h-full object-cover" 
                // mix-blend-overlay
                onError={() => setSquareImgError(true)} // ✅ Proteção Ativada
              />
            </div>

            <div className="flex flex-col justify-center md:justify-end flex-1 z-10 min-w-0">
  <span className="text-[10px] md:text-sm font-bold text-emerald-400 mb-1 uppercase tracking-widest">
    {course?.typology || "Curso"}
  </span>
  
  <h1 className="text-[20px] sm:text-3xl md:text-6xl min-[1275px]:text-[80px] font-black mb-1 md:mb-4 tracking-tighter drop-shadow-2xl text-white leading-snug md:leading-none whitespace-normal line-clamp-3 md:line-clamp-none">
    {course.title}
  </h1>
  
  <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-[10px] sm:text-[11px] md:text-sm text-white/90 font-medium drop-shadow-sm w-full mt-1">
    
    {course?.instructors && course.instructors.length > 0 ? (
      <div className="flex items-center -space-x-1.5 mr-0.5">
        {course.instructors.map((inst: any, index: number) => {
          if (!inst.photo) return null;
          return (
            <img 
              key={index}
              src={inst.photo} 
              alt={inst.name || "Instrutor"} 
              className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover bg-white border border-white/40 relative z-10 hover:z-20 hover:scale-125 transition-all shadow-sm shrink-0" 
            />
          );
        })}
      </div>
    ) : instructorImageUrl ? (
      <img src={instructorImageUrl} alt={instructorName} className="w-4 h-4 md:w-6 md:h-6 rounded-full object-cover border border-white/40 shrink-0" />
    ) : null}

    {instructorName && <span className="font-bold text-white cursor-pointer hover:underline">{instructorName}</span>}
    {instructorName && <span className="opacity-60">•</span>}
    <span className="opacity-80">{new Date().getFullYear()}</span>
    <span className="opacity-60">•</span>
    <span className="opacity-80">{totalTracksInCourse} áudios</span>
    {course.durationInHours && (
      <>
        <span className="opacity-60">•</span>
        <span className="opacity-80">{course.durationInHours} horas</span>
      </>
    )}
  </div>
</div>
          </div>

        </div>
      </div>

      <main className={`relative z-20 max-w-4xl mx-auto px-0 md:px-4 pb-40 transition-opacity duration-700 ${showArt ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
       <style dangerouslySetInnerHTML={{ __html: `footer { display: none !important; }` }} />
       
       <div className="flex items-center gap-4 md:gap-6 py-2 md:py-4 mb-2 px-4 md:px-0">
          <button 
            onClick={handleMainPlay} 
            className="w-12 h-12 md:w-14 md:h-14 bg-[#155DFC] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            {isPlaying ? <Icons.Pause width={24} height={24} /> : <Icons.Play width={24} height={24} fill="currentColor" />}
          </button>

          <a 
            href="/area-pessoal" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-8 h-12 md:w-10 md:h-14 rounded-md overflow-hidden shrink-0 border border-white/10 hover:border-white/40 hover:scale-105 transition-all shadow-md group relative block bg-black/40"
          >
            <img 
              src={customImageUrl} 
              alt="Área Pessoal" 
              className="w-full h-full object-cover group-hover:brightness-75 transition-all" 
              onError={() => {
                setCustomImgError(true);
                setCustomImageUrl(FALLBACK_IMAGE);
              }}
            />
          </a>

          <button 
            onClick={() => setIsShuffle(!isShuffle)} 
            className={`p-2 shrink-0 transition-colors active:scale-95 ${isShuffle ? 'text-[#155DFC]' : 'text-[#b3b3b3] hover:text-white'}`}
            title="Tocar Aleatório"
          >
            <svg width="24" height="24" className="md:w-[28px] md:h-[28px]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c.84 0 1.634.367 2.176.994l1.106 1.279-.994 1.183-1.012-1.171A2.25 2.25 0 0 0 .39 3.5zM7.545 8.751 6.362 7.34 8.28 5.05l1.183 1.41-1.918 2.29zM11.16 12.5h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06l1.017-1.018H11.16a3.75 3.75 0 0 1-2.873-1.34l-1.025-1.22.994-1.183 1.18 1.405A2.25 2.25 0 0 0 11.16 12.5z"></path>
            </svg>
          </button>
       </div>

       <div className="flex overflow-x-auto custom-scrollbar gap-3 mb-8 pb-3 w-full justify-start px-4 md:px-0 mt-2" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
          {Object.keys(groups).map(name => (
            <button key={name} onClick={() => setActiveGroup(name)} className={`shrink-0 px-4 py-1 rounded-full text-[9px] font-bold uppercase transition-all whitespace-nowrap tracking-wider ${activeGroup === name ? "bg-white text-black shadow-lg" : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"}`}>{name}</button>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-none md:rounded-3xl border border-white/0 p-4 md:p-6 shadow-2xl">
          {groups[activeGroup]?.map((track: any, index: number) => {
            const isActive = currentTrack?._id === track._id;
            const isDone = completedTracks.includes(track._id);
            const isFav = favorites.includes(track._id);
            const isLast = index === groups[activeGroup].length - 1;
            const trackYoutubeId = getTrackYouTubeId(track); 

            const opacityClass = track.isLocked ? "opacity-40 hover:opacity-50" : "opacity-100 hover:bg-white/10";

            return (
              <div 
                key={track._id} 
                className={`relative flex flex-col group transition-all duration-300 rounded-2xl hover:bg-white/5 ${opacityClass}`}
              >
                <div 
                  onClick={() => handlePlay(track)} 
                  className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 ${isActive ? "bg-white/20 border border-white/20 shadow-md" : "border border-transparent"}`}
                >
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center mr-4 text-[10px] md:text-[12px] font-bold shadow-inner transition-colors ${isActive ? "border-white bg-white text-black" : isDone ? "border-[#2DD4BF] text-[#2DD4BF] bg-[#2DD4BF]/10" : "border-white/20 group-hover:border-white/40"}`}>
                    {isActive && isPlaying ? <Icons.Pause /> : isActive && !isPlaying ? <Icons.Play /> : isDone ? <Icons.Check /> : track.sessionNumber || (track.isLocked ? <Icons.Lock /> : "▶")}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className={`text-[13px] md:text-base font-medium truncate transition-colors ${isActive ? "text-white" : "text-white/90 group-hover:text-white"}`}>{track.title}</h3>
                    <p className="text-[9px] md:text-[11px] text-white/40 mt-0.5 md:mt-1 tracking-widest">{trackYoutubeId ? "🎥 VÍDEO PRÁTICA" : `${track.duration || '--'} MIN`}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    {!track.isLocked && (
                      <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(e, track._id); }} className="p-2 -m-2 hover:scale-110 transition-transform">
                        {isFav ? <Icons.HeartFilled color="#ff4b4b" /> : <Icons.Heart />}
                      </button>
                    )}
                    {track.isLocked ? <Icons.Lock /> : <Icons.Unlock />}
                  </div>
                </div>
                
                {!isLast && <div className="w-[85%] h-[1px] bg-white/5 mx-auto my-1 group-hover:opacity-0 transition-opacity duration-300" />}
              </div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {showStoreModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="bg-[#0A0B1E] border border-white/20 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.Lock className="w-8 h-8 text-white" /></div>
              <h2 className="text-2xl font-bold text-white mb-2">Conteúdo Bloqueado</h2>
              <p className="text-white/70 mb-6 font-light">Para aceder a esta prática, precisas de adquirir o nível correspondente, o curso completo ou o membro premium na nossa loja.</p>
              <div className="flex flex-col gap-3">
                <a 
                  href={storeModalLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full py-3 bg-[#2DD4BF] text-black font-bold rounded-full hover:scale-105 transition text-center"
                >
                  Ir para a Loja
                </a>
                <button onClick={() => setShowStoreModal(false)} className="w-full py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition">Voltar à Prática</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

<AnimatePresence>
        {isScrolled && !showArt && !activeTrackYoutubeId && !currentTrack?.isPlaceholder && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} 
            animate={{ 
              y: 0, 
              opacity: 1,
              // 👇 As tuas cores entram aqui! Repeti a primeira no final para o loop ser perfeito
              backgroundColor: ['#1A74B8', '#0A1C6E', '#5A0B85', '#320652', '#520620', '#1A74B8']
            }} 
            exit={{ y: -100, opacity: 0 }} 
            transition={{ 
              // Separei a transição: o "cair" demora 0.3s, mas a cor muda em loop infinito!
              y: { duration: 0.3, ease: "easeOut" },
              opacity: { duration: 0.3, ease: "easeOut" },
              backgroundColor: {
                duration: 50, // 👈 25 segundos para passar por todas as cores. Podes ajustar!
                ease: "linear",
                repeat: Infinity
              }
            }} 
            /* A linha style={{ background: ... }} foi apagada porque a cor agora é animada! */
            className="fixed top-0 left-0 md:left-[00px] min-[1275px]:left-0 right-0 h-[60px] z-[100] hidden md:flex items-center shadow-2xl border-b border-white/5"
          >
            <div className="max-w-4xl mx-auto w-full px-4 flex items-center gap-4">
              <button 
                onClick={handleMainPlay} 
                className="w-10 h-10 !bg-[#155DFC] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                {isPlaying ? <Icons.Pause width={18} height={18} /> : <Icons.Play width={18} height={18} />}
              </button>

              <span className="text-[12px] md:text-[15px] font-bold text-white tracking-tight drop-shadow-md truncate">
                {currentTrack?.title}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👇 NOVO BOTÃO QUE SÓ APARECE NO MODO ART 👇 */}
      <AnimatePresence>
        {showArt && !activeTrackYoutubeId && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => {
              setIsExpanded(false); // Fecha o modo expandido
              setIsIdle(false);     // Se foi ativado por inatividade, acorda o player
            }}
            className="fixed bottom-6 right-6 md:right-8 z-[260] p-3 bg-white/5 hover:bg-white/20 rounded-full backdrop-blur-md transition border border-white/10 shadow-2xl active:scale-90"
            title="Minimizar Modo Art"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/> {/* Seta a apontar para baixo */}
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
            
  <AnimatePresence>
  {currentTrack && !showArt && !activeTrackYoutubeId && !currentTrack.isPlaceholder && (
    <>
      {/* BARRA DE PROGRESSÃO DO CURSO - TOPO ABSOLUTO DA PÁGINA */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-[300]">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${courseCompletionPercentage}%` }} 
          transition={{ duration: 1 }} 
          className="h-full bg-[#2DD4BF] relative"
        >
          <span className={`absolute top-[6px] text-[9px] font-bold opacity-80 whitespace-nowrap bg-[#2DD4BF] text-black px-1.5 rounded-sm ${courseCompletionPercentage < 10 ? 'left-0' : 'right-0'}`}>
            {courseCompletionPercentage}%
          </span> 
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 150 }} 
        animate={{ y: 0 }} 
        exit={{ y: 150 }} 
        transition={{ duration: 0.5 }} 
        className="fixed bottom-0 left-0 right-0 w-full h-[64px] md:h-[104px] bg-[rgba(10,11,30,0.95)] md:bg-[rgba(0,0,2,0.5)] backdrop-blur-2xl border-t border-white/10 z-[150] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] select-none"
      >
        {/* PROGRESSÃO DA PRÁTICA EM MOBILE - NO TOPO DA BARRA */}
        {/* 📱 PROGRESSÃO DA PRÁTICA EM MOBILE - COM PROTEÇÃO DE BORDAS */}
        <div className="md:hidden absolute top-0 left-0 w-full h-[3px] bg-white/10 z-30">
          
          {/* 1. Tooltip de Tempo com Cálculo de Clamp (Impede sair do ecrã) */}
          {duration > 0 && (
            <div 
              className="absolute -top-7 flex flex-col items-center pointer-events-none transition-all duration-75"
              style={{ 
                left: `${(currentTime / duration) * 100}%`,
                // O segredo está aqui: o translateX varia de 0% a -100% conforme o progresso
                transform: `translateX(-${(currentTime / duration) * 100}%)` 
              }}
            >
              <span className="bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap">
                {formatSeconds(currentTime)}
              </span>
              <div className="w-1.5 h-1.5 bg-white rotate-45 -mt-1 shadow-lg" />
            </div>
          )}

          {/* 2. Linha de Progresso e Círculo (Handle) */}
          <div 
            className="h-full bg-white relative" 
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} 
          >
            {/* Círculo (Handle) com ajuste para não sair em 0% */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border-[2px] border-slate-900 transition-transform active:scale-150"
              style={{ 
                right: '-7px',
                // Esconde ou ajusta o handle quando está muito no início para não "comer" a borda
                opacity: (currentTime / duration) < 0.01 ? 0 : 1 
              }}
            />
          </div>

          {/* 3. Área de toque ampliada */}
          <input 
            type="range" min="0" max={duration || 100} value={currentTime} 
            onChange={(e) => { if(audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
            className="absolute top-[-15px] left-0 w-full h-[40px] opacity-0 cursor-pointer z-40"
          />
        </div>

        {/* LAYOUT MOBILE */}
        {/* LAYOUT MOBILE */}
        <div className="flex md:hidden relative w-full h-full items-center px-2 z-20">
          

         <div className="flex md:hidden relative w-full h-full items-center px-2 z-20">
  {/* Foto */}
  <div className="w-[44px] h-[44px] rounded-md overflow-hidden bg-slate-100 shrink-0 shadow-md">
    <img src={squareCoverSrc} alt={course.title} className="w-full h-full object-cover" onError={() => setSquareImgError(true)} />
  </div>

  {/* Contentor de Texto */}
  <div className="flex flex-col justify-center flex-1 min-w-0 px-3 mt-1 overflow-hidden">
    <div className="marquee-container">
      {/* Esta div move-se inteira */}
      <div className="marquee-content">
        {/* Renderizamos o título duas vezes para o loop ser contínuo */}
        <span className="text-[13px] font-bold text-white marquee-item">
          {currentTrack?.title}
        </span>
        <span className="text-[13px] font-bold text-white marquee-item">
          {currentTrack?.title}
        </span>
      </div>
    </div>
    <span className="text-[11px] text-white/50 truncate">
      {instructorName || "Prática Meditt"}
    </span>
  </div>

  {/* Botões */}
  <div className="flex items-center gap-1 shrink-0">
    <button onClick={(e) => handleToggleFavorite(e, currentTrack._id)} className="p-2 opacity-70 scale-90">
      {favorites.includes(currentTrack._id) ? <Icons.HeartFilled color="#ff4b4b" /> : <Icons.Heart />}
    </button>
    <button onClick={togglePlay} className="p-2 text-white">
      {isPlaying ? <Icons.Pause width={22} height={22} /> : <Icons.Play width={22} height={22} />}
    </button>
    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 opacity-70">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isExpanded ? <path d="M6 9l6 6 6-6"/> : <path d="M6 15l6-6 6 6"/>}
      </svg>
    </button>
  </div>
</div>

    
        </div>

        {/* LAYOUT DESKTOP */}
        <div className="hidden md:flex relative w-full h-full items-center px-8 max-w-7xl mx-auto z-20">
          <div className="flex-none z-10 flex items-center gap-3">
            <div className="w-[56px] h-[56px] rounded-md overflow-hidden bg-slate-100 shrink-0 shadow-md">
              <img src={squareCoverSrc} alt={course.title} className="w-full h-full object-cover" onError={() => setSquareImgError(true)} />
            </div>
          </div> 
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-2">
            <div className="flex flex-col items-center w-full max-w-md pointer-events-auto">
              <div className="flex items-center gap-6 mb-1">
                <button onClick={playPrev} className="opacity-60 hover:opacity-100 transition"><Icons.Prev /></button>
                <button onClick={togglePlay} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform active:scale-95 transition">
                  {isPlaying ? <Icons.Pause width={18} height={18} /> : <Icons.Play width={18} height={18} />}
                </button>
                <button onClick={playNext} className="opacity-60 hover:opacity-100 transition"><Icons.Next /></button>
              </div>
              <span className="text-[10px] text-white/70 font-medium mb-0.5 truncate max-w-full">{currentTrack?.title}</span>
              <div className="flex items-center gap-3 w-full">
                <span className="text-[10px] text-white/40 font-mono w-9 text-right">{formatSeconds(currentTime)}</span>
                <input type="range" min="0" max={duration || 100} value={currentTime} onChange={(e) => { if(audioRef.current) audioRef.current.currentTime = Number(e.target.value); }} className="flex-1 h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer"/>
                <span className="text-[10px] text-white/40 font-mono w-9 text-left">{formatSeconds(duration)}</span>
              </div>
            </div>
          </div>
          <div className="ml-auto z-10 flex items-center gap-3">
            <button onClick={(e) => handleToggleFavorite(e, currentTrack._id)} className="p-2 opacity-60 scale-[0.8]">
              {favorites.includes(currentTrack._id) ? <Icons.HeartFilled color="#ff4b4b" /> : <Icons.Heart />}
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isExpanded ? <path d="M6 9l6 6 6-6"/> : <path d="M6 15l6-6 6 6"/>}
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

      {!activeTrackYoutubeId && (
        <audio 
          ref={audioRef} 
          key={currentTrack?._id} 
          src={validAudioUrl || undefined} 
          preload="metadata" 
          onTimeUpdate={(e) => { 
            const el = e.currentTarget; 
            setCurrentTime(el.currentTime); 
            if (el.duration) { 
              setDuration(el.duration); 
              const curProg = (el.currentTime / el.duration) * 100; 
              setProgress(curProg); 
              
              // ❌ REMOVIDO: O auto-save a cada 10 segundos que estava aqui a estoirar os pedidos
              
              // ✅ MANTIDO: Marca como concluído aos 95% (Faz apenas 1 pedido por prática)
              if (curProg >= 95 && hasMarked95Ref.current !== currentTrack._id) { 
                hasMarked95Ref.current = currentTrack._id; 
                const newCompleted = [...new Set([...completedTracks, currentTrack._id])]; 
                setCompletedTracks(newCompleted); 
                if (session?.user?.email) localStorage.setItem(`meditt_completed_${course?._id || course?.id}_${session.user.email}`, JSON.stringify(newCompleted)); 
                saveProgressToDB(el.currentTime, true); 
              } 
            } 
          }}
          // ✅ NOVO: Só grava o progresso temporário se a pessoa clicar no Pause manualmente
          onPause={(e) => {
            const el = e.currentTarget;
            // Evita gravar se o pause foi porque o áudio acabou ou mal começou
            if (el.currentTime > 0 && el.currentTime < el.duration && hasMarked95Ref.current !== currentTrack._id) {
               saveProgressToDB(el.currentTime, false);
            }
          }}
          onEnded={() => { setIsPlaying(false); playNext(); }} 
          onError={() => console.error("Audio error - link broken")}
        />
      )}
         </div>
  );
}