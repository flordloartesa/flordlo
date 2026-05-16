"use client";

import { MonitorPlay, Mountain, ShoppingBag, Gift } from "lucide-react";

export default function StoreFilters() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Ajustado para dar mais ar no topo
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const navItems = [
    { id: "cursos", label: "Cursos Online", icon: <MonitorPlay size={42} strokeWidth={1.2} /> },
    { id: "retiros", label: "Retiros e Workshops", icon: <Mountain size={42} strokeWidth={1.2} /> },
    { id: "acessorios", label: "Acessórios & Zafus", icon: <ShoppingBag size={42} strokeWidth={1.2} /> },
    { id: "presentes", label: "Cartão Oferta", icon: <Gift size={42} strokeWidth={1.2} /> },
  ];

  return (
    <div className="w-full mb-16 overflow-x-auto no-scrollbar pb-4">
      <div className="flex items-start justify-start md:justify-center gap-10 md:gap-14 min-w-max px-4">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => scrollToSection(e, item.id)}
            className="flex flex-col items-center gap-3 group cursor-pointer transition-all"
          >
            {/* Ícone Estilo Apple */}
            <div className="text-slate-800 transition-transform duration-300 group-hover:scale-110 group-hover:text-[#3D81F1]">
              {item.icon}
            </div>

            {/* Label tipografia Inter 14px */}
            <span className="text-[14px] font-medium text-slate-900 border-b-2 border-transparent group-hover:text-[#3D81F1] transition-colors leading-tight text-center">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}