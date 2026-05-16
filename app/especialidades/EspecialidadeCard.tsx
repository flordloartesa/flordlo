'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from '@/components/MyLink';
import { PortableText } from '@portabletext/react';

// === 1. DEFINIÇÃO DOS PADRÕES SVG ===

const PatternAquaWave = () => (
  <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
    <path fill="white" d="M0,100 Q100,50 200,100 T400,100 L400,0 L0,0 Z" className="opacity-40" />
    <path fill="white" d="M400,300 Q300,350 200,300 T0,300 L0,400 L400,400 Z" className="opacity-20" />
    <circle cx="350" cy="200" r="80" fill="white" className="opacity-10" />
  </svg>
);

const PatternBlobs = () => (
  <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
    <path fill="white" d="M-50,200 Q100,20 250,150 T500,50 L500,-50 L-50,-50 Z" className="opacity-50" />
    <path fill="white" d="M450,200 Q300,400 100,300 T-100,450 L-100,500 L450,500 Z" className="opacity-30" />
    <circle cx="380" cy="220" r="120" fill="white" className="opacity-20" />
  </svg>
);

const PatternGeometric = () => (
  <svg className="absolute inset-0 w-full h-full opacity-95 pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
    <circle cx="350" cy="50" r="100" fill="white" className="opacity-50" />
    <path fill="white" d="M-20,350 Q100,180 250,350 T500,350 L500,500 L-20,500 Z" className="opacity-40" />
    <rect x="280" y="220" width="180" height="180" rx="90" fill="black" className="opacity-10" />
    <path fill="white" d="M30,30 L180,10 L140,180 Z" className="opacity-30" />
  </svg>
);

const PatternWaves = () => (
  <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
    <path fill="none" stroke="white" strokeWidth="60" strokeLinecap="round" d="M-50,120 L80,50 L200,120 L320,50 L450,120" className="opacity-30" />
    <path fill="white" d="M220,120 A110,110 0 0,1 440,120 Z" className="opacity-50" />
    <circle cx="20" cy="380" r="140" fill="white" className="opacity-20" />
    <rect x="300" y="280" width="120" height="200" rx="60" fill="white" className="opacity-30" />
  </svg>
);

const PatternFloral = () => (
  <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
    <path fill="white" d="M200,180 Q280,30 380,180 T550,180 L550,450 L-100,450 L-100,180 T50,180 Q120,350 200,180" className="opacity-40" />
    <circle cx="40" cy="40" r="110" fill="white" className="opacity-30" />
    <path fill="black" d="M400,400 Q320,280 240,400 T80,400" fill="none" stroke="black" strokeWidth="45" strokeLinecap="round" className="opacity-10" />
  </svg>
);


// === 2. PALETA DE CORES ===

const vividColors = [
  'bg-[#2490EB]', // Cor solicitada aplicada aqui
];

interface EspecialidadeCardProps {
  item: any;
}

