// app/lib/sanity.ts
import { createClient } from 'next-sanity';

// 👇 CORREÇÃO AQUI: Agora aponta para a base de dados da Flor d'Ló
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "bzcq0ztm";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;


// 🟢 CLIENT 1: PÚBLICO (Para ler dados super rápido no site)
// Não leva token! A CDN funciona e resolve os erros da Netlify.
export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-02-12",
  useCdn: true, // 👈 Agora sim, a cache vai funcionar!
  perspective: 'published',
});

// 🔴 CLIENT 2: ADMIN (Para criar utilizadores ou alterar dados)
// Leva token. Não usa CDN. 
// Só deve usar este client nos ficheiros onde faz ".create()" ou mutações.
export const adminClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-02-12",
  useCdn: false, // 👈 Mutações nunca usam CDN
  token: token,  // 👈 Os super poderes ficam isolados aqui
  perspective: 'published',
  ignoreBrowserTokenWarning: true,
});

// ==========================================
// QUERIES DE LEITURA (Usam o Client 1 - Público)
// ==========================================

export const GET_COURSE_QUERY = `
  *[_type == "courses" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    "workbooks": workbooks[]{
      title,
      "fileUrl": file.asset->url
    }
  }
`;

export async function getLibraryCourseBySlug(slug: string) {
  const query = `
    *[_type == "libraryCourseWorld" && slug.current == $slug][0] {
      _id,
      title,
      subtitle,
      "slug": slug.current,
      description,
      instructor,
      customGradient,
      "coverImageUrl": coverImage.asset->url,
      "playerBackgroundImageUrl": playerBackgroundImage.asset->url,
      
      standaloneTracks[]->{
        _id,
        title,
        author,
        mediaType,
        duration,
        url,
        imageSource, 
        "thumbnailUrl": coalesce(thumbnail.asset->url, thumbnailUrl, imageSource) 
      },
      
      modules[]{
        title,
        content[]->{
          _id,
          title,
          author,
          mediaType,
          duration,
          url,
          imageSource, 
          "thumbnailUrl": coalesce(thumbnail.asset->url, thumbnailUrl, imageSource)
        }
      }
    }
  `;

  // 🟢 Usa o client público com Cache de 24 horas (86400 segundos)
  const data = await client.fetch(query, { slug }, { next: { revalidate: 86400 } });
  return data;
}

export async function getCenariosRelaxantes() {
  const query = `
    *[_type == "cenarios"] {
      _id,
      title,
      videoType,
      youtubeId,
      directVideoUrl,
      audioUrl,
      "img": coalesce(coverImage.asset->url, coverImageUrl) 
    }
  `;
  
  // 🟢 Usa o client público com Cache de 24 horas (Nota: variáveis vão vazias {})
  const data = await client.fetch(query, {}, { next: { revalidate: 86400 } });
  return data;
}

export async function getRetreatBySlug(slug: string) {
  const query = `
    *[_type == "retreat" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      format,
      dateRange,
      location,
      price,
      priceNote,
      heroDateLocation,
      heroSpotsText,
      heroSeeAlsoText,
      heroSeeAlsoLink,
      "imageUrl": imageUrl,
      "image": image.asset->url,
      description,
      status,
      instructors
    }
  `;
  
  // 🟢 Usa o client público com Cache de 24 horas
  const data = await client.fetch(query, { slug }, { next: { revalidate: 86400 } });
  return data;
}