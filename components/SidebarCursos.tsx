"use client";

import { useState, useEffect } from "react";
import Link from '@/components/MyLink';
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UserMenu from "./UserMenu";
import { 
  Home, Library, User, Users, Sparkles, 
  CircleDashed, Wind, Music, Globe, Timer, Info, X 
} from "lucide-react";

// ✅ Dados das práticas para a Imagem 2 (Exemplo)
const worldPractices = [
  { 
    title: "Mindfulness for Beginners", 
    img: "https://images2.pangobooks.com/images/49376275-5942-49d0-b70a-db3cc4c92bad?auto=webp&format=webp&height=300&quality=85&crop=5%3A6",
    url: "/world/jon-kabat-zinn" 
  },
  { 
    title: "Wherever You Go", 
    img: "https://m.media-amazon.com/images/I/81qPtpPRfYL._AC_UF1000,1000_QL80_.jpg",
    url: "/world/jon-kabat-zinn" 
  },
  { 
    title: "Meditation is Not What You Think", 
    img: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1524083629i/36204290.jpg",
    url: "/world/jon-kabat-zinn" 
  },
  { 
    title: "A Practical Guide to Finding Peace in a Frantic World", 
    img: "https://m.media-amazon.com/images/I/41l0SNBebcL.jpg",
    url: "/world/mindfulness-a-practical-guide-to-finding-peace-in-a-frantic-world" 
  },
  { 
    title: "Mindful Way through Depression", 
    img: "https://i.discogs.com/TuY3d93A4yLGpmlOZ05j0ZcQEH7BqVOenzP4V_9eJt8/rs:fit/g:sm/q:90/h:600/w:535/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEzOTgx/NTI2LTE1NjU0MjI2/ODgtOTUzMS5qcGVn.jpeg",
    url: "/world/the-mindful-way-through-depression-mbct" 
  },
  { 
    title: "The Mind Illuminated", 
    img: "https://libris.to/media/jacket/13669090_untitled.jpg",
    url: "/world/the-mind-illuminated" 
  },
  { 
    title: "Mindfulness in Plain English", 
    img: "https://www.worldofbooks.com/cdn/shop/files/0861719069.jpg?v=1751439706&width=493",
    url: "/world/mindfulness-in-plain-english" 
  },
  { 
    title: "Beyond Mindfulness", 
    img: "https://www.worten.pt/i/9d356313825f415076410069a9e55b2ea53fd2e3",
    url: "/world/mindfulness-in-plain-english" 
  },
];

const menuItems = [
  { label: "Home", href: "/mindful-store", icon: Home, gradient: "from-blue-500 to-indigo-500" },
  { label: "Curso completo", href: "/cursos/3-niveis-introducao-mindfulness", icon: Library, gradient: "from-purple-500 to-fuchsia-500" },
  { label: "Nível 1", href: "/cursos/introducao-mindfulness-nivel-1", icon: User, gradient: "from-emerald-400 to-teal-500" },
  { label: "Nível 2", href: "/cursos/introducao-mindfulness-nivel-2", icon: Users, gradient: "from-orange-400 to-pink-500" },
  { label: "Nível 3", href: "/cursos/introducao-mindfulness-nivel-3", icon: Sparkles, gradient: "from-cyan-400 to-blue-500" },
  { label: "iMBSR - 8 Semanas", href: "/cursos/mindfulness-based-stress-reduction", icon: CircleDashed, gradient: "from-rose-400 to-red-500" },
  { label: "Pranayama - 12 Sem", href: "/cursos/pranayama-breathwork-12-semanas", icon: Wind, gradient: "from-violet-400 to-purple-500" },
  { label: "Sonoridades Relaxantes", href: "/sonoridades-relaxantes", icon: Music, gradient: "from-amber-400 to-orange-500" },
  { label: "World", href: "#", icon: Globe, gradient: "from-lime-400 to-emerald-500", hasInfo: true, isWorldTrigger: true },
  { label: "Timer - Taça Tibetana", href: "/timer-para-meditar", icon: Timer, gradient: "from-sky-400 to-cyan-500" },
];

