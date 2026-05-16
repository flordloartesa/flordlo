"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from '@/components/MyLink';
import { useRouter } from 'next/navigation';
import { useCart } from "@/app/context/CartContext";

import TestimonialsSlider5DayRetreat from "@/components/TestimonialsSlider5DayRetreat"; 
import TopicsSlider5DayRetreat from "@/components/TopicsSlider5DayRetreat";
import StudiesSlider5DayRetreat from "@/components/StudiesSlider5DayRetreat";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Play, X, Share2, Gift, Mail, MessageCircle, Instagram, Facebook, Telegram, Send, Upload, Copy } from 'lucide-react';

const COURSE_ID = "af8222cb-5e3a-4cb7-8b83-f16423cdefc7";
const RESERVA_PRICE = 160;

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

const razoesParaParticipar = [
  { num: 1, bg: "#EAF475", text: "Life is defined by impermanence — nothing remains static, and change is the only constant. Yet, our deeply ingrained habits often act as anchors." },
  { num: 2, bg: "#F0DFD1", text: "The first few days will focus on Mindfulness, creating an embodied foundation for developing practices that strengthen the natural heart qualities." },
  { num: 3, bg: "#FFFFFF", text: "Revitalization in times of challenge: Receive a spiritual boost amidst life's struggles, replenishing your heart and mind with friendliness and joy." },
  { num: 4, bg: "#ACF7EB", text: "Dialogue and connection: Participate in meaningful discussions that deepen your understanding of Mindfulness and Brahmavihāras." },
  { num: 5, bg: "transparent", border: "1px solid #FFFFFF", text: "Join both traditional and contemporary teachings of mindfulness and positive emotions in a beautiful natural environment." },
  { num: 6, bg: "#EAF475", text: "Everything is organized so you can have an intimate and safe experience in a beautiful and peaceful atmosphere." }
];

const instrutores = [
  {
    nome: "Adrian Karunavira",
    especialidade: "Mindfulness Teacher | Senior Trainer & Mentor at CMRP Bangor University and the Mindfulness Network",
    foto: "https://lh3.googleusercontent.com/-ekRpzzInDxs/WvIBoN9zPUI/AAAAAAAAAFw/5-H5z4QA1c0OhjHF1dQqZPQCu4caPAnqgCLcBGAs/s1600/karunavira-perfil-fotos-133x133.png",
    descricao: "Karunavira is one of the most experienced and knowledgeable instructor that you can find internationally and exceptionally skilled at creating a safe learning environment, supportive and deeply engaging, allowing participants to seek, explore and inquire.",
    link: "https://training.mindfulness-network.org/our-trainers/karunavira/"
  }
];

const ReadMoreCard = ({ category, title, children }: { category: string, title: string, children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <article className="bg-white py-8 px-0 lg:p-8 rounded-none lg:rounded-2xl shadow-sm border border-slate-100 flex flex-col w-full relative">
      <div className="text-[10px] font-bold tracking-widest text-[#01cac3] uppercase mb-2 px-4 lg:px-0">{category}</div>
      <h2 className="text-2xl font-serif font-bold mb-4 text-[#333] px-4 lg:px-0">{title}</h2>
      <div className={`relative overflow-hidden transition-all duration-500 ease-in-out px-4 lg:px-0 ${isExpanded ? 'max-h-[2000px]' : 'max-h-[120px]'}`}>
        <div className="detail-card-text text-black">{children}</div>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-16 z-10" style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)' }} />
        )}
      </div>
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#01cac3] text-[10px] font-bold uppercase tracking-widest mt-6 text-left hover:text-black transition-colors w-fit px-4 lg:px-0">
        {isExpanded ? '↑ SHOW LESS' : '↓ READ MORE'}
      </button>
    </article>
  );
};

