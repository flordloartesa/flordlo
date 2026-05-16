'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from '@/components/MyLink';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react"; // ✅ IMPORT ADICIONADO AQUI! A causa do erro era esta.
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PraticasPlayer({ 
  practice, 
  globalPromos = [] 
}: { 
  practice: any; 
  globalPromos?: any[] 
}) {
  const router = useRouter();
  const { data: session, status } = useSession(); // Extrai o status da sessão

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [browserDuration, setBrowserDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] = useState(false);
  const [isCirclesInstructorOpen, setIsCirclesInstructorOpen] = useState(false); 
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'basics'>('plus');

  // --- ESTADOS DO RATING (NOVO) ---
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const averageRating = practice.averageRating || 4.5; // Fallback caso não venha da base de dados

  // --- LÓGICA DE CORES COM FALLBACK INTEGRADA ---
  function getValidColor(colorValue: string | undefined, defaultColor: string) {
    if (!colorValue || colorValue.trim() === "") return defaultColor;
    if (colorValue.startsWith('#') || colorValue.startsWith('rgb')) return colorValue;
    const hexMatch = colorValue.match(/\[(#.*?)\]/);
    if (hexMatch) return hexMatch[1];
    return defaultColor;
  }

  const bg = getValidColor(practice.colorBg, '#FFD600');
  const s1 = getValidColor(practice.colorShape1, '#FFC000');
  const s2 = getValidColor(practice.colorShape2, '#FFAB00');
  const s3 = getValidColor(practice.colorShape3, '#FF9500');

  // --- LÓGICA DE VARIAÇÕES ---
  const hasVariations = practice.variations && practice.variations.length > 0;
  
  const availableInstructors = useMemo(() => {
    if (!hasVariations) return [];
    const unique = new Map();
    practice.variations.forEach((v: any) => { 
      if (!unique.has(v.instructorName)) unique.set(v.instructorName, v.instructorImage); 
    });
    return Array.from(unique.entries()).map(([name, image]) => ({ name, image }));
  }, [practice.variations, hasVariations]);

  const [selectedInstructor, setSelectedInstructor] = useState(
    hasVariations ? availableInstructors[0].name : (practice.instructor || '')
  );

  const availableDurations = useMemo(() => {
    if (!hasVariations) return [];
    return Array.from(new Set(
      practice.variations
        .filter((v: any) => v.instructorName === selectedInstructor)
        .map((v: any) => v.durationLabel)
    ));
  }, [practice.variations, selectedInstructor, hasVariations]);

  const [selectedDuration, setSelectedDuration] = useState(
    hasVariations ? availableDurations[0] : ''
  );

  useEffect(() => {
    if (hasVariations && !availableDurations.includes(selectedDuration)) {
      setSelectedDuration(availableDurations[0]);
    }
  }, [selectedInstructor, availableDurations, selectedDuration, hasVariations]);

  const activeVariation = useMemo(() => {
    if (!hasVariations) return null;
    return practice.variations.find((v: any) => 
      v.instructorName === selectedInstructor && v.durationLabel === selectedDuration
    ) || practice.variations[0];
  }, [hasVariations, practice.variations, selectedInstructor, selectedDuration]);

  const activeAudioSrc = activeVariation ? activeVariation.audioUrl : practice.finalAudioUrl;
  
  const activeImage = activeVariation?.instructorImage || availableInstructors.find(i => i.name === selectedInstructor)?.image || practice.instructorImage;

  const finalDuration = useMemo(() => {
    const label = activeVariation ? activeVariation.durationLabel : practice.duration;
    if (!label) return browserDuration || 0;
    if (typeof label === 'string' && label.includes(':')) {
      const p = label.split(':');
      return parseInt(p[0]) * 60 + (parseInt(p[1]) || 0);
    }
    const m = String(label).match(/(\d+)/);
    return m ? parseInt(m[1], 10) * 60 : browserDuration || 0;
  }, [activeVariation, practice.duration, browserDuration]);

  // Recarrega o áudio quando a fonte muda
  useEffect(() => {
    if (audioRef.current && activeAudioSrc) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  }, [activeAudioSrc]);

  // Fallbacks de Imagem para o Template Split
  const splitCoverImage = practice.coverImage || practice.fullscreenExternalImage || practice.externalImageUrl || practice.imageUrl;

  const finalQrCodeSrc = 
    practice?.sidebarAd?.ExternalUrl || 
    practice?.sidebarAd?.externalUrl || 
    practice?.sidebarAd?.qrCode?.asset?.url || 
    practice?.sidebarAd?.qrCode || 
    "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg";

  // --- CONTROLOS EXTRA (FULLSCREEN & PIP) ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.log(`Erro ao ativar Fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen();
    }
  };

  const togglePiP = () => {
    setIsPipMode(!isPipMode);
  };

  // --- CONTROLOS ÁUDIO MÁXIMA FIABILIDADE ---
  const toggleAudio = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); 
      e.preventDefault();
    }
    
    if (practice.isLocked) {
      setIsModalOpen(true);
      return;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((error) => console.error("Erro ao reproduzir áudio:", error));
        }
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (practice.isLocked) {
      setIsModalOpen(true);
      return;
    }
    if (audioRef.current && finalDuration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * finalDuration;
    }
  };

  const skipForward = (e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (practice.isLocked) { setIsModalOpen(true); return; }
    if (audioRef.current && finalDuration > 0) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, finalDuration);
    }
  };

  const skipBackward = (e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (practice.isLocked) { setIsModalOpen(true); return; }
    if (audioRef.current && finalDuration > 0) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "00:00";
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const renderAudio = () => (
    <audio 
      key={activeAudioSrc} ref={audioRef} src={activeAudioSrc} preload="metadata"
      onTimeUpdate={(e) => { 
        setCurrentTime(e.currentTarget.currentTime); 
        if (finalDuration > 0) setProgress((e.currentTarget.currentTime / finalDuration) * 100); 
      }}
      onLoadedMetadata={(e) => setBrowserDuration(e.currentTarget.duration)}
      onEnded={() => { setIsPlaying(false); setProgress(0); setCurrentTime(0); }}
    />
  );

  const relatedItems = practice.relatedPractices || practice.related || practice.sidebarCourses || [];

  const TopRightControls = (
    <div className="absolute top-6 right-6 z-[90] flex items-center gap-4 text-white drop-shadow-md">
      <button onClick={togglePiP} className={`hover:scale-110 transition-transform cursor-pointer ${isPipMode ? 'text-[#3D81F1] opacity-100' : 'opacity-70 hover:opacity-100'}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <rect x="12" y="12" width="7" height="5" rx="1" ry="1"></rect>
        </svg>
      </button>
      
      <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform opacity-70 hover:opacity-100 cursor-pointer">
        {isFullscreen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        )}
      </button>
    </div>
  );

  const hasCustomColors = Boolean(
    (practice.colorBg && practice.colorBg.trim() !== "") ||
    (practice.colorShape1 && practice.colorShape1.trim() !== "") ||
    (practice.colorShape2 && practice.colorShape2.trim() !== "") ||
    (practice.colorShape3 && practice.colorShape3.trim() !== "")
  );

  const showBgImage = !!practice.fullscreenExternalImage && !hasCustomColors;

  // ========================================================
  // 🧩 BLOCO DE METADADOS EXTRAÍDO (Para reutilizar Mobile/Desktop)
  // ========================================================
  const practiceMetadataContent = (
    <>
      {/* CATEGORIA E ESTRELAS INTERATIVAS */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[14px] font-black tracking-widest uppercase text-[#3D81F1]">{practice.category || 'MEDITATION'}</span>
        
        {/* RATING SYSTEM NOVO */}
        <div className="flex items-center gap-1.5 text-gray-500 font-bold text-sm">
          <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => {
              // Preenche a estrela se for menor/igual ao hover, ao userRating, ou ao average (arredondado)
              const isFilled = star <= (hoverRating || userRating || Math.round(averageRating));
              
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    // ✅ NOVA LÓGICA: Se a prática for Premium (isLocked) E o utilizador não tiver login, mostra modal.
                    // Se for livre (isLocked: false), qualquer pessoa pode votar.
                    if (practice.isLocked && status !== 'authenticated') {
                      setIsModalOpen(true);
                      return;
                    }
                    setUserRating(star);
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  className="focus:outline-none transition-transform hover:scale-125 p-0.5 cursor-pointer"
                >
                  <svg
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isFilled ? 'text-[#FCD34D] fill-current' : 'text-gray-200 fill-current'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              );
            })}
          </div>
          <span className="ml-1 text-[13px] text-gray-400 mt-0.5">
            {userRating > 0 ? userRating.toFixed(1) : averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      {hasVariations ? (
        <>
          {/* CAIXAS DE TEMPO (Selecionáveis, Font 12px) */}
          {availableDurations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-[13px] font-bold text-[#141313] mb-3">Duration</h4>
              <div className="flex flex-wrap gap-3">
                {availableDurations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDuration(d)}
                    className={`px-5 py-2.5 rounded-xl border-1 font-normal text-[11px] uppercase tracking-wide transition-all ${
                      selectedDuration === d 
                      ? 'border-[#3D81F1] text-[#3D81F1] bg-blue-50 shadow-sm' 
                      : 'border-gray-200 text-[#4B5563] hover:border-[#3D81F1] hover:text-[#3D81F1]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INSTRUTOR */}
          <div className="space-y-4 mb-2 lg:mb-8">
            <div className="relative">
              <button onClick={() => setIsInstructorDropdownOpen(!isInstructorDropdownOpen)} className="w-full flex items-center justify-between bg-white border-2 border-gray-100 p-3 rounded-2xl font-bold text-sm hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  {activeImage ? (
                    <img src={activeImage} className="w-7 h-7 rounded-full object-cover shadow-sm" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200" />
                  )}
                  {selectedInstructor}
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {isInstructorDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                  {availableInstructors.map(inst => (
                    <button key={inst.name} onClick={() => { setSelectedInstructor(inst.name); setIsInstructorDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left">
                      {inst.image && <img src={inst.image} className="w-5 h-5 rounded-full object-cover" alt="" />}
                      {inst.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* FALLBACK SEM VARIAÇÕES (TEMPO EM CIMA, INSTRUTOR EM BAIXO) */
        <>
          {practice.duration && (
            <div className="mb-6">
              <h4 className="text-[15px] font-bold text-[#141313] mb-3">Duration</h4>
              <div className="inline-block px-5 py-2.5 rounded-xl border-2 border-[#3D81F1] text-[#3D81F1] bg-blue-50 font-bold text-[14px] tracking-wide shadow-sm">
                {practice.duration}
              </div>
            </div>
          )}
          {practice.instructor && (
            <div className="mb-2 lg:mb-8 w-full flex items-center gap-3 bg-white border-2 border-gray-100 p-3 rounded-2xl font-bold text-sm">
              {practice.instructorImage ? (
                <img src={practice.instructorImage} className="w-7 h-7 rounded-full object-cover shadow-sm" alt="" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200" />
              )}
              {practice.instructor}
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      {practice.layoutTemplate === 'split' ? (
        /* ========================================================
            TEMPLATE EDITORIAL (SPLIT)
         ======================================================== */
        <div className="w-full">
          <div className="fixed top-0 w-full h-[80px] bg-white z-[90] border-b border-gray-100" />
          <div className="relative z-[100]">
            <Navbar />
          </div>

          <div className="min-h-screen bg-[#FDFDFD] pt-32 pb-20 px-6 font-sans">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                
                <div className="flex-1 text-[#141313] flex flex-col">
                  
                  {/* METADADOS APENAS NO MOBILE (Antes do Player) */}
                  <div className="block lg:hidden bg-white border border-gray-100 p-6 rounded-[12px] shadow-sm mb-6">
                    {practiceMetadataContent}
                  </div>

                  {/* PLAYER */}
                  <div className="relative aspect-video w-full" ref={playerContainerRef}>
                    <div className={`w-full h-full rounded-[12px] overflow-hidden bg-black shadow-2xl group transition-all duration-300 ${isPipMode ? 'fixed bottom-8 right-8 !w-80 !h-48 z-[9999]' : 'relative'}`}>
                      
                      {splitCoverImage && <img src={splitCoverImage} className="absolute inset-0 w-full h-full object-cover opacity-70" alt="" />}
                      
                      {TopRightControls}

                      <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end ${isPipMode ? 'p-4 pt-16' : 'p-6 pt-24'}`}>
                        <div className={`flex items-center justify-center mb-5 ${isPipMode ? 'gap-4' : 'gap-6'}`}>
                          <button onClick={skipBackward} className="text-white hover:scale-110 transition-transform cursor-pointer relative z-50">
                            <svg width={isPipMode ? "22" : "28"} height={isPipMode ? "22" : "28"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                              <polyline points="1 4 1 10 7 10"></polyline>
                              <text x="12" y="16" fill="currentColor" stroke="none" fontSize="7" fontWeight="bold" textAnchor="middle">15</text>
                            </svg>
                          </button>
                          
                          <button onClick={toggleAudio} className={`${isPipMode ? 'w-10 h-10' : 'w-12 h-12'} bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all cursor-pointer relative z-50`}>
                            <svg width={isPipMode ? "18" : "22"} height={isPipMode ? "18" : "22"} className="text-[#3D81F1] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              {isPlaying ? <path d="M8 19h2V5H8v14zm6-14v14h2V5h-2z" /> : <path d="M8 5v14l11-7z" />}
                            </svg>
                          </button>
                          
                          <button onClick={skipForward} className="text-white hover:scale-110 transition-transform cursor-pointer relative z-50">
                            <svg width={isPipMode ? "22" : "28"} height={isPipMode ? "22" : "28"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"></path>
                              <polyline points="23 4 23 10 17 10"></polyline>
                              <text x="12" y="16" fill="currentColor" stroke="none" fontSize="7" fontWeight="bold" textAnchor="middle">15</text>
                            </svg>
                          </button>
                        </div>

                        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer mb-2 relative z-50" onClick={handleSeek}>
                          <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/80 px-1 relative z-50 pointer-events-none">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(finalDuration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* TITULO E DESCRIÇÃO */}
                  <h1 className="text-4xl font-bold mt-10 mb-4">{practice.title}</h1>
                  <p className="text-gray-500 text-sm leading-relaxed">{practice.description}</p>
                </div>

                <aside className="w-full lg:w-[360px] shrink-0">
                  <div className="sticky top-32 space-y-6">
                    <div className="bg-white border border-gray-100 p-8 rounded-[12px] shadow-2xl shadow-gray-200/50">
                      
                      {/* METADADOS APENAS NO DESKTOP (Mantém na Sidebar) */}
                      <div className="hidden lg:block">
                        {practiceMetadataContent}
                      </div>

                      {/* CAIXAS DOS PLANOS */}
                      <div className="space-y-4 mb-6 mt-4 lg:mt-0">
                        <div 
                          onClick={() => setSelectedPlan('plus')}
                          className={`cursor-pointer p-3 rounded-2xl border-2 transition-all ${selectedPlan === 'plus' ? 'border-[#3D81F1] shadow-sm bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                             <div className="flex items-center gap-1.5">
                               <span className="font-bold text-[#141313] text-[14px]"> Mindfulness <span className="text-[#CBA573] font-medium"> Trial+ </span></span>
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-gray-400 line-through text-[11px] font-semibold"> $99.00 </span>
                               <span className="font-bold text-[#209F5A] text-xl"> $0 </span>
                             </div>
                          </div>
                          <p className="text-[13px] text-gray-400 font-medium"> 7 dias trial gratuito </p>
                        </div>

                        <div 
                          onClick={() => setSelectedPlan('basics')}
                          className={`cursor-pointer p-3 rounded-2xl border-2 transition-all ${selectedPlan === 'basics' ? 'border-[#3D81F1] shadow-sm bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-[#141313] text-[14px]">Membro Ilimitado</span>
                             <span className="font-bold text-[#141313] text-xl">$99.00</span>
                          </div>
                          <p className="text-[13px] text-gray-400 font-medium">Subscrição Anual após 7 dias</p>
                        </div>
                      </div>

                      {/* ✅ BOTÃO DE PAGAMENTO / CARRINHO */}
                      <button 
                        onClick={() => {
                          if (selectedPlan === 'plus') {
                            router.push('/checkout/trial'); 
                          } else {
                            router.push('/checkout'); 
                          }
                        }} 
                        className="w-full bg-[#4863F7] text-white font-bold py-4 rounded-full hover:bg-blue-600 transition-all mb-6 shadow-md text-[17px]"
                      >
                        {selectedPlan === 'plus' ? "Iniciar Trial" : "Adicionar ao Carrinho"}
                      </button>
                      
                      <div className="w-full h-px bg-gray-100 mb-6 "></div>
                      <div className="bg-gray-50 border border-gray-100 p-2 rounded-2xl flex items-center gap-4 mt-2 hover:bg-gray-100 transition-colors cursor-pointer">
                        <img src="https://64.media.tumblr.com/37bcea09d536b950954a64d725ed6842/c3a3b6f0e62210f2-95/s100x200/1f267beb81da6efc6374029e47dac42bd233f1b9.webp" className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0" alt="App" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#141313] leading-tight mb-0.5">Sempre disponível.</span>
                          <span className="text-xs font-medium text-gray-500 leading-tight">Compatível com todas as plataformas.</span>
                        </div>
                      </div>

                      {/* ✅ SECÇÃO DINÂMICA DE PUBLICIDADE */}
                      {globalPromos && globalPromos.length > 0 && (
                        <div className="space-y-4 mt-8">
                          {globalPromos.map((promo: any, index: number) => (
                            <a 
                              key={index}
                              href={promo.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 p-2 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group cursor-pointer"
                            >
                              {promo.imageUrl && (
                                <img 
                                  src={promo.imageUrl} 
                                  alt={promo.tag || "Publicidade"} 
                                  className="w-14 h-14 bg-white rounded-lg object-cover shadow-sm shrink-0 group-hover:scale-105 transition-transform" 
                                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150" }}
                                />
                              )}
                              <div className="flex flex-col">
                                {promo.tag && (
                                  <span className="bg-[#3D81F1] text-white text-[9px] font-black px-1.5 py-0.5 rounded w-fit mb-1 tracking-tighter uppercase">
                                    {promo.tag}
                                  </span>
                                )}
                                <p className="text-[11px] text-[#4B5563] leading-tight font-medium pr-2 line-clamp-2">
                                  {promo.description}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </aside>
              </div>

              {relatedItems.length > 0 && (
                <div className="mt-24 w-full">
                  <h3 className="text-xl font-bold text-[#141313] mb-6">Similar to this</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedItems.map((item: any, i: number) => {
                      const itemImg = item.coverImage || item.fullscreenExternalImage || item.externalImageUrl || item.imageUrl;
                      return (
                        <Link href={item.url || `/praticas/${item.slug?.current || item.slug || ''}`} key={i} className="group block cursor-pointer">
                          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-sm border border-gray-100">
                            {itemImg ? (
                              <img 
                                src={itemImg} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                alt={item.title} 
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <h4 className="font-bold text-[#141313] text-[15px] mb-1.5 line-clamp-1">{item.title}</h4>
                          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest gap-2">
                            <span>{item.category || practice.category || 'Meditation'}</span>
                            {item.duration && (
                              <>
                                <span>•</span>
                                <span>{item.duration}</span>
                              </>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
          {/* O FOOTER SÓ APARECE AQUI NO TEMPLATE SPLIT */}
         
        </div>
      ) : (
        /* TEMPLATE PADRÃO (CÍRCULOS OU IMAGEM EXTERNA) */
        <div ref={playerContainerRef} className={`relative w-full overflow-hidden flex flex-col items-center justify-center transition-all duration-500 ${isPipMode ? 'fixed bottom-8 right-8 !w-80 !h-48 z-[9999] rounded-[40px] shadow-2xl' : 'h-[100dvh]'}`} style={{ backgroundColor: showBgImage ? '#000' : bg }}>
          
          <style dangerouslySetInnerHTML={{ __html: `footer { display: none !important; }` }} />

          <div className="fixed top-0 left-0 w-full h-20 z-[100] opacity-40 hover:opacity-100 transition-opacity duration-500">
             <Navbar />
          </div>

          <div className="absolute inset-0 pointer-events-none z-0">
            {showBgImage ? (
              <>
                <img src={practice.fullscreenExternalImage} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
              </>
            ) : (
              <>
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes respira { 0%, 100% { transform: translate(-50%, 85%) scale(1); } 50% { transform: translate(-50%, 85%) scale(1.04); } } 
                  .onda { position: absolute; left: 50%; bottom: 0; border-radius: 50%; transform-origin: center; will-change: transform; pointer-events: none; } 
                  .onda-1 { width: 250vmax; height: 250vmax; z-index: 1; animation: respira 16s ease-in-out infinite; } 
                  .onda-2 { width: 170vmax; height: 170vmax; z-index: 2; animation: respira 14s ease-in-out infinite -4s; } 
                  .onda-3 { width: 80vmax; height: 80vmax; z-index: 3; animation: respira 12s ease-in-out infinite -8s; }
                `}} />
                <div className="absolute inset-0 pointer-events-none">
                   <div className="onda onda-1 pointer-events-none" style={{ backgroundColor: s1 }}/>
                   <div className="onda onda-2 pointer-events-none" style={{ backgroundColor: s2 }}/>
                   <div className="onda onda-3 pointer-events-none" style={{ backgroundColor: s3 }}/>
                </div>
              </>
            )}
          </div>
          
          <div className={`absolute top-28 right-6 z-50 flex items-center gap-4 ${showBgImage ? 'text-white' : 'text-[#141313]'} drop-shadow-sm`}>
            {!isPipMode && (
              <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform opacity-70 hover:opacity-100 cursor-pointer">
                {isFullscreen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className={`absolute top-[22%] z-50 flex flex-col items-center w-full px-6 ${showBgImage ? 'text-white' : 'text-[#141313]'} ${isPipMode ? 'scale-75 origin-top' : ''}`}>
            <h1 className={`font-bold text-center drop-shadow-sm ${isPipMode ? 'text-2xl mb-2' : 'text-4xl md:text-6xl mb-6'}`}>{practice.title}</h1>
            
            {hasVariations && !isPipMode ? (
               <div className={`flex gap-3 p-1.5 rounded-full backdrop-blur-sm ${showBgImage ? 'bg-white/10' : 'bg-black/5'}`}>
                 <div className="relative">
                   <button onClick={() => setIsCirclesInstructorOpen(!isCirclesInstructorOpen)} className={`flex items-center gap-2 pl-3 pr-4 py-2.5 text-[11px] font-bold tracking-widest cursor-pointer rounded-full transition-all ${showBgImage ? 'hover:bg-white/20' : 'hover:bg-white/50'}`}>
                     {activeImage && <img src={activeImage} className="w-6 h-6 rounded-full object-cover shadow-sm" alt="" />}
                     {selectedInstructor}
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                   </button>
                   {isCirclesInstructorOpen && (
                     <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl z-50 overflow-hidden w-48 text-[#141313]">
                       {availableInstructors.map(inst => (
                         <button key={inst.name} onClick={() => { setSelectedInstructor(inst.name); setIsCirclesInstructorOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-wide font-bold hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left">
                           {inst.image && <img src={inst.image} className="w-6 h-6 rounded-full object-cover" alt="" />}
                           {inst.name}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>

                 <div className="relative flex items-center">
                   <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} className={`appearance-none outline-none pl-5 pr-8 py-2.5 text-[11px] font-normal uppercase tracking-widest rounded-full shadow-sm cursor-pointer transition-all ${showBgImage ? 'bg-white/20 text-white' : 'bg-white text-[#141313]'}`}>
                     {availableDurations.map(d => <option key={d} value={d} className="text-[#141313]">{d}</option>)}
                   </select>
                   <svg className={`absolute right-3 pointer-events-none opacity-50 ${showBgImage ? 'text-white' : 'text-[#141313]'}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                 </div>
               </div>
            ) : (
               !isPipMode && (practice.instructor || practice.duration) ? (
                 <div className={`flex gap-3 p-1.5 rounded-full backdrop-blur-sm ${showBgImage ? 'bg-white/10' : 'bg-black/5'}`}>
                    {practice.instructor && (
                       <div className="flex items-center gap-2 pl-3 pr-4 py-2.5 text-[11px] font-bold tracking-widest">
                         {practice.instructorImage && <img src={practice.instructorImage} className="w-6 h-6 rounded-full object-cover shadow-sm" alt="" />}
                         {practice.instructor}
                       </div>
                    )}
                    {practice.duration && (
                       <div className={`px-5 py-2.5 text-[11px] font-normal uppercase tracking-widest rounded-full shadow-sm ${showBgImage ? 'bg-white/20' : 'bg-white'}`}>
                         {practice.duration}
                       </div>
                    )}
                 </div>
               ) : null
            )}
          </div>

          <div className={`absolute w-9/12 max-w-lg z-50 flex flex-col gap-3 ${isPipMode ? 'bottom-6' : 'bottom-28 lg:bottom-12'}`}>
            <div className={`flex items-center justify-center gap-8 mb-2 ${isPipMode ? 'scale-75' : ''}`}>
              <button onClick={skipBackward} className={`${showBgImage ? 'text-white' : 'text-[#141313]'} hover:scale-110 transition-transform cursor-pointer relative z-50`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <text x="12" y="16" fill="currentColor" stroke="none" fontSize="7" fontWeight="bold" textAnchor="middle">15</text>
                </svg>
              </button>
              
              <button onClick={toggleAudio} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer relative z-50 ${showBgImage ? 'bg-white text-black' : 'bg-[#141313] text-white'}`}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  {isPlaying ? <path d="M8 19h2V5H8v14zm6-14v14h2V5h-2z" /> : <path d="M8 5v14l11-7z" />}
                </svg>
              </button>
              
              <button onClick={skipForward} className={`${showBgImage ? 'text-white' : 'text-[#141313]'} hover:scale-110 transition-transform cursor-pointer relative z-50`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"></path>
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <text x="12" y="16" fill="currentColor" stroke="none" fontSize="7" fontWeight="bold" textAnchor="middle">15</text>
                </svg>
              </button>
            </div>

            <div className="w-full h-4 flex items-center cursor-pointer relative z-50" onClick={handleSeek}>
              <div className={`relative w-full h-[2px] rounded-full ${showBgImage ? 'bg-white/30' : 'bg-black/10'}`}>
                <div className={`absolute h-full rounded-full ${showBgImage ? 'bg-white' : 'bg-black/40'}`} style={{ width: `${progress}%` }} />
                <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-sm ${showBgImage ? 'bg-white' : 'bg-[#141313]'}`} style={{ left: `calc(${progress}% - 6px)` }} />
              </div>
            </div>
            <div className={`flex justify-between text-[10px] font-black uppercase tracking-widest px-1 pointer-events-none ${showBgImage ? 'text-white/80' : 'text-[#141313]/40'} ${isPipMode ? 'hidden' : ''}`}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(finalDuration)}</span>
            </div>
          </div>
        </div>
      )}

      {renderAudio()}
      {isModalOpen && <ModalAuth onClose={() => setIsModalOpen(false)} router={router} />}
    </>
  );
}

function ModalAuth({ onClose, router }: { onClose: () => void, router: any }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[50px] p-12 text-center shadow-2xl">
        <h2 className="text-4xl font-bold mb-4 tracking-tight text-[#141313]">Acesso Exclusivo</h2>
        <p className="text-gray-500 mb-10 text-lg leading-relaxed text-center">
          Esta prática faz parte do nosso conteúdo premium. Faça login ou crie uma conta gratuita para desbloquear agora.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/mindful-store')} 
            className="w-full bg-[#3D81F1] text-white font-black py-5 rounded-2xl text-lg shadow-xl shadow-blue-200 hover:bg-blue-600 transition-all"
          >
            Ver Mais / Criar Conta
          </button>
          
          <button onClick={onClose} className="w-full bg-gray-50 text-gray-400 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all">
            Talvez depois
          </button>
        </div>
      </div>
    </div>
  );
}

