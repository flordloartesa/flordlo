"use client";

import { useState, useRef } from "react";

interface Track {
  _id: string;
  title: string;
  duration: string;
  isFree: boolean;
  url: string;
  courseLevel?: string;
}

interface Props {
  tracks: Track[];
  isPreview: boolean;
  hasFullAccess?: boolean; // ✅ Adicionado para o Cloudflare não dar erro
}

export default function CoursePreviewUI({ tracks, isPreview, hasFullAccess }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = (id: string, url: string) => {
    if (!audioRef.current) return;

    if (playingId === id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play().catch(err => console.error("Erro ao tocar áudio:", err));
      setPlayingId(id);
    }
  };

  // Garante que não crasha se tracks for undefined
  const safeTracks = tracks || [];

  return (
    <div className="space-y-4">
      {/* Elemento de áudio oculto que gere a reprodução */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingId(null)} 
        onPause={() => setPlayingId(null)}
      />

      {safeTracks.map((track) => {
        // ✅ Lógica: A aula está disponível se for gratuita OU se o user pagou (hasFullAccess)
        const isUnlocked = track.isFree || hasFullAccess;

        return (
          <div 
            key={track._id} 
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
              isUnlocked 
                ? 'border-blue-200/50 bg-blue-400/10 shadow-sm' 
                : 'border-white/30 bg-white/20 opacity-80'
            } hover:bg-white/40 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => isUnlocked && toggleAudio(track._id, track.url)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  !isUnlocked 
                    ? 'bg-gray-200/50 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#3D81F1] text-white shadow-lg shadow-blue-200 hover:scale-110 active:scale-95'
                }`}
              >
                {!isUnlocked ? (
                  <span className="text-xs">🔒</span>
                ) : playingId === track._id ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <div className="text-left">
                <p className={`font-bold text-sm leading-tight ${!isUnlocked ? 'text-[#37374B]/50' : 'text-[#37374B]'}`}>
                  {track.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-40">
                    {track.duration || "10 min"}
                  </span>
                  {track.isFree && !hasFullAccess && (
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                      • Amostra Grátis
                    </span>
                  )}
                  {hasFullAccess && (
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter">
                      • Acesso Total
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {!isUnlocked && (
              <div className="opacity-30 text-[#37374B]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            )}
          </div>
        );
      })}

      {safeTracks.length === 0 && (
        <p className="text-gray-400 text-sm italic text-center py-4">
          Nenhuma prática disponível.
        </p>
      )}
    </div>
  );
}