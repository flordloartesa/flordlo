import { client } from "@/app/lib/sanity";
import LojaClient from "./LojaClient";

export const revalidate = 60; 

async function getProducts() {
  const query = `*[_type == "product" && visibility != "hidden"] {
    _id,
    title,
    "slug": slug.current,
    price,
    status,
    category,
    weight,
    "imageUrl": coalesce(images[0].asset->url, images[0].url),
    "hoverImageUrl": coalesce(images[1].asset->url, images[1].url)
  }`;
  
  return await client.fetch(query);
}

export default async function LojaPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">A Nossa Loja</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Descubra as nossas coleções exclusivas criadas com detalhe e paixão.
          </p>
        </header>

        {/* Chamamos a secção interativa e passamos os produtos */}
        <LojaClient initialProducts={products} />

      </div>
    </main>
  );
}