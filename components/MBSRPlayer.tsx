"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // ✅ Importado para refresh em tempo real
 
import styles from "./MBSRPlayer.module.css";
// ✅ Importa a ação do servidor
import { toggleFavorite as toggleFavoriteAction } from "@/app/actions/updateCustomer"; 

// ✅ 1. FUNÇÕES AUXILIARES E LIMPEZA DE IDs
const cleanId = (id: any) => {
  if (!id) return null;
  return String(id).replace("drafts.", "").trim();
};

const getTrackId = (track: any): string | null => {
  if (!track) return null;
  return cleanId(track._id || track.id);
};

const formatSeconds = (secs: number) => {
  if (!secs || isNaN(secs) || !isFinite(secs) || secs < 0) return "00:00";
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
};

const getValidAudioUrl = (track: any): string | null => {
  if (!track) return null;
  return track.cloudflareAudioUrl || track.url || track.audioUrl || track.audioFile?.asset?.url || track.link || null;
};

// --- ÍCONES ---
const Icons = {
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Volume: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  PlayCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>,
  Next: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>,
  Prev: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>,
  Heart: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  HeartFilled: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  Info: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Unlock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>,
  Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
};

export default function MBSRPlayer({ course, isPreview, hasFullAccess }: { course: any, isPreview?: boolean, hasFullAccess?: boolean }) {
  const { data: session, status } = useSession();
  const router = useRouter(); // ✅ Inicializado
  const audioRef = useRef<HTMLAudioElement>(null);
  const idleAudioRef = useRef<HTMLAudioElement>(null); 
  const hasLoadedFromStore = useRef(false);
  
  // Refs para controlo de gravação na DB
  const hasMarked95Ref = useRef<string | null>(null);
  const lastSavedTimeDB = useRef<number>(0);

  // ✅ LÓGICA DE EXTRAÇÃO DE DADOS DO SANITY
  const allTracks = useMemo(() => {
    if (!course) return [];
    if (course.modules && course.modules.length > 0) {
      return course.modules.flatMap((mod: any, modIdx: number) => {
        const weekKey = `semana-${modIdx + 1}`;
        return (mod.content || []).map((t: any) => ({
          ...t,
          courseLevel: weekKey,
          weekTitle: mod.title
        }));
      });
    }
    if (course.courseContent) {
      const levels = ['nivel1', 'nivel2', 'nivel3'];
      return levels.flatMap((lvl, idx) => {
        return (course.courseContent[lvl] || []).map((t: any) => ({
          ...t,
          courseLevel: `semana-${idx + 1}`
        }));
      });
    }
    return course.content || [];
  }, [course]);

  const [activeWeek, setActiveWeek] = useState("semana-1");
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showInfo, setShowInfo] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);
  
  const [timeStats, setTimeStats] = useState<Record<string, number>>({}); 
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validAudioUrl = useMemo(() => getValidAudioUrl(currentTrack), [currentTrack]);
  const currentWeekTracks = useMemo(() => 
    allTracks.filter((t: any) => t.courseLevel === activeWeek).sort((a: any, b: any) => a.sessionNumber - b.sessionNumber)
  , [allTracks, activeWeek]);

  // ✅ GESTÃO DO MODO INATIVO (SCREENSAVER)
  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    setIsIdle(false);

    if (!showPlaylist && isPlaying) {
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 3000); 
    }
  }, [showPlaylist, isPlaying]);

  useEffect(() => {
    const handleUserActivity = () => resetIdleTimer();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    resetIdleTimer(); 
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    if (showPlaylist || !isPlaying) {
      setIsIdle(false);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    }
  }, [showPlaylist, isPlaying]);

  useEffect(() => {
    if (idleAudioRef.current) {
      idleAudioRef.current.volume = 0.4; 
      if (isIdle) {
        idleAudioRef.current.currentTime = 0;
        idleAudioRef.current.play().catch(e => console.log("Áudio bloqueado", e));
      } else {
        idleAudioRef.current.pause();
        idleAudioRef.current.currentTime = 0;
      }
    }
  }, [isIdle]);

  // ✅ GUARDAR PROGRESSO NA BASE DE DADOS
  const saveProgressToDB = useCallback(async (timeWatched: number, isCompleted: boolean) => {
    if (status !== "authenticated" || !session?.user?.email) return;
    const trackId = getTrackId(currentTrack);
    const courseId = cleanId(course?._id || course?.id);
    if (!trackId || !courseId) return;
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, trackId, timeWatched: Math.floor(timeWatched), isCompleted })
      });
    } catch (error) {
      console.error("Erro ao guardar progresso", error);
    }
  }, [course, currentTrack, session, status]);

  // ✅ CARREGAR DADOS DA BASE DE DADOS E LOCALSTORAGE
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;
    
    const courseId = cleanId(course?._id || course?.id);
    if (courseId) {
      fetch(`/api/progress?courseId=${courseId}`, { cache: 'no-store' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.progress) {
            const completedIds = data.progress.filter((p: any) => p.isCompleted).map((p: any) => cleanId(p.trackId));
            setCompletedTracks(prev => {
              const updated = [...new Set([...prev, ...completedIds])];
              const key = `meditt_mbsr_instant_v10_${session.user?.email?.toLowerCase()}`;
              const savedRaw = localStorage.getItem(key);
              let saved = savedRaw ? JSON.parse(savedRaw) : {};
              saved.completed = updated;
              localStorage.setItem(key, JSON.stringify(saved));
              return updated;
            });
            const statsMap: Record<string, number> = {};
            data.progress.forEach((p: any) => {
               const dateKey = p.lastUpdated ? p.lastUpdated.split('T')[0] : new Date().toISOString().split('T')[0];
               statsMap[dateKey] = (statsMap[dateKey] || 0) + (p.timeWatched || 0);
            });
            setTimeStats(statsMap);
          }
        }).catch(e => console.error(e));
    }

    if (hasLoadedFromStore.current) return;
    const key = `meditt_mbsr_instant_v10_${session.user.email?.toLowerCase()}`;
    try {
      const savedRaw = localStorage.getItem(key);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved.completed) setCompletedTracks(prev => [...new Set([...prev, ...saved.completed])]);
        if (saved.favorites) setFavorites(saved.favorites);
        if (saved.lastPlayed) {
          const t = allTracks.find((track: any) => getTrackId(track) === saved.lastPlayed);
          if (t) { setCurrentTrack(t); setActiveWeek(t.courseLevel); setLastPlayedId(saved.lastPlayed); }
        }
      }
      hasLoadedFromStore.current = true;
    } catch (e) { console.error(e); }
  }, [status, session, allTracks, course]);

  // ✅ ATUALIZAR TEMPO REAL-TIME
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const today = new Date().toISOString().split('T')[0];
        setTimeStats(prev => ({ ...prev, [today]: (prev[today] || 0) + 5 }));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // ✅ CÁLCULO ESTATÍSTICAS MENSAIS/SEMANAIS
  const { weekStats, monthStats } = useMemo(() => {
    const today = new Date();
    let weekTotal = 0; let monthTotal = 0;
    Object.entries(timeStats).forEach(([dateStr, seconds]) => {
      const recordDate = new Date(dateStr);
      const diffDays = Math.ceil(Math.abs(today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) weekTotal += seconds;
      if (recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear()) {
        monthTotal += seconds;
      }
    });
    return { weekStats: Math.floor(weekTotal / 60), monthStats: Math.floor(monthTotal / 60) };
  }, [timeStats]);

  useEffect(() => {
    if (currentWeekTracks.length > 0 && !currentTrack) setCurrentTrack(currentWeekTracks[0]);
  }, [currentWeekTracks, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !validAudioUrl) return;
    if (audio.src !== validAudioUrl) { audio.src = validAudioUrl; audio.load(); }
    audio.playbackRate = speed;
    if (isPlaying) { audio.play().catch(() => setIsPlaying(false)); } else { audio.pause(); }
  }, [validAudioUrl, isPlaying, speed]);

  const playTrack = (track: any) => {
    if (track.isLocked) return;
    hasMarked95Ref.current = null;
    lastSavedTimeDB.current = 0;
    setCurrentTrack(track);
    const trackId = getTrackId(track);
    setLastPlayedId(trackId);
    setShowPlaylist(false);
    setIsPlaying(true);
    if (trackId && session?.user?.email) {
      const key = `meditt_mbsr_instant_v10_${session.user.email?.toLowerCase()}`;
      const savedRaw = localStorage.getItem(key);
      let saved = savedRaw ? JSON.parse(savedRaw) : {};
      saved.lastPlayed = trackId; 
      localStorage.setItem(key, JSON.stringify(saved));
    }
  };

  // ✅ INTEGRADA: LOGICA DE FAVORITOS COM SERVER ACTION
  const toggleFavorite = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    
    if (status !== "authenticated") {
      alert("Precisas de estar ligado para guardar favoritos.");
      return;
    }

    console.log("A tentar favoritar id:", trackId);

    // 1. Chama a Server Action (Backend)
    const result = await toggleFavoriteAction(trackId);

    if (result.success) {
      console.log("Sucesso na BD:", result.action);

      // 2. Atualiza o Estado Local (Frontend)
      const isAdded = result.action === "added";
      const newFavorites = isAdded 
        ? [...favorites, trackId] 
        : favorites.filter(id => id !== trackId);
      
      setFavorites(newFavorites);

      // 3. Atualiza LocalStorage (Redundância)
      if (session?.user?.email) {
        const key = `meditt_mbsr_instant_v10_${session.user.email?.toLowerCase()}`;
        const savedRaw = localStorage.getItem(key);
        let saved = savedRaw ? JSON.parse(savedRaw) : {};
        saved.favorites = newFavorites;
        localStorage.setItem(key, JSON.stringify(saved));
      }

      // 4. ✅ Força o Next.js a revalidar os dados no Dashboard
      router.refresh(); 
      
    } else {
      console.error("Erro na Action:", result.error);
      alert("Não foi possível guardar o favorito. Tenta novamente.");
    }
  };

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!course) return null;

  return (
    <div className={`${styles.pageContainer} font-sans`} style={{ isolation: 'isolate', overflow: 'hidden', fontFamily: "var(--font-sans), 'Inter', sans-serif" }}>

      <audio ref={idleAudioRef} src="https://assets.mixkit.co/active_storage/sfx/1208/1208-preview.mp3" preload="auto" loop />

      <svg style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="liquify-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="warp">
              <animate attributeName="baseFrequency" values="0.012; 0.018; 0.012" dur="20s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="65" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className={styles.bgOverlay} style={{ filter: 'url(#liquify-filter)', transform: 'scale(1.1)', transition: 'none' }}></div>
      <div className={`fixed top-0 left-0 w-full transition-opacity duration-700 ${isIdle ? 'opacity-0 pointer-events-none -z-10' : 'opacity-100 z-[120]'}`}></div>
      
      <audio ref={audioRef} 
        onTimeUpdate={(e) => {
          const curr = e.currentTarget.currentTime;
          const dur = e.currentTarget.duration || 1;
          const prog = (curr / dur) * 100;
          setCurrentTime(curr);
          setDuration(dur);
          setProgress(prog);
          if (curr - lastSavedTimeDB.current >= 10) {
            saveProgressToDB(curr, false);
            lastSavedTimeDB.current = curr;
          }
          if (prog >= 95) {
            const tid = getTrackId(currentTrack);
            if (tid && hasMarked95Ref.current !== tid) {
              hasMarked95Ref.current = tid;
              setCompletedTracks(prev => {
                const updated = [...new Set([...prev, tid])];
                if (session?.user?.email) {
                  const key = `meditt_mbsr_instant_v10_${session.user.email?.toLowerCase()}`;
                  const savedRaw = localStorage.getItem(key);
                  let saved = savedRaw ? JSON.parse(savedRaw) : {};
                  saved.completed = updated;
                  localStorage.setItem(key, JSON.stringify(saved));
                }
                return updated;
              });
              saveProgressToDB(curr, true);
            }
          }
        }}
        onEnded={() => {
            const idx = currentWeekTracks.findIndex((t: any) => getTrackId(t) === getTrackId(currentTrack));
            if (idx < currentWeekTracks.length - 1) playTrack(currentWeekTracks[idx + 1]);
        }}
      />

      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
           background: isIdle 
             ? `linear-gradient(105deg, rgba(16, 16, 148, 0.7) 0%, rgba(11, 162, 217, 0.1) 100%), url('https://64.media.tumblr.com/b95ea67270ad37540c0b666fe7cd408c/885d4d0feb3dfde8-d7/s640x960/595e91ee982e71703601ae68232b78600bc300e9.gifv') no-repeat center center / cover`
             : 'transparent',
           backdropFilter: isIdle ? 'blur(15px)' : 'blur(0px)',
           opacity: isIdle ? 1 : 0,
           zIndex: 99999,
           transition: 'all 1s ease-in-out'
        }}
      />

      <div className={`${styles.playerWrapper} pt-24`} style={{ position: 'relative', zIndex: isIdle ? 100000 : 10 }}>
        
        <div className={styles.playerGlass} style={{ opacity: isIdle ? 0 : 1, transition: 'opacity 1s ease' }}></div>
        
        <div className={styles.toolbar} style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          width: '100%', padding: '0 30px', position: 'absolute', top: '40px', left: 0, zIndex: 160, pointerEvents: 'auto',
          opacity: isIdle ? 0 : 1, transition: 'opacity 0.5s ease'
        }}>
            <button className={styles.iconBtn} onClick={() => setShowInfo(true)} style={{ cursor: 'pointer' }}>
                <Icons.Info />
            </button>
            <button className={styles.iconBtn} onClick={() => setShowPlaylist(!showPlaylist)} style={{ cursor: 'pointer' }}>
                {showPlaylist ? <Icons.Menu /> : <Icons.Close />}
            </button>
        </div>

        <div className={`${styles.playlistView} ${showPlaylist ? styles.visible : styles.hidden}`}>
            <div className={styles.listTitle} style={{ marginBottom: '50px', fontWeight: 300 }}>{course.title}</div>
            <div style={{padding: '0 20px', marginBottom: '15px'}}>
               <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'rgba(255,255,255,0.7)', marginBottom:'5px', fontWeight: 300}}>
                  <span>{Math.round((completedTracks.length / (allTracks.length || 1)) * 100)}% ({completedTracks.length} sessões)</span>
                  <button onClick={() => playTrack(allTracks[0])} style={{background:'none', border:'none', color:'#ffffff', cursor:'pointer', fontSize:'9px', fontWeight: 'bold', textDecoration:'underline', letterSpacing:'1px'}}>
                      {lastPlayedId ? "CONTINUAR ▶" : "INICIAR ▶"}
                  </button>
               </div>
               <div style={{width:'100%', height:'4px', background:'rgba(255,255,255,0.2)', borderRadius:'3px', overflow:'hidden'}}>
                  <div style={{ width: `${(completedTracks.length / (allTracks.length || 1)) * 100}%`, height:'100%', background:'#ffffff', borderRadius:'3px', transition:'width 0.5s ease' }}></div>
               </div>
            </div>
            <div className={styles.weekSelector}>
               {Array.from(new Set(allTracks.map((t:any) => t.courseLevel))).sort().map((w: any) => (
                   <button key={w} onClick={()=>setActiveWeek(w)} className={`${styles.weekBtn} ${activeWeek === w ? styles.activeTab : ''}`} style={{ fontSize: '0.5rem', fontWeight: 400, padding: '4px 12px' }}> 
                       {w.replace('-',' ').toUpperCase()}
                   </button>
               ))}
            </div>
            <div className={styles.listScroll}>
               {currentWeekTracks.map((track: any) => {
                   const trackId = getTrackId(track);
                   const isActive = getTrackId(currentTrack) === trackId;
                   const isFav = trackId ? favorites.includes(trackId) : false;
                   const isDone = trackId ? completedTracks.includes(trackId) : false;
                   
                   return (
                       <div key={trackId} className={`${styles.listItem} ${isActive && !track.isLocked ? styles.active : ''}`} onClick={() => playTrack(track)}>
                           
                           <div className={styles.itemNumber} style={{ 
                               display: 'flex', alignItems: 'center', justifyContent: 'center', 
                               color: (isActive || isDone) ? '#4ade80' : '#fff', 
                               fontWeight: (isActive || isDone) ? 'bold' : 300, 
                               width: '26px', height: '26px', minWidth: '26px', fontSize: '12px' 
                            }}>
                              {isDone ? <Icons.Check /> : track.sessionNumber}
                           </div>

                           <div className={styles.itemInfo}>
                               <div className={styles.itemTitle} style={{ fontSize: '0.76rem', fontWeight: 600 }}>{track.title}</div>
                               <div className={styles.itemSub} style={{ fontWeight: 300, opacity: 0.8 }}>
                                 Sessão {track.sessionNumber} {track.duration && `• ${track.duration} min`}
                               </div>
                           </div>

                           <div className={styles.itemRight} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
                               {!track.isLocked && (
                                 <button onClick={(e) => { if(trackId) toggleFavorite(e, trackId) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                     {isFav ? <Icons.HeartFilled /> : <Icons.Heart />}
                                 </button>
                               )}
                               {track.isLocked ? (
                                  <div style={{ opacity: 0.8, color: '#fff' }}><Icons.Lock /></div>
                               ) : (
                                  isActive && isPlaying ? <Icons.Volume /> : <Icons.Unlock />
                               )}
                           </div>
                       </div>
                   );
               })}
            </div>
        </div>

        <div className={`${styles.playerView} ${showPlaylist ? styles.hidden : styles.visible}`}>
            
            <div className={styles.trackInfo} style={{ paddingTop: '50px', opacity: isIdle ? 0 : 1, transition: 'opacity 0.5s ease' }}>
               <div className={styles.trackTitle} style={{ fontSize: '1.0rem', letterSpacing: '-0.03em', fontWeight: 500 }}>{currentTrack?.title}</div>
               <div className={styles.trackMeta} style={{ opacity: 0.6, fontWeight: 300, fontSize: '0.7rem' }}>Sessão {currentTrack?.sessionNumber}</div>
            </div>

            <div style={{ position: 'relative', width: '260px', height: '260px', margin: '30px auto 10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: isIdle ? 'scale(1.2)' : 'scale(1)', transition: 'transform 1s ease-in-out' }}>
                <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                    <circle cx="130" cy="130" r={radius} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="5" fill="transparent" />
                    <circle cx="130" cy="130" r={radius} stroke="#ffffff" strokeWidth="5" fill="transparent" strokeDasharray={circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out', strokeLinecap: 'round' }} />
                </svg>
                <div style={{ textAlign: 'center', zIndex: 10 }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 300, color: 'white', letterSpacing: '-2px' }}>{formatSeconds(duration - currentTime)}</div>
                </div>
            </div>

            <div className={styles.glassControls} style={{ marginTop: '0px', opacity: isIdle ? 0 : 1, pointerEvents: isIdle ? 'none' : 'auto', transition: 'opacity 0.5s ease' }}>
               <div className={styles.progressBar} onClick={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     if(audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
               }}>
                   <div className={styles.progressFill} style={{width: `${progress}%`, background: '#ffffff'}}></div>
               </div>
               <div className={styles.timeRow} style={{ fontSize: '10px', marginBottom: '12px', opacity: 0.7, fontWeight: 300 }}>
                 <span>{formatSeconds(currentTime)}</span><span>{formatSeconds(duration)}</span>
               </div>
               <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                       <button className={styles.ctrlBtn} onClick={() => {
                        const idx = currentWeekTracks.findIndex((t: any) => getTrackId(t) === getTrackId(currentTrack));
                        if (idx > 0) playTrack(currentWeekTracks[idx - 1]);
                       }}><Icons.Prev /></button>
                       <button className={styles.ctrlBtn} style={{ fontSize: '11px', fontWeight: 700 }} onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 30 }}>-30s</button>
                       <button className={styles.playBtnLarge} onClick={() => setIsPlaying(!isPlaying)} style={{ background: '#ffffff', color: '#155DFC' }}>
                          {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                       </button>
                       <button className={styles.ctrlBtn} style={{ fontSize: '11px', fontWeight: 700 }} onClick={() => { if(audioRef.current) audioRef.current.currentTime += 30 }}>+30s</button>
                       <button className={styles.ctrlBtn} onClick={() => {
                        const idx = currentWeekTracks.findIndex((t: any) => getTrackId(t) === getTrackId(currentTrack));
                        if (idx < currentWeekTracks.length - 1) playTrack(currentWeekTracks[idx + 1]);
                       }}><Icons.Next /></button>
                   </div>
                   <div style={{ position: 'absolute', right: '0' }}>
                       <button onClick={() => setSpeed(speed === 1 ? 1.5 : 1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: '10px', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}>{speed}x</button>
                   </div>
               </div>
            </div>
        </div>

        <div className={`absolute inset-0 z-[400] flex flex-col transition-all duration-500 ease-in-out ${showInfo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`} 
             style={{ background: 'linear-gradient(180deg, #4c4ed4 0%, #1e1f5e 100%)', padding: '100px 30px 40px', position: 'fixed' }}>
          
          <div style={{ position: 'absolute', top: '20px', left: '30px', right: '30px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 401 }}>
            <button className={styles.iconBtn} onClick={() => setShowInfo(false)} style={{ cursor: 'pointer', padding: '0' }}>
              <Icons.Close />
            </button>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              SOBRE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h2 style={{ fontSize: '1.8rem', fontWeight: 300, lineHeight: '1.1', color: '#fff', marginBottom: '20px' }}>
              {course.title}
            </h2>
            <div style={{ width: '50px', height: '1.5px', background: 'rgba(255,255,255,0.5)', marginBottom: '40px' }} />
            
            <p style={{ fontSize: '12px', lineHeight: '1.4', color: '#fff', opacity: 0.8, fontStyle: 'italic', marginBottom: '30px' }}>
              {course.description || "Este curso foca na redução de stress através de técnicas comprovadas de mindfulness."}
            </p>

            <div className="flex gap-4 mb-4">
              <div className="flex-1 p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>DURAÇÃO</span>
                <span style={{ fontSize: '16px', fontWeight: 400, color: '#fff' }}>8 Semanas</span>
              </div>
              <div className="flex-1 p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>SESSÕES</span>
                <span style={{ fontSize: '16px', fontWeight: 400, color: '#fff' }}>{allTracks.length} áudios</span>
              </div>
            </div>

            <div className="flex gap-4 mb-10">
              <div className="flex-1 p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>ESTA SEMANA</span>
                <span style={{ fontSize: '16px', fontWeight: 400, color: '#fff' }}>{weekStats} min</span>
              </div>
              <div className="flex-1 p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>ESTE MÊS</span>
                <span style={{ fontSize: '16px', fontWeight: 400, color: '#fff' }}>{monthStats} min</span>
              </div>
            </div>
          </div>

          <button onClick={() => setShowInfo(false)} 
            className="w-full py-6 bg-white text-[#1e1f5e] font-bold rounded-[40px] shadow-2xl mt-4"
            style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
            Regressar à Prática
          </button>
        </div>

      </div>
    </div>
  );
}