const VideoModal = ({ isOpen, onClose, videoId }: { isOpen: boolean; onClose: () => void; videoId: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-none md:rounded-2xl overflow-hidden shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"><X size={24} /></button>
        <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
      </div>
    </div>
  );
};

  const audienceList = [
    {
      title: "For those seeking a life of greater fulfillment",
      imageUrl: "https://images.unsplash.com/photo-1536551739350-d473d0f5d66a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Mindfulness"
    },
    {
      title: "HIGH STRESS PROFESSIONALS",
      imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80",
      alt: "Profissional a trabalhar - Mindfulness"
    },
    {
      title: "HEALTH PROFISSIONALS",
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&h=200&q=80",
      alt: "Médica - Mindfulness"
    },
    {
      title: "TEACHERS AND EDUCATORS",
      imageUrl: "https://plus.unsplash.com/premium_photo-1683121152928-787ececd7359?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzc29yZXN8ZW58MHx8MHx8fDA%3D",
      alt: "Mindfulness"
    },
    {
      title: "WHO SEEKS INNER PEACE",
      imageUrl: "https://64.media.tumblr.com/8abca1194a74d248a354ae517ef32ce0/a99d19b78ae28da0-42/s1280x1920/4107e4fb7eed2223f1ba6890fdddb6c0fb6243be.pnj",
      alt: "Pessoa a meditar"
    },
    {
      title: "WHO WANTS TO MANAGE STRESS AND ANXIETY ",
      imageUrl: "https://images.unsplash.com/photo-1713428856219-20e151269843?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNhbG0lMjBhbnhpZXR5fGVufDB8fDB8fHww",
      alt: "Pessoa relaxada - Mindfulness"
    }
  ];

