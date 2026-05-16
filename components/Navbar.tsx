"use client";

import React, { useState, useEffect } from 'react';
import { Mail, ChevronDown, Menu, X, Search } from "lucide-react";
import Link from '@/components/MyLink';
import { usePathname } from 'next/navigation';
//import { useSession } from "next-auth/react";
//import UserMenu from "./UserMenu";
import ProgressBar from './ProgressBar';
import SearchModal from './SearchModal';

// --- TIPAGENS ---
export type NavLink = {
  label: string;
  href: string;
  icon?: string;
};

// --- FUNÇÃO AUXILIAR PARA ÍCONES ---
const renderIcon = (iconName?: string) => {
  if (iconName === 'mail') return <Mail size={18} />;
  return null;
};

// --- COMPONENTES AUXILIARES ---
const Dropdown = ({ title, items = [] }: { title: string, items?: NavLink[] }) => {
  const [isMounted, setIsMounted] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="relative group z-[10020]"
      onMouseEnter={() => setIsMounted(true)} 
      onMouseLeave={() => setIsMounted(false)}
    >
      <button className="flex items-center gap-1 py-4 hover:text-[#C67F8F] transition-colors cursor-default">
        {title} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
      </button>
      
      {isMounted && (
        <div className="absolute top-full left-0 w-[240px] bg-white shadow-xl rounded-2xl flex flex-col py-3 z-50 border border-slate-100">
          {items.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href || "#"} 
              target={item.href?.startsWith('http') ? "_blank" : "_self"}
              className="px-5 py-2.5 text-[#37374B] hover:bg-slate-50 hover:text-[#C67F8F] text-[13px] font-medium transition-colors flex items-center gap-2"
            >
              {item.icon && <span className="text-[#C67F8F]">{renderIcon(item.icon)}</span>}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchBarMobile = ({ onFocus }: { onFocus: () => void }) => {
  return (
    <div className="relative w-full group mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#C67F8F] transition-colors" />
      </div>
      <input
        type="text"
        onClick={onFocus}
        placeholder="Pesquisar..."
        readOnly
        className="cursor-pointer block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#C67F8F] transition-all text-[#37374B]"
      />
    </div>
  );
};

// --- COMPONENTE PRINCIPAL NAVBAR ---
export default function Navbar({ initialMenuData = {} }: { initialMenuData?: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [safeData, setSafeData] = useState(initialMenuData);

  useEffect(() => {
    if (initialMenuData) setSafeData(initialMenuData);
  }, [initialMenuData]);

  const pathname = usePathname();
  //const { status } = useSession();

  const isPraticasPage = pathname?.startsWith("/praticas/");
  const isTransparent = isPraticasPage && !mobileMenuOpen;

  // 🎨 NOVO GRADIENTE: Rosa Seco
  const projectGradient = 'linear-gradient(135deg, #C67F8F 0%, #C37F8B 100%)';

  const ctaHref = safeData.ctaButton?.href || '#';
  const ctaLabel = safeData.ctaButton?.label || 'Botão CTA';

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 80);
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith("/cursos")) return null;

  return (
    <>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {!isPraticasPage && <div className="h-7 w-full shrink-0" aria-hidden="true" />}

      <nav className={`w-full px-6 md:px-12 fixed left-0 top-0 z-[100] transition-all duration-300 ${
        (isVisible || mobileMenuOpen) ? 'translate-y-0' : '-translate-y-full'
      } ${
        isTransparent ? 'bg-transparent shadow-none' : 'bg-white shadow-sm'
      }`}>
        <div className="max-w-[1200px] mx-auto flex justify-between items-center h-20 relative">
          
          <div className="flex items-center gap-10">
            {/* Logo Meditt */}
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <img 
                src="https://64.media.tumblr.com/9bfd5a9b6fcabd796b4679706eb94bdb/b7ada38ef8913aeb-1a/s250x400/9e8009abb454d4ed251ded0bba9c8645bf1277aa.pnj" 
                alt="Logo Meditt" 
                className="h-10 w-auto object-contain"
              />
            </Link>
            
            {/* Desktop Menu Dinâmico */}
            <div className="hidden lg:flex gap-6 text-sm font-bold text-[#37374B] items-center">
              {safeData.menuItems?.map((item: any, idx: number) => (
                item._type === 'navDropdown' ? (
                  <Dropdown key={idx} title={item.title} items={item.links} />
                ) : (
                  <Link 
                    key={idx} 
                    href={item.href || "#"} 
                    className="py-4 hover:text-[#C67F8F] transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {safeData.displaySearch !== false && (
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-[#37374B] hover:text-[#C67F8F] transition-colors">
                <Search size={22} />
              </button>
            )}

            {/* Botão CTA com o Novo Gradiente Rosa */}
            <button 
              onClick={() => window.location.href = ctaHref}
              className="hidden md:block text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-[#C67F8F]/30 hover:-translate-y-0.5 transition-all duration-300"
              style={{ background: projectGradient }}
            >
              {ctaLabel}
            </button>

           {/* <div className="flex items-center">
              {status === "authenticated" ? <UserMenu /> : (
                <Link href="/auth/signin" className="text-xs font-bold uppercase text-[#37374B] hover:text-[#C67F8F]">
                  Entrar
                </Link>
              )}
            </div> */}

            <button className="lg:hidden text-[#37374B]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dinâmico */}
        <div className={`lg:hidden absolute top-20 left-0 w-full h-[calc(100vh-80px)] bg-white z-40 overflow-y-auto transition-all ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {mobileMenuOpen && (
            <div className="p-6 flex flex-col gap-2">
              {safeData.displaySearch !== false && (
                <SearchBarMobile onFocus={() => { setMobileMenuOpen(false); setIsSearchOpen(true); }} />
              )}

              {safeData.menuItems?.map((item: any, idx: number) => (
                item._type === 'navDropdown' ? (
                  <div key={idx} className="border-b border-slate-100">
                    <button
                      onClick={() => setActiveSubmenu(activeSubmenu === idx ? null : idx)}
                      className="flex justify-between items-center w-full py-4 font-bold text-lg text-[#37374B]"
                    >
                      {item.title}
                      <ChevronDown size={18} className={`transition-transform ${activeSubmenu === idx ? 'rotate-180 text-[#C67F8F]' : ''}`} />
                    </button>
                    
                    <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${activeSubmenu === idx ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                      {item.links?.map((sub: any, subIdx: number) => (
                        <Link 
                          key={subIdx} 
                          href={sub.href || "#"} 
                          className="py-2.5 pl-4 text-slate-500 font-medium block"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link 
                    key={idx} 
                    href={item.href || "#"} 
                    className="py-4 border-b border-slate-100 font-bold text-lg text-[#37374B] block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}

              {/* CTA Mobile com Gradiente Rosa */}
              <Link 
                href={ctaHref} 
                className="text-white px-6 py-3 rounded-full text-center font-bold mt-6 shadow-md block"
                style={{ background: projectGradient }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {ctaLabel}
              </Link>          
            </div>
          )}
        </div>
        
        <ProgressBar />
      </nav>
    </> 
  );
}