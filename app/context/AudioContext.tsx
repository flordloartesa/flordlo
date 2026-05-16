"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// O formato das funções e variáveis que vamos partilhar com o site todo
interface AudioContextType {
  currentTrack: any | null;
  currentPlaylist: any[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  speed: number;
  isLooping: boolean;
  playTrack: (track: any, playlist?: any[]) => void;
  togglePlay: () => void;
  handleNextTrack: () => void;
  handlePrevTrack: () => void;
  skipTime: (seconds: number) => void;
  toggleSpeed: () => void;
  toggleLooping: () => void;
  seekTo: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const getValidAudioUrl = (track: any): string | null => {
  if (!track) return null;
  return track.cloudflareAudioUrl || track.url || track.audioUrl || track.audioFile?.asset?.url || null;
};

const getTrackId = (track: any): string | null => {
  if (!track) return null;
  return track._id || track.id ? String(track._id || track.id) : null; 
};

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Estados Globais
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(false);

  // Lógica global para contar o tempo de meditação (5 em 5 segundos)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const today = new Date().toISOString().split('T')[0];
        const userKey = session?.user?.email || "convidado";
        const statsKey = `meditt_stats_${userKey}`;
        
        try {
          const statsRaw = localStorage.getItem(statsKey);
          const stats = statsRaw ? JSON.parse(statsRaw) : {};
          stats[today] = (stats[today] || 0) + 5;
          localStorage.setItem(statsKey, JSON.stringify(stats));
        } catch (e) { console.error("Erro a guardar estatísticas", e); }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, session]);

  // Controlo do Áudio Real
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Carregar nova faixa
  useEffect(() => {
    const audio = audioRef.current;
    const url = getValidAudioUrl(currentTrack);
    if (!audio || !url) return;
    
    if (audio.src !== url) {
      audio.src = url;
      audio.load();
      audio.addEventListener("canplay", () => {
        audio.playbackRate = speed;
        if (isPlaying) audio.play().catch(() => setIsPlaying(false));
      }, { once: true });
    } else {
       audio.playbackRate = speed;
    }
  }, [currentTrack, speed]); // remove isPlaying para evitar re-loads

  // Funções de Controlo
  const playTrack = useCallback((track: any, playlist?: any[]) => {
    setCurrentTrack(track);
    if (playlist) setCurrentPlaylist(playlist);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
  const toggleSpeed = useCallback(() => setSpeed(s => s === 1 ? 1.2 : s === 1.2 ? 1.5 : s === 1.5 ? 2 : 1), []);
  const toggleLooping = useCallback(() => setIsLooping(prev => !prev), []);

  const handleNextTrack = useCallback(() => {
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    if (!currentPlaylist.length || !currentTrack) return;
    const currentIndex = currentPlaylist.findIndex((t: any) => getTrackId(t) === getTrackId(currentTrack));
    if (currentIndex >= 0 && currentIndex < currentPlaylist.length - 1) {
      playTrack(currentPlaylist[currentIndex + 1]);
    } else {
      setIsPlaying(false); // Fim da playlist
    }
  }, [currentPlaylist, currentTrack, isLooping, playTrack]);

  const handlePrevTrack = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (!currentPlaylist.length || !currentTrack) return;
    const currentIndex = currentPlaylist.findIndex((t: any) => getTrackId(t) === getTrackId(currentTrack));
    if (currentIndex > 0) {
      playTrack(currentPlaylist[currentIndex - 1]);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [currentPlaylist, currentTrack, playTrack]);

  const skipTime = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.max(0, Math.min(newTime, audioRef.current.duration));
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  // Media Session API (Ecrã de Bloqueio) - Agora Global!
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Sessão de Meditação',
        artist: currentTrack.instructor || 'Vítor Bertocchini',
        album: 'Meditt - Prática Guiada',
        artwork: [
          { src: 'https://via.placeholder.com/512/4c4ed4/ffffff?text=Mindfulness', sizes: '512x512', type: 'image/png' } // Podes ajustar a capa padrão aqui
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', handlePrevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', handleNextTrack);
      navigator.mediaSession.setActionHandler('seekbackward', () => skipTime(-30));
      navigator.mediaSession.setActionHandler('seekforward', () => skipTime(30));
    }
  }, [currentTrack, handleNextTrack, handlePrevTrack, skipTime]);

  return (
    <AudioContext.Provider value={{
      currentTrack, currentPlaylist, isPlaying, currentTime, duration, progress, speed, isLooping,
      playTrack, togglePlay, handleNextTrack, handlePrevTrack, skipTime, toggleSpeed, toggleLooping, seekTo
    }}>
      {/* O elemento de áudio real vive AQUI, invisível e imortal! */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const curr = e.currentTarget.currentTime || 0;
          const dur = e.currentTarget.duration || 1;
          setCurrentTime(curr);
          setDuration(dur === 1 && curr === 0 ? 0 : dur);
          setProgress((curr / dur) * 100 || 0);
        }}
        onEnded={handleNextTrack}
      />
      {children}
    </AudioContext.Provider>
  );
};

export const useGlobalAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) throw new Error("useGlobalAudio must be used within an AudioProvider");
  return context;
};