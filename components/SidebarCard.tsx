"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PlayCircle, Clock, Infinity, Smartphone, Award } from "lucide-react";

export default function SidebarCard({ courseImage, courseTitle, coursePrice, duration, tracksCount }: any) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Define a partir de quantos pixels a imagem desaparece
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="lg:sticky lg:top-10 z-40 lg:-mt-[420px] transition-all duration-500">
      <div className="bg-white shadow-2xl rounded-[32px] border border-slate-100 overflow-hidden">
        
        {/* IMAGEM: Desaparece se scrolled for verdadeiro */}
        <div className={`relative aspect-video bg-slate-900 group transition-all duration-500 ease-in-out ${scrolled ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[300px] opacity-100'}`}>
          <Image src={courseImage} alt={courseTitle} fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
             <PlayCircle size={64} className="text-white/90 drop-shadow-2xl" />
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-xs font-bold uppercase tracking-widest bg-black/40 py-2 backdrop-blur-sm">
            Pré-visualizar este curso
          </div>
        </div>

        <div className="p-8 space-y-8 text-center">
          <div className="flex items-baseline justify-center gap-3">
            <span className="text-4xl font-black text-slate-900">€{coursePrice}</span>
            <span className="text-slate-400 line-through text-lg font-medium">€75.00</span>
          </div>

          <button className="w-full bg-[#3D81F1] text-white py-4 rounded-full font-bold text-[16px] hover:bg-[#2b6fd4] transition-all shadow-lg active:scale-[0.98]">
            Comprar agora
          </button>

          <div className="text-[13px] space-y-4 pt-4 text-slate-500 font-medium text-left">
            <p className="font-bold text-slate-900 uppercase tracking-tighter text-[11px] mb-2">Este curso inclui:</p>
            <div className="flex items-center gap-3"><Clock size={16} className="text-[#1e3a8a]"/> {duration || 12} meses de acesso</div>
            <div className="flex items-center gap-3"><Infinity size={16} className="text-[#1e3a8a]"/> {tracksCount} Meditações guiadas</div>
            <div className="flex items-center gap-3"><Smartphone size={16} className="text-[#1e3a8a]"/> Acesso no telemóvel e TV</div>
            <div className="flex items-center gap-3"><Award size={16} className="text-[#1e3a8a]"/> Certificado de Conclusão</div>
          </div>
        </div>
      </div>
    </div>
  );
}