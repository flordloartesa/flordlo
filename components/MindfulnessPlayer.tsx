"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import styles from "./MindfulnessPlayer.module.css";

// ✅ FUNÇÃO PARA LIMPAR IDs
const cleanId = (id: any) => {
  if (!id) return null;
  return String(id).replace("drafts.", "").trim();
};

// ✅ 1. FUNÇÕES AUXILIARES
const formatSeconds = (secs: number) => {
  if (!secs || isNaN(secs)) return "00:00";
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
};

const getValidAudioUrl = (track: any): string | null => {
  if (!track) return null;
  return track.cloudflareAudioUrl || track.url || track.audioUrl || track.audioFile?.asset?.url || track.link || null;
};

const getTrackId = (track: any): string | null => {
  if (!track) return null;
  const id = track._id || track.id;
  return cleanId(id); 
};

const getYoutubeVideoId = (track: any): string | null => {
  if (!track) return null;
  const possibleValues = [track.youtubeUrl, track.videoUrl, track.url, track.link, track.codigo, track.video];
  for (const val of possibleValues) {
    if (typeof val === 'string' && val.trim() !== '') {
      const str = val.trim();
      if (str.length === 11 && !str.includes(' ') && !str.includes('/')) return str;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = str.match(regExp);
      if (match && match[2].length === 11) return match[2];
    }
  }
  return null;
};

// --- ÍCONES ---
const Icons = {
  Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Volume: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  Heart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  HeartFilled: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  Info: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Unlock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>,
  Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Loop: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>,
  Playlist: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Next: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>,
  Prev: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
};

