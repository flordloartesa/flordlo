'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { useCart } from '@/app/context/CartContext'; 
import Link from '@/components/MyLink';
import { Play, X, Share2, Gift, Mail, MessageCircle, Instagram, Facebook, Telegram, Send, Check } from 'lucide-react';

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
    }; // Fechei o objeto marqueeSettings aqui, que estava a faltar no teu código

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
  }
}

export default function eventosSoltosLayoutMindfulEating({ event }: SanityEventProps) {

  console.log("CONTEÚDO DO EVENTO:", event);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const router = useRouter();
  const { addToCart } = useCart();
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'readings' | 'faq' | 'schedule' | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DO CARROSSEL RELATED EVENTS (Estabilizada) ---
  const relatedCarouselRef = useRef<HTMLDivElement>(null);
  
  // Tranca de montagem (essencial no Next.js para não chocar com o SSR)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []); // <-- Corre apenas uma vez na montagem

  useEffect(() => {
    // Só inicia o carrossel se a página já estiver montada no cliente
    if (!isMounted || !event?.suggestedEvents || event.suggestedEvents.length === 0) return;

    let interval: ReturnType<typeof setInterval>;

    // Adicionado requestAnimationFrame para proteger a Main Thread e evitar memory leaks
    const startCarousel = () => {
      interval = setInterval(() => {
        if (relatedCarouselRef.current) {
          window.requestAnimationFrame(() => {
            const { scrollLeft, scrollWidth, clientWidth } = relatedCarouselRef.current!;
            if (scrollLeft + clientWidth >= scrollWidth - 10) {
              relatedCarouselRef.current!.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              relatedCarouselRef.current!.scrollBy({ left: 320, behavior: 'smooth' });
            }
          });
        }
      }, 5000);
    };

    startCarousel();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMounted, event?.suggestedEvents]);

  // Lógica de Fallback para a Marquee: Se o Sanity estiver vazio, usa os teus dados originais
  const marqueeData = {
    coluna1: event?.marqueeSettings?.coluna1?.length ? event.marqueeSettings.coluna1 : [
      { imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500", nome: "Dr. Vítor Bertocchini", cargo: "Clinical and Health Psychologist, Ph.D." },
      { imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744a05?w=500", nome: "Dr. Vítor Bertocchini", cargo: "Clinical and Health Psychologist, Ph.D." },
    ],
    coluna2: event?.marqueeSettings?.coluna2?.length ? event.marqueeSettings.coluna2 : [
      { imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500", nome: "Dr. Vítor Bertocchini", cargo: "Clinical and Health Psychologist, Ph.D." },
      { imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500", nome: "Dr. Vítor Bertocchini", cargo: "Clinical and Health Psychologist, Ph.D." },
    ]
  };

  // --- NOVA SECÇÃO: DADOS DO PÚBLICO ALVO ---
  const audienceList = [
    
    {
      title: "PROFISSIONAIS DE SAÚDE",
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&h=200&q=80",
      alt: "Médica - Mindfulness"
    },
    {
      title: "Pessoas com Alimentação Emocional ou Binge Eating",
      imageUrl: "https://images.unsplash.com/photo-1541961152178-0077098ff937?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmluZ2UlMjBlYXRpbmd8ZW58MHx8MHx8fDA%3D",
      alt: "Binge Eating - Mindfulness"
    },
    {
      title: "EDUCADORES E PROFESSORES",
      imageUrl: "https://plus.unsplash.com/premium_photo-1683121152928-787ececd7359?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzc29yZXN8ZW58MHx8MHx8fDA%3D",
      alt: "Mindfulness"
    },
    {
      title: "Profissionais de Alta Performance e Executivos",
      imageUrl: "https://images.unsplash.com/photo-1758519288495-5f79a4bbab83?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fGV4ZWN1dGl2ZSUyMGpvYnxlbnwwfHwwfHx8MA%3D%3D",
      alt: "Mindfulness at work"
    },
    {
      title: "Pessoas Cansadas das Dietas (Efeito Ioiô)",
      imageUrl: "https://images.unsplash.com/photo-1522844990619-4951c40f7eda?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Mindul eating"
    },
    {
      title: "Instrutores de Yoga, Life Coaches, etc.",
      imageUrl: "https://plus.unsplash.com/premium_photo-1674059549600-112258d701ca?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8eW9nYSUyMHRlYWNoZXJ8ZW58MHx8MHx8fDA%3D",
      alt: "Pessoa relaxada - Mindfulness"
    }
  ];

  // Função que limpa o link do Sanity e tira apenas o ID do vídeo
  const getYouTubeId = (url) => {
    if (!url) return '';
    // Se por acaso já for apenas o ID, devolve diretamente
    if (url.length === 11 && !url.includes('/')) return url;
    // Se for link inteiro ou Short, extrai o ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length >= 11) ? match[2] : 'IORFrgBauqo';
  };

  // Variável com o ID limpo e pronto a usar
  const finalVideoId = getYouTubeId(event?.youtubeId || "IORFrgBauqo");



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
// para pagar o curso

    // 1. Definimos o preço normal como base (segurança: se algo falhar, aplica o valor normal)
    let precoFinal = event?.regularPrice || 299;

    // 2. Verificamos se o Sanity enviou uma data e um preço Early Bird
    if (event?.earlyBirdDate && event?.earlyBirdPrice) {
      const dataLimite = new Date(event.earlyBirdDate);
      
      // Truque importante: Ajustar a data limite para as 23:59:59.
      // Assim garantimos que o desconto é válido até ao último minuto desse dia!
      dataLimite.setHours(23, 59, 59, 999); 
      
      const dataAtual = new Date();

      // 3. Comparamos as datas: se ainda estivermos a tempo, muda o preço para o Early Bird
      if (dataAtual <= dataLimite) {
        precoFinal = event.earlyBirdPrice;
      }
    }

   // 4. Enviamos para o carrinho com o preço calculado dinamicamente
    addToCart({
      // 🔥 A MÁGICA ACONTECE AQUI: Passamos o ID real do Sanity
      _id: event?._id, 
      
      // Opcional, mas recomendado: manter o tipo real do documento
      _type: "eventos", 
      
      // Podes manter o teu texto de "Garantir Vaga", o Sanity vai ignorar isto
      // e ler o título real lá no painel, mas fica bonito no teu frontend!
      title: `Garantir Vaga - ${event?.titulo || "Workshop"}`, 
      
      price: precoFinal, 
      quantity: bookingQuantity 
    });
    
    router.push('/checkout'); 
  };



  useEffect(() => {
    if (!isMounted || isCarouselHovered) return;
    const intervalId = setInterval(() => {
      if (carouselRef.current) {
        window.requestAnimationFrame(() => {
          const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current!;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            carouselRef.current!.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            carouselRef.current!.scrollBy({ left: 400, behavior: 'smooth' });
          }
        });
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isMounted, isCarouselHovered]);
  
  // (O resto do teu componente / return vai aqui por baixo)

  return (
    <div className="min-h-screen bg-[#FDFDFD]  text-slate-800 font-sans overflow-x-hidden selection:bg-slate-200">
      
      {/* NOVA SECÇÃO INTEGRADA: HERO COM MARQUEE VERTICAL */}
      <section className="hero-section">
        <div className="hero-inner">
        <div className="content-side">
        
        <div className="logos-row">
            <div className="logo-placeholder">Workshop</div>
            
          </div>
          {/*<div className="logos-row">
            <div className="logo-placeholder">SM APPROVED</div>
            <div className="logo-placeholder">AA APPROVED</div>
          </div> */}

<p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1 font-medium">
            {event?.subtitle || "TEACHING MINDFULNESS TO KIDS AND TEENS RETREAT"} 
        </p>
          <h1>{event?.titulo || "Teaching Mindfulness+"}</h1>
          
          <p className="description">
               Reconecta-te com a sabedoria inata do teu corpo através do programa MB-EAT de <em>Jean Kristeller</em>. 
               Um treino transformador para romper com a alimentação automática, cultivar consciência plena à mesa e criar uma relação saudável e duradoura com a comida.
          </p>

{/* Contentor de 3 Colunas Sem Quebra no Mobile */}
<div className="grid grid-cols-3 gap-2 sm:gap-2 w-full max-w-[450px] mx-auto lg:mx-0 py-2 px-6 bg-white rounded-full border border-slate-100 shadow-sm mb-12 -mt-2 text-center lg:text-left">
  
 {/* Coluna 1: Data */}
  <div className="flex flex-col items-center lg:items-start">
    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-0 font-bold whitespace-nowrap">Data</span>
    <span className="text-[10px] font-medium text-slate-900 leading-tight mb-0.5">
      {event?.dataEventoTexto}
    </span>
  </div>

  {/* Coluna 2: Local (COM AS LINHAS SEPARADORAS) */}
  <div className="flex flex-col items-center lg:items-start border-x border-slate-200 px-2 sm:px-4">
    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-0 font-bold whitespace-nowrap">Local</span>
    <span className="text-[10px] font-medium text-slate-900 leading-tight">
      {event?.local || "Barcelos"}
    </span>
  </div>

  {/* Coluna 3: Idioma */}
  <div className="flex flex-col items-center lg:items-start">
    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-0 font-bold whitespace-nowrap">Idioma</span>
    <span className="text-[10px] font-medium text-slate-900 leading-tight">
      {event?.idioma || "Português"}
    </span>
  </div>

</div>


          <div className="cta-area">
            <button onClick={() => setIsVideoOpen(true)} className="btn-sample">Ver Vídeo</button>
            <span className="text-sm font-medium"> <button onClick={handleBookNow} className="enroll-link">Garantir Vaga</button></span>
          </div>

          {/*<div className="students-row">
            <div className="avatar-group">
              <div className="avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop')" }}></div>
              <div className="avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop')" }}></div>
              <div className="avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop')" }}></div>
              <div className="avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop')" }}></div>
            </div>
            <span className="student-count">1k+ happy students</span>
          </div> */}

          <div className="info-box">
            <div className="info-item">
              <h4>Duração</h4>
              <p className="text-[10px]">Uma jornada online de +10 horas para aprofundar a <br/>prática da Alimentação Consciente.  <br/>Obtém o teu certificado de participação.</p>
            </div>
            <div className="info-item">
              <h4>Preço Flexível</h4>
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
          src="https://static.wixstatic.com/media/8c5aa8_25d39b9033e84445a5461268e6f8644b~mv2.png/v1/fill/w_1168,h_1316,fp_0.51_0.44,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/MARIANA%20MARQUES.png" 
          alt="Foto do Formador" 
          className="w-34 h-34 mx-auto rounded-full object-cover mb-2 shadow-sm border border-slate-200"
        />
            </div>
            <p className="text-2xl md:text-3xl font-serif italic text-white mb-2">Orientado por Mariana Marques, Ph.D.</p>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/50"> Psicóloga, Sexóloga, Facilitadora de Mindfulness </p>
          </div>

          {/* Título Principal */}
          <div className="text-left mb-16 max-w-5xl">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-8 leading-tight">
              {event?.titulo || "mindfulness expert"}
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
                INSTRUTORA QUALIFICADA
              </h3>
              <p className="feature-text">
                Marina Marques é facilitadora certificada de Mindfulness: Mindfulness-Based Stress Reduction (MBSR); Mindfulness-Based Eating Awareness Training (MB-EAT); A Still Quiet Place; Mindfulness Childbirth and Parenting Program e Mindfulness-Based Cognitive Therapy (MBCT). 
              </p>
            </div>

            {/* Item 2 */}
            <div className="feature-card">
              <h3 className="feature-title">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                APRENDIZAGEM IMERSIVA 
              </h3>
              <p className="feature-text"> Um "retiro" online estruturado onde praticas lado a lado com outros participantes e instrutores – sem vídeos pausados, sem procrastinação, apenas aprendizagem focada e conexão genuína com a tua sabedoria alimentar interna.</p>
            </div>

            {/* Item 3 */}
            <div className="feature-card">
              <h3 className="feature-title">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
               HANDS‑ON MINDFULNESS
              </h3>
              <p className="feature-text">Um workshop abrangente que aborda as causas profundas da alimentação automática e emocional através de meditações guiadas, exercícios práticos, partilha em grupo e mentoria direta – não apenas teoria, mas experiência real de reconexão com os sinais de fome e saciedade do teu corpo.</p>
            </div>

            {/* Item 4 */}
            <div className="feature-card">
              <h3 className="feature-title">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                MINDFUL EATING PRÁTICO
              </h3>
              <p className="feature-text"> Experiências Sensoriais, Cozinha Consciente + Explora formas criativas de integrar a alimentação consciente no teu dia a dia: transforma as refeições em momentos de presença, descobre o prazer de comer com atenção plena e aprende a cozinhar como prática meditativa. </p>
            </div>

          </div>

          {/* Botão Inferior */}
          <div className="mt-20">
        <button onClick={handleBookNow} className="block  w-full max-w-[400px] mx-auto py-4 text-center rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-bold hover:opacity-90 transition-opacity mt-auto cursor-pointer">
                  QUERO PARTICIPAR
                </button>
          </div>

        </div>
      </section>

      

    

      {/* 5. KEY COMPONENTS */}
      <section className="py-24 bg-[#FDFDFD] px-6 mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#30C5C2] mb-4">
              Com a sua participação <br />
              terá acesso a uma
            </h2>
            <p className="text-sm md:text-base font-semibold text-slate-500 max-w-2xl mx-auto leading-relaxed">
              maior conexão com os seus mecanismos inatos de feedback homeostático do corpo, algo que é central para a autoregulação comportamental e para a promoção de respostas adaptativas, tais como:
            </p>
          </div>
          <div className={`flex flex-col space-y-10 overflow-hidden transition-[max-height] duration-700 ease-in-out ${isExpanded ? 'max-h-[3000px]' : 'max-h-[250px]'}`}>
            
            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-4xl md:text-5xl font-bold text-[#30C5C2] shrink-0 pt-1">1</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Integrar o corpo, o "coração" e a mente na escolha, preparação e ingestão dos alimentos</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Aprender a comer quando está com fome e parar quando está saciada.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-4xl md:text-5xl font-bold text-[#30C5C2] shrink-0 pt-1">2</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Potencial perda de peso como efeito colateral</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Como resultado dos pontos anteriores, frequentemente, perde peso, se tiver excesso de peso.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-4xl md:text-5xl font-bold text-[#30C5C2] shrink-0 pt-1">3</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Aprender como a comida afeta o seu humor e a sua energia vital ao longo do dia</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Aprender a discernir quais alimentos melhor nutrem o seu exercício, trabalho e divertimento.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#30C5C2] shrink-0 pt-1">4</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Mergulhar nas cores, texturas, aromas, sabores e até nos sons de beber e comer.</h3>
                <p className="text-sm text-slate-600 leading-relaxed">permite-nos ser curiosos e até divertidos ao investigarmos as nossas respostas à comida e às nossas pistas internas de fome e saciedade.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#30C5C2] shrink-0 pt-1">5</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Técnicas para provar a comida e saborear a comida saudável</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Talvez concluir que alimentos não saudáveis não são tão saborosos quanto pensava, nem a fazem sentir muito bem.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#30C5C2] shrink-0 pt-1">6</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Maior Consciência</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Comer em excesso socialmente pode tornar-se menos problemático - poderá comer conscientemente enquanto socializa.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#30C5C2] shrink-0 pt-1">7</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Maior Equilíbrio</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Mindfulness pode diminuir diretamente a tendência a nos envolvermos numa alimentação descontrolada.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-10">
              <span className="text-3xl md:text-4xl font-bold text-[#30C5C2] shrink-0 pt-1">8</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">O Mindful Eating substitui a autocrítica pelo autocuidado</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Substitui a vergonha pelo respeito da sua própria sabedoria interior.</p>
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
    {isExpanded ? 'Ver menos' : 'Ver mais'}
    <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
</div>
        </div>
      </section>




 {/* VIDEO YOUTUBE  */}
<section className="p-0 md:p-8">
      {/* Container Principal com fundo azul claro e cantos arredondados */}
     <div className="max-w-[1300px] mx-auto bg-[#e8f4f8] rounded-[2rem] px-[10px] py-10 md:p-16 lg:p-40 flex flex-col md:flex-row items-center gap-10 lg:gap-16 -mb-12 md:-mb-18 ">
        
  {/* Coluna da Esquerda: Texto */}
  <div className="w-full md:w-1/2 flex flex-col items-start px-2 md:px-0">
    <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 mb-4">
      Featured 
    </span>
    
    <h2 className="text-[16px] md:text-xl lg:text-[18px] font-medium text-gray-900 mb-6 leading-snug">
      Mindfulness-Based Eating  <em className="italic font-serif">| Jean Kristeller, Ph.D. </em>
    </h2>
    
    {/* Citação com linha vertical ao lado */}
    <div className="border-l-[2px] border-black pl-5 py-1 mb-8">
      <p className="italic font-serif text-gray-800 text-base lg:text-lg leading-relaxed">
        
Kristeller has taught at Harvard University, University of Massachusetts Medical School, and Indiana State University and is cofounder of The Center for Mindful Eating.
      </p>
    </div>
    
    {/* Botão */}
    <Link 
      href="/inscricao" 
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#111827] text-white text-xs font-bold tracking-wider uppercase px-8 py-4 rounded-full hover:bg-gray-800 transition-colors duration-300 inline-block text-center"
    >
      Inscrever-me agora
    </Link>
  </div>

  {/* Coluna da Direita: Vídeo do YouTube */}
  <div className="w-full md:w-1/2">
    {/* O aspect-video mantém a proporção 16:9 em qualquer ecrã */}
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src="https://www.youtube.com/embed/oQo-gTcYmzg?rel=0" 
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  </div>

      </div>
    </section>




  {/* REDES SOCIAIS */}
<section className="mt-20 mb-5">
  <div className="w-full max-w-3xl mx-auto text-center pt-10 border-t border-slate-100 px-4 lg:px-0">
    <h3 className="text-xl font-bold text-[#756E68] mb-8 font-serif">Share this Event</h3>
    
    {/* Contentor Minimalista para os Ícones */}
    <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 w-full">
      
      {/* WhatsApp */}
      <a 
        href={`https://api.whatsapp.com/send?text=I%20think%20you%27ll%20find%20this%20event%20interesting.%20It%27s%20really%20good!%20${encodeURIComponent(currentUrl)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        title="Share on WhatsApp"
        className="text-slate-800 hover:text-black hover:-translate-y-1 hover:scale-110 transition-all duration-300"
      >
        <MessageCircle size={25} strokeWidth={1.5} />
      </a>

      {/* Telegram */}
      <a 
        href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=I%20think%20you%27ll%20find%20this%20event%20interesting.%20It%27s%20really%20good!`} 
        target="_blank" 
        rel="noopener noreferrer" 
        title="Share on Telegram"
        className="text-slate-800 hover:text-black hover:-translate-y-1 hover:scale-110 transition-all duration-300"
      >
        <Send size={25} strokeWidth={1.5} />
      </a>

      {/* Facebook */}
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        title="Share on Facebook"
        className="text-slate-800 hover:text-black hover:-translate-y-1 hover:scale-110 transition-all duration-300"
      >
        <Facebook size={25} strokeWidth={1.5} />
      </a>

      {/* Instagram (Normalmente aponta para o teu perfil, pois a API deles não aceita partilha por link) */}
      <a 
        href="https://www.instagram.com/o_teu_perfil_aqui" 
        target="_blank" 
        rel="noopener noreferrer" 
        title="Visit our Instagram"
        className="text-slate-800 hover:text-black hover:-translate-y-1 hover:scale-110 transition-all duration-300"
      >
        <Instagram size={25} strokeWidth={1.5} />
      </a>

      {/* Email */}
      <a 
        href={`mailto:?subject=Retreat&body=I%20think%20you%27ll%20find%20this%20event%20interesting.%20It%27s%20really%20good!%20Here%20is%20the%20link:%20${encodeURIComponent(currentUrl)}`} 
        title="Share via Email"
        className="text-slate-800 hover:text-black hover:-translate-y-1 hover:scale-110 transition-all duration-300"
      >
        <Mail size={25} strokeWidth={1.5} />
      </a>

      {/* Linha separadora (discreta) */}
      <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2"></div>

      {/* Offer Retreat */}
      <a 
        href="/mindful-store/cartao-oferta" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center gap-2 text-slate-800 hover:text-[#005C65] hover:-translate-y-1 transition-all duration-300"
      >
        <Gift size={25} strokeWidth={1.5} />
        <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Offer</span>
      </a>

    </div>
  </div>
</section>



  {/* Para quem? */}

    <section className="py-16 px-0 md:px-8">
      {/* Contentor Principal (Fundo creme claro com cantos arredondados como na imagem) */}
      <div className="max-w-[1300px] mx-auto bg-[#F8F7F4] rounded-[2rem] py-16 px-6 md:px-12 lg:px-20">
        
        {/* Título (Serif e Itálico) */}
        <h2 className="text-3xl md:text-[22px] lg:text-[22px] font-serif italic text-center text-slate-800 mb-14">
          Este programa é para...
        </h2>

        {/* Grelha de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audienceList.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center bg-white rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Imagem do Card */}
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden rounded-xl">
                <img 
                  src={item.imageUrl} 
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Texto do Card */}
              <div className="ml-4 flex-1">
                <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-wide text-slate-900 leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>





  {/* Teacher profile */}
<section className="bg-[#FBC78D] flex items-center justify-center font-sans w-full max-w-[1300px] mx-auto rounded-[2rem] py-8 md:py-16 px-4 md:px-0 -mt-12 md:-mt-10 ">
  
  {/* Sua DIV branca (Filho) */}
  <div className="bg-white rounded-[40px] max-w-[1100px] w-full shadow-2xl overflow-hidden flex flex-col md:flex-row p-0 md:p-12 gap-8 md:gap-12 items-center">   
    
    {/* Coluna da Esquerda (Conteúdo) */}
    {/* Adicionado order-2 md:order-1 para inverter a ordem no mobile */}
    <div className="flex-1 space-y-6 px-[30px] md:px-0 py-8 md:py-0 sm:p-5 w-full order-2 md:order-1">
      <header>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1e1b4b] leading-tight">
          Mariana Marques <br />
          <span className="text-2xl font-medium text-gray-500">Mindfulness Expert</span>
        </h2>
      </header>

      <div className="text-gray-600 text-[12px] md:text-[12px] leading-relaxed max-h-60 overflow-y-auto pr-4 custom-scrollbar">
        <p className="mb-4">

É facilitadora certificada de Mindfulness (Mindfulness-Based Stress Reduction/MBSR; Mindfulness-Based Eating Awareness Training; A still quiet place; Mindfulness Childbirth and Parenting Program e Mindfulness Based Cognitive Therapy/MBCT). Realizou vários workshops e seminários dedicados ao tema Mindfulness, junto de profissionais de saúde, professores, psicólogos e população geral.
<br/><br/>
Psicóloga Clínica, ramo de Psicologia Cognitivo-Comportamental.
Formação avançada (pós-graduação) em Terapia Cognitivo-Comportamental/terapias de terceira-geração: mindfulness.
Doutorada no ramo das Ciências Biomédicas pela Faculdade de Medicina da Universidade de Coimbra  pela Faculdade de Medicina da Universidade de Coimbra.
              
          
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 md:gap-8 py-4 border-y border-gray-100 justify-between md:justify-start">
        <div>
          <span className="block text-xl font-bold text-[#1e1b4b]">★ 4,8</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Rating</span>
        </div>
        <div>
          <span className="block text-xl font-bold text-[#1e1b4b]">18+</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Cursos</span>
        </div>
        <div>
          <span className="block text-xl font-bold text-[#1e1b4b]">400</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Participantes</span>
        </div>
      </div>

      {/* Botão e CTA */}
   <div className="flex items-center gap-4 md:gap-6 flex-wrap">
  <button onClick={handleBookNow} className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-6 md:px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-200 inline-block text-center">
                  QUERO PARTICIPAR
                </button>

  {/*<span className="text-xl font-bold text-gray-800">Grátis</span>*/}
</div>
      
      <p className="text-xs text-gray-400 flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        Explora formas criativas de integrar a alimentação consciente no teu dia a dia.
      </p>
    </div>

    {/* Coluna da Direita (Imagem Estilizada) */}
    {/* Adicionado order-1 md:order-2 e mt-8 md:mt-0 para ajuste no mobile */}
    <div className="relative w-[260px] md:w-[350px] h-[290px] md:h-[400px] flex-shrink-0 mb-8 md:mb-0 mt-8 md:mt-0 order-1 md:order-2">
      <div className="absolute inset-0 bg-[#F9AE4E] rounded-3xl rotate-3 translate-x-2"></div>
      <div className="relative h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-[#F9AE4E] via-[#FBC78D] to-[#F9AE4E]">
        <img 
          src="https://static.wixstatic.com/media/8c5aa8_25d39b9033e84445a5461268e6f8644b~mv2.png/v1/fill/w_1168,h_1316,fp_0.51_0.44,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/MARIANA%20MARQUES.png" 
          alt="Mariana Marques"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[124%] object-cover object-top contrast-110"
        />
      </div>
    </div>

  </div>
</section>



      

{/* 8. FAQ & SCHEDULE */}
      <section className="py-2 bg-white px-6 mt-25 mb-30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-slate-800 text-center mb-12">In Detail + FAQ</h3>
          
          {/* Acordeão 1: Porquê este Workshop? */}
          <div className="border-t border-slate-200">
            <button onClick={() => toggleAccordion('readings')} className="w-full flex justify-between items-center py-6 text-[20px] md:text-[30px]  tracking-wide font-normal text-slate-500 hover:text-slate-800 transition-colors text-left">
              Porquê este Workshop? <span>{openAccordion === 'readings' ? '−' : '+'}</span>
            </button>
            {openAccordion === 'readings' && (
              <div className="bg-slate-50 p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm mb-6">
                <div className="space-y-6">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong>Workshop de Mindful Eating</strong><br />
                    Com base no programa Mindfulness-Based Eating Awareness Training (MB-EAT) de Jean Kristeller. A alimentação tem um papel fundamental na nossa vida, mas muitas vezes temos um relacionamento difícil com o ato de comer, alimentando-nos frequentemente de forma automática. Não seria bom cultivar uma nova forma de se relacionar consigo e com a comida? Neste programa iremos abordar e vivenciar a "sabedoria" interna e externa inata a cada uma/um de nós, criando consciência do que motiva o nosso ato de comer, do que nos faz comer em demasia e iremos cultivar uma maior consciência em torno das ações relacionadas com o ato de comer. 
                  </p>
                  
                  <p className="text-sm text-slate-900 leading-relaxed font-bold">
                    Melhorar a Relação com a Comida! Melhorar a Saúde Física e Mental.
                  </p>
                  
                  <ul className="space-y-4 list-none pl-0 mt-4">
                    <li className="flex items-start gap-4 group">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                      <p className="text-sm text-slate-700 leading-relaxed">Mais de 100.000 artigos científicos foram publicados sobre nutrição no ano passado, mais de 250 novos artigos por dia.</p>
                    </li>
                    <li className="flex items-start gap-4 group">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                      <p className="text-sm text-slate-700 leading-relaxed">Existe uma inerente confusão com as teorias aparentemente infinitas sobre as melhores formas de comer (e viver) para atingir a saúde, bem-estar e longevidade.</p>
                    </li>
                    <li className="flex items-start gap-4 group">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                      <p className="text-sm text-slate-700 leading-relaxed">Se deseja melhorar áreas específicas da sua saúde, como problemas com o comer em excesso ou em déficit?</p>
                    </li>
                    <li className="flex items-start gap-4 group">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                      <p className="text-sm text-slate-700 leading-relaxed">Já passou por várias "dietas" e todas se revelaram infrutíferas a médio / longo prazo?</p>
                    </li>
                    <li className="flex items-start gap-4 group">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                      <p className="text-sm text-slate-700 leading-relaxed">Acha que há muito mais na alimentação do que apenas comer?</p>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Acordeão 2: Trabalharemos tópicos como */}
          <div className="border-t border-slate-200">
            <button onClick={() => toggleAccordion('topicos')} className="w-full flex justify-between items-center py-6 text-[20px] md:text-[30px] tracking-wide font-normal text-slate-500 hover:text-slate-800 transition-colors text-left">
              Trabalharemos tópicos como: <span>{openAccordion === 'topicos' ? '−' : '+'}</span>
            </button>
            {openAccordion === 'topicos' && (
              <div className="bg-slate-50 p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm mb-6">
                <ul className="space-y-4 list-none pl-0">
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Quais as diferenças entre o comer de forma automática, em piloto automático, e o comer de uma forma consciente, mindful.</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Recorrendo à profunda sabedoria interna (através da escuta do nosso corpo).</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Práticas de Mindfulness e práticas de Mindfulness aplicadas ao contexto alimentar.</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Permite-nos notar quando é que sentimos, momento a momento, fome física, desejo, saciação, entre outras sensações.</p>
                  </li>
                </ul>

                <h4 className="font-semibold text-slate-900 text-base mt-8 mb-4">E ainda:</h4>
                <ul className="space-y-4 list-none pl-0">
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">E recorrendo ao conhecimento científico (o conhecimento nutricional sobre os alimentos e o conhecimento sobre o exercício físico).</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Ao invés de mantermos uma relação de controlo perante os alimentos/a comida, que envolve, tantas vezes, emoções como a culpa e a vergonha, quando não mantemos esse controlo, aprendemos que a liberdade das decisões reside em nós mesmos.</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Podendo escolher que alimentos comer, quando parar de comer, em função de elementos como a fome e a saciedade, e encontrar diferentes formas de gerir a fome emocional.</p>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Acordeão 3: Programa */}
          <div className="border-t border-slate-200">
            <button onClick={() => toggleAccordion('schedule')} className="w-full flex justify-between items-center py-6 text-[20px] md:text-[30px] tracking-wide font-normal text-slate-500 hover:text-slate-800 transition-colors text-left">
              Programa / Horário <span>{openAccordion === 'schedule' ? '−' : '+'}</span>
            </button>
            {openAccordion === 'schedule' && (
              <div className="bg-slate-50 p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h4 className="font-bold text-[#005C65] text-lg mb-4 border-b border-[#005C65]/20 pb-2">Manhã</h4>
                    <ul className="space-y-4 list-none pl-0">
                      <li className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">09:00</span>
                        <p className="text-sm text-slate-700"><strong className="text-slate-900">INÍCIO</strong> - Introdução ao grupo e ao workshop</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <p className="text-sm text-slate-700">Mindfulness e Mindful Eating (elementos do modelo que suporta o programa MBE-AT: sabedoria interna e sabedoria externa)</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <p className="text-sm text-slate-700">Mini-meditação e Prática Guiada</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <p className="text-sm text-slate-700">O questionário Keep it off</p>
                      </li>
                      <li className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-200 border-dashed">
                        <span className="text-[#005C65] font-bold mt-0.5 text-xs font-mono">12:30</span>
                        <p className="text-sm text-slate-700"><strong className="text-slate-900">ALMOÇO</strong> c/ prática de Mindfulness (até 13:30)</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#005C65] text-lg mb-4 border-b border-[#005C65]/20 pb-2">Tarde</h4>
                    <ul className="space-y-4 list-none pl-0">
                      <li className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">13:30</span>
                        <p className="text-sm text-slate-700">Meditação da consciência da fome</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <p className="text-sm text-slate-700">Meditação da sensação de "se estar cheia" e da saciedade</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <p className="text-sm text-slate-700">Fazer escolhas mindful</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <p className="text-sm text-slate-700">Comer emocional: o exercício de chaining e Exercícios práticos</p>
                      </li>
                      <li className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-200 border-dashed">
                        <span className="text-slate-400 mt-0.5 text-xs font-mono">16:00</span>
                        <p className="text-sm text-slate-700 uppercase tracking-widest text-[10px] font-bold">Tea Break</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#005C65] font-bold mt-0.5 text-xs font-mono">18:00</span>
                        <p className="text-sm text-slate-700"><strong className="text-slate-900">FIM</strong> do Workshop</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Acordeão 4: Quem pode participar? */}
          <div className="border-t border-slate-200">
            <button onClick={() => toggleAccordion('quem')} className="w-full flex justify-between items-center py-6 text-[20px] md:text-[30px] tracking-wide font-normal text-slate-500 hover:text-slate-800 transition-colors text-left">
              Quem pode Participar e Beneficiar? <span>{openAccordion === 'quem' ? '−' : '+'}</span>
            </button>
            {openAccordion === 'quem' && (
              <div className="bg-slate-50 p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm mb-6">
                <ul className="space-y-4 list-none pl-0">
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Este workshop é aberto a todos e <strong>não requer conhecimentos ou práticas prévias</strong>.</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Qualquer pessoa que queira iniciar a sua prática de Meditação Mindfulness, em especial integrando-a no contexto alimentar.</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Para os interessados em aprender técnicas de redução dos níveis de Stress e de Ansiedade.</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">   
                       Instrutores de Yoga, Life Coaches, entre outros.</p>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed"> Profissionais de Saúde e profissionais que trabalham na áreas da alimentação/nutrição (psicólogos, nutricionistas, etc.).</p>
                  </li>
                              <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">   
      Pessoas com Alimentação Emocional ou Binge Eating; Pessoas Cansadas das Dietas (Efeito Ioiô).</p>
                  </li>
      
                  <li className="flex items-start gap-4 group">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#005C65] transition-colors duration-300 shrink-0"></span>
                    <p className="text-sm text-slate-700 leading-relaxed">Todas as pessoas que sintam que pode ser uma mais valia desenvolver uma relação mais equilibrada e saudável com a comida.</p>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Acordeão 5: FAQ & Logística Online */}
          <div className="border-t border-b border-slate-200">
            <button onClick={() => toggleAccordion('requisitosfaq')} className="w-full flex justify-between items-center py-6 text-[20px] md:text-[30px] tracking-wide font-normal text-slate-500 hover:text-slate-800 transition-colors text-left">
              FAQ & Requisitos  <span>{openAccordion === 'requisitosfaq' ? '−' : '+'}</span>
            </button>
            {openAccordion === 'requisitosfaq' && (
              <div className="bg-slate-50 p-8 sm:p-10 text-sm text-slate-800 leading-relaxed border border-slate-100 mb-6 rounded-2xl shadow-sm">
                <div className="space-y-8">
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base mb-2">Como vai funcionar o formato Online?</h4>
                    <p className="text-slate-700">
                      O workshop será transmitido em direto através da plataforma Zoom. A sessão é altamente interativa, pelo que requer a sua presença em tempo real. Receberá o link de acesso seguro por email nos dias anteriores ao evento.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-base mb-2">Quais são os requisitos técnicos obrigatórios?</h4>
                    <ul className="space-y-2 mt-2">
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#005C65]" /> Computador ou Tablet (preferencialmente computador) com câmara e microfone funcionais.</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#005C65]" /> Ligação estável à internet (recomendamos estar perto do router).</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#005C65]" /> Aplicação Zoom atualizada para a última versão.</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#005C65]" /> Sugerimos que a câmara <strong>esteja ligada</strong> durante a sessão para permitir a interação de grupo.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-base mb-2">Como devo preparar o meu espaço?</h4>
                    <p className="text-slate-700">
                      Procure um espaço tranquilo, confortável e onde saiba que não será interrompido/a durante as horas do evento. Recomendamos o uso de auscultadores (fones) para uma melhor imersão nas práticas meditativas e melhor foco da sua atenção. Se possível, tenha à mão um caderno e caneta para notas.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-base mb-2">Sobre os momentos práticos (Alimentação e Exercícios)</h4>
                    <p className="text-slate-700">
                      Uma vez que faremos práticas de Mindful Eating em tempo real, ser-lhe-á enviada atempadamente uma pequena lista de alimentos simples (ex: peças de fruta, bolachas) que deverá ter consigo no dia do workshop para participar nos exercícios práticos guiados. O momento de almoço (12h30 - 13h30) será também usado para praticar Mindful Eating.
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
        <p className="text-slate-300 font-medium mb-1">Até {event?.earlyBirdDate}</p>
        <p className="text-[#00AEEF] font-bold text-sm mb-8">Valor Reduzido </p>



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
  Inscrição
</a>

        <button onClick={handleBookNow} className="w-full py-4 text-center rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#A855F7] text-white font-bold hover:opacity-90 transition-opacity">Garantir Vaga</button>
      </div>

      {/* Standard */}
      <div className="bg-[#1E293B] rounded-2xl p-10 border border-slate-700 flex flex-col shadow-2xl">
        <h3 className="text-5xl font-bold text-white mb-4">{event?.regularPrice.toFixed(0)}€</h3>
        <p className="text-slate-300 font-medium mb-1">Depois {event?.earlyBirdDate}</p>
        <p className="text-[#A855F7] font-bold text-sm mb-8">Valor Normal</p>

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
  Inscrição
</a>

        <button onClick={handleBookNow} className="w-full py-4 text-center rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors">Garantir Vaga</button>
      </div>
    </div>

    


{/* --- NOVA CAIXA DE INFORMAÇÕES IMPORTANTES --- */}
    <div className="max-w-4xl mx-auto mt-12 bg-[#1E293B]/40 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-slate-700/50">
      <h4 className="text-white font-semibold text-md mb-6 flex items-center gap-3">
        {/* Ícone de Informação */}
        <svg className="w-5 h-5 text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Informações Importantes
      </h4>
      
      {/* Grelha de 2 colunas para o texto */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 text-[10px] text-slate-300 leading-relaxed">
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>No formulário de inscrição, selecione a Formação pretendida - Mindful Eating).</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>A inscrição só é valida após a liquidação do valor do workshop .</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>Este evento realiza-se com um número mínimo e máximo de participantes. Por isso, se tem interesse, sugerimos que se inscreva e reserve a sua vaga o mais breve possível para ajudar na logística.</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>Para cancelamentos até 10 dias antes do início da formação, será cobrada uma taxa administrativa de 40€.</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>Não nos responsabilizamos por quaisquer despesas em que possa incorrer para participar nesta formação.</p>
        </li>
        
        <li className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0 shadow-[0_0_8px_#00AEEF]"></span>
          <p>Caso o evento seja cancelado, garantimos o reembolso integral do valor pago.</p>
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
            
            {/* Título da Secção */}
            <div className="flex flex-col items-start mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800">
                Poderás ter interesse em:
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
                  // 👇 A LÓGICA DO LINK ESTÁ AQUI (Garante que retiros vão para /t/ e eventos para /eventos/)
                  href={evt.tipoEvento === 'retreat' || evt._type === 'retreat' ? `/t/${evt.slug?.current || ''}` : `/eventos/${evt.slug?.current || ''}`} 
                  key={evt._id}
                  className="relative w-[280px] md:w-[320px] h-[420px] flex-shrink-0 rounded-2xl overflow-hidden snap-start group block shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  {/* Imagem de Fundo Completa */}
                  <img 
                    src={evt.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"} 
                    alt={evt.titulo}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  
                  {/* Gradiente Escuro */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80"></div>
                  
                  {/* Conteúdo do Cartão */}
                  <div className="relative h-full flex flex-col p-6 z-10">
                    
                    {/* Topo: Tags TIPOLOGIA e PREÇO */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="border border-white/30 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                        {evt.tipologia || 'Presencial'} 
                      </span>

                      <span className="bg-white text-slate-900 text-[8px] font-extrabold px-3 py-1 rounded-full">
                        {evt.preco || evt.regularPrice || evt.earlyBirdPrice 
                          ? `${evt.preco || evt.regularPrice || evt.earlyBirdPrice}€` 
                          : ''}
                      </span>
                    </div>

                    {/* 👇 TOP: A DATA CORRIGIDA AQUI */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="border border-white/30 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                        {evt.heroDate || evt.dataEventoTexto || 'Datas a anunciar'} 
                      </span>
                    </div>
                    
                    {/* Meio: Título e Autor */}
                    <div className="mt-2">
                      <h4 className="text-white text-[17px] md:text-[20px] font-bold leading-tight mb-1">
                        {evt.titulo}
                      </h4>
                      <p className="text-white/80 text-[13px] font-medium">
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

            {/* Pontos Decorativos do Carrossel */}
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
            <iframe 
              className="w-full h-full relative z-10" 
              src={`https://www.youtube.com/embed/${finalVideoId}?autoplay=1`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
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
    width: 100%; 
    max-width: 100%;
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
    width: 100%; /* CORREÇÃO EDGE: Força o contentor a ocupar o espaço real */
    max-width: 1600px;
    margin: 0 auto;
    padding-left: 10%; 
    padding-right: 0px; 
    gap: 40px; 
    justify-content: space-between;
    align-items: center;
}

.content-side { 
    flex: 1; 
    min-width: 0; /* CORREÇÃO EDGE: Impede que o conteúdo bloqueie o encolhimento correto do Flexbox */
    z-index: 2; 
    text-align: left; 
}
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
            font-size: 1rem;
            line-height: 1.5;
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

        .info-item p { font-size: 0.85rem; font-weight: 500; line-height: 1.4; color: #334155; }
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
            .program-info-section { padding: 60px 0; margin-top: -30px; }
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