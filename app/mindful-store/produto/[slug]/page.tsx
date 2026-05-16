import Link from '@/components/MyLink';
import ProductViewer from '@/components/ProductViewer'; 
import ReviewSlideshow from '@/components/ReviewSlideshow';
import { client } from '../../../lib/sanity';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

// 🎯 FUNÇÃO ÚNICA DE FETCH
async function getPageData(slug: string) {
  const query = `{
    "product": *[_type == "physicalProduct" && slug.current == $slug][0] {
      _id,
      _type, 
      title,
      "slug": slug.current,
      price,
      discountPrice,
      weight,
      description,
      "images": images[]{
        "url": coalesce(asset->url, url)
      },
      colors,
      sizes,
      details,
      isAvailable,
      "ratings": *[_type == "review" && references(^._id)].rating,
      "reviews": *[_type == "review" && (product._ref == ^._id || item._ref == ^._id)] | order(_createdAt desc) {
        userName,
        rating,
        comment,
        approved,
        "userImage": userImage.asset->url
      }
    },
    "related": *[_type == "physicalProduct" && slug.current != $slug][0...3] {
      _id,
      _type,
      title,
      "slug": slug.current,
      "price": coalesce(price, sizes[0].price, variations[0].price, 0),
      "discountPrice": coalesce(discountPrice, sizes[0].discountPrice, variations[0].discountPrice, 0),
      "imageUrl": coalesce(images[0].asset->url, images[0].url),
      isAvailable
    }
  }`;

  return await client.fetch(query, { slug }, { cache: 'no-store' });
}

export default async function PhysicalProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // 🚀 APENAS 1 CHAMADA AO SANITY
  const { product, related: relatedProducts } = await getPageData(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const reviewCount = product.ratings?.length || 0;
  const averageRating = reviewCount > 0 ? (product.ratings.reduce((a: any, b: any) => a + b, 0) / reviewCount) : 5.0;

  return (
    <main className="min-h-screen bg-[#FCFCFC] font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-24 pb-12">
        
        <Link href="/mindful-store" className="inline-flex items-center text-slate-500 hover:text-gray-900 font-semibold text-sm mb-10 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
          Voltar à Loja
        </Link>

        {/* Passamos os dados já carregados para o viewer */}
        <ProductViewer product={product} relatedProducts={relatedProducts} />

        <section className="mt-24 pt-16 border-t border-slate-200 relative overflow-hidden bg-[#FCFCFC]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">O que dizem os nossos clientes</h2>
            
            {reviewCount > 0 && (
              <>
                <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} fill={i < Math.round(averageRating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-slate-500 font-medium text-lg">
                  Classificação média de {averageRating.toFixed(1)} em 5 ({reviewCount} avaliações)
                </p>
              </>
            )}
          </div>
          
          {/* 💡 DICA: Se o ReviewSlideshow aceitar uma prop "data", podes passar product.reviews 
              e poupar o 3º fetch que ele provavelmente faz lá dentro! */}
          <ReviewSlideshow productId={product._id} initialData={product.reviews} />
          
        </section>
      </div>
    </main>
  );
}