// ✅ 1. CONFIGURAÇÕES DE RUNTIME E CACHE
export const runtime = 'nodejs'; 
// Mudamos para force-dynamic com revalidate para proteger contra Edge requests excessivos
export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { client } from "@/app/lib/sanity"; 
import React, { cache } from 'react';
import RetiroMindfulnessYoga from "./RetreatClientUI";

// Imagem padrão caso o link do Sanity esteja quebrado ou vazio
const FALLBACK_IMAGE = "https://64.media.tumblr.com/12d2a1fb27beb5bcc4d8c93d834ee9d9/04801380bf115da1-40/s1280x1920/b956b0f0a664d7ebb4b25992f055099b9537e846.jpg";

// ✅ 2. BUSCA DE DADOS (GROQ OTIMIZADO COM CACHE DE 60 SEGUNDOS)
const getRetreatData = cache(async () => {
  return await client.fetch(
    `*[_type == "retreat" && slug.current == "mindfulness-yoga"][0] {
      ...,
      _id,
      title,
      seoTitle,          
      seoDescription,    
      imageUrl,          
      heroSpotsText,
      heroSeeAlsoText,
      heroSeeAlsoLink,
      heroDate,      // Novo campo visual
      heroLocation,  // Novo campo visual
      seoStartDate,  // Para o Google (formato YYYY-MM-DD)
      seoEndDate,    // Para o Google (formato YYYY-MM-DD)
      price,
      
      // 👇 MAPEAMENTO EXPLÍCITO DAS REVIEWS (Evita fetchs desnecessários no cliente)
      "reviews": *[_type == "review" && retreat._ref == ^._id && approved == true] | order(_createdAt desc) {
        _id,
        "name": coalesce(name, userName, "Anónimo"),
        "comment": comment, 
        "rating": rating    
      },
      
      // Fallback para imagem caso use asset no Sanity
      "image": image.asset->url
    }`,
    {}, 
    // ✅ PROTEÇÃO: Revalidação em vez de no-store para poupar Edge Requests
    { next: { revalidate: 60 } } 
  );
});

// ✅ 3. METADATA DINÂMICO (Proteção para Redes Sociais e WhatsApp)
export async function generateMetadata() {
  const data = await getRetreatData();
  const siteUrl = 'https://meditt.space/t/mindfulness-yoga';

  if (!data) return { title: 'Retiro Não Encontrado - Meditt' };

  const title = data.seoTitle || data.title || 'Retiro de Mindfulness e Yoga | Meditt';
  const description = data.seoDescription || 'Fim de semana para relaxar e rejuvenescer o seu corpo, mente e espírito com Mindfulness e Yoga.';
  
  // ✅ PROTEÇÃO: Se a imagem estiver quebrada ou vazia, usa o Fallback
  const shareImage = data.imageUrl || data.image || FALLBACK_IMAGE;

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

    // Verificação de segurança para ambiente de produção
    if (!data && process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
       return <RetiroMindfulnessYoga sanityData={{}} />;
    }

    if (!data) {
       console.warn("Aviso: Retiro 'mindfulness-yoga' não encontrado no Sanity.");
       return notFound();
    }

    // ✅ 4. DADOS ESTRUTURADOS (JSON-LD) PARA SEO (Estrelas, Datas e Local no Google)
    // Garantimos que não enviamos valores nulos que quebrem o validador do Google
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: data.seoTitle || data.title || 'Retiro de Mindfulness e Yoga',
      image: data.imageUrl || data.image || FALLBACK_IMAGE,
      description: data.seoDescription || 'Retiro de imersão total.',
      url: 'https://meditt.space/t/mindfulness-yoga',
      
      // Datas formatadas diretamente do Sanity (Proteção contra links/datas vazias)
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
      // ✅ SINCRO DE REVIEWS: Se houver reviews, o Google mostra as estrelas nos resultados
      ...(data.reviews?.length > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (data.reviews.reduce((acc: number, rev: any) => acc + (rev.rating || 5), 0) / data.reviews.length).toFixed(1),
          reviewCount: data.reviews.length,
        }
      }),
      offers: {
        '@type': 'Offer',
        price: data.price || 80, 
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: 'https://meditt.space/t/mindfulness-yoga'
      }
    };

    return (
      <>
        {/* Injeção invisível do Schema para os motores de busca */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* ✅ DADOS INTEGRADOS: Passamos tudo para o Cliente (Evita 2º Fetch no Client Side) */}
        <RetiroMindfulnessYoga sanityData={data} />
      </>
    );
    
  } catch (error) {
    console.error("Erro crítico ao carregar dados do retiro:", error);
    // Em caso de erro catastrófico, renderiza a UI vazia em vez de crashar a Vercel
    return <RetiroMindfulnessYoga sanityData={{}} />;
  }
}