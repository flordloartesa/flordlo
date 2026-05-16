import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from '@/components/MyLink';
import type { Metadata } from "next";

// ✅ COMPONENTES (Sobem 2 níveis: [slug] -> mindful-store -> app)


import CartSidebar from "@/components/CartSidebar";
import CoursePreviewUI from "@/components/CoursePreviewUI"; 
import ReviewSlideshow from "@/components/ReviewSlideshow";
import CourseReviewForm from "@/components/CourseReviewForm";

// ✅ AÇÕES (Sobem 2 níveis para chegar a app/actions)
import { getCourseOffer } from "@/app/actions/course";

// ✅ SANITY (Sobem 2 níveis para chegar a app/sanity - confirmado pelo teu comando dir)
import { client } from "@/app/sanity/client"; 

// ✅ LOCAL (Mesma pasta)
import PurchaseSection from "./PurchaseSection";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseOffer(slug);
  if (!course) return { title: 'Curso não encontrado' };
  return { title: `${course.title} | Meditt` };
}

export default async function SalesPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseOffer(slug);

  if (!course) return notFound();

  const relatedCourses = await client.fetch(
    `*[_type == "course" && slug.current != $currentSlug][0...3] {
      _id,
      title,
      price,
      "slug": slug.current,
      "image": coverImage.asset->url
    }`,
    { currentSlug: slug },
    { cache: 'no-store' }
  );

  const freeTracks = course.content?.filter((t: any) => t.isFree) || [];
  const allTracks = course.content || [];

  return (
    <main className="min-h-screen bg-white font-sans font-light">
      
      <CartSidebar /> 
      
      {/* --- HERO SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <h1 className="text-[32px] md:text-[50px] leading-tight font-roboto-condensed font-light">
            {course.title}
          </h1>
          <p className="text-[14px] md:text-[16px] text-gray-500 mb-10 leading-relaxed max-w-xl font-roboto-condensed font-light">
            {course.description || "Um programa desenvolvido para cultivar a presença e transformar a tua relação com o stress e a ansiedade."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <PurchaseSection course={course} slug={slug} />
          </div>
        </div>

        <div className="order-1 lg:order-2 relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white">
          <Image src={course.image} alt={course.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </section>

      {/* --- SECÇÃO DE CONTEÚDO --- */}
      <section className="bg-[#F8F9FB] py-24 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black text-[#37374B] mb-16 text-center tracking-tight text-balance">
            Explora o conteúdo
          </h2>
          
          {freeTracks.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Amostras Disponíveis</h3>
              </div>
              <CoursePreviewUI tracks={freeTracks.slice(0, 3)} isPreview={true} />
            </div>
          )}

          <div className="mt-12">
            <details className="group border-2 border-gray-100 rounded-[40px] overflow-hidden bg-white transition-all duration-300 open:shadow-xl open:border-transparent">
              <summary className="flex justify-between items-center p-10 cursor-pointer hover:bg-gray-50/50 transition-all list-none">
                <div className="flex flex-col">
                  <span className="font-black text-[#37374B] text-2xl tracking-tight">Currículo do Programa</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">{allTracks.length} sessões • Acesso Vitalício</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-open:rotate-180 transition-transform duration-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </summary>
              <div className="p-10 pt-0 border-t border-gray-0">
                <div className="text-center">
                   <CoursePreviewUI tracks={allTracks} isPreview={false} />
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ✅ SECÇÃO DE REVIEWS COM SLIDESHOW */}
      <section className="py-24 bg-white border-t border-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <ReviewSlideshow courseId={course._id} />

          {/*<div className="mt-20 pt-20 border-t border-gray-100">
            <h3 className="text-center font-roboto-condensed uppercase tracking-widest text-xs text-gray-400 mb-10 text-balance">
              Já concluíste este programa? Deixa a tua marca
            </h3>
            <CourseReviewForm courseId={course._id} />
          </div>*/}
        </div>
      </section>

      {/* --- RELACIONADOS --- */}
      {relatedCourses.length > 0 && (
        <section className="py-24 bg-[#F8F9FB]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-16">
              <div className="max-w-xl">
                <h2 className="text-4xl font-black text-[#37374B] tracking-tight mb-4 text-center md:text-left">Continuar a Explorar</h2>
                <p className="text-gray-500 font-medium">Descobre outros programas desenvolvidos para apoiar o teu bem-estar.</p>
              </div>
              <Link href="/mindful-store" className="hidden md:block text-[#3D81F1] font-bold border-b-2 border-blue-100 pb-1 hover:border-blue-500 transition-all">
                Ver toda a loja
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {relatedCourses.map((item: any) => (
                <Link key={item._id} href={`/mindful-store/${item.slug}`} className="group">
                  <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                    <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-sm font-black text-[#37374B]">
                      {item.price}€
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-[#37374B] group-hover:text-[#3D81F1] transition-colors duration-300 text-center">{item.title}</h3>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2 text-center">Formação Online</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      
    </main>
  );
}