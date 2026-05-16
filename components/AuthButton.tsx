"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { User, LogOut, LogIn } from "lucide-react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  // 1. Estado de carregamento (evita que o botão "salte")
  if (status === "loading") {
    return <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />;
  }

  // 2. Se o utilizador estiver LOGADO
  if (session?.user) {
    return (
      <div className="flex items-center gap-3 group">
        {/* Foto de Perfil */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#3D81F1] bg-white shadow-sm shrink-0">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt="Avatar"
              fill
              className="object-cover"
              unoptimized // Ajuda a carregar imagens externas sem erro de configuração
              referrerPolicy="no-referrer" // OBRIGATÓRIO para imagens do Google aparecerem
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <User size={18} className="text-slate-400" />
            </div>
          )}
        </div>
        
        {/* Nome e Botão Sair */}
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-black text-[#37374B] leading-tight truncate max-w-[80px]">
            {session.user.name?.split(' ')[0]}
          </span>
          <button 
            onClick={() => signOut()}
            className="text-[10px] text-red-400 font-bold hover:text-red-600 transition-colors flex items-center gap-1"
          >
            Sair <LogOut size={10} />
          </button>
        </div>
      </div>
    );
  }

  // 3. Se o utilizador estiver DESLOGADO
  return (
    <button
      onClick={() => signIn()}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D81F1] text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-md active:scale-95"
    >
      <LogIn size={16} />
      <span>Entrar</span>
    </button>
  );
}