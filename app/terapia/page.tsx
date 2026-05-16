'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from '@/components/MyLink'; // Importação necessária para as ligações


import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

// ----------------------------------------------------------------------
// DADOS DOS PASSOS (SECÇÃO 3)
// ----------------------------------------------------------------------
const howItWorksSteps = [
  {
    id: 1,
    title: 'Fale-nos sobre si',
    description: 'Responda a algumas perguntas rápidas sobre como se sente e as suas preferências, para que possamos encontrar a melhor reposta.',
    image: 'https://64.media.tumblr.com/43bafb86a2bc379e244e8411de086544/bef13e74fc4ba444-49/s1280x1920/ce0ba29dbdd938dff28e7693e049d40e200729e5.pnj'
  },
  {
    id: 2,
    title: 'Acesso a um terapeuta acreditado pela OPP em até 2 dias',
    description: 'Após o agendamento da consulta e respetivo pagamento (online)',
    image: 'https://64.media.tumblr.com/d0e6f9e99220d585fe3cabcfec976679/bef13e74fc4ba444-fa/s540x810/8b0e4c2d8be51237c75f309571efc0faf46335f1.pnj'
  },
  {
    id: 3,
    title: 'Sessões em Vídeo, Voz + Mensagens (à sua escolha)',
    description: 'Felixibilidade, com mensagens ilimitadas com o seu Terapeuta, 24/7 →',
    image: 'https://64.media.tumblr.com/fcb3bbea5c0a491f202e1d8888d3b26c/bef13e74fc4ba444-f3/s540x810/ca460fb0bc0ed600b61ee59b0c0a2e59d1233f82.pnj'
  },
  {
    id: 4,
    title: 'Aceda a ferramentas extra',
    description: 'Desbloqueie meditações exclusivas, exercícios de respiração e muito mais, para apoiar a sua jornada entre sessões.',
    image: 'https://64.media.tumblr.com/ca00cdebb675b71480aa016b0b261d96/d59ff427b8cf68a8-2e/s1280x1920/7c4f7724df5be31b6b0e4bb22fdd4182f568d822.pnj'
  }
];

// ----------------------------------------------------------------------
// DADOS DAS CATEGORIAS DE TERAPIA (SECÇÃO 5)
// ----------------------------------------------------------------------
const therapyCategories = [
  {
    id: 'anxiety',
    label: 'Ansiedade',
    title: 'Diminua a sua ansiedade',
    desc: 'Trabalhe em conjunto com o seu terapeuta para identificar os gatilhos e aprender técnicas baseadas na ciência para gerir a ansiedade e as preocupações do dia a dia.',
    btnText: 'Gerir ansiedade',
    image: 'https://64.media.tumblr.com/cbbcc5f320196075d0c93e25a5e1b833/0b50173fe0ca326f-0d/s540x810/4c79c797fd9cb14f6f2225f383bedab6f30b5860.pnj'
  },
  {
    id: 'depression',
    label: 'Depressão',
    title: 'Navegue pela depressão',
    desc: 'Encontre um espaço seguro para explorar os seus sentimentos e desenvolver estratégias práticas para recuperar a sua energia, perspetiva e alegria.',
    btnText: 'Apoio para depressão',
    image: 'https://64.media.tumblr.com/89017d01aab1832108c2d458d9494068/0b50173fe0ca326f-4d/s540x810/2afa778d4b677938c523e4e7d870dfdc7a73e0fd.pnj'
  },
  {
    id: 'stress',
    label: 'Stress',
    title: 'Reduza o stress diário',
    desc: 'Aprenda a lidar com as pressões profissionais e pessoais, construindo resiliência com o apoio guiado e focado inteiramente no seu bem-estar.',
    btnText: 'Reduzir stress',
    image: 'https://64.media.tumblr.com/13f89a7064825fc55e948e5857dc16f2/ee7f7170a28fcd13-92/s1280x1920/66b5809e919713cb8c9e9e3f1b61ab202df835a3.pnj'
  },
  {
    id: 'relationships',
    label: 'Relacionamentos',
    title: 'Melhore as suas relações',
    desc: 'Compreenda os seus padrões e dinâmicas de relacionamento. Navegue e melhore as ligações mais importantes da sua vida com as ferramentas do seu terapeuta.',
    btnText: 'Gerir relacionamentos',
    image: 'https://64.media.tumblr.com/4a948147ee0100fd7597f222341e9476/0b50173fe0ca326f-3c/s1280x1920/504f3524249dc28daed8e882a0c74e8e51487a5e.pnj'
  },
  {
    id: 'sleep',
    label: 'Sono',
    title: 'Durma melhor e descanse',
    desc: 'Desenvolva uma rotina de sono mais saudável e trabalhe as causas profundas das suas noites mal dormidas com acompanhamento profissional.',
    btnText: 'Melhorar o sono',
    image: 'https://64.media.tumblr.com/0b8ce42f160091f9c91ddef11204cd38/888ead59c9662205-c3/s1280x1920/cdf0953f5eae4a3752cecfef599267ac1d7bc520.pnj'
  },
  {
    id: 'grief',
    label: 'Luto',
    title: 'Navegue pelo luto',
    desc: 'Receba apoio compassivo enquanto lida com a perda, processa emoções difíceis e encontra formas saudáveis e graduais de seguir em frente.',
    btnText: 'Apoio no luto',
    image: 'https://64.media.tumblr.com/47fbc1f4abbef59ef725f958370a9a4b/888ead59c9662205-13/s540x810/874eb65cb7a2c27abadae1040fa52259f856bde6.pnj'
  }
];

const globalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  @keyframes cloud-float {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    50% { transform: translateY(-10px) translateX(5px); }
  }
  .animate-float {
    animation: float 4s infinite ease-in-out;
  }
  .animate-cloud-float {
    animation: cloud-float 6s infinite ease-in-out;
  }
`;

// Define a structure for the mood selection
// ----------------------------------------------------------------------
// OPÇÕES DE HUMOR COM ÍCONES VETORIAIS (SEM BORDAS DO WINDOWS)
// ----------------------------------------------------------------------
const moodOptions = [
  { 
    label: 'Não muito bem', 
    alt: 'Nuvem de chuva',
    // Ícone de Chuva
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300 drop-shadow-md">
        <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/>
        <path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>
      </svg>
    )
  },
  { 
    label: 'OK', 
    alt: 'Nuvem com sol',
    // Ícone de Nuvem
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200 drop-shadow-md">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
      </svg>
    )
  },
  { 
    label: 'Bastante bem', 
    alt: 'Sol com nuvem',
    // Ícone de Sol com Nuvem
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-100 drop-shadow-md">
        <path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>
      </svg>
    )
  },
  { 
    label: 'Ótimo(a)', 
    alt: 'Sol brilhante',
    // Ícone de Sol
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 drop-shadow-md">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      </svg>
    )
  },
];

export default function TerapiaPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('moodToday'); // 'moodToday' | 'moodPast' | 'confirmation'

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', skipSnaps: false },
    [Autoplay({ delay: 8000, stopOnInteraction: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <>
      <style>{globalStyles}</style>
      <main className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
        

        {/* 1. TOP BANNER
        <Link href="/especialidades">
          <div className="bg-[#FFCE00] w-full py-3 text-center text-sm md:text-base font-medium cursor-pointer hover:bg-[#f2c400] transition-colors">
            <p className="underline underline-offset-4">
              Acesso a um terapeuta acreditado pela OPP em até 2 dias
            </p>
          </div>
        </Link> */}

        {/* 2. HERO SECTION */}
        <div className="w-full bg-[#F9F4F2]">
          <section className="w-full max-w-[1400px] mx-auto px-6 py-12 md:py-24 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="w-full md:w-1/2 max-w-xl z-10">
              <div className="mb-6">
                <Image 
                  src="https://64.media.tumblr.com/9ecf0193a9fca77c433ae5d2d638a18e/518e2040efb307ef-f9/s400x600/475837f2da942d53687b5d4e5bd887dcdd4dfdd5.pnj" 
                  alt="Terapia por Meditt" 
                  width={250} 
                  height={50} 
                  className="w-auto h-8 md:h-10 object-contain"
                />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold leading-[1.05] mb-8 text-[#2D2C2B] tracking-tight">
                Terapia online e presencial acessível<br />e muito mais
              </h1>
              
              <ul className="space-y-4 mb-10 text-[1.1rem] text-[#2D2C2B]">
                <li className="flex items-start gap-4">
                  <span className="w-5 h-5 shrink-0 bg-black text-white rounded-full flex items-center justify-center text-xs mt-1">✓</span>
                  Um local para terapia, ferramentas de mindfulness e apoio diário¹
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-5 h-5 shrink-0 bg-black text-white rounded-full flex items-center justify-center text-xs mt-1">✓</span>
                  Focados no Florescimento Humano, através da Psicologia Positiva
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-5 h-5 shrink-0 bg-black text-white rounded-full flex items-center justify-center text-xs mt-1">✓</span>
                  Horários flexíveis com terapeutas acreditados, ajustados a si
                </li>
              </ul>

              <button 
                onClick={() => { setIsModalOpen(true); setModalStep('moodToday'); }} 
                className="bg-[#0061EF] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Começar agora
              </button>
            </div>

            <div className="w-full md:w-1/2 flex justify-center md:justify-end relative mt-16 md:mt-0 z-10">
              <div className="relative w-full max-w-[400px] lg:max-w-[460px] aspect-[4/5] bg-transparent flex items-center justify-center">
                <div className="absolute -top-4 right-0 md:-top-8 md:-right-4 w-28 h-28 md:w-36 md:h-36 z-0 animate-cloud-float">
                  <img src="https://64.media.tumblr.com/7eb207d83db687fc50191380e507dd0f/b63344857fa24c31-3e/s250x400/c3202eb93b79c4c3d86d9ea4fef42923c420f5de.pnj" alt="Cloud" className="w-full h-full object-contain opacity-90 drop-shadow-lg" />
                </div>
                <img src="https://64.media.tumblr.com/a643b34e8b04ca63d5bc1c051fda6c9b/c824fca5d4efcecf-98/s1280x1920/7a05156c34f876b1ef18ff73ba36df19fa90cd19.pnj" alt="Sessão" className="w-[75%] md:w-[70%] h-auto max-h-[80%] object-cover rounded-[2.5rem] shadow-xl z-10 border-[8px] border-white" />
                <div className="absolute top-16 -right-4 md:top-24 md:-right-8 w-28 h-40 md:w-36 md:h-52 z-30 animate-float">
                  <img src="https://images.unsplash.com/photo-1713865471790-809cf16c1582?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHdvbWFuJTIwdGFsa2luZyUyMHNvZmF8ZW58MHx8MHx8fDA%3D" alt="Perfil" className="w-full h-full object-cover rounded-[1.5rem] shadow-2xl border-[4px] border-white" />
                </div>
                <div className="absolute bottom-0 left-0 md:-bottom-4 md:-left-4 w-24 h-24 md:w-36 md:h-36 z-20 animate-cloud-float">
                  <img src="https://64.media.tumblr.com/7eb207d83db687fc50191380e507dd0f/b63344857fa24c31-3e/s250x400/c3202eb93b79c4c3d86d9ea4fef42923c420f5de.pnj" alt="Cloud" className="w-full h-full object-contain drop-shadow-md" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 3. HOW IT WORKS SECTION */}
        <section className="py-20 px-6 lg:px-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Como funciona</h2>
            <p className="text-lg text-gray-600">
              Desde encontrar o terapeuta ideal até ao agendamento fácil, a nossa terapia online simplifica o processo.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
            <div className="w-full md:w-1/2 bg-[#F9F4F2] rounded-[2rem] p-8 h-[450px] md:h-[550px] relative overflow-hidden flex items-center justify-center">
               <Image key={activeStep} src={howItWorksSteps[activeStep].image} alt={howItWorksSteps[activeStep].title} fill className="object-contain p-8 md:p-12 animate-[fadeIn_0.5s_ease-in-out]" />
            </div>

            <div className="w-full md:w-1/2 space-y-2">
              {howItWorksSteps.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <div key={step.id} onClick={() => setActiveStep(index)} className={`flex flex-col py-4 cursor-pointer transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}>
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isActive ? 'bg-[#0061EF] text-white' : 'bg-gray-200 text-[#0061EF]'}`}>{step.id}</span>
                      <h3 className="text-xl md:text-2xl font-bold">{step.title}</h3>
                    </div>
                    <div className={`pl-12 overflow-hidden transition-all duration-500 ease-in-out ${isActive ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
                      <p className="text-gray-600 text-[1.05rem] leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
              
              <button 
                onClick={() => { setIsModalOpen(true); setModalStep('moodToday'); }} 
                className="bg-[#2D2C2B] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors w-full inline-block mt-8 md:w-auto"
              >
                Iniciar o processo
              </button>
            </div>
          </div>
        </section>

        {/* 5. CAROUSEL SECTION */}
        <section className="py-20 px-0 md:px-6 lg:px-12 bg-white">
          <div className="text-center max-w-3xl mx-auto mb-10 px-6">
            <h2 className="text-3xl md:text-5xl font-bold">Como a terapia online a(o) pode ajudar?</h2>
          </div>

          <div className="flex justify-start md:justify-center gap-3 mb-10 overflow-x-auto px-6 pb-4 scrollbar-hide no-scrollbar">
            {therapyCategories.map((category, index) => (
              <button key={category.id} onClick={() => scrollTo(index)} className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition-all border ${selectedIndex === index ? 'bg-[#2D2C2B] text-white border-[#2D2C2B]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                {category.label}
              </button>
            ))}
          </div>
          
          <div className="overflow-hidden px-4 md:px-0" ref={emblaRef}>
            <div className="flex items-stretch">
              {therapyCategories.map((category, index) => (
                <div key={index} className="flex-[0_0_100%] md:flex-[0_0_85%] lg:flex-[0_0_70%] min-w-0 pl-4 md:pl-6 py-4">
                  <div className="bg-[#F9F4F2] rounded-[2.5rem] p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-10 md:gap-16 h-full">
                    <div className="w-full md:w-1/2 flex justify-center items-center shrink-0">
                      <img src={category.image} alt={category.title} className="w-full max-w-[420px] h-auto object-contain rounded-[2rem] shadow-sm" />
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                      <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#2D2C2B]">{category.title}</h3>
                      <p className="text-[1.1rem] leading-relaxed text-gray-700 mb-8">{category.desc}</p>
                      
                      <button 
                        onClick={() => { setIsModalOpen(true); setModalStep('moodToday'); }}
                        className="bg-[#2D2C2B] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors w-fit"
                      >
                        {category.btnText}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE MODAL COMPONENT (FULL SCREEN) */}
        {/* ------------------------------------------------------------------ */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0057E3] z-150" 
            onClick={() => setIsModalOpen(false)}
            style={{
              backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
            }}
          >
            
            {/* Modal Container: Full Screen e Centrado */}
            <div 
              className="relative w-full h-full min-h-screen flex flex-col items-center p-6 md:p-16 text-white overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Navigation Indicators & Close */}
              <div className="absolute top-[30px] right-8 md:right-12 z-20 flex items-center gap-4">
                {modalStep === 'confirmation' && (
                  <button onClick={() => setModalStep('moodPast')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xl transition-all">
                    ←
                  </button>
                )}
                {modalStep === 'moodPast' && (
                  <button onClick={() => setModalStep('moodToday')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xl transition-all">
                    ←
                  </button>
                )}
                {/* Botão Fechar igual à imagem: Branco, texto preto, com sombra */}
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-100 font-bold text-xl shadow-lg transition-colors">
                  ×
                </button>
              </div>
              
              {/* Progresso: 3 bolinhas */}
              <div className="absolute top-[30px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${modalStep === 'moodToday' ? 'bg-orange-500' : 'bg-white/30'}`}></span>
                <span className={`w-2.5 h-2.5 rounded-full ${modalStep === 'moodPast' ? 'bg-orange-500' : 'bg-white/30'}`}></span>
                <span className={`w-2.5 h-2.5 rounded-full ${modalStep === 'confirmation' ? 'bg-orange-500' : 'bg-white/30'}`}></span>
              </div>

              {/* Wrapper de Conteúdo Principal */}
              <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center mt-[100px] md:mt-[150px] mb-20">

              {/* Step 1: Mood Selection (Hoje) */}
                {modalStep === 'moodToday' && (
                  <div className="text-center w-full">
                    <p className="text-xl opacity-80">Antes de começarmos...</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight ">Como se sente hoje?</h2>
                    
                    {/* Alterado aqui: md:grid-cols-4 para 1 linha, w-fit mx-auto para mantê-los juntos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-center w-fit mx-auto">
                      {moodOptions.map((mood) => (
                        <div 
                          key={`today-${mood.label}`} 
                          onClick={() => setModalStep('moodPast')}
                          className="flex flex-col items-center justify-center bg-[#053EC1] rounded-3xl w-36 h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 cursor-pointer hover:border-2 hover:border-blue-400 group transition-all shadow-sm"
                        >
                          <div className="text-5xl lg:text-7xl group-hover:scale-110 transition-transform mb-1 md:mb-3">{mood.icon}</div>
                          <p className="text-sm lg:text-lg font-medium text-center leading-tight px-2">{mood.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Mood Selection (Últimos 15 dias) */}
                {modalStep === 'moodPast' && (
                  <div className="text-center w-full animate-[fadeIn_0.3s_ease-in-out]">
                    <p className="text-xl opacity-80 mb-2">Para compreendermos melhor...</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight">Como se sentiu nos últimos 15 dias?</h2>
                    
                    {/* Alterado aqui: md:grid-cols-4 para 1 linha, w-fit mx-auto para mantê-los juntos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-center w-fit mx-auto">
                      {moodOptions.map((mood) => (
                        <div 
                          key={`past-${mood.label}`} 
                          onClick={() => setModalStep('confirmation')}
                          className="flex flex-col items-center justify-center bg-[#053EC1] rounded-3xl w-36 h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 cursor-pointer hover:border-2 hover:border-blue-400 group transition-all shadow-sm"
                        >
                          <div className="text-5xl lg:text-7xl group-hover:scale-110 transition-transform mb-1 md:mb-3">{mood.icon}</div>
                          <p className="text-sm lg:text-lg font-medium text-center leading-tight px-2">{mood.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation & Scheduling */}
                {modalStep === 'confirmation' && (
                  <div className="text-center flex flex-col items-center animate-[fadeIn_0.3s_ease-in-out]">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight max-w-xl mx-auto">
                      Obrigado por partilhar como se sente.
                    </h2>
                    <p className="text-xl leading-relaxed opacity-90 max-w-2xl mx-auto mb-16">
                      Os nossos terapeutas certificados pela OPP estão prontos para apoiar a sua saúde mental com terapia acessível. 
                    </p>
                    
                    {/* Clicável: Abre a página de especialidades num novo separador */}
                    <Link href="/especialidades" target="_blank">
                      <button 
                        className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
                      >
                        Agendar sessão
                      </button>
                    </Link>
                  </div>
                )}

              </div>
              
              {/* Blurred Cloud effect at bottom left */}
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/20 rounded-full blur-[80px] pointer-events-none"></div>

            </div>
          </div>
        )}
        {/* ------------------------------------------------------------------ */}

        
      </main>
    </>
  );
}