export default function EspecialidadeCard({ item }: EspecialidadeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garantir que o Portal só renderiza no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquear scroll do body quando a modal abre
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isModalOpen]);

  const charCodeSum = item._id.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
  const selectedColor = vividColors[charCodeSum % vividColors.length];
  
  const patterns = [
    <PatternAquaWave key="p1" />,
    <PatternBlobs key="p2" />,
    <PatternGeometric key="p1" />,
    <PatternWaves key="p1" />,
    <PatternFloral key="p1" />
  ];
  const SelectedPattern = patterns[charCodeSum % patterns.length];

  const formatText = item.format && item.format.length > 0 ? item.format.join(' & ') : 'Presencial';

  return (
    <>
      {/* O CARTÃO PRINCIPAL */}
      <div 
        className={`relative w-full h-[350px] ${selectedColor} rounded-[25px] overflow-hidden flex flex-col p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group cursor-default`}
      >
        {SelectedPattern}

        <div 
          className="absolute inset-0 backdrop-blur-[3px] pointer-events-none z-0 opacity-50"
          style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #2A27B3 50%, #000000 100%)' }}
        />

        <div className="relative z-10 flex justify-between items-start mb-4">
          <span className="bg-black/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] uppercase font-black text-[#FFFFFF] tracking-widest border border-white/20">
            {formatText}
          </span>
          <span className="text-[#2D2C2B]/40 text-[8px] font-black uppercase tracking-widest">
            {item.duration}
          </span>
        </div>

        <div className="relative z-10 text-left mb-6">
          <h3 className="text-[22px] font-medium text-[#FFFFFF] leading-[1.1] mb-3 tracking-tight">
            {item.title}
          </h3>
          <div className="flex items-center gap-2">
            {item.therapistPhoto && (
              <img 
                src={item.therapistPhoto} 
                alt={item.therapistName} 
                className="w-6 h-6 rounded-full object-cover border border-white/50 shadow-sm"
              />
            )}
            <div className="flex flex-col">
              <p className="text-[#FFFFFF]/60 text-[8px] font-bold tracking-widest uppercase">
                {item.therapistName || "Equipa Meditt"}
              </p>
              {item.therapistRole && (
                <p className="text-[#FFFFFF]/40 text-[7px] font-medium uppercase tracking-tight">
                  {item.therapistRole}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto flex flex-col gap-3">
          <div className="flex items-baseline gap-1 mb-1">
             <span className="text-2xl font-black text-[#FFFFFF] tracking-tighter">{item.price}€</span>
             <span className="text-[10px] text-[#FFFFFF]/50 font-black uppercase">/ sessão</span>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md text-[#DADAE0] hover:bg-white/40 transition-all border border-white/30"
            >
              Saber mais
            </button>
            <Link 
              href={`/marcacao?id=${item._id}&nome=${item.title}`}
              className="w-full text-center py-2 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/40 backdrop-blur-lg text-[#DADAE0] shadow-sm hover:bg-white/60 transition-all border border-white/40"
            >
              Agendar Consulta
            </Link>
          </div>
        </div>
      </div>

      {/* PORTAL PARA A MODAL */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div 
            className="absolute inset-0 bg-white/60 backdrop-blur-xl cursor-pointer" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative bg-white rounded-[1rem] w-full max-w-[800px] max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col border border-white/20">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors z-20"
            >
              ✕
            </button>

            <div className="p-10 sm:p-14 text-left">
              {/* Accent bar com a mesma cor do card */}
              <div className={`w-20 h-2.5 rounded-full bg-[#2490EB] mb-10`}></div>
              
              <h2 className="text-4xl font-black text-[#2D2C2B] mb-2 leading-tight tracking-tighter">{item.title}</h2>
              <div className="flex items-center gap-3 mb-10">
                {item.therapistPhoto && (
                  <img src={item.therapistPhoto} className="w-10 h-10 rounded-full object-cover shadow-md" alt="" />
                )}
                <div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{item.therapistName}</p>
                    <p className="text-gray-400 text-xs font-medium uppercase">{item.therapistRole}</p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-10">
                <span className="text-[11px] font-black bg-gray-100 px-5 py-2.5 rounded-xl text-gray-600 uppercase tracking-widest">
                  {item.duration}
                </span>
                <span className="text-[11px] font-black bg-gray-100 px-5 py-2.5 rounded-xl text-gray-600 uppercase tracking-widest">
                  {item.price}€ / sessão
                </span>
              </div>
              
              <div className="prose prose-flat text-gray-600 mb-12 leading-relaxed font-medium text-[13px]">
                {item.longDescription ? (
                  <PortableText value={item.longDescription} />
                ) : (
                  <p>{item.shortDescription}</p>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <Link 
                  href={`/marcacao?id=${item._id}&nome=${item.title}`}
                  className="block w-full text-center bg-[#2D2C2B] text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl"
                >
                  Agendar Consulta
                </Link>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 font-bold hover:text-gray-600 transition-colors text-[10px] uppercase tracking-[0.3em]"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}