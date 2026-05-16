import Link from '@/components/MyLink';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { client } from '../lib/sanity';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: "Blog | Meditt",
  description: "Artigos sobre Mindfulness, bem-estar e desenvolvimento pessoal.",
};

// Vai buscar os artigos ao Sanity (presumindo que o tipo de documento se chama "post")
async function getPosts() {
  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      // 👇 CORRIGIDO: Agora procura primeiro pelo link externo, depois pelo upload, e por fim usa o placeholder
      "imageUrl": coalesce(mainImageUrl, mainImage.asset->url, '/images/placeholder.jpg'),
      publishedAt,
      excerpt,
      category
    }`;
    return await client.fetch(query, {}, { cache: 'no-store' });
  } catch (e) {
    console.error("Erro ao carregar o blog:", e);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-[#FCFCFC]">
      
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10 mt-20">
        
        {/* Cabeçalho do Blog */}
        <header className="mb-16 text-center md:text-left border-b border-slate-200 pb-8">
          <span className="text-[#3D81F1] text-xs font-bold uppercase tracking-widest mb-2 block">INSPIRAÇÃO E CONHECIMENTO</span>
          <h1 className="text-3xl md:text-5xl font-bold text-[#37374B] mb-4">Blog Meditt</h1>
          <p className="text-slate-500 max-w-2xl">Reflexões práticas sobre mindfulness, neurociência e como viver de forma mais consciente no dia a dia.</p>
        </header>

        {/* Grelha de Artigos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {posts.map((post: any) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="group block h-full">
              <div className="flex flex-col w-full bg-white rounded-[12px] hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden h-full">
                
                {/* Imagem do Artigo */}
                <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                  <Image 
                    src={post.imageUrl} 
                    alt={post.title}
                    fill
                    unoptimized // 👈 ADICIONADO: Permite que os links do Google/YouTube funcionem perfeitos aqui!
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Categoria Flutuante */}
                  {post.category && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[#3D81F1] shadow-sm">
                      {post.category}
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Data */}
                   {/* {post.publishedAt && (
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                      {new Date(post.publishedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )} */}

                        {/* Etiqueta Novo (Só aparece se tiver menos de 60 dias) */}
                  {post.publishedAt && (new Date(post.publishedAt).getTime() > Date.now() - 60 * 24 * 60 * 60 * 1000) && (
                    <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                      Novo
                    </p>
                  )}
                  
                  {/* Título */}
                  <h3 className="text-[#37374B] font-bold text-xl leading-tight mb-3 group-hover:text-[#3D81F1] transition-colors duration-300">
                    {post.title}
                  </h3>
                  
                  {/* Resumo */}
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>

                  {/* Botão Ler Mais */}
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <span className="text-[#3D81F1] text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ler Artigo <span className="text-lg leading-none">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-slate-400 py-20">Ainda não existem artigos publicados.</p>
        )}

      </div>
      
    </main>
  );
}