import { client } from "@/app/lib/sanity";
import FeaturedProducts from "@/components/FeaturedProducts"; 
import FlowerCarousel from "@/components/1FlowerCarousel"; 
import FeaturesInfo from "@/components/FeaturesInfo"; 
import MasonryGallery from "@/components/MasonryGallery"; 
import AtelierSection from "@/components/AtelierSection"; // 👈 NOVO
import Link from "next/link";

async function getHomeData() {
  const query = `*[_type == "home"][0] {
    topBanner { isActive, message, linkUrl, "imageUrl": coalesce(image.asset->url, externalUrl) },
    "carouselItems": carouselItems[]{ title, "imageUrl": coalesce(image.asset->url, externalUrl) },
    "features": features[]{ text, "iconUrl": coalesce(icon.asset->url, externalUrl) },
  // 👇 AQUI ESTÁ O SEGREDO: O "linkUrl" tem de estar nesta linha 👇
    "carouselItems": carouselItems[]{ title, linkUrl, "imageUrl": coalesce(image.asset->url, externalUrl) },
    
    // 👇 PEDIR DADOS DO ATELIER
    atelierSection {
      title,
      text,
      signature,
      "imageUrl": coalesce(image.asset->url, externalUrl)
    },

    // 👇 PEDIR DADOS DA MASONRY (Agora com os botões!)
    masonryGallery {
      title,
      description,
      "images": images[]{ alt, "url": coalesce(image.asset->url, externalUrl) },
      buttons
    },
    
    featuredSections
  }`;
  
  return await client.fetch(query, {}, { cache: 'no-store' });
}

export default async function Home() {
  const homeData = await getHomeData();

  return (
    <main>
      {/* Banner Sazonal */}
      {homeData?.topBanner?.isActive && (
        <div className=" max-w-[2200px] mx-auto relative z-40 mt-[100px] md:mt-[120px]"> 
          {/* ... Código do banner idêntico ao que já tinha ... */}
          {homeData.topBanner.imageUrl ? (
            homeData.topBanner.linkUrl ? (
              <Link href={homeData.topBanner.linkUrl} className="block w-full">
                <img src={homeData.topBanner.imageUrl} alt="Banner" className="w-full h-auto" />
              </Link>
            ) : (
              <img src={homeData.topBanner.imageUrl} alt="Banner" className="w-full h-auto" />
            )
          ) : (
            <div className="w-full bg-[#9d6b73] py-4 px-4 text-center text-white">
              {homeData.topBanner.linkUrl ? <Link href={homeData.topBanner.linkUrl}>{homeData.topBanner.message}</Link> : <p>{homeData.topBanner.message}</p>}
            </div>
          )}
        </div>
      )}

      <FlowerCarousel data={homeData?.carouselItems} />
      <FeaturesInfo data={homeData?.features} />
      
      {homeData?.featuredSections?.map((section: any, index: number) => (
        <FeaturedProducts 
          key={index}
          title={section.title}
          subtitle={section.subtitle}
          category={section.category}
        />
      ))}




      {/* Secção do Atelier (Fica perfeitamente antes da galeria!) */}
      <AtelierSection data={homeData?.atelierSection} />

    </main>
  );
}