import { client } from "@/app/lib/sanity";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";

// Função para ir ao Sanity buscar o Produto pelo URL (slug)
async function getProductData(slug: string) {
  const query = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    price,
    productionTime,
    status,
    weight,
    sizes,
    colors,
    "imageUrls": images[]{ "url": coalesce(asset->url, url) }.url,
    youtubeVideoUrl,
    shortDescription,
    description,
    category
  }`;
  
  const product = await client.fetch(query, { slug }, { next: { revalidate: 60 } });
  return product;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // 1. "Esperamos" (await) que o Next.js leia o URL completo
  const resolvedParams = await params;
  
  // 2. Passamos o slug correto e preenchido para o Sanity
  const product = await getProductData(resolvedParams.slug);

  if (!product) {
    return notFound();
  }

  // 3. Renderizamos o componente cliente do produto
  return <ProductClient product={product} />;
}