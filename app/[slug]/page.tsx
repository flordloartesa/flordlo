import { client } from "@/app/lib/sanity";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import PartnersCarousel from "@/components/PartnersCarousel";
import Link from "next/link"; // 👈 IMPORT ADICIONADO PARA OS BOTÕES

// 👇 1. A TUA LISTA DE PROJETOS DO PORTFÓLIO (Substitui pelos slugs reais)
const ordemProjetos = [
  "decoracao-floral", 
  "bouquet-boutonniere", 
  "pormenores-florais", 
  "sessao-de-greenery" 
  
];

async function getPageData(slug: string) {
  if (!slug) return null;

  const query = `*[_type == "page" && slug.current == $slug][0]{
    title,
    sections[] {
      _type,
      title,
      subtitle,
      "imageUrl": coalesce(backgroundImage.asset->url, externalUrl),
      height,
      isFullWidth, 
      link,
      description,
      
      bulkExternalUrls,

      "galleryImages": images[]{
        "url": coalesce(image.asset->url, externalUrl),
        "link": link
      },

      body,
      "partners": logos[]->{ 
        name, 
        "logoUrl": coalesce(logo.asset->url, externalUrl),
        website
      }
    },
    "allReviews": *[_type == "review" && approved == true] | order(_createdAt desc) {
      _id,
      userName,
      rating,
      comment,
      "userImage": userImage.asset->url
    }
  }`;
  
  return await client.fetch(query, { slug }, { next: { revalidate: 0 } });
}

const portableTextComponents = {
  types: {
    linhaSeparadora: ({ value }: any) => {
      const borderStyle = value?.style === 'Tracejada' ? 'border-dashed' : 'border-solid';
      return <hr className={`w-full max-w-3xl mx-auto my-8 md:my-12 border-t ${borderStyle} border-slate-300`} />;
    }
  },
  marks: {
    serif: ({children}: any) => <span className="font-serif italic">{children}</span>,
    sans: ({children}: any) => <span className="font-sans not-italic font-normal">{children}</span>,
    pequena: ({children}: any) => <span className="text-[14px] leading-[22px] block mb-2">{children}</span>,
    gigante: ({children}: any) => <span className="text-2xl md:text-6xl font-bold leading-tight">{children}</span>,
    grande: ({children}: any) => <span className="text-lg md:text-3xl font-medium leading-snug">{children}</span>,
    esquerda: ({children}: any) => <span className="inline-block w-full text-left">{children}</span>,
    centro: ({children}: any) => <span className="inline-block w-full text-center">{children}</span>,
    direita: ({children}: any) => <span className="inline-block w-full text-right">{children}</span>,
    underline: ({children}: any) => <u className="underline underline-offset-4">{children}</u>,
  },
  block: {
    normal: ({children}: any) => <p className="mb-4 md:mb-6 leading-relaxed text-slate-700 text-sm md:text-lg">{children}</p>,
    h1: ({children}: any) => <h1 className="text-3xl md:text-7xl font-bold mb-6 md:mb-8 text-slate-900">{children}</h1>,
    h2: ({children}: any) => <h2 className="text-2xl md:text-6xl font-bold mb-6 md:mb-8 text-slate-900">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-xl md:text-5xl font-bold mb-4 md:mb-6 text-slate-900">{children}</h3>,
  }
};

