"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubePlayer({
  videoId,
  isPlaying,
  onReady,
  onEnd,
  onProgress,
}: {
  videoId: string;
  isPlaying: boolean;
  onReady?: (duration: number) => void;
  onEnd?: () => void;
  onProgress?: (current: number, duration: number) => void;
}) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 LOAD API
  useEffect(() => {
    if (window.YT && window.YT.Player) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {};
  }, []);

  // 🔥 CREATE PLAYER
  useEffect(() => {
    if (!videoId || !window.YT || !window.YT.Player) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          event.target.mute(); // 🔥 autoplay garantido
          event.target.playVideo();

          const duration = event.target.getDuration();
          onReady?.(duration);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            onEnd?.();
          }
        },
      },
    });

    return () => {
      playerRef.current?.destroy();
    };
  }, [videoId]);

  // 🔥 PLAY / PAUSE CONTROL
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  // 🔥 PROGRESS LOOP
  useEffect(() => {
    if (!playerRef.current) return;

    intervalRef.current = setInterval(() => {
      if (typeof playerRef.current.getCurrentTime === 'function') {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();

        if (current && duration) {
          onProgress?.(current, duration);
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoId, onProgress]);

  return (
    <div className="w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}