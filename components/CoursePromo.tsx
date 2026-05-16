import Image from 'next/image';
import Link from '@/components/MyLink';

const PROMO_DATA = {
  pranayama: {
    heading: "Respirar a Vida - Curso de Pranayama em 12 semanas",
    instructor: "Vítor Bertocchini, PhD.",
    courseTitle: "Reduzir a Ansiedade em 12 Semanas",
    description: "Breathwork + Mindfulness · 35 Áudios + Handbook",
    linkUrl: "https://meditt.space/t/respirar-a-vida-pranayama-breathwork-12-semanas-a",
    imageUrl: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?ixlib=rb-1.2.1&auto=format&fit=crop&w=2386&q=80" 
  },
  mbsr: {
    heading: "MBSR - Reduzir o Stress e + em 8 Semanas",
    instructor: "Vítor Bertocchini, PhD.",
    courseTitle: "Aprenda a gerir o stress em 8 semanas",
    description: "Reduzir Stress | Depressão | Ansiedade em 8 Semanas · 65 Áudios + Workbook",
    linkUrl: "https://meditt.space/t/mbsr",
    imageUrl: "https://images.unsplash.com/photo-1548032885-b5e38734688a?ixlib=rb-1.2.1&auto=format&fit=crop&w=956&q=80" 
  },
  ansiedade: {
    heading: "Aprenda a Gerir a sua Ansiedade.",
    instructor: "Vítor Bertocchini, PhD.",
    courseTitle: "Reduzir a Ansiedade em 12 Semanas",
    description: "Breathwork + Mindfulness · 35 Áudios + Handbook",
    linkUrl: "https://meditt.space/t/respirar-a-vida-pranayama-breathwork-12-semanas-a",
    imageUrl: "https://images.unsplash.com/photo-1548032885-b5e38734688a?ixlib=rb-1.2.1&auto=format&fit=crop&w=956&q=80"
  },
  cim: {
    badgeText: "Meditações de · 10 a 40 mins",
    heading: "Curso de Mindfulness",
    courseTitle: "Níveis 1, 2 e 3",
    description: "Este curso de Mindfulness em 3 níveis ajudará, passo a passo, a iniciar e a manter uma prática de meditação sustentável, colhendo todos os benefícios.",
    buttonText: "Experimentar",
    linkUrl: "https://app.meditt.space/a/mindfulness-curso/",
    imageUrl: "https://images.unsplash.com/photo-1455642305367-68834a1da7ab?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8bHlpbmclMjBkb3dufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=900&q=60" 
  },
  retiro5Day: {
    heading: "2 or 5-Day Mindfulness & Chi-Kung Retreat",
    linkUrl: "https://meditt.space/t/2-or-5-day-mindfulness-chi-kung-retreat",
    imageUrl: "https://64.media.tumblr.com/bcca8a9e75d5ac38c08466ba64876c20/e802edbb1514103b-3b/s1280x1920/57a70a2e3e7a4c07e113489c09d5ab2399599e3a.jpg" 
  },
  retiro1Retiro: {
    heading: "O Meu 1º Retiro - Mindfulness & Yoga",
    linkUrl: "https://meditt.space/t/mindfulness-yoga",
    imageUrl: "https://64.media.tumblr.com/bcca8a9e75d5ac38c08466ba64876c20/e802edbb1514103b-3b/s1280x1920/57a70a2e3e7a4c07e113489c09d5ab2399599e3a.jpg"
  },
  psicologia: {
    badgeText: "Aposta na prevenção!",
    heading: "Psicologia Clínica / Mindfulness",
    description: "Oferecemos opções abrangentes de tratamento e prevenção de saúde mental online e presencial para atender às suas necessidades. Com uma forte ênfase na Psicologia em combinação com a abordagem Mindfulness.",
    buttonText: "Agendar Consulta",
    linkUrl: "https://clinic.meditt.space/pesquisa-servico-e-data/",
    imageUrl: "https://images.unsplash.com/photo-1551845811-f63135691a4b?q=80&w=3870&auto=format&fit=crop"
  }
};

