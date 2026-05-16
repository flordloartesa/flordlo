"use client";

import { useState, useRef } from "react";
import { CustomImage } from "@/components/CustomImage"; 
import { Lock, Play } from "lucide-react";
import Link from "@/components/MyLink"; 

export default function TrackCard({ track }: { track: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [imgError, setImgError] = useState(false); // 1. Estado para detetar erro na imagem

  const isOpen = track.isFree === true;

  const handleAudioClick = (e: React.MouseEvent) => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 2. URL de fallback caso a imagem original falhe
  const fallbackImage = "https://images.unsplash.com/photo-1495785870240-c8456d5aeda2?q=80&w=2073";

  const CardContent = (
    <div className="relative group cursor-pointer">
      <style jsx global>{`
        @keyframes sound-wave-track {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
      `}</style>

      {/* Contentor da Imagem */}
      <div className="relative aspect-[4/4.2] rounded-[1rem] overflow-hidden mb-5 shadow-sm transition-all duration-300 group-hover:shadow-xl">
        <CustomImage 
          // 3. Se houver erro ou URL vazia, usa a fallback imediatamente
          src={imgError || !track.imageUrl ? fallbackImage : track.imageUrl} 
          alt={track.title} 
          fill 
          hasBlueGradient 
          className={`transition-transform duration-1000 ${isPlaying ? 'scale-110' : 'group-hover:scale-110'}`}
          // 4. Se a CustomImage for baseada em next/image ou img, adiciona o onError
          onError={() => setImgError(true)} 
        />

        {isOpen ? (
          <>
            <div className="absolute top-4 right-4 bg-white/95 px-3 py-2 flex items-center justify-center rounded-xl shadow-sm z-10 ">
              <span className="text-[7px] font-black text-emerald-1000 uppercase tracking-widest leading-none text-center">
                Prática Aberta
              </span>
            </div>

            {isPlaying && (
              <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                <div className="flex items-end gap-2 h-10">
                  <div className="w-1.5 bg-white rounded-full animate-[sound-wave-track_0.6s_ease-in-out_infinite]"></div>
                  <div className="w-1.5 bg-white rounded-full animate-[sound-wave-track_0.8s_ease-in-out_infinite_0.2s]"></div>
                  <div className="w-1.5 bg-white rounded-full animate-[sound-wave-track_0.5s_ease-in-out_infinite_0.4s]"></div>
                  <div className="w-1.5 bg-white rounded-full animate-[sound-wave-track_0.7s_ease-in-out_infinite_0.1s]"></div>
                </div>
              </div>
            )}
            
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="bg-white/90 p-5 rounded-full shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 text-[#155DFC] fill-[#155DFC]" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg z-20">
            <Lock className="w-4 h-4 text-slate-800" strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="px-2">
        <p className="text-[8px] text-slate-500 font-bold mb-1.5 tracking-wider">
          {track.instructor || "Vítor Bertocchini"}
        </p>
        <h3 className="text-lg font-bold text-[#1E293B] leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {track.title}
        </h3>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
          {track.duration || "10 MINS"}
        </p>
      </div>

      {isOpen && track.audioUrl && (
        <audio 
          ref={audioRef} 
          src={track.audioUrl} 
          onEnded={() => setIsPlaying(false)} 
          preload="metadata" // Garante que o browser não tenta carregar o áudio todo de uma vez
        />
      )}
    </div>
  );

  return (
    <div className="relative flex-none w-[200px] md:w-[230px] lg:w-[250px]">
      {!isOpen ? (
        <Link href={`/cursos/${track.courseSlug}`}>
          {CardContent}
        </Link>
      ) : (
        <div onClick={handleAudioClick}>
          {CardContent}
        </div>
      )}
    </div>
  );
}