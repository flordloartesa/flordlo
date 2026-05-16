"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, X, Music, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";

// --- CONFIGURAÇÕES DOS ÁUDIOS ---
const AUDIO_SOURCES = {
  bowl: "https://pub-1658279070cc4b1b9e98c97054103002.r2.dev/tibetan-meu_2021-ef.mp3",
  forest: "https://pub-1658279070cc4b1b9e98c97054103002.r2.dev/freesound_community-forest-with-small-river-birds-and-nature-field-recording-6735.mp3",
  ocean: "https://pub-1658279070cc4b1b9e98c97054103002.r2.dev/prem_adhikary-relaxing-ocean-waves-high-quality-recorded-177004.mp3",
  rain: "https://pub-1658279070cc4b1b9e98c97054103002.r2.dev/soft-rain-ambient-111154.mp3",
  stream: "https://assets.mixkit.co/active_storage/sfx/1208/1208-preview.mp3" // NOVO SOM
};

type AppState = "setup" | "delay" | "running";

export default function MeditationTimer() {
  const { data: session, status } = useSession();

  // Estados de Tempo e Configuração
  const [appState, setAppState] = useState<AppState>("setup");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);
  const [seconds, setSeconds] = useState(0);
  const [delaySecs, setDelaySecs] = useState(10);
  
  // Estados do Timer Ativo
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Estados de Som e Menus
  const [bgSound, setBgSound] = useState<"none" | "forest" | "ocean" | "rain" | "stream">("none");
  const [bgVolume, setBgVolume] = useState<number>(0.5); // Volume inicial 50%
  const [bowlInterval, setBowlInterval] = useState<number>(0);
  const [isBgDelayed, setIsBgDelayed] = useState<boolean>(false);
  
  // Estados para os Dropdowns Customizados
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);
  const [isBowlMenuOpen, setIsBowlMenuOpen] = useState(false);

  // Refs de Áudio e Timer
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const bowlAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgDelayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LÓGICA DO CRONÔMETRO ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (appState === "delay" && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            startMeditation();
            return totalTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (appState === "running" && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endMeditation();
            return 0;
          }
          // Checa se deve tocar o sino de intervalo
          checkIntervalBell(prev - 1);
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [appState, isPaused, totalTime, bowlInterval]);

  // --- CONTROLE DE ÁUDIO E VOLUME ---
  useEffect(() => {
    if (bgAudioRef.current) {
      if (appState === "running" && !isPaused && bgSound !== "none" && !isBgDelayed) {
        bgAudioRef.current.play().catch(e => console.log("Autoplay bloqueado:", e));
      } else {
        bgAudioRef.current.pause();
      }
    }
  }, [appState, isPaused, bgSound, isBgDelayed]);

  // Aplica o volume apenas ao som de fundo
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = bgVolume;
    }
  }, [bgVolume]);

  const playBowl = () => {
    if (bowlAudioRef.current) {
      bowlAudioRef.current.currentTime = 0;
      bowlAudioRef.current.volume = 0.7; // 70%
      bowlAudioRef.current.play().catch(e => console.log("Autoplay bloqueado:", e));
    }
  };

  const checkIntervalBell = (currentSecondsLeft: number) => {
    if (bowlInterval === 0) return;
    const elapsed = totalTime - currentSecondsLeft;
    if (elapsed > 0 && elapsed % (bowlInterval * 60) === 0) {
      playBowl();
    }
  };

  // --- REGISTO DE PROGRESSO PREMIUM ---
  const saveMeditationProgress = async (timeSpent: number, isCompleted: boolean) => {
    if (status !== "authenticated" || timeSpent < 10) return; 
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId: "meditation-timer", 
          trackId: `timer-${Date.now()}`, 
          timeWatched: timeSpent, 
          isCompleted: isCompleted 
        })
      });
      console.log(`Sessão guardada com sucesso: ${timeSpent} segundos.`);
    } catch (e) {
      console.error("Erro ao guardar o tempo de meditação:", e);
    }
  };

  // --- AÇÕES PRINCIPAIS ---
  const handleStart = () => {
    const totalSecs = hours * 3600 + minutes * 60 + seconds;
    if (totalSecs === 0) return;

    setTotalTime(totalSecs);
    if (delaySecs > 0) {
      setTimeLeft(delaySecs);
      setAppState("delay");
    } else {
      setTimeLeft(totalSecs);
      startMeditation();
    }
  };

  const startMeditation = () => {
    setAppState("running");
    setIsBgDelayed(true); 
    playBowl(); 
    
    if (bgDelayTimerRef.current) clearTimeout(bgDelayTimerRef.current);
    bgDelayTimerRef.current = setTimeout(() => {
      setIsBgDelayed(false);
    }, 4000);
  };

  const endMeditation = () => {
    if (bgDelayTimerRef.current) clearTimeout(bgDelayTimerRef.current);
    setAppState("setup");
    setIsPaused(false);
    playBowl(); 
    setTimeout(playBowl, 3000); 
    
    saveMeditationProgress(totalTime, true); 
  };

  const cancelTimer = () => {
    if (bgDelayTimerRef.current) clearTimeout(bgDelayTimerRef.current);
    
    const timeSpent = totalTime - timeLeft;
    saveMeditationProgress(timeSpent, false);

    setAppState("setup");
    setIsPaused(false);
    if (bgAudioRef.current) bgAudioRef.current.pause();
  };

  // --- COMPONENTES VISUAIS (Helpers) ---
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const TimeSpinner = ({ value, max, setter, label }: { value: number, max: number, setter: React.Dispatch<React.SetStateAction<number>>, label: string }) => {
    const increment = () => setter(prev => (prev < max ? prev + 1 : 0));
    const decrement = () => setter(prev => (prev > 0 ? prev - 1 : max));

    return (
      <div className="flex flex-col items-center mx-1 lg:mx-2">
        <button onClick={increment} className="p-1.5 lg:p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
          <ChevronUp className="w-3 h-3 lg:w-7 lg:h-7" />
        </button>
        <div className="text-3xl lg:text-5xl font-light text-white w-10 lg:w-20 text-center select-none py-1 lg:py-2">
          {value.toString().padStart(2, '0')}
        </div>
        <button onClick={decrement} className="p-1.5 lg:p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
          <ChevronDown className="w-3 h-3 lg:w-7 lg:h-7" />
        </button>
        <span className="text-white/40 text-[7px] lg:text-xs font-bold uppercase tracking-widest mt-1 lg:mt-2">{label}</span>
      </div>
    );
  };

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = appState !== "setup" ? circumference - ((totalTime - timeLeft) / totalTime) * circumference : 0;

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* BACKGROUND IMAGE COM OVERLAY ESCURO */}
      <div 
        className="absolute inset-0 z-0 opacity-100"
        style={{
          backgroundImage: `url('https://i.pinimg.com/originals/33/3a/4f/333a4f5559594c4bdd3fefe68032ea9c.gif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070494]/100 via-[#070494]/30 to-[#cba382]/20 z-0 pointer-events-none" />

      <audio ref={bgAudioRef} src={bgSound !== "none" ? AUDIO_SOURCES[bgSound] : undefined} loop />
      <audio ref={bowlAudioRef} src={AUDIO_SOURCES.bowl} />

      <div className="z-10 pt-16 w-full text-center">
        <h1 className="text-2xl lg:text-4xl font-sans tracking-wide text-white drop-shadow-lg">Timer p/ Meditar</h1>
      </div>

      <div className="z-10 flex flex-col items-center flex-grow justify-center w-full px-6">
        
        {appState === "setup" ? (
          <>
            {/* SELETORES DE TEMPO */}
            <div className="flex items-center justify-center gap-1 lg:gap-2 mb-4 lg:mb-10 bg-white/5 backdrop-blur-md p-3 lg:p-6 rounded-[1rem] lg:rounded-[2rem] border border-white/10 shadow-2xl z-20">
              <TimeSpinner value={hours} max={23} setter={setHours} label="Horas" />
              <span className="text-xl lg:text-4xl font-extralight text-white/30 -mt-4 lg:-mt-8">:</span>
              <TimeSpinner value={minutes} max={59} setter={setMinutes} label="Minutos" />
              <span className="text-xl lg:text-4xl font-extralight text-white/30 -mt-4 lg:-mt-8">:</span>
              <TimeSpinner value={seconds} max={59} setter={setSeconds} label="Segundos" />
            </div>

            {/* BOTÕES DE DELAY */}
            <div className="flex items-center gap-2 lg:gap-4 text-[10px] lg:text-sm mb-4 lg:mb-12 z-20">
              <span className="text-white/60">Delay:</span>
              {[0, 10, 25].map(d => (
                <button
                  key={d}
                  onClick={() => setDelaySecs(d)}
                  className={`px-2 py-1 lg:px-4 lg:py-1.5 rounded-full transition-all text-[8px] lg:text-xs font-bold tracking-wider uppercase ${delaySecs === d ? "bg-white/30 text-white shadow-lg" : "text-white/50 hover:text-white bg-white/5"}`}
                >
                  {d === 0 ? "Nenhum" : `${d} seg`}
                </button>
              ))}
            </div>

            {/* CONFIGURAÇÃO DE SONS */}
            <div className="w-full max-w-[250px] lg:max-w-sm bg-white/5 backdrop-blur-md rounded-xl lg:rounded-[1.5rem] p-3 lg:p-5 flex flex-col gap-2 lg:gap-5 border border-white/10 mb-4 lg:mb-8 shadow-xl z-20">
              
              {/* Dropdown Customizado: Som Ambiente */}
              <div className="flex justify-between items-center relative">
                <span className="text-[10px] lg:text-sm font-medium text-white/80 flex items-center gap-1.5 lg:gap-3"><Music className="w-3.5 h-3.5 lg:w-5 lg:h-5 opacity-70"/> Som Ambiente</span>
                
                <div className="relative flex flex-col items-center">
                  <button
                    onClick={() => { setIsBgMenuOpen(!isBgMenuOpen); setIsBowlMenuOpen(false); }}
                    className="bg-white/10 border border-white/10 rounded-md lg:rounded-lg px-2 py-0.5 lg:px-4 lg:py-1.5 text-[9px] lg:text-sm text-center outline-none text-white w-[90px] lg:w-[130px] hover:bg-white/20 transition-colors"
                  >
                    {bgSound === "none" ? "Nenhum" : bgSound === "forest" ? "Floresta" : bgSound === "ocean" ? "Oceano" : bgSound === "rain" ? "Chuva" : "Rio"}
                  </button>

                  {isBgMenuOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-1/2 transform -translate-x-1/2 w-max min-w-[100px] lg:min-w-[140px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col">
                      {[
                        { value: "none", label: "Nenhum" },
                        { value: "forest", label: "Floresta" },
                        { value: "ocean", label: "Oceano" },
                        { value: "rain", label: "Chuva" },
                        { value: "stream", label: "Rio" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setBgSound(option.value as any); setIsBgMenuOpen(false); }}
                          className={`px-4 py-2 text-[10px] lg:text-sm text-center hover:bg-white/10 transition-colors ${bgSound === option.value ? 'bg-white/20 font-bold text-white' : 'text-white/70'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="h-px w-full bg-white/10"></div>
              
              {/* Dropdown Customizado: Taça Tibetana */}
              <div className="flex justify-between items-center relative">
                <span className="text-[10px] lg:text-sm font-medium text-white/80 flex items-center gap-1.5 lg:gap-3"><Volume2 className="w-3.5 h-3.5 lg:w-5 lg:h-5 opacity-70"/> Taça Tibetana</span>
                
                <div className="relative flex flex-col items-center">
                  <button
                    onClick={() => { setIsBowlMenuOpen(!isBowlMenuOpen); setIsBgMenuOpen(false); }}
                    className="bg-white/10 border border-white/10 rounded-md lg:rounded-lg px-2 py-0.5 lg:px-4 lg:py-1.5 text-[9px] lg:text-sm text-center outline-none text-white w-[90px] lg:w-[130px] hover:bg-white/20 transition-colors"
                  >
                    {bowlInterval === 0 ? "Início e Fim" : `A cada ${bowlInterval} min`}
                  </button>

                  {isBowlMenuOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-1/2 transform -translate-x-1/2 w-max min-w-[100px] lg:min-w-[140px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col">
                      {[
                        { value: 0, label: "Início e Fim" },
                        { value: 5, label: "A cada 5 min" },
                        { value: 10, label: "A cada 10 min" },
                        { value: 15, label: "A cada 15 min" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setBowlInterval(option.value); setIsBowlMenuOpen(false); }}
                          className={`px-4 py-2 text-[10px] lg:text-sm text-center hover:bg-white/10 transition-colors ${bowlInterval === option.value ? 'bg-white/20 font-bold text-white' : 'text-white/70'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            <button 
              onClick={handleStart}
              className="px-8 py-2.5 lg:px-16 lg:py-4 mt-2 lg:mt-4 bg-white text-stone-900 rounded-full text-xs lg:text-lg font-bold tracking-widest uppercase shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform z-20"
            >
              Iniciar
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center w-full relative">
            {appState === "delay" ? (
              <div className="text-center mb-16 relative z-10">
                <p className="text-white/60 mb-2 uppercase tracking-widest text-sm">A preparar...</p>
                <div className="text-5xl lg:text-6xl font-light drop-shadow-lg">{timeLeft}</div>
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-48 h-48 lg:w-72 lg:h-72 mb-10 drop-shadow-2xl">
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 scale-[1.2]">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-white stroke-[0.3]">
                    <circle cx="50" cy="50" r="20" />
                    <circle cx="50" cy="30" r="20" />
                    <circle cx="50" cy="70" r="20" />
                    <circle cx="32.68" cy="40" r="20" />
                    <circle cx="67.32" cy="40" r="20" />
                    <circle cx="32.68" cy="60" r="20" />
                    <circle cx="67.32" cy="60" r="20" />
                  </svg>
                </div>

                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 relative z-10">
                  <circle cx="50" cy="50" r={radius} className="stroke-white/10 fill-none" strokeWidth="2" />
                  <circle
                    cx="50" cy="50" r={radius}
                    className="stroke-white/80 fill-none"
                    strokeWidth="2"
                    strokeDasharray={circumference} 
                    style={{ 
                      strokeDashoffset: dashOffset,
                      transition: "stroke-dashoffset 1s linear" 
                    }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-5xl lg:text-6xl font-extralight tracking-tighter drop-shadow-md z-10">
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 lg:gap-8 mb-6 mt-4 z-10">
              <button onClick={cancelTimer} className="p-3 lg:p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20 shadow-lg">
                <X className="w-4 h-4 lg:w-6 lg:h-6" />
              </button>
              <button 
                onClick={() => setIsPaused(!isPaused)} 
                className="p-4 lg:p-6 bg-white text-stone-900 rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                {isPaused ? <Play className="w-5 h-5 lg:w-7 lg:h-7 ml-1" fill="currentColor" /> : <Pause className="w-5 h-5 lg:w-7 lg:h-7" fill="currentColor" />}
              </button>
            </div>

            {appState === "running" && (
              <div className="flex flex-col items-center gap-2 mt-2 animate-fade-in z-10 w-full max-w-[250px] lg:max-w-sm">
                <span className="text-[9px] lg:text-[10px] font-bold tracking-widest text-white/50 uppercase">
                  AMBIENTE ({Math.round(bgVolume * 100)}%)
                </span>
                
                <div className="flex w-full items-center gap-2">
                  <div className="flex items-center gap-1.5 w-1/2 bg-white/10 backdrop-blur-md px-2 py-1.5 lg:px-3 lg:py-2 rounded-full border border-white/10 shadow-lg">
                    <Music className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/60 shrink-0" />
                    <select 
                      className="bg-transparent text-[9px] lg:text-xs w-full outline-none text-white/90 appearance-none cursor-pointer"
                      value={bgSound}
                      onChange={(e) => setBgSound(e.target.value as any)}
                    >
                      <option value="none" className="text-stone-800">S/ Som</option>
                      <option value="forest" className="text-stone-800">Floresta</option>
                      <option value="ocean" className="text-stone-800">Oceano</option>
                      <option value="rain" className="text-stone-800">Chuva</option>
                      <option value="stream" className="text-stone-800">Rio</option>
                    </select>
                  </div>

                  {bgSound !== "none" && (
                    <div className="flex items-center gap-1.5 w-1/2 bg-white/10 backdrop-blur-md px-2 py-1.5 lg:px-3 lg:py-2 rounded-full border border-white/10 shadow-lg animate-fade-in">
                      {bgVolume === 0 ? <VolumeX className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/60 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/60 shrink-0" />}
                      <input 
                        type="range" 
                        min="0" max="1" step="0.05"
                        value={bgVolume} 
                        onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <div className="h-16 w-full"></div>
    </div>
  );
}