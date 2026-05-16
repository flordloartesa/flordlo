'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { useCart } from '@/app/context/CartContext'; 

interface SanityEventProps {
  event: {
    titulo: string;
    dataEventoTexto: string;
    local: string;
    earlyBirdPrice: number;
    regularPrice: number;
    reservaPrice: number; // Depósito de 80€
    preco: number;        // Preço total
    earlyBirdDate: string;
    registrationLink?: string;
    youtubeId?: string;
    subtitle?: string;
  }
}

const testemunhos = [
  {
    id: 1,
    nome: "Susan Kaiser Greenland, JD.",
    imagem: "https://lh3.googleusercontent.com/-uAp5nB1YbTU/XF8PtsVJicI/AAAAAAAAD0w/JSbt9Ci7YaQnALFnbVpD6v1e0tJC20SHACLcBGAs/s800/susan.png",
    titulo: "What a gem of a book!",
    texto: "Chris Willard’s new book Growing Up Mindful is jam packed with great advice and practices for children, teens and families. It is a wonderful resource for parents, therapists and teachers worldwide!"
  },
  {
    id: 2,
    nome: "Amy Saltzman M.D, creator A Still Quiet Place",
    imagem: "https://lh3.googleusercontent.com/-ZTJ-F5FQeL0/XF8PthP_w7I/AAAAAAAAD0s/5Qwl50lqetIT1UBz04HJfI-a-6tbQ3_FgCLcBGAs/s800/amy.png",
    titulo: "This book offers a wonderful array of simple, playful, engaging mindfulness practices",
    texto: "which can be shared by parents, teachers, and therapists with children at home, at school, and in clinical settings. Dr. Willard has created an invaluable resource to support you in sharing the nourishing power of mindfulness with children and adolescents."
  },
  {
    id: 3,
    nome: "Susan M. Pollak, President, Institute for Meditation and Psychotherapy",
    imagem: "https://www.drsusanpollak.com/images/Dr-Susan-Pollak.jpg",
    titulo: "A wonderful, practical book for kids and adults",
    texto: "that is reassuring, accessible, and enjoyable. Chock-full of useful and engaging practices, it is a great resource for parents, therapists, and teachers. Chris Willard is a rising star whose attunement to the needs of children shines through on every page."
  },
  {
    id: 4,
    nome: "Jack Kornfield, Meditation Teacher",
    imagem: "https://lh3.googleusercontent.com/-J5zJa99Sj3E/XF8Ptu1C9NI/AAAAAAAAD0o/9tHDQXnnF8srT-KbKpIEUuJHmV7s_Y-ggCLcBGAs/s800/jack.png",
    titulo: "A wonderful approach to learning mindfulness:",
    texto: "A wonderful approach to learning mindfulness - full of great skills, practical tools and enormously helpful wisdom."
  },
  {
    id: 5,
    nome: "Christopher Germer, Author of The Mindful Path to Self-Compassion",
    imagem: "https://lh3.googleusercontent.com/-4Kshq4P2sbw/W9STzbDVvuI/AAAAAAAADM0/6BxenQcTyqYqBdKKO_kEHUeEH9Fd0-bdQCLcBGAs/s800/chris-germer.png",
    titulo: "“How do you teach this stuff to kids?”",
    texto: "As the benefits of mindfulness become well established, a recurring question is, “How do you teach this stuff to kids?” Look no further. This book is a treasure trove of exercises and practical wisdom to inspire any reader."
  },
  {
    id: 6,
    nome: "Ronald D. Siegel, PsyD",
    imagem: "https://d2icykjy7h7x7e.cloudfront.net/authors/hqwkw0e2w2HnusJ12IPvNPNI00Cbzl0OSVjUEwFt.jpg",
    titulo: "Practical, engaging, and a pleasure to read,",
    texto: "this inspirational book is an invaluable resource for parents, teachers, and anyone else who works with or cares for kids. Based on extensive experience, it’s chock-full of creative, common-sense practices that can help virtually any child, adolescent, or adult live a happier, richer, more engaged, life."
  },
  {
    id: 7,
    nome: "Chris McKenna, Program Director, Mindful Schools",
    imagem: "https://media.licdn.com/dms/image/v2/C5603AQGoqL6YF6i8vw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1516328730816?e=2147483647&v=beta&t=EgqcS9L01yY3m8IdWt9KbpTZjQP0pqdPFpMHvRnZpLk",
    titulo: "Many of the deepest experiences youth have with mindfulness do not happen in formal, structured lessons.",
    texto: "They happen in the ‘micro-moments’ of daily life. With a variety of short, conceptually simple methods, Growing Up Mindful is one of the few mindfulness and youth books that is structured to reflect this truth. If you are looking for developmentally appropriate ways to introduce practice to youth in a way that will stick, this is your book."
  }
];

