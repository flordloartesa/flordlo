"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from '@/components/MyLink';
import { useRouter } from 'next/navigation';
import { useCart } from "@/app/context/CartContext";

import TestimonialsSlider from "@/components/TestimonialsSlider"; 
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Play, ChevronDown, CheckCircle2, X, ChevronLeft, ChevronRight, Share2, Gift, Mail, MessageCircle, Instagram, Send, Upload, Copy } from 'lucide-react';

const COURSE_ID = "af8222cb-5e3a-4cb7-8b83-f16423cdefc7";
const RESERVA_PRICE = 80;

// --- COMPONENTE DE OTIMIZAÇÃO DE IMAGENS (FALLBACK + EDGE PROTECTION) ---
const SafeImage = ({ src, alt, fallbackSrc = "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80", unoptimized = true, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt || "Imagem"}
      onError={() => setImgSrc(fallbackSrc)}
      unoptimized={unoptimized} // Evita requests massivos à API de otimização Edge do Next.js
    />
  );
};

// --- 1. DADOS ESTÁTICOS ---

const razoesParaParticipar = [
  { num: 1, title: "Perspectiva e Clareza", text: "A circularidade e a velocidade do quotidiano impedem olhar com perspectiva. Presos na repetição das tarefas e na tirania da urgência, perdemos a capacidade de observar, escutar e refletir sobre as experiências, decisões e valores." },
  { num: 2, title: "Conexão Autêntica", text: "Ansiamos por viver as nossas vidas com significado e objetivo, e por nos ligarmos autenticamente nas nossas relações e a nós próprios. No entanto, a ansiedade, a depressão, as dependências e a solidão atingiram níveis epidémicos." },
  { num: 3, title: "Contexto de Paragem", text: "Este retiro é uma óptima alternativa para promover um contexto onde podemos parar, acalmar e ver de novo de forma mais clara." },
  { num: 4, title: "Simplicidade ", text: "Aproximando-nos das coisas simples, largar por um fim de semana dos ritmos exigentes da cidade e cultivar uma abordagem à profundidade e à impermanência da vida." },
  { num: 5, title: "Paz e Insight", text: "Este retiro pode ajudar a gerir a agitação e proporcionar uma profunda sensação de paz e compreensão de como se encontrar com o mundo. Vamos combinar práticas de Meditação sentadas com alguma prática corporal e respiratória." },
  { num: 6, title: "Experiência Segura", text: "Tudo é organizado de modo a que possa ter uma experiênca íntima e segura numa atmosfera bela e tranquila, onde o apoio dos colegas e dos profissionais estará presente." }
];

const instrutores = [
  {
    nome: "José Martins",
    especialidade: "Soundhealing",
    foto: "https://64.media.tumblr.com/611c6a52c4712dca668bfc7e20ee0d0b/08f84f4762490085-98/s1280x1920/c6d08e58fb75c05415d060230ddf5bfbf284c2d9.jpg",
    descricao: "Terapeuta desde 2008 com base nos Seres de Cristal. Facilitou mais de 900 sessões grupais.",
    link: "https://meditt.space/teacher/jose-martins.php"
  },
  {
    nome: "Mário Rodrigues",
    especialidade: "Mindfulness",
    foto: "https://64.media.tumblr.com/18ca6a76d30f27f40c9e83467e8e1048/08f84f4762490085-56/s500x750/e2058d6255dae8171ce34e402a427e70e375cc6c.jpg",
    descricao: "Membro efetivo da OPP, com especialidade em Psicologia Clínica e da Saúde e especialidade avançada em Neuropsicologia.",
    link: "https://meditt.space/teacher/mario-rodrigues.php"
  },
  {
    nome: "Vítor Bertocchini, Ph.D.",
    especialidade: "Mindfulness",
    foto: "https://64.media.tumblr.com/8abca1194a74d248a354ae517ef32ce0/a99d19b78ae28da0-42/s1280x1920/4107e4fb7eed2223f1ba6890fdddb6c0fb6243be.pnj",
    descricao: "Membro efetivo da OPP, com especialidade em Psicologia Clínica e da Saúde. É instrutor qualificado pelo Mindfulness-Based Professional Training Institute (MBPTI)...",
    link: "https://meditt.space/teacher/vitor-bertocchini.php"
  },
  {
    nome: "Tatiana Bührnheim",
    especialidade: "Yoga",
    foto: "https://64.media.tumblr.com/9afc12c752adb2002ffe9cb057809d3a/52f74422ca5f5655-5c/s540x810/1badf1ce86958454ae462e8d94f45a01067ceea9.jpg",
    descricao: "Licenciada em Artes - Praticante de Yoga desde 2002 em Yoga Integral, Vinyasa e Yin Yoga, Yoga Kids.",
    link: "https://meditt.space/teacher/tatiana-bührnheim.php"
  }
];

