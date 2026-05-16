"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; 
import { getUserTopTracks, getFavoriteTracksDetails } from "@/app/actions/updateCustomer"; 

const Icons = {
  HeartFilled: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  Time: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Play: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
};

export default function MinhasFaixas() {
  const { data: session, status } = useSession();
  const router = useRouter(); 
  
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [favoriteTracks, setFavoriteTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        const topRes = await getUserTopTracks(session.user.email);
        
        if (topRes.success && topRes.tracks) {
          // ✅ A MAGIA ACONTECE AQUI: Agregar os tempos dispersos do Timer
          let timerTotalMinutes = 0;
          const standardTracks: any[] = [];

          topRes.tracks.forEach((track: any) => {
            // Se for do timer (ou não tiver título), somamos ao bolo total do timer
            if (track.id?.startsWith("timer-") || track.courseId === "meditation-timer" || !track.title) {
              timerTotalMinutes += (track.totalTimeMinutes || 0);
            } else {
              standardTracks.push(track);
            }
          });

          // Se o utilizador já usou o timer, criamos a "Super Faixa" do Timer
          if (timerTotalMinutes > 0) {
            standardTracks.push({
              id: "timer-aggregated-super-track",
              title: "Prática Livre",
              isTimer: true, // Etiqueta secreta para o design
              totalTimeMinutes: timerTotalMinutes,
              playerLink: "/timer" // ← MUDA AQUI se o teu URL do timer for outro (ex: "/meditation-timer")
            });
          }

          // Reordenamos tudo do maior para o menor e cortamos para mostrar só o Top 5
          const finalTopTracks = standardTracks
            .sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes)
            .slice(0, 5);

          setTopTracks(finalTopTracks);
        }

        const favRes = await getFavoriteTracksDetails();
        if (favRes.success && favRes.tracks) {
          setFavoriteTracks(favRes.tracks);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfileData();
  }, [session, status]);

  const handlePlayTrack = (trackId: string, playerLink?: string) => {
    if (!session?.user?.email) return;
    
    const key = `meditt_mbsr_instant_v10_${session.user.email}`;
    const savedRaw = localStorage.getItem(key);
    let saved = savedRaw ? JSON.parse(savedRaw) : {};
    saved.lastPlayed = trackId; 
    localStorage.setItem(key, JSON.stringify(saved));

    if (playerLink && playerLink !== "#") {
      router.push(playerLink);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-[#60B1E6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 p-4 font-sans text-white">
      
      {/* COLUNA ESQUERDA: FAIXAS MAIS OUVIDAS */}
      <div className="flex-1 bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-[#636AE0] to-[#60B1E6] rounded-xl text-white">
            <Icons.Time />
          </div>
          <h2 className="text-xl font-light tracking-wide">Mais Ouvidas</h2>
        </div>

        {topTracks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {topTracks.map((track, index) => (
              <div 
                key={track.id} 
                onClick={() => handlePlayTrack(track.id, track.playerLink)}
                className="flex items-center bg-white/5 hover:bg-white/20 transition-colors p-3 rounded-2xl gap-4 cursor-pointer group" 
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-[#add8e6] group-hover:bg-[#60B1E6] group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-sm truncate">{track.title}</h3>
                  {/* ✅ DESIGN ESPECÍFICO SE FOR O TIMER */}
                  <p className="text-xs opacity-60">
                    {track.isTimer 
                      ? "Timer de Meditação" 
                      : `Sessão ${track.sessionNumber || '-'} ${track.level ? `• ${track.level.replace('-', ' ').toUpperCase()}` : ''}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#60B1E6] group-hover:text-white">{track.totalTimeMinutes} min</span>
                  <p className="text-[9px] opacity-50 uppercase tracking-widest">Total</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 opacity-50">
            <p className="text-sm font-light">Ainda não tens estatísticas de meditação.</p>
            <p className="text-xs mt-1">Começa a praticar para veres aqui o teu top 5!</p>
          </div>
        )}
      </div>

      {/* COLUNA DIREITA: FAVORITOS */}
      <div className="flex-1 bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl text-white">
            <Icons.HeartFilled />
          </div>
          <h2 className="text-xl font-light tracking-wide">Os Meus Favoritos</h2>
        </div>

        {favoriteTracks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {favoriteTracks.map((track) => (
              <div 
                key={track.id} 
                onClick={() => handlePlayTrack(track.id, track.playerLink)}
                className="flex items-center bg-white/5 hover:bg-white/20 transition-colors p-3 rounded-2xl gap-4 cursor-pointer group" 
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                  {track.image ? (
                    <img src={track.image} alt={track.title} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#636AE0] to-[#37374B]"></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                     <div className="text-white/80 group-hover:text-[#60B1E6] transition-colors">
                        <Icons.Play />
                     </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-sm truncate">{track.title}</h3>
                  <p className="text-xs opacity-60">
                    Sessão {track.sessionNumber} 
                    {track.courseLevel && ` • ${track.courseLevel.replace('-', ' ').toUpperCase()}`}
                    {track.duration && ` • ${track.duration} min`}
                  </p>
                </div>
                <div>
                   <Icons.HeartFilled />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 opacity-50">
            <p className="text-sm font-light">Ainda não guardaste nenhuma faixa.</p>
            <p className="text-xs mt-1">Clica no coração durante a prática para adicionares aqui.</p>
          </div>
        )}
      </div>

    </div>
  );
}