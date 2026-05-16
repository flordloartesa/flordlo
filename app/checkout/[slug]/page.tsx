// 1. REMOVE O IMPORT DO getCourseOffer DAQUI DO TOPO!
// import { getCourseOffer } from "@/app/actions/course"; <-- APAGADO

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from '@/components/MyLink';


import ShopCard from "@/components/ShopCard";
import CoursePreviewUI from "@/components/CoursePreviewUI";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function SalesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 2. LAZY LOAD DA ACTION: O compilador não vê isto durante o build!
  // Só vai importar e executar a ligação à base de dados quando a página for visitada.
  const { getCourseOffer } = await import("@/app/actions/course");
  
  const course = await getCourseOffer(slug);

  if (!course) return notFound();

  const freeTracks = course.content?.filter((t: any) => t.isFree) || [];
  const allTracks = course.content || [];

  return (
    <main className="min-h-screen bg-white">
      
      
      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        <Image 
          src={course.image} 
          alt={course.title} 
          fill 
          className="object-cover brightness-[0.3] scale-105"
          priority
        />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-7xl font-black text-white max-w-5xl leading-[1.1] drop-shadow-2xl">
            {course.title}
          </h1>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* COLUNA ESQUERDA: Descrição */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* ✅ AVISO DE ACESSO EXISTENTE */}
          {course.hasAccess && (
            <div className="bg-green-50 border border-green-100 p-6 rounded-[32px] flex items-center gap-5 animate-in fade-in slide-in-from-top-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-green-200">✓</div>
              <div>
                <p className="font-black text-green-900 text-lg">Este programa já é teu!</p>
                <p className="text-green-700 font-medium">O teu acesso é vitalício. Podes continuar a tua jornada quando quiseres.</p>
              </div>
            </div>
          )}

          <section>
            <h2 className="text-3xl font-bold text-[#37374B] mb-8">Sobre este Programa</h2>
            <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line font-medium">
              {course.description}
            </div>
          </section>

          {/* Amostras Gratuitas */}
          <CoursePreviewUI tracks={freeTracks.slice(0, 3)} isPreview={true} />
        </div>

        {/* COLUNA DIREITA: Caixa de Compra / Acesso */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white p-10 rounded-[50px] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-gray-50 text-center">
            
            {course.hasAccess ? (
              // ✅ UI PARA QUEM JÁ COMPROU
              <div className="animate-in zoom-in-95 duration-500">
                <div className="mb-8">
                  <span className="text-5xl">✨</span>
                  <h3 className="text-2xl font-black text-[#37374B] mt-4">Conteúdo Aberto</h3>
                  <p className="text-gray-400 text-sm mt-2">Clica abaixo para abrir o teu player</p>
                </div>
                <Link 
                  href={`/cursos/${slug}`}
                  className="w-full block bg-[#3D81F1] text-white py-5 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-100"
                >
                  Entrar no Curso
                </Link>
              </div>
            ) : (
              // UI DE VENDA NORMAL
              <>
                <p className="text-[#737373] text-xs font-bold uppercase tracking-widest mb-4">Investimento</p>
                <div className="text-6xl font-black text-[#37374B] mb-10 tracking-tighter">
                  {course.price}€
                </div>
                <ShopCard {...course} instructor="Acesso Imediato" />
              </>
            )}

            <div className="mt-10 pt-8 border-t border-gray-50 space-y-5 text-left text-sm font-medium text-gray-700">
              <div className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                Acesso 12 meses 
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </main>
  );
}