export default function MindfulnessPlayer({ course, allTracks, courseTitle, courseDescription }: any) {
  const { data: session, status } = useSession();
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasMarked95Ref = useRef<string | null>(null);
  const lastSavedTimeDB = useRef<number>(0);

  const title = course?.title || courseTitle || "47 dias de Mindfulness (3 níveis)";
  const subtitle = course?.subtitle || "Introduzindo Mindfulness na sua vida quotidiana"; 
  const description = course?.description || courseDescription || "Este programa de Mindfulness utiliza a Consciência Plena para promover o Bem-Estar Cognitivo e Emocional.";

  // ✅ 2. LÓGICA DE DADOS "BLINDADA"
  const masterTracks = useMemo(() => {
    if (allTracks && Array.isArray(allTracks) && allTracks.length > 0) return allTracks.filter(Boolean);
    if (allTracks?.sessoes) return allTracks.sessoes.filter(Boolean);
    if (allTracks?.content) return allTracks.content.filter(Boolean);
    if (course?.sessoes) return course.sessoes.filter(Boolean);
    if (course?.content) return course.content.filter(Boolean);
    if (Array.isArray(course)) return course.filter(Boolean);
    return [];
  }, [allTracks, course]);

  const purchasedTracksIds = useMemo(() => {
    let purchased = [];
    if (course?.sessoes) purchased = course.sessoes;
    else if (course?.content) purchased = course.content;
    else if (Array.isArray(course)) purchased = course;
    return purchased.map((t: any) => getTrackId(t)).filter(Boolean);
  }, [course]);

  const isTrackLocked = useCallback((track: any) => {
    if (!track) return false;
    if (track.isFree) return false;

    if (course?.allowedLevels && Array.isArray(course.allowedLevels)) {
      const lvlStr = String(track.courseLevel || track.nivel || track.level || "").toLowerCase();
      let trackLevelNum = 1;
      if (lvlStr.includes("2")) trackLevelNum = 2;
      if (lvlStr.includes("3")) trackLevelNum = 3;
      return !course.allowedLevels.includes(trackLevelNum);
    }

    const tid = getTrackId(track);
    if (purchasedTracksIds.length > 0 && masterTracks.length > purchasedTracksIds.length && tid) {
      return !purchasedTracksIds.includes(tid);
    }
    return false;
  }, [course?.allowedLevels, purchasedTracksIds, masterTracks.length]);

  const unlockedLevels = useMemo(() => {
    if (course?.allowedLevels && Array.isArray(course.allowedLevels)) {
      return course.allowedLevels.map((n: number) => `nivel-${n}`);
    }
    const levels = new Set<string>();
    purchasedTracksIds.forEach(tid => {
       const t = masterTracks.find(track => getTrackId(track) === tid);
       if (t) {
         const lvlStr = String(t.courseLevel || t.nivel || t.level || "").toLowerCase();
         if (lvlStr.includes("1") || lvlStr === "") levels.add("nivel-1");
         if (lvlStr.includes("2")) levels.add("nivel-2");
         if (lvlStr.includes("3")) levels.add("nivel-3");
       }
    });
    if (levels.size === 0) levels.add("nivel-1");
    return Array.from(levels);
  }, [course?.allowedLevels, purchasedTracksIds, masterTracks]);

  const initialLevel = useMemo(() => {
    if (unlockedLevels.includes("nivel-1")) return "nivel-1";
    if (unlockedLevels.includes("nivel-2")) return "nivel-2";
    if (unlockedLevels.includes("nivel-3")) return "nivel-3";
    return "nivel-1";
  }, [unlockedLevels]);

  const [activeLevel, setActiveLevel] = useState<string>(initialLevel);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(false);
  
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // ✅ timeStats agora servirá para os cálculos semanais/mensais
  const [timeStats, setTimeStats] = useState<Record<string, number>>({}); 

  const currentLevelTracksRef = useRef<any[]>([]);
  const currentTrackRef = useRef<any>(null);

  const saveProgressToDB = useCallback(async (timeWatched: number, isCompleted: boolean) => {
    if (status !== "authenticated" || !session?.user?.email) return;

    const trackId = getTrackId(currentTrackRef.current);
    const courseId = cleanId(course?._id || course?.id) || "curso_geral"; 

    if (!trackId || !courseId) return;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          trackId,
          timeWatched: Math.floor(timeWatched),
          isCompleted
        })
      });
    } catch (error) {
      console.error("Erro ao guardar progresso na base de dados", error);
    }
  }, [course, session, status]);

  // ✅ ATUALIZADO: Carrega Vistos Verdes E Minutos Praticados
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email || !course) return;

    const courseId = cleanId(course?._id || course?.id) || "curso_geral";

    const loadProgressFromDB = async () => {
      try {
        const res = await fetch(`/api/progress?courseId=${courseId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.progress) {
            // 1. Vistos Verdes
            const completedIds = data.progress
              .filter((p: any) => p.isCompleted === true)
              .map((p: any) => cleanId(p.trackId))
              .filter(Boolean);
            setCompletedTracks(completedIds as string[]);

            // 2. Estatísticas de Tempo (Transformamos os dados da BD num formato legível para o useMemo)
            const statsMap: Record<string, number> = {};
            data.progress.forEach((p: any) => {
               // Usamos a data da última atualização para saber quando foi praticado
               const dateKey = p.lastUpdated ? p.lastUpdated.split('T')[0] : new Date().toISOString().split('T')[0];
               statsMap[dateKey] = (statsMap[dateKey] || 0) + (p.timeWatched || 0);
            });
            setTimeStats(statsMap);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados da Base de Dados", error);
      }
    };

    loadProgressFromDB();
  }, [status, session, course]);

  // ✅ Atualiza o tempo enquanto ouve (em tempo real)
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

  // ✅ Este cálculo agora usa os dados que vieram do MongoDB
  const { weekStats, monthStats } = useMemo(() => {
    const today = new Date();
    let weekTotal = 0;
    let monthTotal = 0;

    Object.entries(timeStats).forEach(([dateStr, seconds]) => {
      const recordDate = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - recordDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Se foi nos últimos 7 dias
      if (diffDays <= 7) weekTotal += seconds;
      
      // Se foi neste mês
      if (recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear()) {
        monthTotal += seconds;
      }
    });

    return { 
      weekStats: Math.floor(weekTotal / 60), 
      monthStats: Math.floor(monthTotal / 60) 
    };
  }, [timeStats]);

  const currentLevelTracks = useMemo(() => {
    let filtered = masterTracks.filter((t: any) => {
      if (!t) return false; 
      const lvlStr = String(t.courseLevel || t.nivel || t.level || "").toLowerCase();
      
      if (lvlStr === "") return activeLevel === "nivel-1";
      if (activeLevel === "nivel-1") return lvlStr.includes("1");
      if (activeLevel === "nivel-2") return lvlStr.includes("2");
      if (activeLevel === "nivel-3") return lvlStr.includes("3");
      
      return false;
    });
    
    return filtered.sort((a: any, b: any) => (Number(a.sessionNumber || a.numero || 0)) - (Number(b.sessionNumber || b.numero || 0)));
  }, [masterTracks, activeLevel]);

  const youtubeVideoId = getYoutubeVideoId(currentTrack);
  const isVideoTrack = !!youtubeVideoId;
  const validAudioUrl = useMemo(() => !isVideoTrack ? getValidAudioUrl(currentTrack) : null, [currentTrack, isVideoTrack]);

  useEffect(() => {
    if (!currentTrack && currentLevelTracks.length > 0) {
        const firstUnlocked = currentLevelTracks.find((t: any) => !isTrackLocked(t));
        if (firstUnlocked) {
            setCurrentTrack(firstUnlocked);
        } else {
            setCurrentTrack(currentLevelTracks[0]);
        }
    }
  }, [currentLevelTracks, currentTrack, isTrackLocked]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isVideoTrack) { audio.pause(); return; }
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, isVideoTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !validAudioUrl || isVideoTrack) return;
    if (audio.src !== validAudioUrl) {
      audio.src = validAudioUrl;
      audio.load();
      audio.playbackRate = speed;
      if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    } else {
       audio.playbackRate = speed;
    }
  }, [validAudioUrl, speed, isPlaying, isVideoTrack]);

  const playTrack = useCallback((track: any) => {
    hasMarked95Ref.current = null;
    lastSavedTimeDB.current = 0;
    setCurrentTrack(track);
    setShowPlaylist(false);
    setIsPlaying(!getYoutubeVideoId(track));
  }, []);

  const toggleFavorite = useCallback((e: React.MouseEvent, trackId: string | null) => {
    e.stopPropagation();
    if (!trackId) return;
    setFavorites(prev => prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]);
  }, []);

  useEffect(() => { currentLevelTracksRef.current = currentLevelTracks; }, [currentLevelTracks]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

  const handleNextTrack = useCallback(() => {
    if (isLooping && audioRef.current && !isVideoTrack) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    const tracks = currentLevelTracksRef.current;
    const track = currentTrackRef.current;
    const currentIndex = tracks.findIndex((t: any) => getTrackId(t) === getTrackId(track));
    
    if (currentIndex >= 0 && currentIndex < tracks.length - 1) {
      const nextTrack = tracks[currentIndex + 1];
      if (!isTrackLocked(nextTrack)) {
        playTrack(nextTrack);
      }
    }
  }, [playTrack, isLooping, isVideoTrack, isTrackLocked]);

  const handlePrevTrack = useCallback(() => {
    const tracks = currentLevelTracksRef.current;
    const track = currentTrackRef.current;
    const currentIndex = tracks.findIndex((t: any) => getTrackId(t) === getTrackId(track));
    
    if (!isVideoTrack && audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else if (currentIndex > 0) {
      const prevTrack = tracks[currentIndex - 1];
      if (!isTrackLocked(prevTrack)) {
        playTrack(prevTrack);
      }
    } else if (!isVideoTrack && audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [playTrack, isVideoTrack, isTrackLocked]);

  const skipTime = (seconds: number) => {
    if (!isVideoTrack && audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration));
    }
  };

  const toggleSpeed = () => setSpeed(s => s === 1 ? 1.2 : s === 1.2 ? 1.5 : s === 1.5 ? 2 : 1);

  const coursePercentage = useMemo(() => {
    if (masterTracks.length === 0) return 0;
    const count = masterTracks.filter((t: any) => {
      const id = getTrackId(t);
      return id && completedTracks.includes(id);
    }).length;
    return Math.round((count / masterTracks.length) * 100);
  }, [masterTracks, completedTracks]);

  const handleAudioEnded = useCallback(() => {
    if (isLooping && audioRef.current && !isVideoTrack) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    setIsPlaying(false);
    const trackId = getTrackId(currentTrackRef.current);
    if (trackId) setCompletedTracks(prev => prev.includes(trackId) ? prev : [...prev, trackId]);
    handleNextTrack();
  }, [handleNextTrack, isLooping, isVideoTrack]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.pageContainer} style={{ isolation: 'isolate', fontWeight: 500, fontFamily: "'font-sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&display=swap');` }} />
      <div className={styles.bgOverlay}></div>
      <div className="fixed top-0 left-0 w-full z-[120]"></div>

      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          if (isVideoTrack) return;
          const curr = e.currentTarget.currentTime || 0;
          const dur = e.currentTarget.duration || 1;
          const prog = (curr / dur) * 100;
          setCurrentTime(curr);
          setDuration(dur === 1 && curr === 0 ? 0 : dur);
          setProgress(prog || 0);

          if (curr - lastSavedTimeDB.current >= 10) {
            saveProgressToDB(curr, false);
            lastSavedTimeDB.current = curr;
          }

          if (prog >= 95) {
            const trackId = getTrackId(currentTrackRef.current);
            if (trackId && hasMarked95Ref.current !== trackId) {
              hasMarked95Ref.current = trackId;
              setCompletedTracks(prev => prev.includes(trackId) ? prev : [...prev, trackId]);
              saveProgressToDB(curr, true);
            }
          }
        }}
        onEnded={handleAudioEnded}
      />

      <div className={`${styles.playerWrapper} pt-24`} style={{ position: 'relative', overflow: 'hidden' }}>
        <div className={styles.playerGlass}></div>

      {!showInfo && (
          <div className={styles.toolbar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 30px', position: 'absolute', top: '40px', left: 0, zIndex: 350 }}>
            <div>
              {showPlaylist && (
                <button className={styles.iconBtn} onClick={() => setShowInfo(true)}>
                  <Icons.Info />
                </button>
              )}
            </div>
            <button className={styles.iconBtn} onClick={() => setShowPlaylist(!showPlaylist)}>
              {showPlaylist ? <Icons.Menu /> : <Icons.Close />}
            </button>
          </div>
        )}

        {/* --- VISTA LISTA --- */}
        <div className={`${styles.playlistView} ${showPlaylist ? styles.visible : styles.hidden}`}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h1 className={styles.listTitle} style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#fff', margin: 0 }}>{title}</h1>
            <div style={{ color: '#fff', fontWeight: 300, fontSize: '0.7rem', marginTop: '5px' }}>{subtitle}</div>
          </div>
          
          <div style={{ padding: '0 20px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#fff', opacity: 0.7, marginBottom: '5px' }}>
              <span>{coursePercentage}% CONCLUÍDO</span>
              <span 
                onClick={() => {
                  const firstUnlocked = currentLevelTracks.find((t: any) => !isTrackLocked(t));
                  if (firstUnlocked) playTrack(firstUnlocked);
                }} 
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                INICIAR ▶
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${coursePercentage}%`, height: '100%', background: '#ffffff', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>

          <div className={styles.weekSelector} style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {['nivel-1', 'nivel-2', 'nivel-3'].map((lvl) => {
              const isUnlocked = unlockedLevels.includes(lvl);

              return (
                <button 
                  key={lvl} 
                  onClick={() => setActiveLevel(lvl)} 
                  style={{
                    fontSize: '0.5rem', padding: '4px 10px', borderRadius: '25px', fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.5)', 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: activeLevel === lvl ? '#fff' : 'transparent',
                    color: activeLevel === lvl ? '#6b21a8' : '#fff',
                    opacity: 1, 
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                  {!isUnlocked && <Icons.Lock />} 
                  {lvl.replace('nivel-', 'NÍVEL ')}
                </button>
              );
            })}
          </div>


          <div className={styles.listScroll}>
            {currentLevelTracks.map((track: any, index: number) => {
              const trackId = getTrackId(track);
              const isActive = getTrackId(currentTrack) === trackId;
              const isDone = trackId ? completedTracks.includes(trackId) : false;
              
              const trackNumNoNivel = index + 1;
              const isNivel1 = activeLevel === "nivel-1";
              
              const isLocked = isTrackLocked(track);
              
              let numeroEsquerda;
              let textoCalculado = "";

              if (isNivel1) {
                 if (trackNumNoNivel >= 12) {
                     numeroEsquerda = trackNumNoNivel - 11;
                     textoCalculado = `Sessão ${numeroEsquerda}`;
                 } else {
                     numeroEsquerda = trackNumNoNivel;
                     textoCalculado = String(trackNumNoNivel);
                 }
              } else {
                 numeroEsquerda = trackNumNoNivel;
                 textoCalculado = `Sessão ${trackNumNoNivel}`;
              }
              
              const textoFinal = track.name || track.title || textoCalculado;
              const trackTemVideo = !!getYoutubeVideoId(track);
              const nivelFormatado = activeLevel.replace('nivel-', 'Nível ');
              const nomeInstrutor = track.instructorName || track.instructor;
              const imagemInstrutor = track.instructorImage;

              return (
                <div 
                  key={trackId || index} 
                  className={`${styles.listItem} ${isActive && !isLocked ? styles.active : ''}`} 
                  onClick={() => {
                    if (!isLocked) playTrack(track); 
                  }}
                  style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                >
                  
                  <div className={styles.itemNumber} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDone ? '#4ade80' : '#fff', fontWeight: isDone ? 'bold' : 'normal', width: '26px', height: '26px', minWidth: '26px', fontSize: '12px' }}>
                    {isDone ? <Icons.Check /> : numeroEsquerda}
                  </div>
                  
                  <div className={styles.itemInfo} style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.itemTitle} style={{ fontSize: '0.76rem', fontWeight: 300 }}>
                      {textoFinal}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.6rem', opacity: 0.6 }}>
                      <span>{nivelFormatado}</span>
                      {track.duration && <span>• {track.duration}</span>}
                      
                      {nomeInstrutor && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          •
                          {imagemInstrutor && (
                            <img 
                              src={imagemInstrutor} 
                              alt={nomeInstrutor} 
                              style={{ width: '12px', height: '12px', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                          )}
                          {nomeInstrutor}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.itemRight} style={{ display: 'flex', flexDirection: 'row', gap: '15px', alignItems: 'center' }}>
                    
                    {!isLocked && (
                      <button onClick={(e) => toggleFavorite(e, trackId)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        {trackId && favorites.includes(trackId) ? <Icons.HeartFilled /> : <Icons.Heart />}
                      </button>
                    )}
                    
                    {isLocked ? (
                      <div style={{ opacity: 0.8, color: '#fff' }}><Icons.Lock /></div>
                    ) : (
                      isActive && isPlaying && !trackTemVideo ? <Icons.Volume /> : <Icons.Unlock />
                    )}
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>

        {/* --- VISTA PLAYER --- */}
        <div className={`${styles.playerView} ${showPlaylist ? styles.hidden : styles.visible}`} 
             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'calc(100% - 200px)', display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
          <div style={{ textAlign: 'center', marginTop: '6vh', flexShrink: 0 }}>
            <div className={styles.trackTitle} style={{ fontSize: '1.35rem', fontWeight: 700 }}>{currentTrack?.name || currentTrack?.title}</div>
            
            <div className={styles.trackMeta} style={{ opacity: 0.9, letterSpacing: '3px', fontSize: '14px', textTransform: 'uppercase', marginTop: '5px' }}>
              {(() => {
                if (!currentTrack) return "1";
                const indexOfCurrent = currentLevelTracks.findIndex((t:any) => getTrackId(t) === getTrackId(currentTrack));
                const trackNumNoNivel = indexOfCurrent !== -1 ? indexOfCurrent + 1 : 1;
                const isNivel1 = activeLevel === "nivel-1";
                
                if (isNivel1) {
                   return trackNumNoNivel >= 12 ? `Sessão ${trackNumNoNivel - 11}` : String(trackNumNoNivel);
                } else {
                   return `Sessão ${trackNumNoNivel}`;
                }
              })()}
            </div>

          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', width: '100%', zIndex: 50 }}>
            
            {isVideoTrack ? (
              <div style={{ width: '90%', maxWidth: '400px', margin: '0 auto', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', background: '#000' }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '220px', height: '220px', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                  <circle cx="110" cy="110" r={80} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" fill="transparent" />
                  <circle cx="110" cy="110" r={80} stroke="#ffffff" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 0.8s ease-out', strokeLinecap: 'round' }} />
                </svg>
                <div style={{ fontSize: '2.2rem', color: 'white', fontWeight: 300, letterSpacing: '-1px' }}>
                  {formatSeconds(currentTime)}
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* ✅ CONTROLOS BASE */}
        <div className={`${showPlaylist ? styles.hidden : styles.visible}`} 
             style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px', display: 'flex', flexDirection: 'column', zIndex: 150 }}>
          
          <div style={{ padding: '15px 30px 10px', display: 'flex', alignItems: 'center', gap: '15px', width: '100%', opacity: isVideoTrack ? 0.3 : 1 }}>
            <span style={{ fontSize: '10px', color: '#fff', opacity: 0.7 }}>{isVideoTrack ? "--:--" : formatSeconds(currentTime)}</span>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', cursor: isVideoTrack ? 'default' : 'pointer', position: 'relative' }}
              onClick={(e) => {
                if (isVideoTrack) return;
                const rect = e.currentTarget.getBoundingClientRect();
                if (audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
              }}>
              <div style={{ width: `${isVideoTrack ? 0 : progress}%`, height: '100%', background: '#fff', borderRadius: '4px', pointerEvents: 'none' }}></div>
            </div>
            <span style={{ fontSize: '10px', color: '#fff', opacity: 0.7 }}>{isVideoTrack ? "--:--" : formatSeconds(duration)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px 15px', color: '#fff', opacity: 0.8 }}>
            <button onClick={toggleSpeed} disabled={isVideoTrack} style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '12px', fontWeight: 'bold', cursor: isVideoTrack ? 'default' : 'pointer', opacity: isVideoTrack ? 0.3 : 1 }}>{speed}x</button>
            <button onClick={() => setIsLooping(!isLooping)} disabled={isVideoTrack} style={{ background: 'none', border: 'none', color: isLooping ? '#ffffff' : 'inherit', opacity: isVideoTrack ? 0.3 : (isLooping ? 1 : 0.6), cursor: isVideoTrack ? 'default' : 'pointer' }}>
              <Icons.Loop />
            </button>
            <button onClick={() => setShowPlaylist(true)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <Icons.Playlist />
            </button>
          </div>

          <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(25px)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px' }}>
            
            <button onClick={handlePrevTrack} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Icons.Prev />
            </button>
            
            <button onClick={() => skipTime(-30)} disabled={isVideoTrack} style={{ background: 'none', border: 'none', color: '#fff', opacity: isVideoTrack ? 0.2 : 0.6, fontSize: '12px', fontWeight: 'bold', cursor: isVideoTrack ? 'default' : 'pointer' }}>-30s</button>
            
            <button onClick={() => !isVideoTrack && setIsPlaying(!isPlaying)} disabled={isVideoTrack} style={{ background: 'rgba(255,255,255,0.7)', color: '#4C38A3', border: 'none', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isVideoTrack ? 'default' : 'pointer', opacity: isVideoTrack ? 0.5 : 1 }}>
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>
            
            <button onClick={() => skipTime(30)} disabled={isVideoTrack} style={{ background: 'none', border: 'none', color: '#fff', opacity: isVideoTrack ? 0.2 : 0.6, fontSize: '12px', fontWeight: 'bold', cursor: isVideoTrack ? 'default' : 'pointer' }}>+30s</button>
            
            <button onClick={handleNextTrack} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Icons.Next />
            </button>

          </div>
        </div>
        
        {/* ✅ MODAL INFORMAÇÃO / SOBRE */}
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
              {title}
            </h2>
            <div style={{ width: '50px', height: '1.5px', background: 'rgba(255,255,255,0.5)', marginBottom: '40px' }} />
            
            <p style={{ fontSize: '12px', lineHeight: '1.4', color: '#fff', opacity: 0.8, fontStyle: 'italic', marginBottom: '30px' }}>
              {description}
            </p>

            <div className="flex gap-4 mb-4">
              <div className="flex-1 p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>DURAÇÃO</span>
                <span style={{ fontSize: '16px', fontWeight: 400, color: '#fff' }}>47 Dias</span>
              </div>
              <div className="flex-1 p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>SESSÕES</span>
                <span style={{ fontSize: '16px', fontWeight: 400, color: '#fff' }}>{masterTracks.length} áudios</span>
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