export default function SidebarCursos() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWorldOpen, setIsWorldOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
    setIsWorldOpen(false);
  }, [pathname]);

  // Bloquear scroll quando menus estão abertos
  useEffect(() => {
    if (isOpen || isWorldOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen, isWorldOpen]);

  return (
    <>
      {/* Botão Hamburguer Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-[1275px]:hidden absolute top-7 md:top-54 right-6 z-[250] w-[37px] h-[37px] flex flex-col justify-center items-center bg-transparent border-none focus:outline-none"
      >
        <span className={`block h-[2px] w-[33px] ${isOpen ? 'bg-white' : 'bg-white'} rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[2px]' : '-translate-y-[8px]'}`} />
        <span className={`block h-[2px] w-[33px] bg-white rounded-full transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
        <span className={`block h-[2px] w-[33px] ${isOpen ? 'bg-white' : 'bg-white'} rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[2px]' : 'translate-y-[8px]'}`} />
      </button>

      {/* Barra Lateral Principal */}
      <nav className={`
        fixed top-0 left-0 h-[100dvh] w-full z-[155] flex flex-col transition-transform duration-500 ease-in-out
        /* AJUSTE AQUI: No mobile é preto sólido, no desktop é o teu estilo original */
        bg-[#0a0a0a] min-[1275px]:bg-black/40 min-[1275px]:backdrop-blur-xl min-[1275px]:w-[260px] min-[1275px]:border-r min-[1275px]:border-white/5 min-[1275px]:shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full min-[1275px]:translate-x-0'}
      `}>
        <div className="h-full flex flex-col w-full overflow-y-auto scrollbar-hide">
          <div className="pt-8 pl-8 mb-10 flex-shrink-0">
            <Link href="/"><img src="https://64.media.tumblr.com/9da1a428d3c7fa36b6e90894a1a3c580/2c4313bac1b49a85-fa/s250x400/da6efebedb12655095b0b9e0b58224525c0dfa96.pnj" alt="Logo" className="w-[105px] h-[37px] object-contain" /></Link>
          </div>

          <div className="px-6 mb-8 flex justify-center flex-shrink-0" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
            {status === "authenticated" ? <div className="w-full flex justify-center"><UserMenu /></div> : (
              <Link href="/auth/signin" className="w-full max-w-[200px] py-2.5 border border-white/30 text-white text-center rounded-full text-[10px] font-bold uppercase tracking-widest">Entrar</Link>
            )}
          </div>

          <ul className="flex-1 px-4 space-y-[4px]">
            {menuItems.map((item, idx) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={idx} className="w-full">
                  <div
                    onClick={() => item.isWorldTrigger ? setIsWorldOpen(true) : null}
                    className="cursor-pointer"
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => item.isWorldTrigger && e.preventDefault()}
                      className={`group flex items-center justify-between w-full px-3 py-[6px] rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center">
                        <div className="relative flex items-center justify-center w-[32px] h-[32px] mr-[14px]">
                          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.gradient} opacity-40 group-hover:opacity-100 transition-opacity`} style={{ padding: '1.5px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                          <Icon className="relative z-10 w-[18px] h-[18px] text-white/80 group-hover:text-white" strokeWidth={1.5} />
                        </div>
                        <span className="text-[13px] tracking-wide text-white/70 font-light group-hover:text-white">{item.label}</span>
                      </div>
                      {item.hasInfo && <Info className="w-4 h-4 text-white/40 group-hover:text-white" />}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ✅ OVERLAY DO "WORLD" (CLONE IMAGEM 2) */}
      <div className={`fixed inset-0 z-[300] bg-[#1a237e]/90 backdrop-blur-2xl transition-all duration-700 ease-in-out ${isWorldOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-105'}`}>
        
        {/* Botão Fechar */}
        <button onClick={() => setIsWorldOpen(false)} className="absolute top-8 right-8 z-[310] text-white/60 hover:text-white transition-colors">
          <X size={32} strokeWidth={1.5} />
        </button>

        {/* Grelha de Cards */}
        <div className="h-full w-full overflow-y-auto px-6 py-20 md:px-20">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {worldPractices.map((practice, i) => (
              <a 
                key={i} 
                href={practice.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform duration-500 block"
              >
                <img src={practice.img} alt={practice.title} className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                   <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg inline-flex items-center gap-2 border border-white/10">
                      <span className="text-[10px] md:text-[11px] text-white font-medium truncate uppercase tracking-tighter">
                        {practice.title}
                      </span>
                      <span className="text-white/60 text-xs">+</span>
                   </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Backdrop para fechar Sidebar */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="min-[1275px]:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" />}
    </>
  );
}