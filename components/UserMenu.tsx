"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from '@/components/MyLink';
import { 
  Settings, 
  LogOut, 
  ShoppingBag, 
  ChevronDown,
  Layout
} from "lucide-react";

export default function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false); // 👈 ESTADO PARA CONTROLAR ERROS NA IMAGEM
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟢 FUNÇÃO INTELIGENTE PARA CAPTURAR AS INICIAIS
  const getInitials = (fullName?: string | null) => {
    if (!fullName) return "U"; // Utilizador padrão
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    const firstLetter = parts[0].charAt(0);
    const lastLetter = parts[parts.length - 1].charAt(0);
    return (firstLetter + lastLetter).toUpperCase();
  };

  if (!session) return null;

  return (
    <div className="relative z-50" ref={menuRef}> 
      
      {/* Botão Gatilho (Avatar) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-all border border-transparent focus:outline-none"
      >
        {/* 👇 NOVO AVATAR COM FALLBACK PARA INICIAIS 👇 */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-[#3D81F1] flex items-center justify-center text-white text-[13px] font-bold tracking-wider shrink-0">
          {session.user?.image && !imageError ? (
            <img 
              src={session.user.image} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)} // Se o URL falhar, muda imediatamente para iniciais
            />
          ) : (
            getInitials(session.user?.name)
          )}
        </div>
        
        <ChevronDown size={14} className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mini-Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] overflow-hidden z-[9999] animate-in fade-in zoom-in-95 origin-top duration-200">
          
          {/* Cabeçalho do Menu (User Info) */}
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">A tua conta</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{session.user?.name}</p>
          </div>

          {/* Links do Menu */}
          <div className="p-2 flex flex-col">
            <MenuLink 
              href="/area-pessoal" 
              icon={<Layout size={16} />} 
              label="Área Pessoal" 
              onClick={() => setIsOpen(false)} 
            />
            {/* 👇 LINK ATUALIZADO PARA FLOR.D.LÓ 👇 */}
            <MenuLink 
              href="https://flordlo.pt" 
              icon={<ShoppingBag size={16} />} 
              label="Loja Flor.d.Ló" 
              onClick={() => setIsOpen(false)} 
            />
          </div>

          <div className="p-2 border-t border-slate-50">
            <MenuLink 
              href="/perfil" 
              icon={<Settings size={16} />} 
              label="Definições" 
              onClick={() => setIsOpen(false)} 
            />
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <LogOut size={16} />
              Terminar Sessão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, label, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group text-left"
    >
      <span className="text-slate-400 group-hover:text-[#3D81F1] transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}