import Image from 'next/image';
import Link from '@/components/MyLink';
import EspecialidadesCarousel from '@/components/EspecialidadesCarousel';
import AjudaEmSection from '@/components/AjudaEmSection';
import HeroSpecialties from '@/components/HeroSpecialties';
import { client } from '@/app/sanity/client'; 
 

import StressQuiz from '@/components/StressQuiz';

export const revalidate = 60;

interface Especialidade {
  _id: string;
  title: string;
  slug: { current: string };
  shortDescription?: string;
  longDescription?: any;
  imageUrl?: string;
  therapistName?: string;
  therapistPhoto?: string;
  therapistRole?: string;
  duration: string;
  price: number;
  format?: string[];
}

async function getEspecialidades() {
  const query = `*[_type == "especialidade"] | order(order asc) {
    _id,
    title,
    slug,
    shortDescription,
    longDescription,
    imageUrl,
    duration,
    price,
    format,
    order,
    "therapistName": therapist->name,
    "therapistRole": therapist->role,
    "therapistPhoto": therapist->image.asset->url 
  }`;
  
  const data = await client.fetch(query);
  return data as Especialidade[];
}

export default async function EspecialidadesPage() {
  const especialidades = await getEspecialidades();
  const bookingUrl = "/marcacao";

  return (
    <main className="relative min-h-screen bg-white flex flex-col">
      {/* Injeção de CSS para Animações */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatHorizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        @keyframes floatVertical {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float-horizontal { animation: floatHorizontal 6s ease-in-out infinite; }
        .animate-float-vertical { animation: floatVertical 7s ease-in-out infinite; }
      `}} />

      {/* 1. NAVBAR */}
      <div className="relative z-[100]">
        
      </div>
      
      {/* 2. TÍTULO */}
      <section className="pt-32 px-6 mb-[100px]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[#2D2C2B] tracking-tighter">
            Especialidades Clínicas
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Cuidados especializados focados no seu bem-estar integral.
          </p>
        </div>
      </section>

      {/* 3. CARROSSEL */}
      <section className="relative z-20 pb-20 px-6">
        <div className="max-w-[1500px] mx-auto">
          <EspecialidadesCarousel items={especialidades} />
        </div>
      </section>

      {/* 4. TESTE DE STRESS (Agora em 4º lugar) */}
      <section className="py-24 bg-[#F9F4F2]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="relative z-10 mx-auto lg:mx-0 mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white p-[1px] shadow-md">
                <img 
                  src="https://64.media.tumblr.com/13ce3ecd1cab1ecf2b2a12cb2506278a/c951774581abbb56-e1/s1280x1920/2e25e116e56274ae9f67e65f1aa42473fda5db9e.pnj" 
                  alt="Stress Icon"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-sans font-bold text-[#265ACC] mb-6">
                Não tem a certeza do seu nível de stress?
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                O stress crónico pode ser silencioso e perigoso. Criámos este teste baseado na escala clínica <strong>PSS-10</strong> para o ajudar a perceber se precisa de uma pausa ou de acompanhamento especializado.
              </p>
              <div className="flex items-center gap-4 text-[#2490EB] font-bold">
                <span className="w-12 h-0.5 bg-[#2490EB]"></span>
                <span>10 Perguntas • 2 Minutos • Resultado Imediato</span>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <StressQuiz />
            </div>
          </div>
        </div>
      </section>

      {/* 5. BIO DO PROFISSIONAL (Agora em 5º lugar) */}
      <section className="relative py-16 md:py-24 bg-[#FCF5E7] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-x-16 items-start">
            
            <header className="lg:col-start-2 lg:col-span-2 order-1">
              <span className="text-[#175c62] font-semibold uppercase tracking-wider text-sm block mb-2">
                Experiência Profissional
              </span>
              <h1 className="text-4xl md:text-5xl font-sans text-[#265ACC] font-bold leading-tight mb-4">
                Abordagem Abrangente e Especializada
              </h1>
              <p className="text-lg text-slate-600 font-light italic">
                Dedicado ao desenvolvimento do Potencial Humano através da Psicologia Clínica e da abordagem Mindfulness.
              </p>
            </header>

            <div className="lg:col-start-1 lg:row-start-1 lg:row-span-2 order-2 lg:order-none relative">
              <div className="absolute -top-12 -left-40 w-64 h-64 z-0 pointer-events-none opacity-80 animate-float-horizontal">
                <Image 
                  src="https://64.media.tumblr.com/33263b90e07b38ce1aee5a91c48dac28/36c8cdc282c09863-76/s400x600/45d2ece644f4e186f3591db63ced32c635c33105.pnj"
                  alt="Elemento decorativo"
                  width={280}
                  height={290}
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 h-[550px] w-full rounded-[40px] overflow-hidden shadow-2xl border-white animate-float-vertical">
                <Image
                  src="https://64.media.tumblr.com/7132c353b75a6d3ae2029e79027e9700/bc73cfb284d988ed-bb/s1280x1920/0a67c28ce2250b3fb70d8476662c6df95bb3355b.pnj" 
                  alt="Dr. Vítor Bertocchini"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-start-2 lg:col-span-2 order-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col">
                  <p className="text-[#175c62] font-semibold leading-relaxed mb-6 text-lg">
                    Uma comunidade em que todas as pessoas alcançam o seu pleno potencial de saúde e bem-estar ao longo da vida.
                  </p>
                  <div className="mt-2">
                    <div className="relative w-48 h-24 mb-2">
                      <Image 
                        src="https://64.media.tumblr.com/a28d16097f5c3666d5d48f9badbed3bc/ecab806e06c38939-63/s540x810/7b275c6ab9efcf44f33806299ffa787dd16445fe.pnj"
                        alt="Assinatura"
                        fill
                        className="object-contain object-left"
                      />
                    </div>
                    <p className="text-[#175c62] font-bold text-sm uppercase tracking-widest">Vítor Bertocchini</p>
                    <p className="text-slate-500 text-xs italic font-medium">Psicólogo Clínico e da Saúde, Ph.D.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <BioItem text="Especialista em Psicologia Clínica e da Saúde</strong>, membro efetivo da Ordem dos Psicólogos Portugueses. Doutorado em Psicologia da Saúde pela Faculdade de Psicologia e de Ciências de Educação da Universidade do Porto." />
                  <BioItem text="Doutorado em Psicologia da Saúde pela Faculdade de Psicologia e de Ciências da Educação Unv. Porto;" />
                  <BioItem text="Instrutor certificado de MBSR pela Universidade da Califórnia em San Diego;" />
                  <BioItem text="Fundador e Presidente da Sociedade Portuguesa de Meditação e Bem-Estar - Meditt." />
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-[#175c62]/10">
                <Link href={bookingUrl} className="inline-flex items-center justify-center text-white px-12 py-5 rounded-full font-bold text-lg bg-gradient-to-r from-[#265ACC] to-[#0000FF] hover:brightness-110 shadow-xl transition-all">
                  Vamos Conversar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Onda Decorativa */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.83C56.2,115.82,143.29,122,214.34,103.11,262.29,90.3,303.66,74,321.39,56.44Z" fill="#FFFFFF"></path>
          </svg>
        </div>
      </section>

      {/*<HeroSpecialties/>*/}
      <AjudaEmSection />
      
    </main>
  );
}

// Componente Interno
function BioItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="mt-1 flex-shrink-0 bg-[#175c62] p-1 rounded-full text-white">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <p className="text-[12px] text-slate-700 leading-snug font-medium italic">{text}</p>
    </div>
  );
}