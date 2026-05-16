'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { useCart } from '@/app/context/CartContext'; 
import Link from '@/components/MyLink';

interface SanityEventProps {
  event: {
    titulo: string;
    _type: string;
    dataEventoTexto: string;
    local: string;
    earlyBirdPrice: number;
    regularPrice: number;
    reservaPrice: number; // O depósito de 80€
    preco: number;        // O investimento total (ex: 360)
    earlyBirdDate: string;
    registrationLink?: string;
    youtubeId?: string;
    subtitle?: string;
    idioma?: string;
    ShortDescription?: string;
    marqueeSettings?: {
      coluna1: Array<{ imageUrl: string; nome: string; cargo: string }>;
      coluna2: Array<{ imageUrl: string; nome: string; cargo: string }>;

    // Adiciona esta nova propriedade 👇
    suggestedEvents?: Array<{
      _id: string;
      titulo: string;
      tipoEvento: string;
      dataEventoTexto: string;
      slug: { current: string };
      imageUrl: string; 
      tipologia: string;
    }>;  
    };
  }
}


export default function EventosSoltosLayout({ event }: SanityEventProps) {

  console.log("CONTEÚDO DO EVENTO:", event);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'readings' | 'faq' | 'schedule' | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DO CARROSSEL RELATED EVENTS ---
  const relatedCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Se não houver eventos sugeridos, não faz nada
    if (!event?.suggestedEvents || event.suggestedEvents.length === 0) return;

    const interval = setInterval(() => {
      if (relatedCarouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = relatedCarouselRef.current;
        // Se chegou ao fim, volta ao início. Se não, avança 320px (largura do card + gap)
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          relatedCarouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          relatedCarouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 5000); // 5000ms = 5 segundos

    return () => clearInterval(interval);
  }, [event?.suggestedEvents]);


  // Lógica de Fallback para a Marquee: Se o Sanity estiver vazio, usa os teus dados originais
  const marqueeData = {
    coluna1: event?.marqueeSettings?.coluna1?.length ? event.marqueeSettings.coluna1 : [
      { imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500", nome: "Dr. Mark Hyman", cargo: "M.D. Functional Medicine" },
      { imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744a05?w=500", nome: "Will Cole", cargo: "D.C. Practitioner" }
    ],
    coluna2: event?.marqueeSettings?.coluna2?.length ? event.marqueeSettings.coluna2 : [
      { imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500", nome: "JJ Virgin", cargo: "Certified Nutritionist" },
      { imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500", nome: "Vincent M. Pedre", cargo: "M.D. Gut Health" }
    ]
  };

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
      title: `Booking - ${event?.titulo || "Growing Up Mindful"}`,
      price: event?.reservaPrice || 80, 
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
    <div className="min-h-screen bg-[#FDFDFD]  text-slate-800 font-sans overflow-x-hidden selection:bg-slate-200">
      
      {/* NOVA SECÇÃO INTEGRADA: HERO COM MARQUEE VERTICAL */}
      <section className="hero-section">
        <div className="hero-inner">
        <div className="content-side">
        
          {/*<div className="logos-row">
            <div className="logo-placeholder">SM APPROVED</div>
            <div className="logo-placeholder">AA APPROVED</div>
          </div> */}

<p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1 font-medium">
            {event?.subtitle || "TEACHING MINDFULNESS TO KIDS AND TEENS RETREAT"} 
        </p>
          <h1>{event?.titulo || "nutrition & longevity+"}</h1>
          
          <p className="description">
            A cutting-edge nutrition deep dive designed to optimize your health, 
            boost vitality, and create lasting impact on your well-being—starting today.
          </p>


{/* Contentor de 3 Colunas Sem Quebra no Mobile */}
{/*  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2 w-full max-w-full md:max-w-[450px] ml-0 py-0 border-y border-slate-100 mb-12 -mt-2 text-left">*/}
<div className="grid grid-cols-3 gap-2 sm:gap-2 w-full max-w-[450px]  ml-0 py-0 border-y border-slate-100 mb-12 -mt-2 text-left">
  
  {/* Coluna 1: Data */}
  <div className="flex flex-col items-start">
    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-bold whitespace-nowrap">Date</span>
    <span className="text-sm font-medium text-slate-900 leading-tight">
      {event?.dataEventoTexto}
    </span>
  </div>

  {/* Coluna 2: Local */}
  <div className="flex flex-col items-start">
    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-bold whitespace-nowrap">Venue</span>
    <span className="text-sm font-medium text-slate-900 leading-tight">
      {event?.local || "Barcelos"}
    </span>
  </div>

  {/* Coluna 3: Idioma */}
  <div className="flex flex-col items-start">
    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-bold whitespace-nowrap">Language</span>
    <span className="text-sm font-medium text-slate-900 leading-tight">
      {event?.idioma || "Português"}
    </span>
  </div>

</div>


          <div className="cta-area">
            <button onClick={() => setIsVideoOpen(true)} className="btn-sample">Watch Video</button>
            <span className="text-sm font-medium"> <button onClick={handleBookNow} className="enroll-link">Enroll Now</button></span>
          </div>

          <div className="students-row">
            <div className="avatar-group">
              <div className="avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop')" }}></div>
              <div className="avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop')" }}></div>
              <div className="avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop')" }}></div>
              <div className="avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop')" }}></div>
            </div>
            <span className="student-count">1k+ happy students</span>
          </div>

          <div className="info-box">
            <div className="info-item">
              <h4>Duration</h4>
              <p>20+ hours of deep learning during a dedicated <br/>in-person retreat. With certificate.</p>
            </div>
            <div className="info-item">
              <h4>Flexible Pricing</h4>
              <span className="price-value">{event?.regularPrice || "299"}€</span>
              <span className="price-value -mb-2">{event?.earlyBirdPrice || "299"}€ </span>
              <span className="text-[8px] font-light pb-3"> Early-Bird   </span>
              
               <span className="text-[12px]">{event?.reservaPrice || "63"}€ deposit</span>
            </div>
          </div>
        </div>

        <div className="marquee-side">
          {/* COLUNA 1 - SOBE */}
          <div className="marquee-column marquee-up">
            {[1, 2].map((loop) => (
              <React.Fragment key={`up-${loop}`}>
                {marqueeData.coluna1.map((item, index) => (
                  <div key={`${loop}-${index}`} className="instructor-card">
                    <img src={item.imageUrl} alt={item.nome || "Instructor"} />
                    {(item.nome || item.cargo) && (
                      <div className="instructor-info">
                        <h3>{item.nome}</h3>
                        <p>{item.cargo}</p>
                      </div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* COLUNA 2 - DESCE */}
          <div className="marquee-column marquee-down">
            {[1, 2].map((loop) => (
              <React.Fragment key={`down-${loop}`}>
                {marqueeData.coluna2.map((item, index) => (
                  <div key={`${loop}-${index}`} className="instructor-card">
                    <img src={item.imageUrl} alt={item.nome || "Instructor"} />
                    {(item.nome || item.cargo) && (
                      <div className="instructor-info">
                        <h3>{item.nome}</h3>
                        <p>{item.cargo}</p>
                      </div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      </section>

      {/* NOVA SECÇÃO: PROGRAM DETAILS (IGUAL À IMAGEM) */}
      <section className="program-info-section">
        <div className="max-w-7xl mx-auto px-6 text-center -mt-2">
          
          {/* Topo: Teacher e Logo */}
          <div className="mb-15">
            <div className="flex justify-center -space-x-3 mb-10">
             
              <img 
          src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2153456376/settings_images/40ab7a-000-4b7-20-cfb8d2babd60_f270d338-f5d8-4de3-bf7f-f46974786772.png" 
          alt="Foto do Formador" 
          className="w-24 h-24 mx-auto rounded-full object-cover mb-2 shadow-sm border border-slate-200"
        />
            </div>
            <p className="text-2xl md:text-3xl font-serif italic text-white mb-2">Led by Dr. Christopher Willard, Psy. D.</p>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/50">Harvard Medical School Faculty, Author, Psychologist, and Consultant</p>
          </div>

          {/* Título Principal */}
          <div className="text-left mb-16 max-w-5xl">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-8 leading-tight">
              become a {event?.titulo || "mindfulness expert"}
            </h2>
              <p className="text-slate-300 text-lg md:text-md leading-relaxed opacity-90 text-[13px]">
            {event?.ShortDescription || "Be a mindfulness teacher"}
            </p>
          </div>

          {/* Grelha de Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
            
            {/* Item 1 */}
            <div className="feature-card">
              <h3 className="feature-title">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                EXPERT TEACHER
              </h3>
              <p className="feature-text">Christopher Willard, Psy. D., is one of the world's leading experts on mindfulness with young people, having trained thousands of professionals and young people on the practice and benefits of mindfulness. </p>
            </div>

            {/* Item 2 */}
            <div className="feature-card">
              <h3 className="feature-title">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                IMMERSIVE LEARNING
              </h3>
              <p className="feature-text"> A structured, distraction‑free weekend retreat where you practice side‑by‑side with peers and instructors – no paused videos, no procrastination, just deep, focused learning and conection.</p>
            </div>

            {/* Item 3 */}
            <div className="feature-card">
              <h3 className="feature-title">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
               HANDS‑ON MINDFULNESS
              </h3>
              <p className="feature-text">A comprehensive, in‑person retreat that addresses root causes through guided meditation, mindful movement, group sharing, and direct mentorship – not just theory on a screen.</p>
            </div>

            {/* Item 4 */}
            <div className="feature-card">
              <h3 className="feature-title">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                MAKE MINDFULNESS FUN
              </h3>
              <p className="feature-text"> Arts, Games, Sports+ Explore creative ways to make mindfulness fun by integrating it into the activities they are most interested in and enjoy:
Bring mindfulness to games for kids who struggle with attention </p>
            </div>

          </div>

          {/* Botão Inferior */}
          <div className="mt-20">
        <button onClick={handleBookNow} className="block w-full py-4 text-center rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-bold hover:opacity-90 transition-opacity mt-auto cursor-pointer">
                  Book Now
                </button>
          </div>

        </div>
      </section>

     

    

      {/* 5. KEY COMPONENTS */}
      <section className="py-24 bg-[#FDFDFD] px-6 mt-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 text-center mb-16 max-w-2xl mx-auto leading-relaxed">
            Key components and intentions of this highly experiential weekend training include:
          </h2>
          <div className={`flex flex-col space-y-10 overflow-hidden transition-[max-height] duration-700 ease-in-out ${isExpanded ? 'max-h-[3000px]' : 'max-h-[250px]'}`}>
            
            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-4xl md:text-5xl font-bold text-[#005C65] shrink-0 pt-1">1</span>
              <div>
                <h3 className="text-lg font-bold text-[#005C65] mb-2">The importance of personal Mindfulness Practice</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Adults are considered vital to the program. Most mindfulness programs for adults or children recommend that the facilitator/therapist or teacher cultivates his or her own personal mindfulness practice. Simply passing mindfulness activities from a book without having experienced them results in the offering feeling shallow/unauthentic.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-4xl md:text-5xl font-bold text-[#005C65] shrink-0 pt-1">2</span>
              <div>
                <h3 className="text-lg font-bold text-[#005C65] mb-2">Mindfulness and Neuroscience</h3>
                <p className="text-sm text-slate-600 leading-relaxed">The core neuroscience of how mindfulness helps decrease anxiety and depressive tendencies. Physical and practical techniques to explore the mind body connection. Practices for neuroplasticity and the brain's 'reward' center, learning, and resilience.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-4xl md:text-5xl font-bold text-[#005C65] shrink-0 pt-1">3</span>
              <div>
                <h3 className="text-lg font-bold text-[#005C65] mb-2">Managing the Youth Mental Health Crisis</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Understanding of what mindfulness is and isn't when working with kids and youth in a crisis. Why mindfulness? Why now? Managing the modern stress response.</p>
              </div>
            </div>

  <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#005C65] shrink-0 pt-1">4</span>
              <div>
                <h3 className="text-lg font-bold text-[#005C65] mb-2">Anxiety, ADHD and Impulse Control: Body Based Mindful Awareness </h3>
                <p className="text-sm text-slate-600 leading-relaxed">how to befriend the body as a source of wisdom and healing. You'll discover how to:
Help kids integrate their mind and body to maximize health, mental health, and learning
Make mindful movement and walking fun, funny, and engaging!
Mindful eating — Real world ideas and insights beyond the raisins for anxiety, depression, ADHD, impulse control and more.</p>
              </div>
            </div>


    <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#005C65] shrink-0 pt-1">5</span>
              <div>
                <h3 className="text-lg font-bold text-[#005C65] mb-2">Make Mindfulness Fun! Arts, Games, Sports and More</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Explore creative ways to make mindfulness fun by integrating it into the activities they are most interested in and enjoy:
Bring mindfulness to games for kids who struggle with attention;
Create your own visualizations with kids;
Make the virtual virtuous with mindful uses of technology;
The more the merrier (or mindful-er?): Small group and partner practices.</p>
              </div>
            </div>


    <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#005C65] shrink-0 pt-1">6</span>
              <div>
                <h3 className="text-lg font-bold text-[#005C65] mb-2">Mindfulness and Compassion in Action</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Learn additional compassion based-practices, plus ways to cultivate mindful and compassionate workplaces, schools and communities.
Strategies for finding time in busy lives for mindfulness practice and self-compassion.
Inspiring and time-tested ideas for creating a mindful and compassionate workplace, school, or family.</p>
              </div>
            </div>


    <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#005C65] shrink-0 pt-1">7</span>
              <div>
                <h3 className="text-lg font-bold text-[#005C65] mb-2">Building a Teacher Community</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Creating a mutually supportive community of teaching will be a core aim of this training, and that includes the creation of an ongoing support system that continues after the training ends.</p>
              </div>
            </div>



          </div>

          {/* GRADIENTE DE FADE OUT - Aparece apenas quando está colapsado */}
  


          {/* Contentor do Botão com Gradiente Integrado */}
<div 
  className={`w-full text-center relative z-20 flex justify-center items-end pb-4 transition-all duration-500
    ${!isExpanded ? 'h-32 -mt-32 bg-gradient-to-t from-white via-white/80 to-transparent' : 'mt-8'}
  `}
>
  <button 
    onClick={() => setIsExpanded(!isExpanded)}
    className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#005C65] hover:text-[#00AEEF] transition-colors bg-white px-6 py-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"
  >
    {isExpanded ? 'See Less' : 'See More'}
    <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
</div>
        </div>
      </section>




 {/* VIDEO YOUTUBE  */}
<section className="p-4 md:p-8">
      {/* Container Principal com fundo azul claro e cantos arredondados */}
     <div className="max-w-[1300px] mx-auto bg-[#e8f4f8] rounded-[2rem] px-[10px] py-10 md:p-16 lg:p-40 flex flex-col md:flex-row items-center gap-10 lg:gap-16 mb-20">
        
  {/* Coluna da Esquerda: Texto */}
  <div className="w-full md:w-1/2 flex flex-col items-start px-2 md:px-0">
    <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 mb-4">
      Featured Testimonial
    </span>
    
    <h2 className="text-[16px] md:text-xl lg:text-[18px] font-medium text-gray-900 mb-6 leading-snug">
      Growing up Stressed or Growing up Mindful?  <em className="italic font-serif">| Christopher Willard</em>
    </h2>
    
    {/* Citação com linha vertical ao lado */}
    <div className="border-l-[2px] border-black pl-5 py-1 mb-8">
      <p className="italic font-serif text-gray-800 text-base lg:text-lg leading-relaxed">
        Teens are the most stressed population. Learn how simple mindfulness exercises not only physically change our brain for the better, but also help our response to stress.. It's been an incredible complement to my practice."
      </p>
    </div>
    
    {/* Botão */}
    <Link 
      href="/inscricao" 
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#111827] text-white text-xs font-bold tracking-wider uppercase px-8 py-4 rounded-full hover:bg-gray-800 transition-colors duration-300 inline-block text-center"
    >
      Register now
    </Link>
  </div>

  {/* Coluna da Direita: Vídeo do YouTube */}
  <div className="w-full md:w-1/2">
    {/* O aspect-video mantém a proporção 16:9 em qualquer ecrã */}
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src="https://www.youtube.com/embed/znlsoaM_ALQ?rel=0" 
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  </div>

      </div>
    </section>


<section className="bg-[#FBC78D] flex items-center justify-center font-sans w-full max-w-[1500px] mx-auto rounded-[2rem] py-8 md:py-16 px-4 md:px-0">
  
  {/* Sua DIV branca (Filho) */}
  <div className="bg-white rounded-[40px] max-w-[1300px] w-full shadow-2xl overflow-hidden flex flex-col md:flex-row p-0 md:p-12 gap-8 md:gap-12 items-center">    
    
    {/* Coluna da Esquerda (Conteúdo) */}
    {/* Adicionado order-2 md:order-1 para inverter a ordem no mobile */}
    <div className="flex-1 space-y-6 px-[30px] md:px-0 py-8 md:py-0 sm:p-5 w-full order-2 md:order-1">
      <header>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1e1b4b] leading-tight">
          Christopher Willard <br />
          <span className="text-2xl font-medium text-gray-500">Mindfulness Expert</span>
        </h2>
      </header>

      <div className="text-gray-600 text-[12px] md:text-[12px] leading-relaxed max-h-60 overflow-y-auto pr-4 custom-scrollbar">
        <p className="mb-4">
          Christopher Willard, Psy. D., is one of the world's leading experts on mindfulness with young people, having trained thousands of professionals and young people on the practice and benefits of mindfulness. He is a psychologist and consultant based in Boston.    Additionally, he is the author of multiple books on psychology, child development, contemplative practice and more. Dr. Willard is the president of the Mindfulness in Education Network.
              
          In addition to serving on the faculty of Harvard Medical School, Dr. Willard leads courses and workshops around the world and online.
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 md:gap-8 py-4 border-y border-gray-100 justify-between md:justify-start">
        <div>
          <span className="block text-xl font-bold text-[#1e1b4b]">★ 4,9</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Rating</span>
        </div>
        <div>
          <span className="block text-xl font-bold text-[#1e1b4b]">18+</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Books</span>
        </div>
        <div>
          <span className="block text-xl font-bold text-[#1e1b4b]">100k+</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Students</span>
        </div>
      </div>

      {/* Botão e CTA */}
   <div className="flex items-center gap-4 md:gap-6 flex-wrap">
  <a 
    href="https://drchristopherwillard.com/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-6 md:px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-200 inline-block text-center"
  >
    See more
  </a>
  {/*<span className="text-xl font-bold text-gray-800">Grátis</span>*/}
</div>
      
      <p className="text-xs text-gray-400 flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        More than 100,000 people already follow his work.
      </p>
    </div>

    {/* Coluna da Direita (Imagem Estilizada) */}
    {/* Adicionado order-1 md:order-2 e mt-8 md:mt-0 para ajuste no mobile */}
    <div className="relative w-[260px] md:w-[350px] h-[290px] md:h-[400px] flex-shrink-0 mb-8 md:mb-0 mt-8 md:mt-0 order-1 md:order-2">
      <div className="absolute inset-0 bg-[#F9AE4E] rounded-3xl rotate-3 translate-x-2"></div>
      <div className="relative h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-[#F9AE4E] via-[#FBC78D] to-[#F9AE4E]">
        <img 
          src="https://64.media.tumblr.com/4339db311265c820b7dfb48125b87e11/52e20d9f4fe4ef28-87/s1280x1920/2befcc572b3ace7dfe0f91fc67837c8a00152671.pnj" 
          alt="Christopher Willard"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[110%] object-cover object-top contrast-110"
        />
      </div>
    </div>

  </div>
</section>



      


      {/* 8. FAQ & SCHEDULE */}
  <section className="py-2 bg-white px-6 mt-30 mb-30">
  <div className="max-w-4xl mx-auto">
    <h3 className="text-xl font-bold text-slate-800 text-center mb-12">In Detail + FAQ</h3>
    
    {/* Acordeão 1: Suggested Readings */}
    <div className="border-t border-slate-200">
      <button onClick={() => toggleAccordion('readings')} className="w-full flex justify-between items-center py-6 text-xs uppercase tracking-widest font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        Suggested Readings <span>{openAccordion === 'readings' ? '−' : '+'}</span>
      </button>
      {openAccordion === 'readings' && (
      <div className="bg-slate-50 p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm mb-6">
  <ul className="space-y-6 list-none pl-0">
            
            <li className="flex items-start gap-4 group">
      {/* Bullet point elegante */}
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-600 transition-colors duration-300 shrink-0"></span>
      <p className="text-sm text-slate-700 leading-relaxed">
        <span className="font-medium text-slate-900">Willard, C.</span> (2018). <em className="italic text-slate-800">The Wisdom and science of happy families and thriving children.</em>. Sounds True.
      </p>
    </li>

    {/* Livro 2 (Versão Completa) */}
    <li className="flex items-start gap-4 group">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-600 transition-colors duration-300 shrink-0"></span>
      <p className="text-sm text-slate-700 leading-relaxed">
        <span className="font-medium text-slate-900">Kabat Zinn, J.</span> (2016). <em className="italic text-slate-800">Full Catastrophe Living: Using the Wisdom of your Body and Mind to Face Stress, Pain and Illness</em>.
      </p>
    </li>

    {/* Livro 3 */}
    <li className="flex items-start gap-4 group">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-600 transition-colors duration-300 shrink-0"></span>
      <p className="text-sm text-slate-700 leading-relaxed">
        <span className="font-medium text-slate-900">Willard, C.</span> (2016). <em className="italic text-slate-800">Growing Up Mindful: Essential Practices to Help Children, Teens, and Families Find Balance, Calm, and Resilience</em>. Sounds True.
      </p>
    </li>

    {/* Livro 4 */}
    <li className="flex items-start gap-4 group">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-600 transition-colors duration-300 shrink-0"></span>
      <p className="text-sm text-slate-700 leading-relaxed">
        <span className="font-medium text-slate-900">Willard, C. & Saltzman, A.</span> (2017). <em className="italic text-slate-800">Teaching Mindfulness Skills to Kids and Teens</em>. Guilford Press.
      </p>
    </li>
          </ul>
        </div>
      )}
    </div>

    {/* Acordeão 2: FAQ */}
    <div className="border-t border-b border-slate-200">
      <button onClick={() => toggleAccordion('faq')} className="w-full flex justify-between items-center py-6 text-xs uppercase tracking-widest font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        Frequently Asked Questions <span>{openAccordion === 'faq' ? '−' : '+'}</span>
      </button>
      {openAccordion === 'faq' && (
        <div className="bg-slate-50 p-8 text-sm text-slate-800 leading-relaxed border border-slate-100 mb-6">
          <div className="space-y-8">
            
            {/* Q1 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                I am flying in for the training. What are my options and what do you recommend?
              </h4>
              <p>
                About 50 kms from Oporto airport Nestled in the beautiful North of Portugal. It offers fresh air, mountain vistas, gorgeous wooded acreage, personalized service and the best facilities around. Located just 40 minutes from Oporto Airport, with great accesses, train and taxi, you will feel a million miles away from the city, but we&apos;re close enough for an easy getaway.
              </p>
            </div>

            {/* Q2 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                What time should I plan to arrive? When do we finish?
              </h4>
              <p>
                We will begin checking people into the training after 6 pm on the first day of the training. However, it may be possible for you to arrive before and have access to your room. We ask that you plan on arriving no later than 6:30pm so that we can begin with the full group. We plan to end the retreat by 5pm on the last day. So please plan your travel accordingly, using the time guidelines above. Sometimes situations arise in which people have to leave the retreat earlier than noon on the last day but we strongly urge you to avoid this if at all possible.
              </p>
            </div>

            {/* Q3 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                Is there wireless service/cellular phone use?
              </h4>
              <p>
                Yes, there is wireless internet service while at the retreat center.
              </p>
            </div>

            {/* Q4 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                Is it possible to stay extra nights at the facility or arrive a day or two early?
              </h4>
              <p>
                The retreat center is often booked both right before and right after our training, so arriving early or staying an extra night or two after the retreat it&apos;s a possibility. Also, you can arrange to stay at lodging near the retreat center if you would like to extend your stay. Contact us directly at <a href="mailto:eventos.spmbe@gmail.com" className="text-blue-600 hover:underline">eventos.spmbe(at)gmail</a> to make such arrangements.
              </p>
            </div>

            {/* Q5 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                What do I need to bring?
              </h4>
              <p>
                If it is at all possible, please bring a meditation cushion (zafu) and a yoga mat. We will have a few cushions but maybe not enough to everyone, so if you have one and can squeeze it into your luggage or bring it as a carry-on please consider doing so. It is always advisable to check the weather forecast prior to traveling, to help guide you in proper clothing choices.
              </p>
            </div>

            {/* Q6 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                Security?
              </h4>
              <p>
                The relatively remote nature of the location makes security a minor concern.
              </p>
            </div>

            {/* Q7 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                What should I expect regarding the format of the training?
              </h4>
              <p>
                This training is taught in a retreat format, which means there is a great deal of mindfulness practice embedded in the training, and we want to reiterate that now so you are not surprised when you get here. The venue very much facilitates this format; we will meet, eat and be housed in a relatively secluded area. There are no other large groups planned in the center so it should be relatively quiet and secluded. The rooms have private bathroom, are clean and comfortable.
              </p>
            </div>

            {/* Q8 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                What should I read prior to arriving?
              </h4>
              <p>
                Check the &quot;Schedule and Required Reading&quot; page of the specific training you are registered to attend.
              </p>
            </div>

            {/* Q9 */}
            <div>
              <h4 className="font-semibold text-slate-900 text-base mb-2">
                What if I require some special accommodations or have dietary restrictions?
              </h4>
              <p>
                While you are asked to note specific food restrictions on your registration application, if there are any additional food or medical concerns we should be aware of please <a href="#" className="text-blue-600 hover:underline">let us know</a> of these in advance so we may assist you.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>

  </div>
</section>

     {/* 10. PREÇOS */}
<section id="register" className="bg-[#0F172A] py-32 px-6">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-20">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight uppercase">{event?.titulo}</h2>
      <p className="text-white font-medium text-lg">{event?.dataEventoTexto} - {event?.local}</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Early Bird */}
      <div className="bg-gradient-to-b from-[#00AEEF]/20 rounded-2xl p-10 border border-[#A855F7] relative flex flex-col shadow-2xl">
        <h3 className="text-5xl font-bold text-white mb-4">{event?.earlyBirdPrice.toFixed(0)}€</h3>
        <p className="text-slate-300 font-medium mb-1">On or before {event?.earlyBirdDate}</p>
        <p className="text-[#00AEEF] font-bold text-sm mb-8">Early-Bird Rate</p>



  {/* Novo botão Glassmorphism */}
<a 
  href="/inscricao" 
  target="_blank" 
  rel="noopener noreferrer"
  className="block w-full py-4 text-center rounded-xl 
             bg-white/10 backdrop-blur-xl 
             border-t border-l border-white/20 border-b border-r border-white/10
             text-white font-bold 
             shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
             hover:bg-white/30 transition-all mb-5"
>
  Register
</a>

        <button onClick={handleBookNow} className="w-full py-4 text-center rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-bold hover:opacity-90 transition-opacity">Book Now</button>
      </div>

      {/* Standard */}
      <div className="bg-[#1E293B] rounded-2xl p-10 border border-slate-700 flex flex-col shadow-2xl">
        <h3 className="text-5xl font-bold text-white mb-4">{event?.regularPrice.toFixed(0)}€</h3>
        <p className="text-slate-300 font-medium mb-1">After {event?.earlyBirdDate}</p>
        <p className="text-[#A855F7] font-bold text-sm mb-8">Standard Rate</p>

          {/* Novo botão Glassmorphism */}
<a 
  href="/inscricao" 
  target="_blank" 
  rel="noopener noreferrer"
  className="block w-full py-4 text-center rounded-xl 
             bg-white/20 backdrop-blur-xl 
             border-t border-l border-white/20 border-b border-r border-white/10
             text-white font-bold 
             shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
             hover:bg-white/30 transition-all mb-5"
>
  Register
</a>

        <button onClick={handleBookNow} className="w-full py-4 text-center rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors">Book Now</button>
      </div>
    </div>

    {/* --- NOVA CAIXA DE INFORMAÇÕES IMPORTANTES --- */}
    <div className="max-w-4xl mx-auto mt-12 bg-[#1E293B]/40 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-slate-700/50">
      <h4 className="text-white font-semibold text-md mb-6 flex items-center gap-3">
        {/* Ícone de Informação */}
        <svg className="w-5 h-5 text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Important Information
      </h4>
      
      {/* Grelha de 2 colunas para o texto */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 text-[10px] text-slate-300 leading-relaxed">
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>In the application form select the Training – Growing Up Mindful.</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>After registering, you will be redirected to pay the 80 euro reservation via PayPal. The 80 euros is already a portion of the full payment.</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>This event takes place with a minimum and maximum number of participants. Therefore, if you are interested, we suggest you register and reserve as soon as possible to help with logistics.</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>For cancellations up to one month prior to the beginning of the course, an administration fee of 50 Euro will be charged.</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>We are not responsible for any expenses that you may incur to come to this training.</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>If you have any food intolerance or special needs, please inform us in advance.</p>
        </li>
      </ul>
    </div>
    {/* --- FIM DA NOVA CAIXA --- */}

  </div>
</section>



{/* 9. RELATED / SUGGESTED EVENTS (SANITY) */}
      {event?.suggestedEvents && event.suggestedEvents.length > 0 && (
        <section className="py-24 bg-white px-6">
          <div className="max-w-[1300px] mx-auto overflow-hidden">
            
            {/* Título da Secção (Opcional, podes remover se a imagem não tiver) */}
            <div className="flex flex-col items-start mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800">
                You might also be interested in
              </h3>
            </div>

            {/* Container do Carrossel */}
            <div 
              ref={relatedCarouselRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {event.suggestedEvents.map((evt) => (
                <Link 
                  // 👇 A CONDIÇÃO MÁGICA ESTÁ AQUI
                  href={evt.tipoEvento === 'retreat' ? `/t/${evt.slug?.current || ''}` : `/eventos/${evt.slug?.current || ''}`} 
  key={evt._id}
               
                  className="relative w-[280px] md:w-[320px] h-[420px] flex-shrink-0 rounded-2xl overflow-hidden snap-start group block shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  {/* Imagem de Fundo Completa */}
                  <img 
                    src={evt.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"} 
                    alt={evt.titulo}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  
                  {/* Gradiente Escuro (Mais forte em cima e em baixo para ler os textos) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80"></div>
                  
                  {/* Conteúdo do Cartão */}
                  <div className="relative h-full flex flex-col p-6 z-10">
                    
                    {/* Topo: Tags ONLINE e PREÇO */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="border border-white/30 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                        {evt.tipologia || 'Online'} 
                      </span>

                      {/* Se o teu schema já tiver o preco nestes eventos, usa evt.preco. Senão usa fallback */}
                      <span className="bg-white text-slate-900 text-[13px] font-extrabold px-3 py-1 rounded-full">
                        {evt.preco || evt.regularPrice || evt.earlyBirdPrice 
                          ? `${evt.preco || evt.regularPrice || evt.earlyBirdPrice}€` 
                          : '35€'}
                      </span>
                    </div>

                    <div className="flex justify-between items-start mb-4">
                      <span className="border border-white/30 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                        {evt.dataEventoTexto || 'Online'} 
                      </span>
                    </div>
                    
                    {/* Meio: Título e Autor */}
                    <div className="mt-2">
                      <h4 className="text-white text-xl md:text-2xl font-bold leading-tight mb-1">
                        {evt.titulo}
                      </h4>
                      <p className="text-white/80 text-sm font-medium">
                        {/* Se tiveres o autor no sanity, muda para evt.autor. Senão fica este placeholder da foto */}
                         {evt.autorNome}
                      </p>
                    </div>
                    
                    {/* Espaçador flexível para empurrar o botão para o fundo */}
                    <div className="flex-grow"></div>
                    
                    {/* Botão Inferior COMPRAR */}
                    <button className="w-full bg-white text-slate-900 text-xs font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-slate-100 transition-colors">
                      Ver mais
                    </button>

                  </div>
                </Link>
              ))}
            </div>

            {/* Pontos Decorativos do Carrossel (Como na imagem) */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <div className="w-8 h-2.5 bg-slate-800 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
            </div>

          </div>
        </section>
      )}








      {/* MODAL VÍDEO */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsVideoOpen(false)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black shadow-2xl">
            <button onClick={() => setIsVideoOpen(false)} className="absolute -top-10 right-0 text-white hover:text-red-500 transition-colors uppercase tracking-widest text-sm">Fechar ✕</button>
            <iframe className="w-full h-full relative z-10" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        </div>
      )}

      {/* ESTILOS CUSTOMIZADOS INTEGRADOS */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        
        :root {
            --primary-color: #e33a11;
            --bg-color: #f4f9fc;
            --text-dark: #1a1a1a;
            --text-gray: #4a4a4a;
        }

        .hero-section {
            display: flex;
            width:100%; max-width: 100%;
            margin: 0 auto;
            min-height: 100vh;
            padding: 100px 40px 40px 40px;
            gap: 60px;
            align-items: center;
            overflow: hidden;
            background: linear-gradient(to bottom, #E7F6FA 0%, #FFFFFF 100%);
        }

        * {
            box-sizing: border-box;
        }

        .hero-inner {
            display: flex;
            max-width: 1600px;
            margin: 0 auto;
            padding-left: 10%; 
            padding-right: 0px; 
            gap: 40px; 
            justify-content: space-between;
            align-items: center;
        }

        .content-side { flex: 1; z-index: 2; text-align: left; }
        
        .logos-row { display: flex; gap: 15px; margin-bottom: 25px; }
        
        .logo-placeholder {
            background: white;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border: 1px solid #eee;
            color: #1a1a1a;
        }

        .content-side h1 {
            font-size: 3.5rem;
            margin-bottom: 20px;
            color: var(--text-dark);
            font-weight: 800;
            line-height: 1.1;
            text-transform: lowercase;
        }

        .description {
            font-size: 1.1rem;
            line-height: 1.6;
            color: var(--text-gray);
            margin-bottom: 35px;
            max-width: 550px;
        }

        .cta-area { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }

        .btn-sample {
            background-color: var(--primary-color);
            color: white;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
        }

        .btn-sample:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(227, 58, 17, 0.2); }

        .enroll-link {
            color: var(--text-dark);
            text-decoration: underline;
            font-weight: 700;
            background: none;
            border: none;
            cursor: pointer;
        }

        .students-row { display: flex; align-items: center; gap: 15px; margin-bottom: 45px; }
        .avatar-group { display: flex; }
        .avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 2px solid white;
            margin-left: -12px;
            background-size: cover;
            background-position: center;
        }
        .avatar:first-child { margin-left: 0; }
        .student-count { font-size: 0.9rem; font-weight: 700; color: var(--text-dark); }

        .info-box {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            display: flex;
            padding: 25px;
            gap: 30px;
            max-width: 550px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .info-item h4 {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 10px;
            color: #94a3b8;
        }

        .info-item p { font-size: 0.95rem; font-weight: 600; line-height: 1.4; color: #334155; }
        .price-value { font-size: 1.4rem; font-weight: 800; color: #1e293b; display: block; }

        .marquee-side {
            display: flex;
            gap: 12px;
            flex: 0 1 450px; 
            height: 800px;
            position: relative;
            margin-right: 0px; 
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            overflow: hidden;
        }

        .marquee-column {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
        }

        .instructor-card {
            width: 100%;
            aspect-ratio: 3 / 3.1;
            flex-shrink: 0;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            background-color: #000;
        }

        .instructor-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        
        .instructor-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 25px;
            background: linear-gradient(transparent, rgba(0,0,0,0.9));
            color: white;
            text-align: left;
        }

        .instructor-info h3 { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
        .instructor-info p { font-size: 0.55rem; opacity: 0.8; font-weight: 500; }

        .marquee-up { animation: scroll-up 40s linear infinite; }
        .marquee-down { animation: scroll-down 40s linear infinite; }
        .marquee-side:hover .marquee-column { animation-play-state: paused; }

        @keyframes scroll-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }

        @keyframes scroll-down {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
        }

        @keyframes scroll-vertical {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }





        @media (max-width: 992px) {
            .hero-section {
        /* Reduz os 40px laterais para apenas 15px, dando muito mais espaço ao conteúdo */
        padding: 80px 15px 30px 15px; 
        /* Muda o flex para coluna para que os blocos fiquem empilhados e não esmagados de lado */
        flex-direction: column;
        gap: 30px;
    }

    .hero-inner {
        /* Remove o padding de 10% que estava a empurrar tudo para a direita! */
        padding-left: 0;
        padding-right: 0;
        /* Garante que o interior também se empilha verticalmente */
        flex-direction: column;
        width: 100%;
        gap: 20px;
    }

    /* MUITO IMPORTANTE: Garante que o bloco de conteúdo interno 
       também use flex para centrar os textos e botões */
    .content-side {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
    }

            .content-side h1 { font-size: 2.8rem; }

.marquee-side {
        width: 100%;
        height: 550px;
        flex: none;
        gap: 10px;
        /* As correções mágicas: */
        margin: 0 auto !important; /* Anula a margem direita do desktop e centra a caixa inteira */
        justify-content: center; /* Centra as duas colunas perfeitamente a meio */
        padding: 0; /* Garante que não há paddings escondidos a empurrar o conteúdo */
    }

    .marquee-column {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
    }

            .instructor-card {
                height: 150px;
            }

            .info-box { 
                display: flex;
                flex-direction: column; 
                width: 100%; 
                max-width: 100%;
                gap: 0px; 
                padding: 25px 10px; 
                box-sizing: border-box; 
                margin: 0;
            }

            .logos-row, .cta-area, .students-row { 
                display: flex;
                justify-content: center; 
            }
        }

        .program-info-section {
            background-color: #12233F;
            padding: 100px 0;
            color: white;
            width:100%; max-width:1450px;
            margin: -80px auto;
            border-radius:12px;
            position: relative;
            z-index: 50;
        }

        .feature-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.15em;
            margin-bottom: 1.5rem;
            color: white;
        }

        .feature-title svg { color: white; opacity: 0.8; }
        .feature-text { font-size: 0.8rem; line-height: 1.6; color: #f1f1f1; font-weight: 400; }

        @media (max-width: 768px) {
            .program-info-section { padding: 60px 0; margin-top: 20px; }
            .feature-card {
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .feature-card:last-child { border-bottom: none; }
        }
      `}} />
    </div>
  );
}