"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
 
import styles from "./MBSRPlayer.module.css";

// ✅ 1. FUNÇÃO AUXILIAR: FORMATAÇÃO DE TEMPO
const formatSeconds = (secs: number) => {
  if (!secs || isNaN(secs) || !isFinite(secs) || secs < 0) return "00:00";
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
};

// ✅ 2. FUNÇÃO AUXILIAR: EXTRAÇÃO DE URL DE ÁUDIO
const getValidAudioUrl = (track: any): string | null => {
  if (!track) return null;
  return track.url || track.audioUrl || track.cloudflareAudioUrl || track.audioFile?.asset?.url || null;
};

// --- ÍCONES ---
const Icons = {
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Volume: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  PlayCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>,
  Next: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>,
  Prev: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>,
  Heart: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  HeartFilled: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
};

// ✅ CORREÇÃO AQUI: ADICIONADAS AS PROPS PARA O TYPESCRIPT ACEITAR O QUE VEM DA PAGE.TSX
//export default function MBSRPlayer({ course, isPreview, hasFullAccess }: { course: any, isPreview?: boolean, hasFullAccess?: boolean }) {
// Esta linha diz ao TypeScript: "Eu aceito o curso, o modo preview e o estado de acesso"

    export default function MBSRPlayer({ course, isPreview, hasFullAccess }: { course: any, isPreview?: boolean, hasFullAccess?: boolean }) {
  const { data: session, status } = useSession();
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasLoadedFromStore = useRef(false);

  const allTracks = useMemo(() => course?.content || [], [course]);
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

  const validAudioUrl = useMemo(() => getValidAudioUrl(currentTrack), [currentTrack]);
  const currentWeekTracks = useMemo(() => 
    allTracks.filter((t: any) => t.courseLevel === activeWeek).sort((a: any, b: any) => a.sessionNumber - b.sessionNumber)
  , [allTracks, activeWeek]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email || hasLoadedFromStore.current) return;
    const key = `meditt_mbsr_instant_v10_${session.user.email}`;
    try {
      const savedRaw = localStorage.getItem(key);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved.completed) setCompletedTracks(saved.completed);
        if (saved.favorites) setFavorites(saved.favorites);
        if (saved.lastPlayed) {
          const t = allTracks.find((track: any) => track._id === saved.lastPlayed);
          if (t) { setCurrentTrack(t); setActiveWeek(t.courseLevel); }
        }
      }
      hasLoadedFromStore.current = true;
    } catch (e) { console.error(e); }
  }, [status, session, allTracks]);

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
    setCurrentTrack(track);
    setLastPlayedId(track._id);
    setShowPlaylist(false);
    setIsPlaying(true);
    let newCompleted = completedTracks.includes(track._id) ? completedTracks : [...completedTracks, track._id];
    setCompletedTracks(newCompleted);
    if (session?.user?.email) {
      localStorage.setItem(`meditt_mbsr_instant_v10_${session.user.email}`, JSON.stringify({ lastPlayed: track._id, completed: newCompleted, favorites }));
    }
  };

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(trackId) ? favorites.filter(id => id !== trackId) : [...favorites, trackId];
    setFavorites(newFavorites);
    if (session?.user?.email) {
        localStorage.setItem(`meditt_mbsr_instant_v10_${session.user.email}`, JSON.stringify({ lastPlayed: lastPlayedId, completed: completedTracks, favorites: newFavorites }));
    }
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!course) return null;

  return (
    <div className={styles.pageContainer} style={{ isolation: 'isolate', overflow: 'hidden', fontFamily: "'Roboto Condensed', sans-serif" }}>
      
      {/* IMPORT FONTE ROBOTO */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&display=swap');
      `}} />

      {/* MOTOR LIQUIFY */}
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
      <div className="fixed top-0 left-0 w-full z-[120]"></div>
      
      <audio ref={audioRef} 
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          setDuration(e.currentTarget.duration);
          setProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
        }}
        onEnded={() => {
            const idx = currentWeekTracks.findIndex((t: any) => t._id === currentTrack?._id);
            if (idx < currentWeekTracks.length - 1) playTrack(currentWeekTracks[idx + 1]);
        }}
      />

      <div className={`${styles.playerWrapper} pt-24`} style={{ position: 'relative' }}>
        <div className={styles.playerGlass}></div>
        
        {/* TOOLBAR */}
        <div className={styles.toolbar} style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          width: '100%', padding: '0 30px', position: 'absolute', top: '40px', left: 0, zIndex: 160, pointerEvents: 'auto'
        }}>
            <button className={styles.iconBtn} onClick={() => setShowInfo(true)} style={{ cursor: 'pointer' }}>
                <Icons.Info />
            </button>
            <button className={styles.iconBtn} onClick={() => setShowPlaylist(!showPlaylist)} style={{ cursor: 'pointer' }}>
                {showPlaylist ? <Icons.Menu /> : <Icons.Close />}
            </button>
        </div>

        {/* VISTA LISTA */}
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
               {Array.from({length: 8}, (_, i) => `semana-${i+1}`).map(w => (
                   <button key={w} onClick={()=>setActiveWeek(w)} className={`${styles.weekBtn} ${activeWeek === w ? styles.activeTab : ''}`} style={{ fontSize: '0.7rem', fontWeight: 400 }}> 
                       {w.replace('-',' ').toUpperCase()}
                   </button>
               ))}
            </div>
            <div className={styles.listScroll}>
               {currentWeekTracks.map((track: any) => {
                   const isActive = currentTrack?._id === track._id;
                   const isFav = favorites.includes(track._id);
                   return (
                       <div key={track._id} className={`${styles.listItem} ${isActive ? styles.active : ''}`} onClick={() => playTrack(track)}>
                           <div className={styles.itemNumber} style={{ fontWeight: 300 }}>{completedTracks.includes(track._id) ? "✓" : track.sessionNumber}</div>
                           <div className={styles.itemInfo}>
                               <div className={styles.itemTitle} style={{ fontSize: '0.76rem', fontWeight: 300 }}>{track.title}</div>
                               <div className={styles.itemSub} style={{ fontWeight: 300, opacity: 0.5 }}>{track.instructor || 'Meditt'}</div>
                           </div>
                           <div className={styles.itemRight} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
                               {!track.isLocked && (
                                 <button onClick={(e) => toggleFavorite(e, track._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                     {isFav ? <Icons.HeartFilled /> : <Icons.Heart />}
                                 </button>
                               )}
                               {track.isLocked ? <Icons.Lock /> : isActive && isPlaying ? <Icons.Volume /> : <Icons.PlayCircle />}
                           </div>
                       </div>
                   );
               })}
            </div>
        </div>

        {/* PLAYER (COUNTER) */}
        <div className={`${styles.playerView} ${showPlaylist ? styles.hidden : styles.visible}`}>
            <div className={styles.trackInfo} style={{ paddingTop: '50px' }}>
               <div className={styles.trackTitle} style={{ fontSize: '1.25rem', letterSpacing: '-0.03em', fontWeight: 300 }}>{currentTrack?.title}</div>
               <div className={styles.trackMeta} style={{ opacity: 0.6, fontWeight: 300, fontSize: '0.7rem' }}>Sessão {currentTrack?.sessionNumber}</div>
            </div>

            <div style={{ position: 'relative', width: '220px', height: '220px', margin: '30px auto 10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                    <circle cx="110" cy="110" r={radius} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="12" fill="transparent" />
                    <circle cx="110" cy="110" r={radius} stroke="#ffffff" strokeWidth="12" fill="transparent" strokeDasharray={circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out', strokeLinecap: 'round' }} />
                </svg>
                <div style={{ textAlign: 'center', zIndex: 10 }}>
                    <div style={{ fontSize: '3rem', fontWeight: 300, color: 'white', letterSpacing: '-2px' }}>{formatSeconds(duration - currentTime)}</div>
                </div>
            </div>

            <div className={styles.glassControls} style={{ marginTop: '0px' }}>
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
                        const idx = currentWeekTracks.findIndex((t: any) => t._id === currentTrack?._id);
                        if (idx > 0) playTrack(currentWeekTracks[idx - 1]);
                       }}><Icons.Prev /></button>
                       <button className={styles.ctrlBtn} style={{ fontSize: '11px', fontWeight: 700 }} onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 30 }}>-30s</button>
                       <button className={styles.playBtnLarge} onClick={() => setIsPlaying(!isPlaying)} style={{ background: '#ffffff', color: '#155DFC' }}>
                          {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                       </button>
                       <button className={styles.ctrlBtn} style={{ fontSize: '11px', fontWeight: 700 }} onClick={() => { if(audioRef.current) audioRef.current.currentTime += 30 }}>+30s</button>
                       <button className={styles.ctrlBtn} onClick={() => {
                        const idx = currentWeekTracks.findIndex((t: any) => t._id === currentTrack?._id);
                        if (idx < currentWeekTracks.length - 1) playTrack(currentWeekTracks[idx + 1]);
                       }}><Icons.Next /></button>
                   </div>
                   <div style={{ position: 'absolute', right: '0' }}>
                       <button onClick={() => setSpeed(speed === 1 ? 1.5 : 1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: '10px', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}>{speed}x</button>
                   </div>
               </div>
            </div>
        </div>

        {/* ✅ MODAL INFORMATIVO */}
        {showInfo && (
          <div className="absolute inset-0 z-[200] flex flex-col animate-in fade-in duration-500" 
               style={{ borderRadius: 'inherit', background: 'linear-gradient(40deg, #0f21b5 0%, #9a8fe3 100%)', color: '#ffffff' }}>
              <div className="flex items-center justify-between p-8 border-b border-white/10">
                  <div className="flex items-center gap-2 text-white">
                      <Icons.Info />
                      <span className="text-[11px] uppercase tracking-[0.3em] font-bold">SOBRE</span>
                  </div>
                  <button onClick={() => setShowInfo(false)} className="text-white/60 hover:text-white transition-all p-2">
                      <Icons.Close />
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                  <h2 className="text-3xl font-light leading-tight mb-2" style={{ letterSpacing: '-0.04em' }}>{course.title}</h2>
                  <div style={{ height: '1px', width: '40px', background: '#ffffff', marginBottom: '40px' }}></div>
                  <p className="leading-relaxed text-white/80 mb-10 font-light italic" style={{ fontSize: '11px' }}>
                      {course.description || "Este curso foca na redução de stress através de técnicas comprovadas de mindfulness."}
                  </p>
                  <div className="flex gap-4">
                      <div className="flex-1 p-5 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/10">
                          <span className="text-[10px] uppercase text-white/50 font-bold block mb-1">Duração</span>
                          <span className="font-bold" style={{ fontSize: '11px' }}>8 Semanas</span>
                      </div>
                      <div className="flex-1 p-5 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/10">
                          <span className="text-[10px] uppercase text-white/50 font-bold block mb-1">Sessões</span>
                          <span className="font-bold" style={{ fontSize: '11px' }}>{allTracks.length} áudios</span>
                      </div>
                  </div>
              </div>
              <div className="p-8">
                  <button onClick={() => setShowInfo(false)} 
                          className="w-full py-5 bg-white text-[#0f21b5] text-[11px] uppercase tracking-widest font-bold rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                      Regressar à Prática
                  </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}