const audienceList = [
    {
      title: "PROFISSIONAIS OCUPADOS",
      imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80",
      alt: "Profissional a trabalhar - Mindfulness"
    },
    {
      title: "PROFISSIONAIS DE SAÚDE",
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&h=200&q=80",
      alt: "Médica - Mindfulness"
    },
    {
      title: "EDUCADORES E PROFESSORES",
      imageUrl: "https://plus.unsplash.com/premium_photo-1683121152928-787ececd7359?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzc29yZXN8ZW58MHx8MHx8fDA%3D",
      alt: "Mindfulness"
    },
    {
      title: "PAIS E CUIDADORES",
      imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=200&h=200&q=80",
      alt: "Mindfulness"
    },
    {
      title: "QUEM PROCURA PAZ INTERIOR",
      imageUrl: "https://64.media.tumblr.com/8abca1194a74d248a354ae517ef32ce0/a99d19b78ae28da0-42/s1280x1920/4107e4fb7eed2223f1ba6890fdddb6c0fb6243be.pnj",
      alt: "Pessoa a meditar"
    },
    {
      title: "QUEM QUER GERIR A ANSIEDADE",
      imageUrl: "https://images.unsplash.com/photo-1713428856219-20e151269843?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNhbG0lMjBhbnhpZXR5fGVufDB8fDB8fHww",
      alt: "Pessoa relaxada - Mindfulness"
    }
  ];

// --- 2. COMPONENTES AUXILIARES ---

function EquipaSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' }, 
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <section className="py-24 reveal bg-[#F0DFD1]">
      <div className="w-full px-4 md:px-6 mx-auto max-w-[1200px]">
        <h2 className="text-4xl md:text-5xl font-normal text-center mb-16 font-exposure text-[#756E68]">
          Conheça a equipa
        </h2>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-6">
            {instrutores.map((membro, idx) => (
              <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6">
                <article className="bg-white p-10 rounded-2xl shadow-none border border-slate-50 flex flex-col items-center text-center h-full">
                  <div className="relative w-24 h-24 mb-6 rounded-full overflow-hidden border-2 border-[#F0DFD1] flex-shrink-0">
                    <SafeImage src={membro.foto} alt={membro.nome} fill className="object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#005C65] mb-2">{membro.nome}</h3>
                  <p className="text-[#756E68] italic mb-6 text-sm">{membro.especialidade}</p>
                  <p className="flex-grow text-black mb-8 leading-relaxed text-xs">{membro.descricao}</p>
                  <Link href={membro.link} target="_blank" className="mt-auto bg-[#01cac3] text-white px-8 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#00b2ac] transition-colors">
                    Ver mais
                  </Link>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 mt-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === selectedIndex 
                  ? "bg-[#005C65] w-8" 
                  : "bg-[#005C65]/30 w-2.5 hover:bg-[#005C65]/60"
              }`}
              aria-label={`Ir para o slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

const ReadMoreCard = ({ category, title, children }: { category: string, title: string, children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <article className="bg-inherit p-8 md:rounded-2xl flex flex-col w-full relative px-0 md:px-8 shadow-none border-none">
      <div className="text-[10px] font-bold tracking-widest text-[#01cac3] uppercase mb-2">{category}</div>
      <h2 className="text-2xl font-serif font-bold mb-4 text-[#333]">{title}</h2>
      <div className={`relative overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-[120px]'}`}>
        <div className="detail-card-text text-black">{children}</div>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-16 z-10" style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)' }} />
        )}
      </div>
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#01cac3] text-[10px] font-bold uppercase tracking-widest mt-6 text-left hover:text-black transition-colors w-fit">
        {isExpanded ? '↑ LER MENOS' : '↓ LER MAIS'}
      </button>
    </article>
  );
};

