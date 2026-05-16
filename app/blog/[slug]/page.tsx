// app/posts/[slug]/page.tsx
import Image from 'next/image';
import Link from '@/components/MyLink';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoursePromo from '@/components/CoursePromo';
import HeroVideo from '@/components/HeroVideo'; 
import { client } from '../../lib/sanity';
import { PortableText } from '@portabletext/react'; 
import { notFound } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';


export const dynamic = 'force-dynamic';

async function getPostData(slug: string) {
  const query = `
  {
    "post": *[_type == "post" && slug.current == $slug][0] {
      title,
      excerpt,
      "imageUrl": coalesce(mainImageUrl, mainImage.asset->url, ''),
      "videoUrl": videoUrl,
      publishedAt,
      body,
      category,
      "authorName": coalesce(author->name, "Equipa Meditt"),
      "authorRole": coalesce(author->role, "Editor"),
      "authorImage": author->image.asset->url
    },
    "nextPost": *[_type == "post" && publishedAt < *[_type == "post" && slug.current == $slug][0].publishedAt] | order(publishedAt desc)[0] {
      title,
      "slug": slug.current,
      "imageUrl": coalesce(mainImageUrl, mainImage.asset->url, '/images/placeholder.jpg'),
      category
    }
  }
  `;
  return await client.fetch(query, { slug }, { cache: 'no-store' });
}

