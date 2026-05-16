"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { client } from "@/app/sanity/client";
import { getUserCourses } from "@/app/actions/updateCustomer";
import EventosLayout from "@/components/EventosLayout";
import NovoLayout from "@/components/NovoLayout"; // Importado como solicitado

export default function PaginaEventoPresencial({ params }: { params: any }) {
  const [mounted, setMounted] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasOwnership, setHasOwnership] = useState(false);
  const [resolvedId, setResolvedId] = useState<string>("");

  // Fix de Hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setResolvedId(id);

        // 1. Verifica se o user já tem reserva/acesso
        const userCoursesResult = await getUserCourses();
        const purchased = userCoursesResult?.success 
          ? userCoursesResult.courses.map((c: any) => c?.slug?.toLowerCase().trim()) 
          : [];

        // 2. Query completa do Sanity (Garantindo o campo 'layout')
        const query = `*[_type == "course" && slug.current == $id][0]{
          ...,
          layout, // CAMPO ESSENCIAL PARA A LOGICA DE TROCA
          "image": coalesce(coverImageUrl, coverImage.asset->url, image.asset->url, ""),
          "instructorName": coalesce(author->name, instructor->name, instructorName, "Equipa Meditt"),
          "instructorPhoto": coalesce(instructorPhoto.asset->url, author->image.asset->url, author->imageUrl, instructor->imageUrl),
          "instructorDetailedBio": coalesce(instructorDetailedBio, author->bio, instructor->bio),
          "instructorShortBio": coalesce(instructorShortBio, author->shortBio, instructor->shortBio),
          "nivel1": courseContent.nivel1[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          "nivel2": courseContent.nivel2[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          "nivel3": courseContent.nivel3[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          "modules": modules[]{ title, "content": content[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) } },
          "ratings": *[_type == "review" && references(^._id) && approved == true].rating
        }`;

        const result = await client.fetch(query, { id }, { cache: 'no-store' });

        if (!result) {
          setLoading(false);
          return;
        }

        setHasOwnership(purchased.includes(id?.toLowerCase().trim()));
        setCourse(result);
      } catch (error) {
        console.error("Erro ao carregar evento:", error);
      } finally {
        setLoading(false);
      }
    }

    if (mounted) loadData();
  }, [params, mounted]);

  // Proteção de Hidratação
  if (!mounted) return <div className="min-h-screen bg-white" />;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3D81F1] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium italic">A carregar evento...</p>
      </div>
    );
  }

  if (!course) notFound();

  // --- LÓGICA DE SELECÇÃO DE LAYOUT ---

  // 1. Novo Template (Novo/NovoLayout)
  if (course.layout === 'newTemplate') {
    return <NovoLayout course={course} />;
  }

  // 2. Player (Apenas placeholder como solicitado)
  if (course.layout === 'player') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Modo Player Ativado</h1>
        <p className="text-slate-500">Este layout está configurado para visualização de aulas noutro local.</p>
        <button 
          onClick={() => window.history.back()} 
          className="mt-6 text-[#3D81F1] font-bold underline"
        >
          Voltar atrás
        </button>
      </div>
    );
  }

  // 3. Layout Padrão (EventosLayout - Gradiente Azul)
  return (
    <EventosLayout 
      course={course} 
      hasOwnership={hasOwnership} 
      params={{ id: resolvedId, slug: resolvedId }} 
    />
  );
}