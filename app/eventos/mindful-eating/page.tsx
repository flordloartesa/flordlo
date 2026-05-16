// app/eventos/mindful-eating/page.tsx

// ✅ 1. CONFIGURAÇÕES DE RUNTIME (Tiramos o force-dynamic para poupar Vercel)
export const runtime = 'nodejs';

import { notFound } from "next/navigation";
import { client } from '@/app/sanity/client'; 
import React from 'react';
import EventosSoltosLayoutMindfulEating from '@/components/eventosSoltosLayoutMindfulEating';

// ✅ 2. BUSCA DE DADOS (GROQ OTIMIZADO COM ISR)
// Removemos o react cache() porque a fetch API do Next.js com 'next: { revalidate }' já faz cache nativamente.
async function getEventData() {
  return await client.fetch(`
    *[_type == "eventos" && slug.current == "mindful-eating"][0]{
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
      
      // 👇 NOVOS CAMPOS PARA SEO:
      seoStartDate,
      seoEndDate,
      "imagemCapaUrl": imagemCapa.asset->url,
      imagemUrlExterna,

      // 👇 Eventos e retiros sugeridos unificados
      "suggestedEvents": suggestedEvents[]->{
        _id,
        _type,
        slug,
        heroDate,            // 🔥 ISTO FALTAVA: Puxa o campo novo (se for Retiro)
        dataEventoTexto,     // Mantemos este para eventos normais
        
        "titulo": coalesce(titulo, title, name),
        "imageUrl": coalesce(imageUrl, imagemUrlExterna, imagemCapa.asset->url, image.asset->url),
        "preco": coalesce(price, preco, regularPrice, earlyBirdPrice),
        "tipologia": coalesce(tipologia, format, "Retreat"),
        
        // Se for um array de instrutores (Retiro), pega no 1º. Se for evento, pega no autor.
        "autorNome": coalesce(instructors[0], autor->name)
      }
    }
  `, 
  {}, 
  // 👇 A GRANDE POUPANÇA: Atualiza de hora a hora (3600s). Se quiseres de minuto a minuto, usa 60.
  { next: { revalidate: 3600 } } 
  );
}

// ✅ 3. METADATA DINÂMICO (Para WhatsApp, Redes Sociais e Google)
export async function generateMetadata() {
  const data = await getEventData();
  const siteUrl = 'https://meditt.space/eventos/mindful-eating';

  if (!data) return { title: 'Evento Não Encontrado - Meditt' };

  const title = data.titulo || 'Mindful Eating | Meditt';
  const description = data.ShortDescription || data.subtitle || 'Redescobre o verdadeiro sentido de comer.';
  
  // Prioriza a imagem externa, se não houver, tenta a imagem de capa inserida no Sanity
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
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'pt_PT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    }
  };
}

export default async function Page() {
  try {
    const eventData = await getEventData();

    // Verificação de segurança de build
    if (!eventData && process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      return <EventosSoltosLayoutMindfulEating event={{}} />;
    }

    if (!eventData) {
      console.warn("Aviso: Evento 'mindful-eating' não encontrado no Sanity.");
      return notFound();
    }

    // ✅ 4. DADOS ESTRUTURADOS (JSON-LD) PARA SEO (Com as Novas Datas Escondidas)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: eventData.titulo,
      image: eventData.imagemUrlExterna || eventData.imagemCapaUrl,
      description: eventData.ShortDescription || eventData.subtitle,
      url: 'https://meditt.space/eventos/mindful-eating',
      
      // Datas puxadas diretamente dos teus novos campos do Sanity
      startDate: eventData.seoStartDate, 
      endDate: eventData.seoEndDate || eventData.seoStartDate, // Fallback caso esqueças a data final
      
      eventStatus: 'https://schema.org/EventScheduled',
      // Se o local for "Online", muda o modo para evento online
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
        price: eventData.preco || eventData.regularPrice || eventData.reservaPrice || 0,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: 'https://meditt.space/eventos/mindful-eating'
      }
    };

    return (
      <>
        {/* Injeção do Schema.org para o Google Calendar/Pesquisa ler as datas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Renderiza o componente visual (UI) */}
        <EventosSoltosLayoutMindfulEating event={eventData} />
      </>
    );

  } catch (error) {
    console.error("Erro ao carregar dados do evento:", error);
    // Em caso de falha de ligação ao Sanity, previne que a página parta (Renderiza vazio)
    return <EventosSoltosLayoutMindfulEating event={{}} />;
  }
}