export default function CoursePromo({ data }: { data: { courseType: string } }) {
  if (!data || !data.courseType || !(PROMO_DATA as any)[data.courseType]) return null;
  const promo = (PROMO_DATA as any)[data.courseType];

  // ==========================================
  // LAYOUT 4: PSICOLOGIA
  // ==========================================
  if (data.courseType === 'psicologia') {
    return (
      <div className="w-full max-w-[900px] mx-auto my-20 clear-both not-prose px-4 md:px-0">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="w-full md:w-[48%] relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg shrink-0">
            <Image src={promo.imageUrl} alt={promo.heading} fill className="object-cover" unoptimized />
          </div>
          <div className="w-full md:w-[52%] flex flex-col justify-center text-left">
            <small className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4 block">
              {promo.badgeText}
            </small>
            <h2 className="text-[#2F2CF1] text-3xl md:text-4xl font-bold leading-tight mb-6" style={{ fontFamily: 'moderat, sans-serif' }}>
              <Link href={promo.linkUrl} target="_blank" className="hover:text-blue-800 transition-colors">
                {promo.heading}
              </Link>
            </h2>
            <p className="text-[#47374B] text-[16px] leading-[27px] font-normal mb-8">
              {promo.description}
            </p>
            <div>
              <Link href={promo.linkUrl} target="_blank" className="inline-block bg-[#3D81F1] text-white font-bold py-3.5 px-8 rounded-xl hover:bg-[#2F2CF1] transition-colors shadow-md">
                {promo.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // LAYOUT 3: RETIROS 
  // ==========================================
  if (data.courseType === 'retiro5Day' || data.courseType === 'retiro1Retiro') {
    return (
      <div className="w-full max-w-[900px] mx-auto my-20 clear-both not-prose px-4 md:px-0">
        <Link href={promo.linkUrl} target="_blank" className="block w-full group">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(76,48,212,0.4)] to-[rgba(0,0,0,0.7)] group-hover:from-[rgba(76,48,212,0.6)] group-hover:to-[rgba(0,0,0,0.8)] transition-all duration-300"></div>
            <Image src={promo.imageUrl} alt={promo.heading} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-white text-2xl md:text-4xl font-bold leading-tight mb-4 max-w-[80%] mx-auto" style={{ fontFamily: 'moderat, sans-serif' }}>
                {promo.heading}
              </h2>
              <span className="inline-block mt-4 text-white text-sm md:text-base font-semibold border-b-2 border-white/50 pb-1 hover:border-white transition-colors">
                Ver +
              </span>
            </div>
          </div>
        </Link>
        
        {/* 👇 NOVO: PARTILHAR RETIRO (Design minimalista de bolinhas como na imagem) */}
        <div className="w-full text-center mt-8">
          <div className="flex justify-center gap-4">
            
            {/* WhatsApp */}
            <a 
              href={`https://api.whatsapp.com/send?text=Vê este retiro: ${promo.linkUrl}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-[44px] h-[44px] rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#3D81F1] hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </a>
            
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/vitorbertocchini" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-[44px] h-[44px] rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#3D81F1] hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            
            {/* Email */}
            <a 
              href={`mailto:?subject=Retiro&body=Penso que vais gostar deste retiro: ${promo.linkUrl}`} 
              className="w-[44px] h-[44px] rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#3D81F1] hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </a>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // LAYOUT 2: CIM 
  // ==========================================
  if (data.courseType === 'cim') {
    return (
      <div className="w-screen bg-[#F8F6F4] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-20 my-20 clear-both not-prose border-t border-b border-slate-100">
        <div className="w-full max-w-[900px] mx-auto px-6 md:px-0">
          <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-center">
            <div className="w-full md:w-[48%] relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg shrink-0">
              <Image src={promo.imageUrl} alt={promo.heading} fill className="object-cover" unoptimized />
            </div>
            <div className="w-full md:w-[52%] flex flex-col justify-center text-left">
              <small className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4 block">
                {promo.badgeText}
              </small>
              <h2 className="text-[#37374B] text-3xl md:text-4xl font-bold leading-tight mb-2" style={{ fontFamily: 'moderat, sans-serif' }}>
                {promo.heading}
              </h2>
              <h3 className="text-[#37374B] text-xl md:text-2xl font-bold mb-6">
                {promo.courseTitle}
              </h3>
              <p className="text-slate-600 text-[15px] md:text-base leading-[26px] font-normal mb-8">
                {promo.description}
              </p>
              <div>
                <Link href={promo.linkUrl} target="_blank" className="inline-block bg-[#3D81F1] text-white font-bold py-3.5 px-8 rounded-xl hover:bg-[#2F2CF1] transition-colors shadow-md">
                  {promo.buttonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // LAYOUT 1: CARTÃO PADRÃO (Ansiedade, MBSR, Pranayama)
  // ==========================================
  return (
    <div className="w-screen bg-[#F8F6F4] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-20 my-16 clear-both not-prose border-t border-b border-slate-100">
      <div className="w-full flex flex-col items-center mx-auto max-w-[800px] px-6">
        
        <h2 
          className="text-[#37374B] text-center w-full max-w-[800px]" 
          style={{ fontFamily: 'moderat, sans-serif', fontSize: '32px', lineHeight: '1.2', fontWeight: 700, marginBottom: '40px' }}
        >
          {promo.heading}
        </h2>
        
        <div className="w-full max-w-[750px]">
          <Link href={promo.linkUrl} target="_blank" className="block group decoration-transparent cursor-pointer">
            
            <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] transition-all duration-300 p-6 md:p-8 flex flex-col md:flex-row items-center border border-slate-50">
              
              <div className="relative w-full md:w-[130px] aspect-square md:h-[130px] rounded-[16px] overflow-hidden shrink-0 mb-6 md:mb-0 md:mr-8 shadow-sm">
                <Image src={promo.imageUrl} alt="Capa" fill className="object-cover" unoptimized />
              </div>
              
              <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                <h4 className="text-[#7A7A8C] text-[13px] md:text-[14px] font-normal m-0 p-0 leading-tight">
                  {promo.instructor}
                </h4>
                
                {promo.courseTitle && (
                  <h3 className="text-[#2F66F6] text-[18px] md:text-[22px] font-bold mt-2 mb-0 p-0 leading-tight tracking-tight">
                    {promo.courseTitle}
                  </h3>
                )}
                
                <h4 className="text-[#2F66F6] text-[13px] md:text-[15px] font-normal mt-2 m-0 p-0 leading-snug">
                  {promo.description}
                </h4>
              </div>
              
              <div className="shrink-0 mt-6 md:mt-0 md:ml-4">
                <div 
                  className="w-[56px] h-[56px] md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300" 
                  style={{ background: 'linear-gradient(64.09deg, #3D81F1 34.49%, #6631F1 130.74%)', boxShadow: '0px 8px 25px rgba(61, 129, 241, 0.3)' }}
                >
                  <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] ml-1">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.8496 10.7916C21.1297 11.5708 21.1297 13.4292 19.8496 14.2084L7.72739 21.5871C6.3946 22.3984 4.6875 21.439 4.6875 19.8787L4.6875 5.12127C4.6875 3.56098 6.3946 2.60161 7.72739 3.41287L19.8496 10.7916Z" fill="white"></path>
                  </svg>
                </div>
              </div>

            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}