export default async function DynamicPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) return notFound();

  // 👇 2. AS MATEMÁTICAS DO PORTFÓLIO
  const indexAtual = ordemProjetos.indexOf(slug);
  const isPortfolioItem = indexAtual !== -1; 
  const slugAnterior = indexAtual > 0 ? ordemProjetos[indexAtual - 1] : null;
  const slugSeguinte = indexAtual < ordemProjetos.length - 1 ? ordemProjetos[indexAtual + 1] : null;

  // Vai buscar os dados ao Sanity
  const data = await getPageData(slug);
  if (!data) return notFound();

  return (
    <main className="min-h-screen bg-white pb-20">
      
      {/* RENDERIZAÇÃO DOS BLOCOS DO SANITY */}
      {data.sections?.map((section: any, idx: number) => {
        
        // --- BLOCO 1: BANNER HERO ---
        if (section._type === 'hero') {
          let heightClass = "h-[300px] md:h-[400px]";
          if (section.height === 'small') {
            heightClass = "h-[200px] md:h-[300px]";
          } else if (section.height === 'large') {
            heightClass = "h-[400px] md:h-[600px] lg:h-[800px]";
          }

          const containerWidthClass = section.isFullWidth 
            ? "w-full mt-6 md:mt-8" 
            : "w-full max-w-5xl mx-auto px-4 md:px-6 mt-6 md:mt-8";

          const heroContent = (
            <div className={`relative flex items-center justify-center w-full overflow-hidden shadow-sm ${heightClass} ${section.link ? 'group' : ''}`}>
              {section.imageUrl && (
                <div 
                  className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat rounded-xl ${section.link ? 'transition-transform duration-700 group-hover:scale-105 !rounded-xl' : ''}`}
                  style={{ backgroundImage: `url(${section.imageUrl})` }}
                />
              )}
              <div className="absolute inset-0 z-10 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} />
              {section.title && (
                <div className="relative z-20 bg-white/85 px-8 py-3 shadow-md rounded-xl">
                  <h1 className="text-[#9d6b73] text-sm md:text-lg font-serif text-center uppercase tracking-widest font-bold">
                    {section.title}
                  </h1>
                </div>
              )}
            </div>
          );

          return (
            <div key={idx} className={containerWidthClass}>
              {section.link ? (
                <a href={section.link} className="block w-full cursor-pointer">
                  {heroContent}
                </a>
              ) : (
                heroContent
              )}
            </div>
          );
        }

        // --- BLOCO 2: CONTEÚDO DE TEXTO ---
        if (section._type === 'contentBlock') {
          return (
            <div key={idx} className="max-w-4xl mx-auto py-8 md:py-12 px-6">
              <div className="prose max-w-none font-serif">
                <PortableText value={section.body} components={portableTextComponents} />
              </div>
            </div>
          );
        }

        // --- BLOCO 3: PARCEIROS ---
        if (section._type === 'partnersSection') {
          return (
            <div key={idx} className="max-w-6xl mx-auto py-8 md:py-12 border-t border-slate-100 mt-6 text-center overflow-hidden">
              <h2 className="text-lg md:text-xl font-serif text-slate-400 mb-8 md:mb-12 uppercase tracking-[0.3em] px-4">
                {section.title}
              </h2>
              <PartnersCarousel partners={section.partners} />
            </div>
          );
        }

        // --- BLOCO 4: GALERIA PINTEREST ---
        if (section._type === 'pinterestGallery') {
          const bulkUrlsArray = section.bulkExternalUrls 
            ? section.bulkExternalUrls
                .split(/[\n, ]+/) 
                .map((url: string) => url.trim())
                .filter((url: string) => url.length > 5)
                .map((url: string) => ({ url: url, link: null }))
            : [];
          
          const finalGalleryImages = [...(section.galleryImages || []), ...bulkUrlsArray];

          return (
            <div key={idx} className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6">
              {(section.title || section.description) && (
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
                  {section.title && (
                    <h2 className="text-2xl md:text-4xl font-serif text-slate-900 mb-4">{section.title}</h2>
                  )}
                  {section.description && (
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">{section.description}</p>
                  )}
                </div>
              )}
              
              {finalGalleryImages && finalGalleryImages.length > 0 && (
                <div className="columns-2 sm:columns-2 md:columns-4 lg:columns-5 gap-2">
                  {finalGalleryImages.map((img: any, i: number) => {
                    if (!img || !img.url) return null;

                    const innerContent = (
                      <div className="overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow relative group">
                        <img 
                          src={img.url} 
                          alt={`Galeria ${i + 1}`} 
                          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 ease-in-out" 
                          loading="lazy" 
                        />
                      </div>
                    );

                    return img.link ? (
                      <a key={i} href={img.link} target="_blank" rel="noopener noreferrer" className="block break-inside-avoid mb-4">
                        {innerContent}
                      </a>
                    ) : (
                      <div key={i} className="block break-inside-avoid mb-2">
                        {innerContent}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // --- BLOCO 5: TESTEMUNHOS ---
        if (section._type === 'testimonialsSection') {
          return (
            <section key={idx} className="py-8 md:py-12 bg-white mb-10 md:mb-20">
              <div className="max-w-4xl mx-auto text-center -mb-10 md:-mb-5 px-6">
                <h4 className="text-[#9d6b73] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3">
                  {section.subtitle || "Testemunhos"}
                </h4>
                <h2 className="text-2xl md:text-5xl font-serif text-slate-900 leading-tight">
                  {section.title || "O que dizem os nossos clientes"}
                </h2>
              </div>
              <TestimonialsSlider initialReviews={data.allReviews} />
            </section>
          );
        }

        // --- BLOCO 6: DIVISOR ---
        if (section._type === 'divider') {
          const borderStyle = section.style === 'Tracejada' ? 'border-dashed' : 'border-solid';
          
          let marginClass = "my-10"; 
          if (section.spacing === 'small') marginClass = "my-5";
          if (section.spacing === 'large') marginClass = "my-20";

          return (
            <div key={idx} className="max-w-5xl mx-auto px-6">
              <hr className={`w-full border-t ${borderStyle} border-slate-300 ${marginClass}`} />
            </div>
          );
        }

        return null;
      })}

      {/* 👇 3. BLOCO DINÂMICO DE NAVEGAÇÃO DO PORTFÓLIO */}
      {isPortfolioItem && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-10 border-t border-rose-100 max-w-5xl mx-auto px-6">
          
          {/* Botão ANTERIOR */}
          {slugAnterior ? (
            <Link 
              href={`/${slugAnterior}`}
              className="px-6 py-3 bg-white text-[#9d6b73] border border-[#9d6b73] rounded-xl font-bold hover:bg-rose-50 transition-all w-full sm:w-auto text-center"
            >
              &larr; Projeto Anterior
            </Link>
          ) : (
            <div className="hidden sm:block w-[200px]"></div>
          )}

          {/* Botão SEGUINTE */}
          {slugSeguinte ? (
            <Link 
              href={`/${slugSeguinte}`}
              className="px-6 py-3 bg-[#9d6b73] text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-rose-200 w-full sm:w-auto text-center"
            >
              Projeto Seguinte &rarr;
            </Link>
          ) : (
            <Link 
              href="/" 
              className="px-8 py-3 bg-[#9d6b73] text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-rose-200 w-full sm:w-auto text-center"
            >
              Explorar Loja &rarr;
            </Link>
          )}
        </div>
      )}

    </main>
  );
}