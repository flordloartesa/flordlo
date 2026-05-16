"use server";

import { client } from "@/app/sanity/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";

export async function getCourseOffer(slug: string) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    // 🔥 O SEGREDO ESTÁ AQUI: Adicionei os "..." dentro dos content[]-> 
    // para garantir que os campos de vídeo e código do Sanity não são apagados no caminho!
    const query = `*[_type == "course" && slug.current == $slug][0] {
      ...,
      "id": _id,
      "slug": slug.current,
      "image": coverImage.asset->url,
      
      // ✅ 1. DESEMPACOTAR A LISTA DE INSTRUTORES (O ARRAY)
// ✅ 1. DESEMPACOTAR A LISTA DE INSTRUTORES (O ARRAY)
      // ✅ 1. DESEMPACOTAR A LISTA DE INSTRUTORES (O ARRAY)
      "instructors": instructors[]->{
        "name": name,
        "photo": coalesce(image.asset->url, photo.asset->url, imageUrl, ""), // 👉 AQUI ESTÁ A MAGIA!
        "shortBio": coalesce(shortBio, ""),
        "detailedBio": coalesce(pt::text(bio), bio, detailedBio, "")
      },

      // 👇 Mantém os antigos por baixo para os Planos B
      instructorShortBio,
      instructorDetailedBio,
      totalInstructors,

      // ✅ 2. GESTÃO DE NOMES E FOTOS (PARA OS CARDS E FALLBACKS)
      "instructorName": coalesce(
        array::join(instructors[]->name, " | "), // 👉 AQUI: Plural e com a Barra
        instructorName,
        "Equipa Meditt"
      ),
      "instructorPhoto": coalesce(
        instructors[0]->image.asset->url, // 👉 AQUI: Plural
        instructorPhoto.asset->url,
        "/placeholder.jpg"
      ),

      // ✅ CUSTOMIZAÇÃO DO PLAYER
      "playerBackgroundImage": playerBackgroundImage.asset->url,
      "backgroundImageUrl": backgroundImageUrl,
      "customGradient": customGradient,
      "idleGifUrl": idleGifUrl,
      "idleGradient": idleGradient,
      "idleGifForest": idleGifForest,
      "idleGifOcean": idleGifOcean,
      "idleGifRain": idleGifRain,

      // ✅ 1. FORMATO PARA MBSR (8 Semanas)
      "modules": modules[] {
        title,
        "content": content[]-> {
          ..., 
          "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, audio.asset->url, url, link),
          "instructorName": coalesce(^.^.instructorName, author->name, instructor->name)
        }
      },

      // ✅ 2. FORMATO PARA MINDFULNESS (3 Níveis)
      "courseContent": {
        "nivel1": coalesce(courseContent.nivel1[]-> { ..., "courseLevel": "nivel-1", "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, url, link) }, []),
        "nivel2": coalesce(courseContent.nivel2[]-> { ..., "courseLevel": "nivel-2", "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, url, link) }, []),
        "nivel3": coalesce(courseContent.nivel3[]-> { ..., "courseLevel": "nivel-3", "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, url, link) }, [])
      },

      // ✅ 3. O CAMPO "CONTENT" (Flat Array para o UniversalPlayer)
      "content": select(
        defined(courseContent.nivel1) => 
          coalesce(courseContent.nivel1[]->{ ..., "courseLevel": "nivel-1", "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, url, link) }, []) + 
          coalesce(courseContent.nivel2[]->{ ..., "courseLevel": "nivel-2", "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, url, link) }, []) + 
          coalesce(courseContent.nivel3[]->{ ..., "courseLevel": "nivel-3", "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, url, link) }, []),
        
        defined(modules) => modules[].content[]->{ ..., "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, url, link) },
        
        content[]->{ ..., "url": coalesce(cloudflareAudioUrl, audioFile.asset->url, url, link) }
      )
    }`;

    const course = await client.fetch(query, { slug }, { cache: 'no-store' });
    if (!course) return null;

    // 🛡️ VERIFICAÇÃO DE ACESSO
    let hasAccess = false;
    if (userEmail) {
      const order = await client.fetch(
        `*[_type == "order" && 
           (clienteEmail == $email || email == $email || customerEmail == $email) && 
           lower(status) in ["pago", "completed", "paid", "concluído"] &&
           (references($courseId) || $slug in purchasedCourses[]->slug.current)
         ][0]`, 
        { email: userEmail, courseId: course._id, slug: slug }
      );
      hasAccess = !!order;
    }

    return { ...course, hasAccess };
  } catch (error) {
    console.error("Erro na Action getCourseOffer:", error);
    return null;
  }
}

export async function getCourseContent(slug: string) {
  const res = await getCourseOffer(slug);
  if (!res) return { allowed: false, course: null };
  
  // Mantemos a segurança mas sem destruir os campos de vídeo
  const tracksWithSecurity = (res.content || []).map((track: any) => ({
    ...track,
    url: res.hasAccess || track.isFree ? track.url : null,
    // Se o utilizador não tiver acesso, removemos também os links de vídeo por segurança
    codigo: res.hasAccess || track.isFree ? track.codigo : null,
    youtubeUrl: res.hasAccess || track.isFree ? track.youtubeUrl : null,
    videoUrl: res.hasAccess || track.isFree ? track.videoUrl : null,
    video: res.hasAccess || track.isFree ? track.video : null,
    youtube: res.hasAccess || track.isFree ? track.youtube : null,
    isLocked: !(res.hasAccess || track.isFree)
  }));

  return { allowed: res.hasAccess, course: { ...res, content: tracksWithSecurity } };
}