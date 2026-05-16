// ✅ 1. CONFIGURAÇÕES DE RUNTIME E CACHE
export const runtime = 'nodejs';
// Alterado para revalidar a cada 60 segundos (Protege contra Edge Requests excessivos)
export const revalidate = 60; 

import { notFound } from "next/navigation";
import { client } from "@/app/lib/sanity";
import React, { cache } from 'react';
import RetiroMindfulHeart from "./RetreatClientUI";

// Imagem padrão de segurança para links quebrados ou campos vazios
const FALLBACK_IMAGE = "https://64.media.tumblr.com/12d2a1fb27beb5bcc4d8c93d834ee9d9/04801380bf115da1-40/s1280x1920/b956b0f0a664d7ebb4b25992f055099b9537e846.jpg";

// ✅ 2. BUSCA DE DADOS (GROQ AJUSTADO COM CACHE DEDUPLICADO)
const getRetreatData = cache(async () => {
  return await client.fetch(
    `*[_type == "retreat" && slug.current == "2-or-5-day-mindfulness-and-chi-kung-retreat"][0] {
      ...,
      _id,
      title,
      seoTitle,          
      seoDescription,    
      imageUrl,          
      heroDate,          // Para humanos lerem na UI
      heroLocation,      // Novo campo isolado
      seoStartDate,      // Para o Google (formato YYYY-MM-DD)
      seoEndDate,        // Para o Google (formato YYYY-MM-DD)
      price,
      // Puxamos as reviews logo aqui para evitar que o componente de cliente faça fetch extra
      "reviews": *[_type == "review" && retreat._ref == ^._id && approved == true] | order(_createdAt desc) {
        _id,
        "name": coalesce(name, userName, "Anónimo"),
        comment,
        rating
      }
    }`,
    {},
    // Usamos revalidate para aproveitar o cache da Vercel Edge Network
    { next: { revalidate: 60 } }
  );
});

// ✅ 3. METADATA DINÂMICO (Proteção para WhatsApp, Redes Sociais e Google)
export async function generateMetadata() {
  const data = await getRetreatData();
  const siteUrl = 'https://meditt.space/t/2-or-5-day-mindfulness-and-chi-kung-retreat';

  if (!data) return { title: 'Retiro Não Encontrado - Meditt' };

  const title = data.seoTitle || data.title || '2 or 5-Day Mindfulness & Chi-Kung Retreat';
  const description = data.seoDescription || 'Join us on a retreat of mindfulness, Chi-Kung, Nature and Silence.';
  
  // Proteção Broken Link: Se a imagem não existir no Sanity, usa a de fallback
  const shareImage = data.imageUrl || data.image?.asset?.url || FALLBACK_IMAGE;

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

export default async function RetreatPage() {
  try {
    const data = await getRetreatData();

    // Log de controlo para debug em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
        console.log("🔥 DADOS RECEBIDOS:", { 
          id: data?._id,
          novaData: data?.heroDate, 
          novoLocal: data?.heroLocation 
        });
    }

    // Verificação de segurança para evitar crashes se o Sanity falhar
    if (!data && process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
       return <RetiroMindfulHeart sanityData={null} />;
    }

    if (!data) return notFound();

    // ✅ 4. DADOS ESTRUTURADOS (JSON-LD) TOTALMENTE DINÂMICOS COM FALLBACKS
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: data.seoTitle || data.title,
      image: data.imageUrl || FALLBACK_IMAGE,
      description: data.seoDescription || description,
      url: 'https://meditt.space/t/2-or-5-day-mindfulness-and-chi-kung-retreat',
      
      // Datas formatadas com proteção caso o campo esteja vazio
      startDate: data.seoStartDate || new Date().toISOString(), 
      endDate: data.seoEndDate || new Date().toISOString(),
      
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: data.heroLocation || 'Portugal',
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.heroLocation || 'Portugal',
          addressCountry: 'PT'
        }
      },
      // Inclusão de Avaliações no Google (Rich Snippets)
      ...(data.reviews?.length > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (data.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / data.reviews.length).toFixed(1),
          reviewCount: data.reviews.length,
        }
      }),
      offers: {
        '@type': 'Offer',
        price: data.price || 160,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: 'https://meditt.space/t/2-or-5-day-mindfulness-and-chi-kung-retreat'
      }
    };

    return (
      <>
        {/* Injeção do Schema JSON-LD para SEO de eventos e estrelas no Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* ✅ DADOS INTEGRADOS: Passamos tudo (incluindo reviews) para a UI de cliente de uma vez */}
        <RetiroMindfulHeart sanityData={data} />
      </>
    );
  } catch (error) {
    console.error("Erro crítico no carregamento do retiro:", error);
    // Fallback silencioso para não quebrar a página do utilizador
    return <RetiroMindfulHeart sanityData={null} />;
  }
}