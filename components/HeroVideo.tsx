"use client";

import Image from "next/image";
import { useState } from "react";

interface HeroVideoProps {
  imageUrl: string;
  videoUrl?: string;
  title: string;
}

export default function HeroVideo({ imageUrl, videoUrl, title }: HeroVideoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    return url;
  };

  return (
    <>
      <div className="w-full max-w-[1100px] mx-auto px-6 mb-16" onClick={() => videoUrl && setIsOpen(true)}>
        <div className={`relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[30px] overflow-hidden shadow-2xl group ${videoUrl ? 'cursor-pointer' : ''}`}>
          <Image 
            src={imageUrl} 
            alt={title}
            fill
            unoptimized // <-- PROPRIEDADE ADICIONADA AQUI
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          
          {videoUrl && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#2F2CF1]/40 to-transparent"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-white font-bold tracking-widest text-sm mb-4 drop-shadow-md">Ver Vídeo</span>
                 
                 <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 24 24" className="w-[30px] h-[30px] ml-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 3L19 12L5 21V3Z" fill="#2F2CF1" stroke="#2F2CF1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL DO YOUTUBE */}
      {isOpen && videoUrl && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-[fadeIn_0.3s_ease-out]">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white text-4xl font-light hover:text-[#3D81F1] transition-colors"
          >
            &times;
          </button>
          <div className="w-full max-w-[1000px] aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
            <iframe 
              src={`${getEmbedUrl(videoUrl)}?autoplay=1`} 
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}