const AccordionProgramDayRetreat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full px-0 lg:px-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-[#005c65] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-white hover:text-black transition-all uppercase tracking-widest text-xs"
      >
        {isOpen ? 'Close Program' : 'Click to see Summary Program'}
      </button>
      
      <div className={`overflow-hidden transition-all duration-700 ease-in-out w-full ${isOpen ? 'max-h-[3000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#f1f1f1] rounded-none lg:rounded-[25px] py-8 px-0 lg:p-12 text-left section-text-custom w-full">
          
          <div className="mb-10 text-center md:text-left border-b border-slate-300 pb-6 px-4 lg:px-0">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-[#005C65] mb-2">
              A 5-Day Mindfulness and Chi Kung Retreat – with Silence
            </h3>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">
              ‘Building the Foundations of Mindfulness & The 4 Immeasurables’
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full px-4 lg:px-0">
            
            <div>
              <h4 className="font-bold text-[#01cac3] mb-4 text-lg">
                Friday
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1 leading-tight">
                  Arriving in Body, Heart and Mind
                </span>
              </h4>
              <p className="space-y-1">
                • 15:00 - 16:00: Arrive & settling in<br/>
                • 17:00: Group Meets ‘Orientation’ + First Meditations<br/>
                • 19:00: Dinner (not in silence)<br/>
                • 20:00: Chi Kung workshop and sitting<br/>
                <span className="block italic text-[10px] text-slate-500 mt-2 bg-slate-200/50 p-2 rounded-lg">
                  * Silence overnight and until start of Breakfast
                </span>
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#01cac3] mb-4 text-lg">
                Saturday
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1 leading-tight">
                  The Body as the Foundation
                </span>
              </h4>
              <p className="space-y-1">
                • 07:30: Morning Practices (Chi Kung + Meditation)<br/>
                • 08:30: Breakfast (silence is an option)<br/>
                • 09:30: Day’s theme & practice cycle (sitting/walking/tea)<br/>
                • 12:30: Lunch (silence optional) & personal time<br/>
                <span className="block font-bold text-[#01cac3] text-[10px] uppercase mt-2 mb-2">
                  — The full practice of Silence begins for all —
                </span>
                • 14:30: Brief input & practice cycle<br/>
                • 17:30: Optional small group mentoring<br/>
                • 19:00: Dinner (silence is an option)<br/>
                • 20:00: Chi Kung + sitting (end by 21:00)<br/>
                <span className="block italic text-[10px] text-slate-500 mt-2 bg-slate-200/50 p-2 rounded-lg">
                  * Silence continues overnight
                </span>
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#01cac3] mb-4 text-lg">
                Sunday
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1 leading-tight">
                  The Foundation of Feeling-tone
                </span>
              </h4>
              <p className="space-y-1">
                • 07:30: Morning Practices (Chi Kung + Meditation)<br/>
                • 08:30: Breakfast<br/>
                • 09:30: Day’s theme & practice cycle (sitting/walking/tea)<br/>
                • 12:30: Lunch & personal time<br/>
                • 14:30: Brief input & practice cycle<br/>
                • 17:30: Optional small group mentoring<br/>
                • 19:00: Dinner<br/>
                • 20:00: Chi Kung + sitting (end by 21:00)<br/>
                <span className="block italic text-[10px] text-slate-500 mt-2 bg-slate-200/50 p-2 rounded-lg">
                  * Silence continues overnight
                </span>
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#01cac3] mb-4 text-lg">
                Monday
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1 leading-tight">
                  The Foundation of the Mind
                </span>
              </h4>
              <p className="space-y-1">
                • 07:30: Morning Practices (Chi Kung + Meditation)<br/>
                • 08:30: Breakfast<br/>
                • 09:30: Day’s theme & practice cycle (sitting/walking/tea)<br/>
                • 12:30: Lunch & personal time<br/>
                • 14:30: Brief input & practice cycle<br/>
                • 17:30: Optional small group mentoring<br/>
                • 19:00: Dinner<br/>
                • 20:00: Q&A session then final sit<br/>
                <span className="block italic text-[10px] text-slate-500 mt-2 bg-slate-200/50 p-2 rounded-lg">
                  * Silence overnight until the start of Breakfast
                </span>
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#01cac3] mb-4 text-lg">
                Tuesday
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1 leading-tight">
                  Consolidation
                </span>
              </h4>
              <p className="space-y-1">
                • 07:00: Morning Practice<br/>
                • 08:30: Breakfast (extra time for packing)<br/>
                • 10:00: Brief Input and Meditation<br/>
                • 11:00: Tea break<br/>
                • 11:30: Reflective Practice + Closing the Retreat<br/>
                • 12:30: End of Retreat
              </p>
            </div>

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
    const title = "A 2 or 5-Day Mindfulness & Chi-Kung Retreat: With Silence!"; 
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    const customMessage = "I believe this event aligns with your interests. Highly recommended! ";
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
          shadow-[0_12px_24px_-8px_rgba(91,123,254,0.6)]
          hover:shadow-[0_16px_32px_-8px_rgba(91,123,254,0.7)]
          hover:-translate-y-0.5
          active:scale-[0.98] active:translate-y-0
          transition-all duration-300 ease-out
        "
      >
        <Upload className="w-5 h-5" strokeWidth={2.5} />
        <span>Share with a Friend</span>
      </button>
    </div>
  );
}

export default function RetiroMindfulHeart({ sanityData }: { sanityData: any }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false); 
  const [serverReviews, setServerReviews] = useState(sanityData?.reviews || []);
  
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setShowBottomBar(scrollY > 1500); 
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Otimização: { passive: true } agiliza o scroll e evita bloqueio da main thread
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = { threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // Otimização: para de observar este elemento após revelar, poupando processamento
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleGuaranteeSpot = (e: React.MouseEvent) => {
    e.preventDefault();
    
    addToCart({ 
      _id: sanityData?._id || COURSE_ID, 
      title: sanityData?.title || "A 2 or 5-Day Mindfulness & Chi-Kung Retreat", 
      price: RESERVA_PRICE, 
      imageUrl: sanityData?.imageUrl || sanityData?.image || "https://64.media.tumblr.com/9afc12c752adb2002ffe9cb057809d3a/52f74422ca5f5655-5c/s540x810/1badf1ce86958454ae462e8d94f45a01067ceea9.jpg", 
      slug: sanityData?.slug?.current || sanityData?.slug || "retiro-mindfulness-chi-kung"
    });
    
    router.push('/checkout');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto bg-white min-h-screen relative ">
      <main className="font-sans text-slate-800 w-full p-0 m-0 ">
        
        <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoId="ThghtiRKjJ8" />

       {/* HERO SECTION */}
        <section className="relative w-full min-h-[100svh] lg:min-h-[800px] flex flex-col justify-center overflow-hidden reveal bg-[#1EC1D5] ">
          <div className="absolute inset-0 z-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src="https://va.media.tumblr.com/tumblr_se1xm0FeNP1vfm7m2.mp4" type="video/mp4" />
            </video>
          </div>
          
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#1EC1D5] via-[#1EC1D5]/80 to-black/30 w-full" />
          
          <div className="relative z-20 w-full mx-auto px-4 lg:container lg:px-6 text-center text-white flex flex-col items-center justify-center pt-24 pb-12 h-full">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
              
              <button onClick={() => setIsVideoOpen(true)} className="bg-white rounded-full w-14 h-14 lg:w-20 lg:h-20 flex items-center justify-center shadow-xl mb-6 lg:mb-8 hover:scale-105 transition-transform">
                <Play fill="#1EC1D5" className="text-[#1EC1D5] w-5 h-5 lg:w-8 lg:h-8 ml-1" />
              </button>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter mb-1 drop-shadow-lg">
                {sanityData?.title || "A 2 or 5-Day Mindfulness & Chi-Kung Retreat: With Silence!"}
              </h1>
              <h3 className="mb-4">With Silence!</h3>
              
        {/* --- AQUI ESTAVA O PROBLEMA --- */}
        <div className="space-y-1 pt-1">
                {(sanityData?.heroDate || sanityData?.heroLocation || sanityData?.heroSpotsText) && (
                  <p className="!text-[12px] md:!text-[15px] font-bold text-white drop-shadow-md subtitulos">
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
                      {sanityData?.heroSeeAlsoText}
                    </p>
                  </Link>
                )}
              </div>
              
              <Link href="/inscricao" className="inline-block bg-[#ff4d6d] text-white font-bold py-4 px-10 rounded-full shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs mt-6 mb-1">
                REGISTRATION
                </Link>
                <p className="text-[10px] mt-2 opacity-70 subtitulos mb-10">Select the event - <strong>2 or 5-Day Mindfulness and Chi-kung Retreat</strong></p>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-white/30 pt-8 -mt-4 mb-15">
                <div className="flex flex-col items-center">
                  <SafeImage src="https://64.media.tumblr.com/6d340e5aa6028b02b43d09cdb214d548/c1caf3090a9eb65b-8a/s75x75_c1/44bccbb3bc60a44cdadaaf3394bb78de34bdd20d.pnj" width={40} height={40} className="brightness-0 invert mb-3" alt="Immersion" unoptimized />
                  <h3 className="text-xs font-bold uppercase mb-1">Deeper Mindfulness</h3>
                  <p className="text-[10px] subtitulos opacity-90">2 or 5-day retreat for embodied foundations. This is not an escape: it's a homecoming.</p>
                </div>
                <div className="flex flex-col items-center">
                  <SafeImage src="https://64.media.tumblr.com/ed680ef3e192166aec20e5208ae8dbbb/c1caf3090a9eb65b-62/s75x75_c1/fcc56381a676e11f6fbc6b7388edab8ccd895c30.pnj" width={40} height={40} className="brightness-0 invert mb-3" alt="Community" unoptimized />
                  <h3 className="text-xs font-bold uppercase mb-1">Community</h3>
                  <p className="text-[10px] subtitulos opacity-90">Fosters Trust, Communication and Commitment.</p>
                </div>
                <div className="flex flex-col items-center">
                  <SafeImage src="https://64.media.tumblr.com/206cedb88b5663f0fe8a0c13ed30ee59/c1caf3090a9eb65b-8e/s75x75_c1/faa2a238996fec49b327515002845987309ae453.pnj" width={40} height={40} className="brightness-0 invert mb-3" alt="Shinrin-Yoku" unoptimized />
                  <h3 className="text-xs font-bold uppercase mb-1">Shinrin-Yoku</h3>
                  <p className="text-[10px] subtitulos opacity-90">Outdoor Meditation, Chi-Kung and Sensory Immersion.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white overflow-hidden border-b border-slate-100 mb-[10px] reveal w-full">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(3)].map((_, i) => (
              <React.Fragment key={i}>
                {[ "https://64.media.tumblr.com/9b5d3af893d0ee3b51e5f7d2300067ff/52f74422ca5f5655-d2/s540x810/0d99a94a5a6700eac61b4df1d746d9f703b71791.jpg", "https://64.media.tumblr.com/540a8f33e09f9fe099fdd0de2e7ab640/56eef313faf72d5a-c8/s1280x1920/5e68809933ce9ad47e68694c1d409bf9a2e334c9.jpg", "https://64.media.tumblr.com/0eac66b326714d7f26bcd5b6fce62a20/37576a4cf1d43b75-eb/s1280x1920/fcf1d647a31f07eafce223bd1b068d93e324a8f2.jpg", "https://64.media.tumblr.com/1c2ebf591dfefd4194e35f14ff8cc433/044bd821bf0a74d7-7c/s1280x1920/69408858753b02e02ad503a2d84b135fdb91f527.jpg", "https://66.media.tumblr.com/5f6396044f5171aebd7c9b0617db0a48/tumblr_pgczl0ZU7x1vfm7m2o2_540.jpg", "https://66.media.tumblr.com/3f1b49dcce71290053bdcb08c7cc29c0/tumblr_pgczl0ZU7x1vfm7m2o3_540.jpg", "https://64.media.tumblr.com/bcca8a9e75d5ac38c08466ba64876c20/e802edbb1514103b-3b/s1280x1920/57a70a2e3e7a4c07e113489c09d5ab2399599e3a.jpg", "https://66.media.tumblr.com/62949c3bef33d3b2044563d793baee3c/tumblr_pgczl0ZU7x1vfm7m2o8_540.jpg", "https://64.media.tumblr.com/6f4bd3694c99178fd8de9496c798d583/0d5c068c280002aa-4a/s1280x1920/9b3d8c916ba8939e6ba562ff0cdedf165788dc89.jpg", "https://64.media.tumblr.com/21555c3e57e9becff7ea628714610e66/6f237503b884eb63-21/s1280x1920/71cbdcdf936731f4e1ca8ad4782f91b166454689.jpg", "https://64.media.tumblr.com/0eac66b326714d7f26bcd5b6fce62a20/37576a4cf1d43b75-eb/s1280x1920/fcf1d647a31f07eafce223bd1b068d93e324a8f2.jpg" ].map((url, idx) => (
                  <div key={`${i}-${idx}`} className="relative w-[350px] h-[250px] flex-shrink-0 mr-[2px]">
                    <SafeImage src={url} alt={`Gallery`} fill className="object-cover" />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="w-full px-0">
          <TopicsSlider5DayRetreat />
           <div className="mt-0 mb-[70px] text-center w-full px-0"><AccordionProgramDayRetreat /></div>
        </section>

                
        <section className="reveal w-full px-0">
          <TestimonialsSlider5DayRetreat key={serverReviews.length} courseId={sanityData?._id || COURSE_ID} initialReviews={serverReviews} />
        </section>

<section className="reveal w-full px-0 mb-20 -mt-20">
    <div className="w-full max-w-3xl mx-auto text-center pt-10 border-t border-slate-100 px-4 lg:px-0">
             <h2 className="text-2xl font-bold text-[#756E68] mb-2 font-sans">Mindfulness is better with friends</h2>
             <h3 className="text-[20px] font-normal text-[#A1A1A1] mb-8 font-sans">Invite friends</h3>
             <div className="flex justify-center w-full pb-10">
               <ShareButton />
             </div>
           </div>
 
</section>

        <section id="sobre" className="hidden md:block py-24 mb-[10px] reveal w-full" style={{ backgroundColor: '#FDFFDD' }}> 
          <div className="w-full mx-auto px-0 lg:container lg:px-6 max-w-[1200px]">
            <h2 className="text-4xl text-center mb-8 font-serif text-[#005C65] px-4 lg:px-0">What will this retreat be like for you?</h2>
            <p className="text-center max-w-4xl mx-auto mb-12 !text-[18px] !text-[#005c65] px-4 lg:px-0">Life is defined by impermanence. The essence of self-discovery lies in letting go of what feels safe, creating space for something far greater to emerge.</p>
            
            <div className="w-full bg-[#FDFFDD] lg:bg-[#EAF475] py-12 px-0 lg:p-12">
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 text-[#005C65] font-serif text-2xl w-full px-4 lg:px-0">
                  {['Awakening', 'Gratifying', 'Needed', 'Supportive', 'Transformative', 'Revealing', 'Challenging', 'Commitment', 'Self-care', 'Soothing', 'Deep', 'Changing'].map((word) => (
                    <div key={word} className="flex items-center justify-between border-b border-[#005C65]/10 pb-2">
                      <span>{word}</span>
                      
                      <div className="hidden lg:flex items-center gap-3 opacity-30">
                         <span className="w-px h-5 bg-[#005C65]"></span>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M12 19V5"/>
                           <path d="m5 12 7-7 7 7"/>
                         </svg>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </section>

      <section className="w-full px-0 lg:-mt-2 ">
          <StudiesSlider5DayRetreat />
      </section>

 <section className="bg-[#F0DFD1] flex items-center justify-center font-sans w-full max-w-[1600px] mx-auto rounded-[0rem] py-12 md:py-46 px-4 md:px-0 mt-0 md:mt-0 ">
  
  <div className="bg-white rounded-[40px] max-w-[1100px] w-full shadow-2xl overflow-hidden flex flex-col md:flex-row p-0 md:p-12 gap-8 md:gap-12 items-center ">   
    
    <div className="flex-1 space-y-6 px-[30px] md:px-0 py-8 md:py-0 sm:p-5 w-full order-2 md:order-1">
      <header>
        <p>Meet the Teacher</p>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1e1b4b] leading-tight">
          Adrian Karunavira, MSc  <br />
          <span className="text-2xl font-medium text-gray-500">Mindfulness Expert</span>
        </h2>
      </header>

      <div className="text-gray-600 text-[12px] md:text-[12px] leading-relaxed max-h-60 overflow-y-auto pr-4 custom-scrollbar">
        <p className="mb-4">
          Karunavira is one of the most experienced and knowledgeable instructor that you can find internationally and exceptionally skilled at creating a safe learning environment, supportive and deeply engaging, allowing participants to seek, explore and inquire.
                    Mindfulness Teacher | Senior Trainer & Mentor at CMRP Bangor University and the Mindfulness Network.
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-8 py-4 border-y border-gray-100 justify-between md:justify-start">
        <div>
          <span className="block text-[16px] md:text-xl font-bold text-[#1e1b4b] text-center md:text-left">★ 4,9</span>
           <span className="text-xs text-gray-400 uppercase tracking-wider text-center md:text-left">Rating</span>
        </div>
        <div>
          <span className="block text-[16px] md:text-xl font-bold text-[#1e1b4b] text-center md:text-left">30+</span>
           <span className="block w-full text-xs text-gray-400 uppercase tracking-wider text-center md:text-left">Years of teaching</span>
        </div>
        <div>
          <span className="block text-[16px] md:text-xl font-bold text-[#1e1b4b] text-center md:text-left">100k+</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider text-center md:text-left">Students</span>
        </div>
      </div>

   <div className="flex items-center gap-4 md:gap-6 flex-wrap">
  <a 
    href="https://training.mindfulness-network.org/our-trainers/karunavira/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-6 md:px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-200 inline-block text-center"
  >
    See more
  </a>
</div>
      
      <p className="text-xs text-gray-400 flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        More than 100,000 people have already been inspired by his work.
      </p>
    </div>

    <div className="relative w-[260px] md:w-[350px] h-[290px] md:h-[400px] flex-shrink-0 mb-0 md:mb-0 mt-8 md:mt-0 order-1 md:order-2">
      <div className="absolute inset-0 bg-[#FBC891] rounded-3xl rotate-3 translate-x-2"></div>
      <div className="relative h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-[#F07932] via-[#FBC78D] to-[#F07932]">
        <SafeImage 
          src="https://64.media.tumblr.com/4d2f9f92e4af78d7b0199900eb09241b/2c4a4259d5722e7a-c3/s1280x1920/e46fd1b3bbdea436e929e47b8cc3876a047f0766.pnj" 
          alt="Adrian Karunavira"
          fill
          className="object-cover object-top contrast-110"
        />
      </div>
    </div>

  </div>
</section>

    <section className="py-16 px-0 md:px-8">
      <div className="max-w-[1300px] mx-auto bg-[#F8F7F4] rounded-[2rem] py-16 px-6 md:px-12 lg:px-20">
        
        <h2 className="text-3xl md:text-[22px] lg:text-[22px] font-serif italic text-center text-slate-800 mb-14">
         This retreat is for...
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

<section id="precos" className="py-24 reveal w-full" style={{ backgroundColor: '#FDFFDD' }}>
          <div className="w-full mx-auto px-0 lg:container lg:px-6 text-center">
            <h2 className="text-4xl font-black uppercase tracking-widest text-[#444] mb-12 px-4 lg:px-0">Investment</h2>
            <div className="w-full max-w-4xl mx-auto mb-12 px-4 lg:px-0">
              <p className="!text-[18px] !text-[#005c65] ">Fees vary according to the days of the retreat (all included in a single room). After May 31st, fees will increase by 40€ and 70€ respectively.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 w-full max-w-[1100px] mx-auto px-0">
              <div className="investment-card bg-[#FDFFDD] lg:bg-[#EAF475] shadow-none lg:shadow-xl border-b border-[#005C65]/10 lg:border-none">
                <div className="text-3xl font-black mb-4">320€</div>
                <p className="text-[10px] uppercase">July 24th to 26th, 2026 (Weekend)</p>
              </div>
              
              <div className="investment-card bg-[#FDFFDD] lg:bg-[#E1F0EE] shadow-none lg:shadow-xl">
                <div className="text-3xl font-black mb-4">620€</div>
                <p className="text-[10px] uppercase">July 24th to 28th, 2026 (Full 5 Days)</p>
              </div>
            </div>
            <Link href="/inscricao" className="inline-block mt-12 bg-[#ff4d6d] text-white font-bold py-5 px-16 rounded-full shadow-2xl uppercase tracking-widest text-sm hover:scale-105 transition-all">REGISTRATION</Link>
          </div>
        </section>
        <section className="py-20 reveal bg-white w-full">
          <div className="w-full mx-auto px-0 lg:container lg:px-6 max-w-[1100px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-start w-full px-0">
              <div className="bg-white lg:bg-slate-50 py-8 px-4 lg:p-8 rounded-none lg:rounded-[30px] shadow-sm border border-slate-100 w-full">
                <h3 className="text-2xl font-serif font-bold text-[#005C65] mb-6">Important Notes</h3>
                <ul className="space-y-4 detail-card-text text-slate-700 list-disc pl-4">
                  <li>The retreat will take place with a minimum and maximum number of participants;</li>
                  <li>The program is subject to minor changes;</li>
                  <li>On the registration form, choose – <strong>5-Day or 2-Day Mindfulness and Chi-kung Retreat</strong>;</li>
                  <li>If you are really interested in this event, please don't leave your registration too close to the start date;</li>
                  <li>If you cancel up to 10 days before, we will refund 100% of the deposit;</li>
                  <li>If the event is canceled, the Portuguese Meditation Society - Meditt is only responsible for the full refund;</li>
                </ul>
              </div>

              <div className="flex flex-col gap-8 w-full px-0">
                <div className="bg-white lg:bg-slate-50 py-8 px-4 lg:p-8 rounded-none lg:rounded-[30px] shadow-sm border border-slate-100 w-full">
                  <h3 className="text-2xl font-serif font-bold text-[#005C65] mb-6">Registration processing</h3>
                  <ul className="space-y-4 detail-card-text text-slate-700 list-disc pl-4">
                    <li>When you complete your registration form, you will receive an email with additional information;</li>
                    <li>If you find it difficult to fill in all the fields, use a modern browser, or <Link href="https://meditt.space/c" className="text-[#01cac3] font-bold hover:underline">contact us</Link>.</li>
                  </ul>
                </div>
                <div className="bg-white lg:bg-[#E1F0EE] py-8 px-4 lg:p-8 rounded-none lg:rounded-[30px] shadow-sm border border-[#E1F0EE] w-full">
                  <h4 className="font-bold text-[#005C65] mb-2 text-xs uppercase tracking-widest">Data processing</h4>
                  <p className="detail-card-text text-[#005C65]/80">We guarantee the confidentiality of the personal data provided.</p>
                </div>
              </div>
            </div>

       

          </div>
        </section>

<section className="reveal w-full px-0 mb-20 -mt-20">
    <div className="w-full max-w-3xl mx-auto text-center pt-10 border-t border-slate-100 px-4 lg:px-0">
             <h2 className="text-2xl font-bold text-[#756E68] mb-2 font-sans">Mindfulness is better with friends</h2>
             <h4 className="text-[20px] font-normal text-[#A1A1A1] mb-8 font-sans">Invite friends</h4>
             <div className="flex justify-center w-full pb-10">
               <ShareButton />
             </div>
           </div>
 
</section>

        {/* --- NOVA STICKY BOTTOM BAR (Aparece aos 1500px) --- */}
        <div className={`fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 p-3 md:p-4 transition-transform duration-500 ease-in-out shadow-[0_-10px_30px_rgba(0,0,0,0.08)] ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
            
            <div className="flex flex-col text-left w-full md:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#01cac3]">Save your spot</span>
              <h3 className="text-sm md:text-base font-bold text-slate-800 truncate w-full md:max-w-md">
                {sanityData?.title || "A 2 or 5-Day Mindfulness & Chi-Kung Retreat"}
              </h3>
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8">
              <div className="text-left md:text-right">
                <span className="block text-[9px] md:text-[10px] text-slate-400 uppercase font-bold">Deposit</span>
                <span className="text-lg md:text-xl font-black text-slate-900 leading-none">{RESERVA_PRICE}€</span>
              </div>
              
              <button 
                onClick={handleGuaranteeSpot}
                className="bg-[#ff4d6d] hover:bg-[#e03e5d] text-white font-black text-[11px] md:text-xs py-2.5 md:py-3 px-6 md:px-10 rounded-full uppercase tracking-widest transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                S
              </button>
            </div>

          </div>
        </div>
        

        <style jsx global>{`
          .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease; }
          .reveal.is-visible { opacity: 1; transform: translateY(0); }
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { display: flex; width: fit-content; animation: marquee 80s linear infinite; }
          p, li, blockquote, .detail-card-text {
            font-family: 'Maax', sans-serif !important;
            font-weight: 400 !important;
            font-size: 12px !important;
            line-height: 20px !important;
            color: #000000 !important;
          }
          .subtitulos { color: #ffffff !important; }
          .font-exposure { font-family: 'Exposurevar', serif; }
          .investment-card { 
            flex: 1; 
            min-width: 280px; 
            padding: 60px 0px; 
            border-radius: 0px; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            width: 100%;
          }
          @media (min-width: 1024px) {
            .investment-card { padding: 60px 30px; border-radius: 40px; }
          }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
      </main>
    </div>
  );
}