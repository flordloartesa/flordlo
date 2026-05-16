"use client";

import Link from '@/components/MyLink';

const links = [
  { title: "Meditar", sub: "EXPLORAR", color: "bg-[#F8F6F4]" },
  { title: "Dormir", sub: "EXPLORAR", color: "bg-[#F8F6F4]" },
  { title: "Programas", sub: "CURSOS, MASTERCLASS", color: "bg-[#F8F6F4]" },
  { title: "Psicologia", sub: "EXPLORAR", color: "bg-[#F8F6F4]" },
];

export default function QuickLinks() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x px-1">
      {links.map((link, i) => (
        <div 
          key={i}
          className={`flex-none w-[200px] md:w-[260px] p-6 rounded-2xl ${link.color} border border-slate-100 cursor-pointer hover:shadow-md transition-all snap-start`}
        >
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-8 leading-tight">
            {link.title}
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {link.sub}
          </p>
        </div>
      ))}
    </div>
  );
}