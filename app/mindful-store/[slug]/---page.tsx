"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { client } from "@/app/sanity/client";
import { getUserCourses } from "@/app/actions/updateCustomer";

// Importamos os dois layouts
import EventosLayout from "@/components/EventosLayout";


export default function CourseSalesPage({ params }: { params: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasOwnership, setHasOwnership] = useState(false);

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const normalizedSlug = resolvedParams.slug?.toLowerCase().trim();

      // 1. Verificar posse do curso
      const userCoursesResult = await getUserCourses();
      const purchased = userCoursesResult?.success 
        ? userCoursesResult.courses.map((c: any) => c?.slug?.toLowerCase().trim()) 
        : [];

      // 2. Buscar dados incluindo o campo LAYOUT
      const result = await client.fetch(`
        *[_type in ["course", "product", "retreat"] && slug.current == $slug][0]{
          ...,
          layout, // <--- CAMPO ESSENCIAL
          "image": coalesce(coverImageUrl, coverImage.asset->url, ""),
          "instructorName": coalesce(author->name, instructor->name, "Equipa Meditt"),
          "instructorPhoto": coalesce(instructorPhoto.asset->url, author->image.asset->url),
          "nivel1": courseContent.nivel1[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          "nivel2": courseContent.nivel2[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          "nivel3": courseContent.nivel3[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          "modules": modules[]{ title, "content": content[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) } },
          "ratings": *[_type == "review" && references(^._id) && approved == true].rating
        }
      `, { slug: normalizedSlug });

      if (!result) return notFound();

      const isOwned = purchased.includes(normalizedSlug);
      setHasOwnership(isOwned);

      setData(result);
      setLoading(false);
    }
    loadData();
  }, [params]);

  if (loading) return <div className="min-h-screen bg-white" />;

  // --- LÓGICA DE DECISÃO DE LAYOUT ---
  if (data.layout === 'player') {
    return <PlayerLayout course={data} hasOwnership={hasOwnership} />;
  }

  // Por defeito, retorna o layout de Eventos/Vendas
  return <EventosLayout course={data} hasOwnership={hasOwnership} params={params} />;
}