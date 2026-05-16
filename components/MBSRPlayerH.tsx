"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
 

// --- ÍCONES HEADSPACE STYLE (Suaves e Arredondados) ---
const Icons = {
  Play: () => <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M7 5.5v13a1 1 0 0 0 1.55.83l9-6.5a1 1 0 0 0 0-1.66l-9-6.5A1 1 0 0 0 7 5.5z"/></svg>,
  Pause: () => <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M9 19H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1zm8 0h-2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1z"/></svg>,
  Playlist: () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Next: () => <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6.7 18.3a1 1 0 0 1-1.2-1.6l7.5-4.7-7.5-4.7a1 1 0 0 1 1.2-1.6l9 5.5a1 1 0 0 1 0 1.6l-9 5.5zM18 6a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V7a1 1 0 0 1 1-1z"/></svg>,
  Prev: () => <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.3 18.3l-9-5.5a1 1 0 0 1 0-1.6l9-5.5a1 1 0 1 1 1 1.6L10.8 12l7.5 4.7a1 1 0 0 1-1 1.6zM6 6a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V7a1 1 0 0 1 1-1z"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
};

const formatSeconds = (secs: number) => {
  if (!secs || isNaN(secs)) return "00:00";
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
};

export default function HeadspacePlayer({ course }: { course: any }) {
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // States idênticos à sua lógica original
  const allTracks = useMemo(() => course?.content || [], [course]);
  const [activeWeek, setActiveWeek] = useState("semana-1");
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const currentWeekTracks = useMemo(() => 
    allTracks.filter((t: any) => t.courseLevel === activeWeek)
  , [allTracks, activeWeek]);

  // Handler de Play
  const playTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setShowPlaylist(false);
    if (!completedTracks.includes(track._id)) {
      setCompletedTracks([...completedTracks, track._id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#3C3B37] font-sans selection:bg-[#FF6D2F]/20">
      
      
      <main className="max-w-5xl mx-auto pt-32 px-6 pb-12 grid lg:grid-cols-12 gap-12 items-start">
        
        {/* LADO ESQUERDO: PLAYER (Foco Principal) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Card Central Estilo Headspace */}
          <div className="w-full aspect-square max-w-[420px] bg-[#FFD2BB] rounded-[60px] flex items-center justify-center relative overflow-hidden shadow-sm group">
             {/* Ilustração Abstrata (Placeholder do Estilo) */}
             <div className="absolute w-64 h-64 bg-[#FF6D2F] rounded-full opacity-20 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
             <div className="z-10 text-[#FF6D2F] animate-pulse">
                <svg width="120" height="120" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="60" fill="currentColor" />
                    <circle cx="70" cy="80" r="10" fill="#F7F4ED" />
                    <circle cx="130" cy="80" r="10" fill="#F7F4ED" />
                    <path d="M70 130 Q100 160 130 130" stroke="#F7F4ED" strokeWidth="8" fill="none" strokeLinecap="round" />
                </svg>
             </div>
          </div>

          {/* Títulos */}
          <div className="mt-10 text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#FF6D2F] bg-[#FF6D2F]/10 px-4 py-1.5 rounded-full">
               Sessão {currentTrack?.sessionNumber || "1"} • {activeWeek.replace('-',' ').toUpperCase()}
            </span>
            <h1 className="text-3xl font-bold mt-6 tracking-tight text-[#3C3B37]">
              {currentTrack?.title || "Selecione uma prática"}
            </h1>
            <p className="text-lg opacity-60 mt-2 font-medium">Meditação Guiada • Meditt</p>
          </div>

          {/* Controlos de Áudio */}
          <div className="w-full max-w-[480px] mt-12 px-4">
            {/* Progress Bar Amigável */}
            <div className="relative group cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if(audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
            }}>
                <div className="h-3 w-full bg-[#EBE7DE] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF6D2F] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between mt-4 text-[13px] font-bold opacity-40 font-mono">
                    <span>{formatSeconds(currentTime)}</span>
                    <span>{formatSeconds(duration)}</span>
                </div>
            </div>

            {/* Botões Principais */}
            <div className="flex items-center justify-center gap-10 mt-6 text-[#3C3B37]">
                <button className="hover:text-[#FF6D2F] transition-colors"><Icons.Prev /></button>
                
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-24 h-24 bg-[#FF6D2F] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#FF6D2F]/30 hover:scale-105 active:scale-95 transition-all"
                >
                    {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                </button>

                <button className="hover:text-[#FF6D2F] transition-colors"><Icons.Next /></button>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: PLAYLIST (Lista de Aulas) */}
        <div className="lg:col-span-5 bg-white rounded-[40px] p-8 shadow-sm border border-[#EBE7DE]">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight">O teu programa</h3>
              <div className="text-[11px] font-black text-[#FF6D2F] bg-[#FF6D2F]/10 px-3 py-1 rounded-lg">
                {completedTracks.length}/{allTracks.length} CONCLUÍDO
              </div>
           </div>

           {/* Seletor de Semanas Estilo Headspace */}
           <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {Array.from({length: 8}, (_, i) => `semana-${i+1}`).map(w => (
                  <button 
                    key={w} 
                    onClick={() => setActiveWeek(w)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold transition-all
                        ${activeWeek === w ? 'bg-[#3C3B37] text-white' : 'bg-[#F7F4ED] text-[#3C3B37] hover:bg-[#EBE7DE]'}`}
                  >
                    W{w.split('-')[1]}
                  </button>
              ))}
           </div>

           {/* Lista de Tracks */}
           <div className="mt-6 space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {currentWeekTracks.map((track: any) => {
                    const isActive = currentTrack?._id === track._id;
                    const isDone = completedTracks.includes(track._id);
                    return (
                        <button 
                            key={track._id}
                            onClick={() => playTrack(track)}
                            className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all border-2 text-left
                                ${isActive ? 'border-[#FF6D2F] bg-[#FF6D2F]/5' : 'border-transparent hover:bg-[#F7F4ED]'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                ${isDone ? 'bg-green-100 text-green-600' : 'bg-[#EBE7DE] text-[#3C3B37]'}`}>
                                {isDone ? <Icons.Check /> : <span className="text-xs font-bold">{track.sessionNumber}</span>}
                            </div>
                            <div className="flex-1">
                                <div className={`text-[14px] font-bold ${isActive ? 'text-[#FF6D2F]' : 'text-[#3C3B37]'}`}>
                                    {track.title}
                                </div>
                                <div className="text-[11px] opacity-40 font-bold uppercase tracking-wider mt-0.5">
                                    {isActive ? "A reproduzir..." : "10-15 MIN"}
                                </div>
                            </div>
                        </button>
                    );
                })}
           </div>
        </div>
      </main>

      {/* Áudio Hidden Element */}
      <audio ref={audioRef} 
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          setDuration(e.currentTarget.duration);
          setProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Footer Estilo App */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden">
          <button 
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="bg-[#3C3B37] text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3"
          >
            <Icons.Playlist />
            Playlist
          </button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EBE7DE; border-radius: 10px; }
      `}</style>
    </div>
  );
}