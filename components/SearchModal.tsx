"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ShoppingBag, MapPin, FileText, Clock, Flower2, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from '@/components/MyLink';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: true,
  apiVersion: '2023-05-03',
});

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ ATUALIZADO: Incluído 'Presente'
const getContentTypeDetails = (type: string) => {
  switch (type) {
    case 'product': return { label: 'Produto', path: '/produto', icon: <ShoppingBag size={14} /> };
    case 'presente': return { label: 'Presente', path: '/produto', icon: <Gift size={14} /> }; // 👈 NOVO
    case 'event': return { label: 'Evento', path: '/eventos', icon: <MapPin size={14} /> };
    case 'post': return { label: 'Blog', path: '/blog', icon: <FileText size={14} /> };
    default: return { label: 'Arranjo', path: '/loja', icon: <Flower2 size={14} /> };
  }
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateLimitWait, setRateLimitWait] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const projectGradient = 'linear-gradient(135deg, #C67F8F 0%, #C37F8B 100%)';

  useEffect(() => {
    if (rateLimitWait !== null && rateLimitWait > 0) {
      const timer = setInterval(() => {
        setRateLimitWait((prev) => (prev && prev > 1 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimitWait]);

  const checkRateLimit = () => {
    const now = Date.now();
    const windowMs = 20 * 1000;
    const maxRequests = 5;

    let history = JSON.parse(localStorage.getItem('flordelo_search_limit') || '[]');
    history = history.filter((timestamp: number) => now - timestamp < windowMs);

    if (history.length >= maxRequests) {
      const oldestRequest = history[0];
      const waitTime = Math.ceil((oldestRequest + windowMs - now) / 1000);
      setRateLimitWait(waitTime);
      return false;
    }

    history.push(now);
    localStorage.setItem('flordelo_search_limit', JSON.stringify(history));
    return true;
  };

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setRateLimitWait(null);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    const searchSanity = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      if (!checkRateLimit()) return;

      setLoading(true);
      try {
        // ✅ ATUALIZADO: Busca incluíndo o tipo "presente"
        const groqQuery = `*[_type in ["product", "presente", "event", "post"] && [title, name] match $search] {
          _id, 
          "title": coalesce(title, name), 
          "slug": slug.current, 
          _type,
          subtitle
        }[0...10]`;
        
        const data = await client.fetch(groqQuery, { search: `${query}*` });
        setResults(data);
      } catch (error) {
        console.error("Erro Sanity:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchSanity, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-start justify-center pt-24 md:pt-32 px-6 bg-white/95 backdrop-blur-sm"
        >
          <AnimatePresence>
            {rateLimitWait !== null && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="bg-white border border-slate-100 p-8 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: '#C67F8F20', color: '#C67F8F' }}>
                    <Clock size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 font-serif">Pausa para Respirar</h3>
                  <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    Aguarde <span className="font-bold" style={{ color: '#C67F8F' }}>{rateLimitWait}s</span> para continuar a pesquisar.
                  </p>
                  <button
                    onClick={() => setRateLimitWait(null)}
                    className="w-full text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg"
                    style={{ background: projectGradient }}
                  >
                    Entendido
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-all"><X size={32} /></button>

          <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="w-full max-w-3xl">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2" size={28} style={{ color: '#C67F8F' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar arranjos, presentes, velas..."
                className="w-full bg-slate-50 border-b-2 border-slate-100 py-6 pl-16 pr-12 text-2xl text-slate-800 outline-none focus:border-[#C67F8F] transition-all placeholder:text-slate-300 font-light"
                disabled={rateLimitWait !== null}
              />
              {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin" size={24} style={{ color: '#C67F8F' }} />}
            </div>

            <div className="mt-8 max-h-[60vh] overflow-y-auto pr-2">
              {results.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {results.map((item) => {
                    const details = getContentTypeDetails(item._type);
                    return (
                      <Link
                        key={item._id}
                        href={`${details.path}/${item.slug}`}
                        onClick={onClose}
                        className="group flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xl font-medium text-slate-800 group-hover:text-[#C67F8F] transition-colors">{item.title}</span>
                          {item.subtitle && <span className="text-sm text-slate-400 line-clamp-1">{item.subtitle}</span>}
                        </div>
                        
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500">
                          {details.icon}
                          <span className="text-[10px] font-bold uppercase tracking-wider">{details.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : query.length >= 2 && !loading && (
                <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-slate-100">
                   <p className="text-slate-400 italic text-lg font-serif">Não encontrámos esse miminho...</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}