// app/blog/page.tsx
import { client } from @/app/sanity/client';
import Link from '@/components/MyLink';

export default async function BlogIndexPage() {
  // Query GROQ: Vai buscar todos os documentos do tipo 'post' (ajusta se o teu tipo for 'article', etc.)
  // Ordena do mais recente para o mais antigo
  const query = `*[_type == "post"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "imageUrl": mainImage.asset->url
  }`;

  const posts = await client.fetch(query);

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 font-sans">
      <h1 className="text-4xl md:text-5xl font-bold text-[#141313] mb-12 text-center">
        O Nosso Blog
      </h1>

      {/* Grelha responsiva: 1 coluna no telemóvel, 2 no tablet, 3 no PC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <Link 
            key={post._id} 
            href={`/blog/${post.slug}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            {/* Imagem do Artigo */}
            {post.imageUrl && (
              <div className="w-full h-48 overflow-hidden bg-gray-100">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            
            {/* Texto do Artigo */}
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-bold text-[#141313] mb-3 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-3">
                {post.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}