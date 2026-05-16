'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Upload, Instagram, Send } from 'lucide-react'; // Ícones adicionais

export default function ShareButton({ title, message }: { title?: string, message?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = (platform: string) => {
    const url = window.location.href; 
    const shareTitle = title || "Flor de Ló - Decoração Floral"; 
    const customMessage = message || "Sugiro vivamente espreitar este trabalho lindo!"; 
    
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedMessage = encodeURIComponent(customMessage);

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedMessage}%20${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
        break;
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedMessage}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedMessage}`;
        break;
      case 'instagram':
        // Instagram não tem URL de partilha direta. Copiamos o link para facilitar.
        handleCopyLink();
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false); 
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copiado! Agora é só colar no Instagram ou onde desejar.');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex flex-col items-center font-sans z-50" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-full mb-4 w-52 bg-white rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <ul className="flex flex-col space-y-1">
            {/* WhatsApp */}
            <li>
              <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-700 font-medium text-sm">
                <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.124.553 4.195 1.604 6.012L.182 23.497l5.602-1.468C7.57 23.018 9.764 23.57 12.03 23.57c6.649 0 12.032-5.383 12.032-12.032C24.062 5.383 18.68 0 12.031 0zm0 21.602c-1.895 0-3.753-.51-5.38-1.476l-.386-.228-3.993 1.047 1.066-3.894-.25-.398C2.083 15.068 1.542 13.09 1.542 11.03 1.542 5.253 6.254.542 12.03.542c5.776 0 10.488 4.711 10.488 10.488 0 5.776-4.712 10.488-10.488 10.488H12.03v.084z"/></svg>
                WhatsApp
              </button>
            </li>

            {/* Telegram */}
            <li>
              <button onClick={() => handleShare('telegram')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-700 font-medium text-sm">
                <Send className="w-5 h-5 text-[#229ED9]" fill="currentColor" stroke="none" />
                Telegram
              </button>
            </li>

            {/* Facebook */}
            <li>
              <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-700 font-medium text-sm">
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </li>

            {/* Instagram */}
            <li>
              <button onClick={() => handleShare('instagram')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-700 font-medium text-sm">
                <Instagram className="w-5 h-5 text-[#E4405F]" />
                Instagram
              </button>
            </li>

            {/* X (Twitter) */}
            <li>
              <button onClick={() => handleShare('x')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-700 font-medium text-sm">
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                X
              </button>
            </li>

            <div className="h-px bg-slate-100 my-1 w-full"></div>

            {/* Copiar Link */}
            <li>
              <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-700 font-medium text-sm">
                <Copy className="w-5 h-5 text-slate-500" strokeWidth={2} />
                Copiar link
              </button>
            </li>
          </ul>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-x-2.5 bg-[#9d6b73] text-white font-serif italic text-lg px-8 py-3 rounded-sm shadow-md hover:bg-slate-800 transition-colors duration-300 w-full md:w-auto"
      >
        <Upload className="w-5 h-5" strokeWidth={2} />
        <span>Partilhar com amiga(o)s</span>
      </button>
    </div>
  );
}