const VideoModal = ({ isOpen, onClose, videoId }: { isOpen: boolean; onClose: () => void; videoId: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-none">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"><X size={24} /></button>
        <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

const AccordionPrograma = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full flex flex-col items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-[#F0DFD1] text-black px-8 py-4 rounded-full font-bold shadow-none border border-slate-200 hover:bg-white transition-all uppercase tracking-widest text-xs" 
      >
        {isOpen ? 'Fechar Programa' : 'Ver o Programa Resumido'}
      </button>
      
      <div className={`overflow-hidden transition-all duration-700 ease-in-out w-full ${isOpen ? 'max-h-[2000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#FFFFFF] rounded-[25px] p-8 md:p-12 text-left section-text-custom mx-[4px] shadow-none border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div><h4 className="font-bold text-[#01cac3] mb-4">6ª Feira</h4><p>Chegar - depois das 18h<br/>• 20:00: Jantar<br/>• 21:00: Introdução<br/>• 22:30h: Descanso.</p></div>
            <div><h4 className="font-bold text-[#01cac3] mb-4">Sábado</h4><p>• 8:00h: Yoga orientada<br/>• 11:00h: Mindfulness<br/>• 18:00h: Concerto Som<br/>• 20:00h: Jantar</p></div>
            <div><h4 className="font-bold text-[#01cac3] mb-4">Domingo</h4><p>• 8:00: Yoga orientada<br/>• 12:30h: Almoço<br/>• 15:00h: Fecho e Perguntas</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (menuRef.current && !(menuRef.current as any).contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = (platform: string) => {
    const url = window.location.href; 
    const title = "Fim de semana para Regenerar: Mindfulness & Yoga"; 
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    const customMessage = "Sugiro, vivamente, este retiro! ";
    const encodedMessage = encodeURIComponent(customMessage);

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedMessage}${encodedUrl}`;
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
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false); 
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copiado para a área de transferência!');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex flex-col items-center font-sans" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-full mb-4 w-52 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <ul className="flex flex-col space-y-1">
            <li>
              <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-700 font-medium text-sm">
                <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.124.553 4.195 1.604 6.012L.182 23.497l5.602-1.468C7.57 23.018 9.764 23.57 12.03 23.57c6.649 0 12.032-5.383 12.032-12.032C24.062 5.383 18.68 0 12.031 0zm0 21.602c-1.895 0-3.753-.51-5.38-1.476l-.386-.228-3.993 1.047 1.066-3.894-.25-.398C2.083 15.068 1.542 13.09 1.542 11.03 1.542 5.253 6.254.542 12.03.542c5.776 0 10.488 4.711 10.488 10.488 0 5.776-4.712 10.488-10.488 10.488H12.03v.084z"/>
                </svg>
                Whatsapp
              </button>
            </li>
            <li>
              <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-700 font-medium text-sm">
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </li>
            <li>
              <button onClick={() => handleShare('x')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-700 font-medium text-sm">
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
                X
              </button>
            </li>
            <li>
              <button onClick={() => handleShare('telegram')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-700 font-medium text-sm">
                <svg className="w-5 h-5 text-[#229ED9]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </button>
            </li>
            <div className="h-px bg-gray-100 my-1 w-full"></div>
            <li>
              <button 
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-700 font-medium text-sm"
              >
                <Copy className="w-5 h-5 text-[#4B70F5]" strokeWidth={2} />
                Copy link
              </button>
            </li>
          </ul>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-center gap-x-2.5
          bg-gradient-to-r from-[#5B7BFE] to-[#7161F5] 
          text-white font-semibold text-lg
          px-10 py-4 
          rounded-full 
          shadow-[0_12px_24px_-8px_rgba(91,123_254,0.6)]
          hover:shadow-[0_16px_32px_-8px_rgba(91,123_254,0.7)]
          hover:-translate-y-0.5
          active:scale-[0.98] active:translate-y-0
          transition-all duration-300 ease-out
        "
      >
        <Upload className="w-5 h-5" strokeWidth={2.5} />
        <span>Partilhar com Amigos!</span>
      </button>
    </div>
  );
}

// --- 3. COMPONENTE PRINCIPAL ---

export default function RetiroMindfulnessYoga({ sanityData }: { sanityData: any }) {
  const [isSticky, setIsSticky] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false); 
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [serverReviews, setServerReviews] = useState(sanityData?.reviews || []);  
  
  const { addToCart } = useCart();
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((error) => {
        console.log("Autoplay bloqueado pelo browser:", error);
      });
    }
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsSticky(scrollY > 600);
          setShowBottomBar(scrollY > 1000); 
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Otimização: { passive: true } previne bloqueios da main thread durante o scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = { threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // Otimização: Parar de observar o elemento após ele ficar visível
          // Isto previne múltiplos cálculos no scroll posterior
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    const sections = document.querySelectorAll(".reveal");
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleGuaranteeSpot = (e: React.MouseEvent) => {
    e.preventDefault();
    
    addToCart({ 
      _id: sanityData?._id || COURSE_ID, 
      title: sanityData?.title || "O Meu 1º Retiro - Mindfulness + Yoga", 
      price: RESERVA_PRICE, 
      imageUrl: sanityData?.imageUrl || sanityData?.image || "https://64.media.tumblr.com/9afc12c752adb2002ffe9cb057809d3a/52f74422ca5f5655-5c/s540x810/1badf1ce86958454ae462e8d94f45a01067ceea9.jpg", 
      slug: sanityData?.slug?.current || sanityData?.slug || "retiro-mindfulness-yoga"
    });
    
    router.push('/checkout');
  };

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Retiro de Mindfulness e Yoga",
    "startDate": "2026-02-27T18:00",
    "location": { "@type": "Place", "name": "Barcelos" },
    "organizer": { "@type": "Organization", "name": "Meditt" }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto bg-white min-h-screen relative">
      <main className="font-sans text-slate-800 w-full">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
        
        <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoId="hm24vZzVluk" />

        <section className="hero-section-responsive relative w-full overflow-hidden flex flex-col justify-end reveal mt-6">
          <div className="absolute inset-0 z-0">
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              loop 
              playsInline 
              poster="https://64.media.tumblr.com/9afc12c752adb2002ffe9cb057809d3a/52f74422ca5f5655-5c/s540x810/1badf1ce86958454ae462e8d94f45a01067ceea9.jpg" 
              className="w-full h-full object-cover"
            >
              <source src="https://va.media.tumblr.com/tumblr_td380cFYse1vfm7m2.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#01cac3] from-50% via-[#01cac3]/90 via-65% to-transparent" />
          <div className="relative z-20 w-full px-0 text-center text-white pb-0 flex flex-col items-center justify-end h-full">
            <div className="w-full max-w-2xl mx-auto space-y-3 mb-[60px] md:mb-[100px] pt-[80px] md:pt-[200px]">
              
              <div className="flex flex-col items-center justify-center gap-2 mb-4 mt-[20%]">
                <button onClick={() => setIsVideoOpen(true)} className="group cursor-pointer transition-transform hover:scale-110 duration-300">
                  <div className="bg-white rounded-full p-5 shadow-none"><Play fill="#01cac3" className="text-[#01cac3] w-6 h-6 ml-1" /></div>
                </button>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/90">Ver Vídeo</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tighter drop-shadow-md px-4">
                {sanityData?.title || "Retiro De Mindfulness + Yoga + Concerto Meditativo"}
              </h1>
              <div className="py-1"><h2 className="text-base md:text-lg font-light uppercase tracking-widest border-b border-white/40 pb-1 inline-block">O Meu Primeiro Retiro</h2></div>
              <p className="text-sm font-light max-w-lg mx-auto opacity-95 drop-shadow-md subtitulos px-4">Fim de semana para relaxar e rejuvenescer o seu corpo, mente e espírito</p>
              
              <div className="space-y-1 pt-1">
                {(sanityData?.heroDate || sanityData?.heroLocation || sanityData?.heroSpotsText) && (
                  <p className="text-[14px] font-bold text-white drop-shadow-md subtitulos">
                    {/* Exibição dinâmica: Data | Local */}
                    {sanityData?.heroDate} {sanityData?.heroDate && sanityData?.heroLocation ? '|' : ''} {sanityData?.heroLocation}
                    {sanityData?.heroSpotsText && (
                      <span className="text-[10px] font-normal opacity-90 ml-1 bg-black/20 px-2 py-0.5 rounded-full">
                        ({sanityData?.heroSpotsText})
                      </span>
                    )}
                  </p>
                )}
                
                {sanityData?.heroSeeAlsoText && sanityData?.heroSeeAlsoLink && (
                  <Link href={sanityData?.heroSeeAlsoLink} className="inline-block mt-2">
                    <p className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/40 text-white text-[12px] font-bold rounded-full backdrop-blur-sm transition-all cursor-pointer subtitulos">
                    👉 {sanityData?.heroSeeAlsoText}
                    </p>
                  </Link>
                )}
              </div>
              
              <div className="pt-2">
                <Link href="/inscricao" className="inline-block bg-[#ff4d6d] hover:bg-[#e03e5d] text-white font-bold text-sm py-4 px-10 rounded-full shadow-none uppercase tracking-widest transition-all hover:scale-105">Inscrever-me</Link>
                <p className="text-[10px] mt-2 opacity-70 subtitulos">Escolher o evento - O Meu 1º Retiro</p>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-white/20 pt-8 pb-12 bg-inherit">
                <div className="flex flex-col items-center group cursor-default">
                  <div className="mb-3 h-10 w-10 relative">
                    <SafeImage src="https://64.media.tumblr.com/6d340e5aa6028b02b43d09cdb214d548/c1caf3090a9eb65b-8a/s75x75_c1/44bccbb3bc60a44cdadaaf3394bb78de34bdd20d.pnj" alt="Imersão" fill className="object-contain brightness-0 invert" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Imersão</h3>
                  <p className="text-[10px] leading-tight opacity-100 font-bold px-4 max-w-xs mx-auto subtitulos">Mindfulness + Yoga + Taças Cristal</p>
                </div>
                <div className="flex flex-col items-center group cursor-default">
                  <div className="mb-3 h-10 w-10 relative">
                    <SafeImage src="https://64.media.tumblr.com/ed680ef3e192166aec20e5208ae8dbbb/c1caf3090a9eb65b-62/s75x75_c1/fcc56381a676e11f6fbc6b7388edab8ccd895c30.pnj" alt="Comunidade" fill className="object-contain brightness-0 invert" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Comunidade</h3>
                  <p className="text-[10px] leading-tight opacity-100 font-bold px-4 max-w-xs mx-auto subtitulos">Aumenta a (inter)conexão e reduz o stress</p>
                </div>
                <div className="flex flex-col items-center group cursor-default">
                  <div className="mb-3 h-10 w-10 relative">
                    <SafeImage src="https://64.media.tumblr.com/206cedb88b5663f0fe8a0c13ed30ee59/c1caf3090a9eb65b-8e/s75x75_c1/faa2a238996fec49b327515002845987309ae453.pnj" alt="Banhos" fill className="object-contain brightness-0 invert" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Banhos de Floresta</h3>
                  <p className="text-[10px] leading-tight opacity-100 font-bold px-4 max-w-xs mx-auto subtitulos">Tranquilidade + Shinrin-Yoku</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white overflow-hidden border-b border-slate-100 mb-[10px] reveal">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(3)].map((_, i) => (
              <React.Fragment key={i}>
                {[ "https://64.media.tumblr.com/9afc12c752adb2002ffe9cb057809d3a/52f74422ca5f5655-5c/s540x810/1badf1ce86958454ae462e8d94f45a01067ceea9.jpg", "https://64.media.tumblr.com/9b5d3af893d0ee3b51e5f7d2300067ff/52f74422ca5f5655-d2/s540x810/0d99a94a5a6700eac61b4df1d746d9f703b71791.jpg", "https://66.media.tumblr.com/5f6396044f5171aebd7c9b0617db0a48/tumblr_pgczl0ZU7x1vfm7m2o2_540.jpg", "https://66.media.tumblr.com/3f1b49dcce71290053bdcb08c7cc29c0/tumblr_pgczl0ZU7x1vfm7m2o3_540.jpg", "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVvcGxlJTIwbmF0dXJlfGVufDB8fDB8fHww", "https://64.media.tumblr.com/bcca8a9e75d5ac38c08466ba64876c20/e802edbb1514103b-3b/s1280x1920/57a70a2e3e7a4c07e113489c09d5ab2399599e3a.jpg" ].map((url, idx) => (
                  <div key={`${i}-${idx}`} className="relative w-[350px] h-[250px] flex-shrink-0 mr-[2px]">
                    <SafeImage src={url} alt={`Galeria`} fill className="object-cover rounded-none" />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="reveal">
          <TestimonialsSlider 
           courseId={sanityData?._id}  
           initialReviews={sanityData?.reviews} 
          />
        </section>

        <section className="reveal w-full px-0 mb-20 -mt-20">
            <div className="w-full max-w-3xl mx-auto text-center pt-10 border-t border-slate-100 px-4 lg:px-0">
                     <h2 className="text-2xl font-bold text-[#756E68] mb-2 font-sans">Mindfulness é melhor com Amigo/as</h2>
                     <h4 className="text-[17px] font-normal text-[#A1A1A1] mb-8 font-sans">Convida um/a amigo/a</h4>
                     <div className="flex justify-center w-full pb-10">
                       <ShareButton />
                     </div>
                   </div>
        </section>

        <section className="py-24 px-0 reveal bg-[#F7FFFF]">
          <div className="max-w-[1750px] mx-auto text-center w-full">
            <h2 className="text-4xl md:text-5xl font-serif text-[#756E68] mb-16 tracking-tight px-6">Porquê participar neste Retiro?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1100px] mx-auto px-4">
              {razoesParaParticipar.map((razao) => (
                <div key={razao.num} className="relative w-full bg-white p-8 md:p-12 rounded-[32px] shadow-none border border-gray-100 overflow-hidden flex flex-col justify-center min-h-[220px] text-left">
                  <span className="absolute right-[-20px] bottom-[-10px] md:bottom-[-60px] text-[200px] md:text-[320px] font-black text-[indigo]/[0.04] select-none leading-none z-0 pointer-events-none">
                    {razao.num}
                  </span>
                  <div className="relative z-10 max-w-[95%]">
                    <h3 className="text-[20px] md:text-[24px] font-bold text-[#37374B] mb-4 leading-tight">{razao.title}</h3>
                    <p className="text-[13px] md:text-[14px] leading-[22px] text-[#47374B]/90 font-normal">{razao.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

    <section className="py-16 px-0 md:px-8">
      <div className="max-w-[1300px] mx-auto bg-[#F8F7F4] rounded-[2rem] py-16 px-6 md:px-12 lg:px-20">
        
        <h2 className="text-3xl md:text-[22px] lg:text-[22px] font-serif italic text-center text-slate-800 mb-14">
      Este retiro é para...
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audienceList.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center bg-white rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden rounded-xl relative">
                <SafeImage 
                  src={item.imageUrl} 
                  alt={item.alt}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="ml-4 flex-1">
                <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-900 leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>

        <section className="py-20 mb-[10px] reveal" style={{ background:"#F7FFFF", maxWidth: '1450px', margin: '0 auto' }}>
          <div className="w-full px-[10px] lg:px-0">
            <h2 className="text-4xl md:text-5xl font-normal text-center mb-16 font-exposure px-6" style={{ color: '#000000' }}>Informações em Detalhe</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1100px] mx-auto items-start w-full">
              <div className="flex flex-col gap-8 w-full">
                
                <div className="bg-[#ffffff] rounded-[20px] overflow-hidden px-[20px] shadow-none">
                  <ReadMoreCard category="Mindfulness" title="O que são?">
                    <p className="mb-4"><strong>Mindfulness</strong> é um estado de atenção ao momento presente.</p>
                    <p className="mb-4">A prática tem sido amplamente utilizada no mundo empresarial e educação.</p>

                    <p>Mindfulness, ou Atenção Plena, é um estado de atenção ao momento presente que pode ajudá-lo a viver com mais tranquilidade, e/ou com mais consciência, concentração e com mais saúde. Tem resultados cientificamente comprovados em áreas como a redução de stress, da ansiedade, da irritabilidade e da agressividade. Tem o potencial para ajudar a encontrar mais serenidade, tranquilidade e paz no seu dia a dia. A prática de Mindfulness & Yoga tem sido também amplamente utilizada no mundo empresarial, saúde e educação para melhorar a atenção e o bem-estar geral. Embora com fortes bases budistas, Mindfulness não depende de qualquer religião, contexto cultural ou sistema de crenças, podendo ser completamente secular.</p>

                    <p className="mt-2"><strong>Yoga</strong></p>
                    <p>é também uma prática de integração "mente-corpo" com uma história de mais de 3.000 anos na filosofia Indiana. Vários estilos de yoga combinam posturas físicas, técnicas de respiração e meditação e relaxamento.</p>
                  </ReadMoreCard>
                </div>
                
            <div className="bg-[#ffffff] rounded-[20px] overflow-hidden px-[20px] shadow-none">
              <ReadMoreCard category="Mindfulness & Yoga" title="Sobre o Retiro">
                <p className="mb-6 detail-card-text">
                  Um retiro meditativo é uma aventura pessoal. É um pequeno investimento de tempo que tem o potencial para afetar o resto da sua vida. É um espaço para silenciar o ruído e as distrações e ficar cara-a-cara consigo mesmo, criando-se a oportunidade para iniciar uma nova direção. Se procura um bom retorno do seu investimento, então a meditação é a solução perfeita. “Não faz nada” e é recompensado(a) com amplos benefícios. Então, imagine que recompensas podem advir não de uma sessão de meditação, mas de um período de tempo onde a prática meditativa é o foco principal da sua vida. Se o seu quotidiano é agitado/desconfortável ou sente que a vida tem algo mais a oferecer, então, um retiro de meditação pode ser algo a considerar.
                </p>

                <div className="font-bold text-[11px] mt-8 mb-4 text-slate-900 uppercase tracking-widest">
                  TERÁ ACESSO A:
                </div>

                <ul className="space-y-0 list-none border-t border-slate-100">
                  {[
                    "Compreender os principais conceitos e os benefícios da abordagem mindfulness;",
                    "Familiarizar-se com as principais práticas de mindfulness;",
                    "Aplicar mindfulness na sua rotina diária.",
                    "ter a oportunida de aprender e praticar yoga",
                    "Intercalar a prática de yoga com a prática de mindfulness."
                  ].map((item, i) => (
                    <li key={i} className="py-4 border-b border-slate-100 flex gap-3 text-[13px] leading-relaxed">
                      <span className="font-bold text-[#01cac3] min-w-[18px]">{i + 1}.</span>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </ReadMoreCard>
            </div>
            </div>

              <div className="flex flex-col gap-8 w-full">
                <div className="bg-[#ffffff] rounded-[20px] overflow-hidden px-[20px] shadow-none">
                  <ReadMoreCard category="Benefícios" title="Ciência">
                    <blockquote className="border-l-4 border-[#F0DFD1] pl-4 italic mb-4">Estudos mostram que mindfulness afeta a química cerebral.</blockquote>

                    <p>"Numerosos estudos científicos têm demonstrado que mindfulness e yoga trazem enormes benefícios para a sua saúde, afectando positivamente a química cerebral e corporal, pressão arterial e reduzindo a produção das "hormonas do stress". A maioria das pessoas ficaria radiante em possuir ferramentas que lhes permitam gerir dos seus níveis de stress, não?
Um retiro comtemplativo pode ser o início deste processo. E tudo como resultado de “não fazer nada”!</p>
                  </ReadMoreCard>
                </div>

          <div className="bg-[#ffffff] rounded-[20px] overflow-hidden px-[20px] shadow-none">
            <ReadMoreCard category="FAQS" title="Local">
              <div className="text-[#4a4a4a] text-[12px] leading-relaxed pb-4">
                <p className="text-sm text-slate-500 mb-8">- Barcelos, Portugal</p>

                <h3 className="font-bold text-lg text-[#333333] mt-6 mb-3">Vou de comboio</h3>
                <p className="mb-4">. Quais são as minhas opções e o que recomendamos?</p>
                
                <p className="font-bold uppercase mb-2">Distância da estação de Barcelos ao Centro</p>
                <p className="mb-4">Poderá apanhar o comboio intercidades e sair na Estação de Barcelos.</p>
                
                <p className="font-bold mb-6">Por diversas razões, procuramos agregar os participantes interessados em partilhar boleias e custos.</p>

                <h3 className="font-bold text-lg text-[#333333] mt-8 mb-3">A que horas devo chegar? Quando é que vamos terminar?</h3>
                <p className="mb-6">Vamos dar início à entrada para o retiro pelas 18.30 no 1º dia. Solicita-se que procure chegar antes para finalizar a sua inscrição, instalar-se de forma tranquila. Está planeado terminar o retiro pelas 16h no último dia, por isso planeie a sua viagem adequadamente. Por vezes surgem situações em que os participantes têm que deixar o retiro antes do meio-dia, no último dia, mas solicitamos, se possível, que tal não aconteça.</p>

                <h3 className="font-bold text-lg text-[#333333] mt-8 mb-3">Existe internet wireless e rede de telemóvel?</h3>
                <p className="mb-6">Existe cobertura de rede de telemóvel com boas condições de recepção e pode esperar obter serviço de internet sem fios razoavelmente consistente. Contudo, dada a natureza do encontro haverá poucas oportunidades para o seu uso.</p>

                <h3 className="font-bold text-lg text-[#333333] mt-8 mb-3">É possível ficar noites extra no centro ou chegar um ou dois dias mais cedo?</h3>
                <p className="mb-6">Sim, poderá ser possível, mas carece de reserva antecipada.</p>

                <h3 className="font-bold text-lg text-[#333333] mt-8 mb-3">O que preciso levar?</h3>
                <p className="mb-6">Se for possível, por favor, traga uma almofada de meditação (zafu) e um tapete de yoga. Teremos bastante material disponível, mas talvez não o suficiente para ir de encontro a todas as necessidades, por isso, se não for inconveniente, por favor, considere fazê-lo. É sempre aconselhável verificar a previsão do tempo antes de viajar, para ajudar na escolha de roupas adequadas.</p>

                <h3 className="font-bold text-lg text-[#333333] mt-8 mb-3">O que devo esperar em relação às condições onde decorre o Retiro?</h3>
                <p className="mb-6">Este encontro decorre num formato de retiro, o que significa que há bastante prática de meditação incluída. O local facilita muito este formato; iremos estar reunidos, comer e aprender, conviver e dormir numa área relativamente isolada, no entanto perto da cidade e com óptimos acessos. Procuramos que este período seja relativamente calmo e isolado. Os quartos são limpos e confortáveis, iguais aos que se encontra num bom hotel. Têm a possibilidade de escolher quarto individual (WC privativo) ou duplo. Importante reservarem o v/ lugar o mais cedo possível.</p>

                <h3 className="font-bold text-lg text-[#333333] mt-8 mb-3">E se eu necessitar de algumas adaptações especiais ou restrições alimentares?</h3>
                <p className="mb-2">Se existir qualquer alimento adicional ou preocupações médicas que deva mencionar, por favor, avise-nos com antecedência para que possamos ajudá-lo.</p>
              </div>
            </ReadMoreCard>
          </div>

              </div>
            </div>
            <div className="mt-20 max-w-[800px] mx-auto text-center px-6"><AccordionPrograma /></div>
          </div>
        </section>

        {/* EQUIPA */}
        <EquipaSlider />

        {/* INVESTIMENTO */}
        <section id="precos" className="py-24 mb-[10px] reveal bg-[#FDFFDD]">
          <div className="w-full px-0 text-center mx-auto">
            <h2 className="text-3xl md:text-6xl font-black mb-12 uppercase tracking-[0.2em] text-[#444]">Investimento</h2>
            <div className="flex flex-wrap justify-center gap-6 max-w-[1100px] mx-auto w-full px-1">
              <div className="investment-card border-2 border-[#EAF475] shadow-none w-full md:w-auto">
                <div className="text-2xl font-black mb-4">A. 310 a 320</div>
                <div className="text-[12px] opacity-80 uppercase tracking-widest">(+ disponibilidade)</div>
              </div>
              <div className="investment-card border-2 border-[#E1F0EE] shadow-none w-full md:w-auto">
                <div className="text-2xl font-black mb-4">B. 290 a 300</div>
                <div className="text-[12px] opacity-80 uppercase tracking-widest">(- disponibilidade)</div>
              </div>
            </div>
            <div className="mt-20 px-6">
              <Link href="/inscricao" className="inline-block bg-[#ff4d6d] text-white font-bold py-5 px-16 rounded-full shadow-none uppercase tracking-widest text-sm transition-all hover:scale-105">INSCRIÇÃO</Link>
            </div>
          </div>
        </section>

        <section className="py-20 reveal bg-white -mb-[70px]">
          <div className="w-full px-0 max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-start w-full">
              <div className="bg-inherit p-8 md:rounded-[30px] border border-slate-100 px-6">
                <h3 className="text-2xl font-serif font-bold text-[#005C65] mb-6">Notas Importantes</h3>
                <ul className="space-y-4 detail-card-text text-slate-700 list-disc pl-4">
                  <li>O retiro decorrerá com um mínimo e máximo de participantes;</li>
                  <li>No formulário de inscrição escolher o Evento – <strong>O Meu 1º Retiro</strong>;</li>
                  <li>Se tem interesse real neste evento não deixe a sua inscrição para próximo da data de início, pois além do valor ser mais elevado pode também colocar em risco a realização do evento;</li>
                  <li>Em caso de cancelamento até 8 dias antes da data de início do curso devolvemos 100% do sinal. Após este prazo não nos é possível devolver o sinal;</li>
                </ul>
              </div>

              <div className="bg-inherit p-8 md:rounded-[30px] border border-[#E1F0EE] px-6">
                <h4 className="font-bold text-[#005C65] mb-2 text-xs uppercase tracking-widest">Processamento da Inscrição</h4>
                <p className="detail-card-text text-[#005C65]/80">Ao preencher o seu formulário de inscrição receberá um email com informações adicionais;
Caso encontre alguma dificuldade no preenchimento de todos os campos sugerimos utilizar um browser modermo, como o Firefox ou o Chrome (sem certos addons ou plugins ativados) ou contacte-nos.</p>
              </div>


              <div className="bg-inherit p-8 md:rounded-[30px] border border-[#E1F0EE] px-6">
                <h4 className="font-bold text-[#005C65] mb-2 text-xs uppercase tracking-widest">Confidencialidade</h4>
                <p className="detail-card-text text-[#005C65]/80">Garantimos a total confidencialidade dos dados pessoais fornecidos.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="reveal w-full px-0 mb-20 -mt-20">
            <div className="w-full max-w-3xl mx-auto text-center pt-10 border-t border-slate-100 px-4 lg:px-0">
                     <h2 className="text-2xl font-bold text-[#756E68] mb-2 font-sans">Mindfulness é melhor com Amigo/as</h2>
                     <h4 className="text-[17px] font-normal text-[#A1A1A1] mb-8 font-sans">Convida um/a amigo/a</h4>
                     <div className="flex justify-center w-full pb-10">
                       <ShareButton />
                     </div>
                   </div>
        </section>

        <div className={`fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 p-3 md:p-4 transition-transform duration-500 ease-in-out shadow-[0_-10px_30px_rgba(0,0,0,0.08)] ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
            
            <div className="flex flex-col text-left w-full md:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#01cac3]">Reserva o teu lugar</span>
              <h3 className="text-sm md:text-base font-bold text-slate-800 truncate w-full md:max-w-md">
                {sanityData?.title || "Retiro De Mindfulness + Yoga"}
              </h3>
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8">
              <div className="text-left md:text-right">
                <span className="block text-[9px] md:text-[10px] text-slate-400 uppercase font-bold">Valor Reserva</span>
                <span className="text-lg md:text-xl font-black text-slate-900 leading-none">{RESERVA_PRICE}€</span>
              </div>
              
              <button 
                onClick={handleGuaranteeSpot}
                className="bg-[#ff4d6d] hover:bg-[#e03e5d] text-white font-black text-[11px] md:text-xs py-2.5 md:py-3 px-6 md:px-10 rounded-full uppercase tracking-widest transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Garantir Vaga
              </button>
            </div>

          </div>
        </div>

        <style jsx global>{`
          .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); will-change: transform, opacity; }
          .reveal.is-visible { opacity: 1; transform: translateY(0); }
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { display: flex; width: fit-content; animation: marquee 80s linear infinite; }
          .section-text-custom, .razao-card-custom, .detail-card-text { font-family: 'Maax', sans-serif !important; font-size: 12px !important; line-height: 20px !important; color: #000000 !important; }
          .font-exposure { font-family: 'Exposurevar', serif; }
          .subtitulos { color: #ffffff !important; }
          .investment-card { flex: 1; min-width: 280px; padding: 60px 30px; border-radius: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #005C65; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hero-section-responsive { height: 130vh; min-height: 130vh; }
          @media (min-width: 1024px) { .hero-section-responsive { height: 90vh; min-height: 800px; } }
          @media (max-width: 768px) { .w-full { width: 100% !important; } .px-0 { padding-left: 0px !important; padding-right: 0px !important; } }
        `}</style>
      </main>
    </div>
  );
}