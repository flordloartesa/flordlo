import { client } from "@/app/lib/sanity";
import ProductGrid from "./ProductGrid";

// Definimos o que este componente pode receber
interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  category: string;
}

export default async function FeaturedProducts({ 
  title, 
  subtitle, 
  category 
}: FeaturedProductsProps) {
  
  // A query vai buscar 4 produtos que correspondam à categoria pedida!
  const query = `*[_type == "product" && category == $category][0...4] {
    _id,
    title,
    price,
    status,
    weight,
    "slug": slug.current,
    "image1": images[0]{ "url": coalesce(asset->url, url) }.url,
    "image2": images[1]{ "url": coalesce(asset->url, url) }.url
  }`;

  const products = await client.fetch(query, { category }, { next: { revalidate: 60 } });

  // Se não houver produtos nesta categoria, a secção simplesmente esconde-se e não quebra o site
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-[#000000] mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-500 text-[13px] max-w-[800px] mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Passamos os produtos reais para a grelha visual */}
        <ProductGrid products={products} />

      </div>
    </section>
  );
}