// 1. COMPONENTE DE CARDS COM LÓGICA DE LAYOUT DINÂMICO
const CardGridComponent = ({ value }: any) => {
  if (!value?.cards) return null;

  const isWide = value.layout === 'wide';

  return (
    <div 
      className={`
        gap-6 my-14 not-prose
        ${isWide 
          ? 'grid grid-cols-1 xl:grid-cols-3 w-[95vw] max-w-[1600px] relative left-1/2 -translate-x-1/2' 
          : 'flex flex-col w-full'
        }
      `}
    > 
      {value.cards.map((card: any, index: number) => (
        <div 
          key={card._key || index} 
          className="relative bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-center min-h-[220px]"
        >
          <span className="absolute right-[-15px] bottom-[-40px] text-[180px] md:text-[240px] font-black text-indigo-600/[0.07] select-none leading-none z-0 pointer-events-none">
            {index + 1}
          </span>

          <div className="relative z-10 max-w-[90%]">
            <h3 className="text-[18px] font-bold text-[#37374B] mb-2 leading-tight">
              {card.title}
            </h3>
            
            <p className="text-[12px] leading-[1.6] text-[#47374B]/90 font-normal mb-4">
              {card.description}
            </p>
            
            {card.buttonText && (
              <div className="mt-2">
                <a 
                  href={card.link || "#"} 
                  className="text-[#3D81F1] font-bold text-[13px] flex items-center gap-1 hover:underline transition-all"
                >
                  {card.buttonText} 
                  <span className="text-base">›</span>
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. MAPEAMENTO DE COMPONENTES INTEGRADO
const customPortableTextComponents = {
  types: {
    cardGrid: CardGridComponent, 
    coursePromo: ({ value }: any) => <CoursePromo data={value} />,
    externalImage: ({ value }: any) => (
       <div className="my-12 rounded-2xl overflow-hidden shadow-lg border border-slate-100">
         <img src={value.url} alt={value.alt || ""} className="w-full h-auto" />
       </div>
    ),
    image: ({ value }: any) => (
      <div className="my-12 rounded-2xl overflow-hidden shadow-lg">
        <Image src={value.asset.url} alt="" width={800} height={500} unoptimized className="w-full h-auto" />
      </div>
    )
  },
  block: {
    h2: ({ children }: any) => <h2 className="text-[28px] md:text-[34px] leading-tight font-bold text-[#37374B] mt-12 mb-6">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-[22px] md:text-[26px] font-bold text-[#37374B] mt-10 mb-4">{children}</h3>,
    normal: ({ children }: any) => <p className="text-[16px] leading-[26px] font-normal text-[#47374B] mb-6">{children}</p>,
    
    bibliography: ({ children }: any) => (
      <div className="mt-10 mb-4 border-t border-slate-100 pt-8">
        <p className="text-[10px] leading-[1.5] text-slate-400 font-bold tracking-[0.1em] ">
          {children}
        </p>
      </div>
    ),

    normal_small: ({ children }: any) => (
      <p className="text-[11px] leading-[1.8] text-slate-500 font-normal mb-4 block pl-6 -indent-6 text-left">
        {children}
      </p>
    ),

    blockquote: ({ children }: any) => (
      <div className="my-14 w-full relative">
        <div className="border-[2px] border-[#0eb1d5] rounded-tl-3xl rounded-tr-3xl rounded-br-3xl p-8 md:p-10 relative bg-white z-10">
          <div className="text-2xl md:text-3xl font-bold text-[#37374B] leading-tight italic">
            "{children}"
          </div>
        </div>
        <div className="absolute -bottom-6 left-0 w-12 h-12 border-l-[2px] border-b-[2px] border-[#0eb1d5] rounded-bl-3xl bg-white z-0 -translate-y-4"></div>
      </div>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="mb-8 space-y-4">{children}</ul>,
    number: ({ children }: any) => <ol className="mb-8 space-y-4 list-decimal pl-6 text-[#47374B] text-[15px] leading-[25px]">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex items-start gap-3 text-[#47374B] text-[15px] leading-[25px]">
        <span className="text-[#3D81F1] font-bold shrink-0 mt-0.5">✓</span>
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a href={value.href} rel={rel} className="text-[#3D81F1] font-bold underline hover:text-blue-700">
          {children}
        </a>
      );
    },
    blueUnderline: ({ children }: any) => <span className="border-b-[3px] border-[#2F2CF1] pb-[1px] font-medium">{children}</span>,
    orangeHighlight: ({ children }: any) => <span className="bg-[#FFEFE0] text-[#D97706] px-1.5 py-0.5 rounded-[4px] font-medium">{children}</span>,
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const data = await getPostData(slug);
  const post = data?.post;
  const nextPost = data?.nextPost;

  if (!post) {
    notFound();
  }

  const avatarUrl = post.authorImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=eff6ff&color=3d81f1&size=180`;

  return (
    <main className="min-h-screen bg-[#FCFCFC] font-sans overflow-x-hidden">
      
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
      `}} />
      
      <section className="w-full pt-20 pb-10 px-6">
        <div className="max-w-[800px] mx-auto text-center flex flex-col items-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-[34px] md:text-[50px] leading-[1.1] font-bold text-[#37374B] mb-6">{post.title}</h1>
          {post.excerpt && <p className="text-[18px] md:text-[20px] leading-relaxed text-[#47374B] mb-10 max-w-[700px]">{post.excerpt}</p>}
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden mb-3 border-[3px] border-[#3D81F1] relative bg-slate-50 flex items-center justify-center">
              <img src={avatarUrl} alt={post.authorName} className="w-full h-full object-cover" />
            </div>
            <p className="text-[12px] font-bold text-[#37374B]  tracking-wider mt-2">
              {post.authorName} {post.authorRole && <span className="text-slate-400 font-medium normal-case tracking-normal"> - {post.authorRole}</span>}
            </p>
          </div>
        </div>
      </section>

      <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        {post.imageUrl && <HeroVideo imageUrl={post.imageUrl} videoUrl={post.videoUrl} title={post.title} />}
      </div>

      {/* ZONA DOS BOTÕES DE PARTILHA (Mantida Centrada) */}
      <div className="max-w-[750px] mx-auto px-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-5 mt-10 text-center">Partilhar Artigo</h3>
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {/* 1. ENVIAR POR EMAIL */}
          <a 
            href={`mailto:?subject=Artigo no Meditt&body=Vê este artigo: https://meditt.space/blog/${slug}`} 
            className="w-[44px] h-[44px] rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#3D81F1] hover:text-white transition-colors"
            title="Partilhar por Email"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
          </a>

          {/* 2. WHATSAPP */}
          <a 
            href={`https://api.whatsapp.com/send?text=Vê este artigo no Meditt: https://meditt.space/blog/${slug}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-[44px] h-[44px] rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#25D366] hover:text-white transition-colors"
            title="Partilhar no WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </a>

          {/* 3. INSTAGRAM (Link para Perfil ou Copy Link) */}
          <a 
            href="https://www.instagram.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-[44px] h-[44px] rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#E1306C] hover:text-white transition-colors"
            title="Seguir no Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
        <div className="w-full h-[1px] bg-slate-200 mb-12"></div>
      </div>

      {/* 👇 O TEU CONTEÚDO VOLTA AQUI! 👇 */}
      <div className="max-w-[750px] mx-auto px-6 pb-20 w-full text-left opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        {post.body ? (
          <PortableText value={post.body} components={customPortableTextComponents} />
        ) : (
          <p className="text-center text-slate-500">A escrever algo incrível... Volte em breve!</p>
        )}
      </div>
      {/* 👆 FIM DO CONTEÚDO 👆 */}

      

   

      {nextPost && (
        <section className="w-full bg-slate-900 pt-20 pb-24 px-6 mt-10">
          <div className="max-w-[1000px] mx-auto">
            <Link href={`/blog/${nextPost.slug}`} className="group block">
              <div className="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl">
                 <Image src={nextPost.imageUrl} alt={nextPost.title} fill unoptimized className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2f] via-[#1e1e2f]/50 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80"></div>
                 <div className="absolute bottom-0 left-0 w-full p-8 md:p-14 z-10 flex flex-col items-center text-center text-white">
                   <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl">{nextPost.title}</h2>
                 </div>
              </div>
            </Link>
          </div>
        </section>
      )}
      
    </main>
  );
}