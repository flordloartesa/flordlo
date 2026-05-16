// app/eventos/growing-up-mindful/page.tsx

// ✅ 1. CONFIGURAÇÕES DE RUNTIME (Tiramos o force-dynamic para poupar Vercel e ativar a Cache)
export const runtime = 'nodejs';

import { notFound } from "next/navigation";
import { client } from '@/app/sanity/client';
import React from 'react';
import EventosSoltosLayoutGUM from '@/components/eventosSoltosLayoutGUM';

// ✅ 2. BUSCA DE DADOS (GROQ OTIMIZADO COM ISR)
async function getEventData() {
  return await client.fetch(`
    *[_type == "eventos" && slug.current == "growing-up-mindful"][0]{
      _id,
      _type,
      titulo,
      dataEventoTexto,
      local,
      earlyBirdPrice,
      regularPrice,
      reservaPrice,
      preco,
      earlyBirdDate,
      idioma,
      subtitle,
      youtubeId,
      marqueeSettings,
      ShortDescription,
      "registrationLink": registrationLink,
      
      // Campos para SEO
      seoStartDate,
      seoEndDate,
      "imagemCapaUrl": imagemCapa.asset->url,
      imagemUrlExterna,

      // 👇 Eventos e retiros sugeridos com todos os fallbacks de data e imagem
      "suggestedEvents": suggestedEvents[]->{
        _id,
        _type,
        slug,
        heroDate,            // Data para Retiros
        dataEventoTexto,     // Data para Eventos
        "titulo": coalesce(titulo, title, name),
        "imageUrl": coalesce(imageUrl, imagemUrlExterna, imagemCapa.asset->url, image.asset->url),
        "preco": coalesce(price, preco, regularPrice, earlyBirdPrice),
        "autorNome": coalesce(instructors[0], autor->name),
        "tipologia": coalesce(tipologia, format, "Retreat")
      }
    }
  `, 
  {}, 
  // 👇 A GRANDE POUPANÇA: Atualiza os dados do Sanity apenas de 1 em 1 hora (3600 segundos).
  { next: { revalidate: 3600 } } 
  );
}

// ✅ 3. METADATA DINÂMICO (Para que o link no WhatsApp apareça com a imagem e título certos)
export async function generateMetadata() {
  const data = await getEventData();
  const siteUrl = 'https://meditt.space/eventos/growing-up-mindful';

  if (!data) return { title: 'Evento Não Encontrado - Meditt' };

  const title = data.titulo || 'Growing Up Mindful | Meditt';
  const description = data.ShortDescription || data.subtitle || 'Teaching Mindfulness to Kids and Teens.';
  const shareImage = data.imagemUrlExterna || data.imagemCapaUrl || 'https://meditt.space/default-og.jpg';

  return {
    title,
    description,
    alternates: { canonical: siteUrl },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: 'Meditt',
      images: [{ url: shareImage, width: 1200, height: 630, alt: title }],
      locale: 'pt_PT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage],
    },
  };
}

export default async function Page() {
  try {
    const eventData = await getEventData();

    if (!eventData) {
      console.warn("Aviso: Evento 'growing-up-mindful' não encontrado no Sanity.");
      return notFound();
    }

    // ✅ 4. DADOS ESTRUTURADOS (JSON-LD) PARA O GOOGLE
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: eventData.titulo,
      image: eventData.imagemUrlExterna || eventData.imagemCapaUrl,
      description: eventData.ShortDescription || eventData.subtitle,
      url: 'https://meditt.space/eventos/growing-up-mindful',
      startDate: eventData.seoStartDate, 
      endDate: eventData.seoEndDate || eventData.seoStartDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: eventData.local?.toLowerCase().includes('online') 
        ? 'https://schema.org/OnlineEventAttendanceMode' 
        : 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: eventData.local || 'Portugal',
        address: {
          '@type': 'PostalAddress',
          addressLocality: eventData.local || 'Portugal',
          addressCountry: 'PT'
        }
      },
      offers: {
        '@type': 'Offer',
        price: eventData.preco || eventData.regularPrice || 0,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: 'https://meditt.space/eventos/growing-up-mindful'
      }
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <EventosSoltosLayoutGUM event={eventData} />
      </>
    );

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return <EventosSoltosLayoutGUM event={{}} />;
  }
}