export default function EventosSoltosLayout({ event }: SanityEventProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'readings' | 'faq' | 'schedule' | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const youtubeId = event?.youtubeId || "znlsoaM_ALQ";

  const toggleAccordion = (section: 'readings' | 'faq' | 'schedule') => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleBookNow = () => {
    addToCart({
      _id: "reserva-evento", 
      _type: "reserva",
      title: `Booking - ${event.titulo}`,
      price: event.reservaPrice || 80, 
      quantity: bookingQuantity 
    });
    router.push('/checkout'); 
  };

  useEffect(() => {
    if (isCarouselHovered) return;
    const intervalId = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isCarouselHovered]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans overflow-x-hidden selection:bg-slate-200">
      
      {/* HERO */}
      <header className="pt-40 pb-0 px-6 max-w-7xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-6 font-medium">
           {event.subtitle || "TEACHING MINDFULNESS TO KIDS AND TEENS RETREAT"} 
        </p>
        <h1 className="text-5xl md:text-8xl font-light text-slate-900 mb-8 tracking-tight leading-tight uppercase">
           <span className="italic text-slate-400 font-serif"> {event.titulo} </span>
        </h1>
        <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto mb-16">
          Led by <strong className="font-medium text-slate-900">Christopher Willard, Psy. D.</strong>
        </p>
      </header>

      {/* INTRODUÇÃO */}
      <section className="py-2 px-6 max-w-3xl mx-auto text-center">
        <img 
          src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2153456376/settings_images/40ab7a-000-4b7-20-cfb8d2babd60_f270d338-f5d8-4de3-bf7f-f46974786772.png" 
          alt="Foto do Formador" 
          className="w-24 h-24 mx-auto rounded-full object-cover mb-10 shadow-sm border border-slate-200"
        />
        <p className="text-sm md:text-sm font-bold text-slate-800 leading-relaxed mb-12">
          Today's fast-paced, connected, and highly charged world is placing unprecedented stress and pressure on kids and teens. Youth need effective skills to cope with the increasingly demanding lifestyle, combat the symptoms, and establish mindful and compassionate living — to last a lifetime. Join one of the world's leading experts on mindfulness techniques for youth and teens, Dr. Christopher Willard, Psy. D., for a new certificate course on Mindfulness interventions for kids and teens.
        </p>
        <div className="w-10 h-[1px] bg-slate-300 mx-auto"></div>
      </section>

      {/* DETALHES */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div 
            onClick={() => setIsVideoOpen(true)}
            className="aspect-[4/5] md:aspect-square flex items-center justify-center relative group cursor-pointer bg-cover bg-center overflow-hidden"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/-dmQl11UoDxE/XF8ERj3pAPI/AAAAAAAADz8/gendmUkvKHkBaLyBF3NzGAOinir8OpREwCLcBGAs/s1600/Alphacover-copy2.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
            <div className="relative z-10 w-20 h-20 border border-white/90 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 bg-white/90 backdrop-blur-md">
              <span className="text-[#72A2F3] text-lg ml-1">▶</span>
            </div>
          </div>

          <div className="mt-12 lg:mt-0">
            <h2 className="text-3xl font-light mb-12 text-slate-900">{event.titulo}</h2>
            <div className="flex flex-col border-t border-slate-200">
              <div className="flex justify-between py-3 border-b border-slate-200">
                <span className="text-xs uppercase tracking-widest text-slate-400">Date</span>
                <span className="text-sm font-medium text-slate-900">{event.dataEventoTexto}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200">
                <span className="text-xs uppercase tracking-widest text-slate-400">Venue</span>
                <span className="text-sm font-medium text-slate-900">{event.local}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200">
                <span className="text-xs uppercase tracking-widest text-slate-400">Investment</span>
                <span className="text-sm font-medium text-slate-900">{event.preco}€</span>
              </div>
            </div>
            <button onClick={handleBookNow} className="block w-full py-4 text-center rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-bold hover:opacity-90 transition-opacity mt-8">
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* TESTEMUNHOS */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-bold text-gray-800">What Mindfulness experts are saying:</h2>
            <div className="flex gap-4">
              <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-[#005C65] flex items-center justify-center">←</button>
              <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-[#005C65] flex items-center justify-center">→</button>
            </div>
          </div>
          <div ref={carouselRef} onMouseEnter={() => setIsCarouselHovered(true)} onMouseLeave={() => setIsCarouselHovered(false)} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
            {testemunhos.map((item) => (
              <div key={item.id} className="snap-start shrink-0 w-[450px] border border-[#005C65] rounded-[2rem] p-10 bg-white">
                <h3 className="text-xl font-bold text-[#005C65] mb-4 text-center">{item.titulo}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-8 text-center">{item.texto}</p>
                <p className="text-sm font-bold italic text-[#005C65] text-center mt-auto">- {item.nome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="register" className="bg-[#0F172A] py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-20 uppercase">{event.titulo}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#1E293B] rounded-2xl p-10 border border-[#A855F7] flex flex-col">
              <h3 className="text-5xl font-bold text-white mb-4">{event.earlyBirdPrice}€</h3>
              <p className="text-slate-300 mb-8">On or before {event.earlyBirdDate}</p>
              <ul className="space-y-4 text-slate-300 text-sm mb-10 flex-grow">
                <li>€{event.reservaPrice} deposit required</li>
                <li>Full access to the 3-day training.</li>
              </ul>
              <button onClick={handleBookNow} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-bold">Book Now</button>
            </div>
            
            <div className="bg-[#1E293B] rounded-2xl p-10 border border-slate-700 flex flex-col">
              <h3 className="text-5xl font-bold text-white mb-4">{event.regularPrice}€</h3>
              <p className="text-slate-300 mb-8">After {event.earlyBirdDate}</p>
              <ul className="space-y-4 text-slate-300 text-sm mb-10 flex-grow">
                <li>€{event.reservaPrice} deposit required</li>
                <li>Full access to the 3-day training.</li>
              </ul>
              <button onClick={handleBookNow} className="w-full py-4 rounded-xl bg-slate-700 text-white font-bold">Book Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL VÍDEO */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsVideoOpen(false)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black shadow-2xl">
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: ` .hide-scrollbar::-webkit-scrollbar { display: none; } `}} />
    </div>
  );
}