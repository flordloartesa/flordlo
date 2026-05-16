'use client';

import { useState, useEffect } from 'react';

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollHeight > 0) {
        setProgress((scrollTop / scrollHeight) * 100);
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Calcula logo ao abrir a página

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
  <div 
    className="absolute bottom-0 left-0 h-[4px] z-[9999] transition-all duration-75 ease-out" 
    style={{ 
      width: `${progress}%`,
      background: 'linear-gradient(90deg, #C67F8F 0%, #C37F8B 100%)' 
    }} 
  />
);
}