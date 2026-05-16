"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
 // ✅ Navbar Importada
import styles from "./MBSRPlayer.module.css";

// --- ÍCONES SVG ---
const Icons = {
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Volume: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  PlayCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
};

interface Track {
  _id: string;
  title: string;
  sessionNumber: number;
  duration: string;
  url?: string;
  audioUrl?: string;
  cloudflareAudioUrl?: string;
  audioFile?: { asset: { url: string } };
  youtubeUrl?: string;
  courseLevel: string;
  isLocked: boolean;
  instructor?: string;
}

// --- HELPERS ---
const getValidAudioUrl = (track: Track | null): string | null => {
  if (!track) return null;
  if (track.url) return track.url; 
  if (track.audioUrl) return track.audioUrl;
  if (track.cloudflareAudioUrl) return track.cloudflareAudioUrl;
  if (track.audioFile?.asset?.url) return track.audioFile.asset.url;
  return null;
};

const formatSeconds = (secs: number) => {
  if (!secs || isNaN(secs) || !isFinite(secs)) return "00:00";
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  return `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}`;
};

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0&modestbranding=1` 
    : null;
};

export default function MBSRPlayer({ course }: { course: any }) {
  const { data: session, status } = useSession();
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasLoadedFromStore = useRef(false);

  // ✅ ESTABILIZAÇÃO DE DADOS
  const allTracks = useMemo(() => course?.content || [], [course]);
  const userAccessLevels = useMemo(() => Array.from(new Set(allTracks.map((t: any) => t.courseLevel))), [allTracks]);

  // --- ESTADOS ---
  const [activeWeek, setActiveWeek] = useState("semana-1");
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);

  const currentWeekTracks = useMemo(() => 
    allTracks.filter((t: any) => t.courseLevel === activeWeek).sort((a: any, b: any) => a.sessionNumber - b.sessionNumber)
  , [allTracks, activeWeek]);

  // ✅ CARREGAR STORAGE
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email || hasLoadedFromStore.current) return;
    const key = `meditt_mbsr_instant_v10_${session.user.email}`;
    try {
      const savedRaw = localStorage.getItem(key);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved.completed) setCompletedTracks(saved.completed);
        if (saved.lastPlayed) {
            setLastPlayedId(saved.lastPlayed);
            const t = allTracks.find((track: any) => track._id === saved.lastPlayed);
            if (t) {
              setCurrentTrack(t);
              setActiveWeek(t.courseLevel);
            }
        }
      }
      hasLoadedFromStore.current = true;
    } catch (e) { console.error(e); }
  }, [status, session, allTracks]);

  useEffect(() => {
    if (currentWeekTracks.length > 0 && !currentTrack) {
      setCurrentTrack(currentWeekTracks[0]);
    }
  }, [currentWeekTracks, currentTrack]);

  // ✅ LÓGICA DE ÁUDIO
  const isVideoMode = !!getYoutubeEmbedUrl(currentTrack?.youtubeUrl || "");
  const validAudioUrl = useMemo(() => getValidAudioUrl(currentTrack), [currentTrack]);

  useEffect(() => {
    if (currentTrack && audioRef.current && !isVideoMode && validAudioUrl) {
      if (audioRef.current.src !== validAudioUrl) {
         audioRef.current.src = validAudioUrl;
         audioRef.current.playbackRate = speed;
         audioRef.current.load();
         if (isPlaying) {
             audioRef.current.play().catch(() => setIsPlaying(false));
         } else {
             setProgress(0); setCurrentTime(0);
         }
      }
    }
  }, [currentTrack, isVideoMode, validAudioUrl, speed, isPlaying]);

  const saveNow = (trackId: string, list: string[]) => {
      if (!session?.user?.email) return;
      const key = `meditt_mbsr_instant_v10_${session.user.email}`;
      localStorage.setItem(key, JSON.stringify({ lastPlayed: trackId, completed: list }));
  };

  const playTrack = (track: any) => {
    if (track.isLocked) return;
    setCurrentTrack(track);
    setLastPlayedId(track._id);
    setShowPlaylist(false);
    setIsPlaying(true);
    let newCompleted = completedTracks.includes(track._id) ? completedTracks : [...completedTracks, track._id];
    setCompletedTracks(newCompleted);
    saveNow(track._id, newCompleted); 

    setTimeout(() => {
        const url = getValidAudioUrl(track);
        if (audioRef.current && !track.youtubeUrl && url) {
            audioRef.current.play().catch(console.error);
        }
    }, 100);
  };

  const togglePlay = () => {
    if (!audioRef.current || isVideoMode) return;
    audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
  };

  const totalTracks = allTracks.length;
  const coursePercentage = (totalTracks > 0) ? Math.round((completedTracks.length / totalTracks) * 100) : 0;
  const weeks = Array.from({length: 8}, (_, i) => `semana-${i+1}`);

  if (!course) return null;

  return (
    <div className={styles.pageContainer} style={{ isolation: 'isolate' }}>
      <div className={styles.bgOverlay}></div>

      {/* ✅ 1. NAVBAR FIXA NO TOPO COM Z-INDEX ELEVADO */}
      <div className="fixed top-0 left-0 w-full z-[120]">
        
      </div>
      
      <audio 
        ref={audioRef}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          setDuration(e.currentTarget.duration);
          setProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
        }}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* ✅ 2. WRAPPER COM PADDING-TOP PARA NÃO FICAR POR BAIXO DA NAV */}
      <div className={`${styles.playerWrapper} pt-20 md:pt-24`}>
        <div className={styles.playerGlass}></div>
        
        <div className={styles.toolbar}>
            <button className={styles.iconBtn} onClick={() => setShowPlaylist(!showPlaylist)}>
                {/* ✅ Hambúrguer na listagem (true), Close na taça (false) */}
                {showPlaylist ? <Icons.Menu /> : <Icons.Close />}
            </button>
        </div>

        {/* LISTA DE REPRODUÇÃO */}
        <div className={`${styles.playlistView} ${showPlaylist ? styles.visible : styles.hidden}`}>
            <div className={styles.listTitle}>{course.title}</div>
            
            <div style={{padding: '0 20px', marginBottom: '15px'}}>
               <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'rgba(255,255,255,0.7)', marginBottom:'5px'}}>
                  <span>{coursePercentage}% ({completedTracks.length} de {totalTracks} Aulas)</span>
                  <button onClick={() => playTrack(allTracks[0])} style={{background:'none', border:'none', color:'#4ade80', cursor:'pointer', fontSize:'8px', fontWeight:'bold', textDecoration:'underline'}}>
                      {lastPlayedId ? "CONTINUAR ▶" : "INICIAR ▶"}
                  </button>
               </div>
               <div style={{width:'100%', height:'6px', background:'rgba(255,255,255,0.2)', borderRadius:'3px', overflow:'hidden'}}>
                  <div style={{ width: `${coursePercentage}%`, height:'100%', background:'#4ade80', borderRadius:'3px', transition:'width 0.5s ease' }}></div>
               </div>
            </div>

            <div className={styles.weekSelector}>
               {weeks.map(w => (
                   <button key={w} onClick={()=>setActiveWeek(w)} 
                           className={`${styles.weekBtn} ${activeWeek === w ? styles.activeTab : ''}`}
                           style={{ fontSize: '0.5rem' }}> {/* ✅ ALTERAÇÃO ÚNICA: Font 30% menor */}
                       {w.replace('-',' ').toUpperCase()}
                   </button>
               ))}
            </div>

            <div className={styles.listScroll}>
               {currentWeekTracks.map((track: any) => {
                   const isActive = currentTrack?._id === track._id;
                   const isLocked = track.isLocked;
                   const isCompleted = completedTracks.includes(track._id);

                   return (
                       <div key={track._id} className={`${styles.listItem} ${isActive ? styles.active : ''}`} onClick={() => playTrack(track)} style={{opacity: isLocked ? 0.6 : 1}}>
                           <div className={styles.itemNumber}>
                               {isCompleted ? <span style={{color:'#4ade80', fontWeight:'bold'}}>✓</span> : track.sessionNumber}
                           </div>
                           <div className={styles.itemInfo}>
                               <div className={styles.itemTitle}>{track.title}</div>
                               <div className={styles.itemSub}>{track.instructor || 'Meditt'}</div>
                           </div>
                           <div className={styles.itemRight}>
                               {isLocked ? <Icons.Lock /> : isActive && isPlaying ? <Icons.Volume /> : <Icons.PlayCircle />}
                           </div>
                       </div>
                   );
               })}
            </div>
        </div>

        {/* CONTROLES DO PLAYER */}
        <div className={`${styles.playerView} ${showPlaylist ? styles.hidden : styles.visible}`}>
            <div className={styles.trackInfo}>
               <div className={styles.trackTitle}>{currentTrack?.title || "Selecione uma aula"}</div>
               <div className={styles.trackMeta}>Sessão {currentTrack?.sessionNumber}</div>
            </div>

            {isVideoMode ? (
                <div className={styles.videoContainer}><iframe src={getYoutubeEmbedUrl(currentTrack?.youtubeUrl||"")||""} allowFullScreen></iframe></div>
            ) : (
                <div className={styles.coverWrapper}>
                    <div className={`${styles.coverImage} ${isPlaying ? styles.rotating : styles.pausedAnim}`}>
                        <img src="https://app.meditt.space/images/taca-tibetana-mi.jpg" alt="Capa" />
                    </div>
                </div>
            )}

            {!isVideoMode && (
                <div className={styles.glassControls}>
                   <div className={styles.progressBar} onClick={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const pct = (e.clientX - rect.left) / rect.width;
                     if(audioRef.current) audioRef.current.currentTime = pct * (audioRef.current.duration || 0);
                   }} style={{position:'relative', cursor:'pointer'}}>
                       <div className={styles.progressFill} style={{width: `${progress}%`}}></div>
                       <div className={styles.progressHandle} style={{left: `${progress}%`, position:'absolute', transform:'translate(-50%, -50%)', top:'50%'}}></div>
                   </div>

                   <div className={styles.timeRow}>
                       <span>{formatSeconds(currentTime)}</span><span>{formatSeconds(duration)}</span>
                   </div>

                   <div className={styles.controlsRow} style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'15px'}}>
                       <button className={styles.ctrlBtn} onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 30 }}>-30s</button>
                       <button className={styles.playBtnLarge} onClick={togglePlay}>
                            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                       </button>
                       <button className={styles.ctrlBtn} onClick={() => { if(audioRef.current) audioRef.current.currentTime += 30 }}>+30s</button>
                   </div>
                   <div style={{position:'absolute', right:'20px', bottom:'20px'}}>
                       <button onClick={() => setSpeed(speed === 1 ? 1.5 : 1)} style={{background:'none', border:'none', color:'white', fontWeight:'bold'}}>{speed}x</button>
                   </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}