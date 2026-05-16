// app/cursos/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next"; // É mais seguro usar "next-auth/next" no App Router
import { authOptions } from "@/app/lib/auth";
import { client } from "@/app/sanity/client"; // Corrigido para o caminho correto do teu projeto
import UniversalPlayer from "@/components/UniversalPlayer"; 
import { getCourseOffer } from "@/app/actions/course";
import type { Metadata } from "next"; 

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseOffer(slug);
  const siteUrl = `https://meditt.space/cursos/${slug}`;

  if (!course) return { title: 'Curso Não Encontrado - Meditt' };

  const title = course.seoTitle || course.title || 'Curso Meditt';
  const description = course.seoDescription || course.subtitle || course.description || 'Aprende e desenvolve a tua prática na Meditt.';
  const shareImage = course.coverImageUrl || course.coverImage?.asset?.url || course.heroImageUrl || 'https://meditt.space/default-og.jpg';

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

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalizedSlug = slug?.toLowerCase().trim() || "";

  // ==============================================================================
  // 🔥 FETCH ROBUSTO (Garante a extração correta das Imagens Hero e Fundos)
  // ==============================================================================
  let course = await client.fetch(`*[_type in ["course", "product", "physicalProduct", "giftCard", "cartao-oferta", "retreat"] && slug.current == $slug][0]{
    ...,
    "heroImageUrl": coalesce(heroImageUrl, heroImage.asset->url),
    "backgroundImageUrl": coalesce(backgroundImageUrl, playerBackgroundImage.asset->url),
    "nivel1": courseContent.nivel1[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
    "nivel2": courseContent.nivel2[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
    "nivel3": courseContent.nivel3[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
    "modules": modules[]{ title, "content": content[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) } }
  }`, { slug: normalizedSlug });

  if (!course) return notFound();

  // ==============================================================================
  // 🚨 VERIFICAÇÃO BLINDADA COM O SANITY (O Cérebro Central)
  // ==============================================================================
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  let isPremium = false;
  let purchasedSlugs: string[] = [];
  let isCourseExpired = false;

  if (userEmail) {
    const sanityUser = await client.fetch(`
      *[_type == "user" && email == $email][0]{
        plan, planStatus, isPremium,
        "enrollments": enrollments[]{
          "id": course._ref,
          "slug": course->slug.current,
          expiresAt
        }
      }
    `, { email: userEmail }, { cache: 'no-store' });

    if (sanityUser) {
      const pStr = String(sanityUser.plan || "FREE").toUpperCase();
      const pStatusStr = String(sanityUser.planStatus || "inactive").toLowerCase();
      const isTrialing = pStatusStr.includes("trial");
      
      if ((pStr === "PREMIUM" || sanityUser.isPremium) && !isTrialing) {
        isPremium = true;
      }

      if (sanityUser.enrollments) {
        const validEnrollments = sanityUser.enrollments.filter((e: any) => {
          if (!e.slug) return false;
          if (e.expiresAt && new Date(e.expiresAt).getTime() < new Date().getTime()) {
             if (e.slug === normalizedSlug || e.id === course._id) {
                isCourseExpired = true;
             }
             return false;
          }
          return true;
        });
        purchasedSlugs = validEnrollments.map((e: any) => e.slug.toLowerCase().trim());
      }
    } else {
      isPremium = (session?.user as any)?.isPremium === true || (session?.user as any)?.plan === "PREMIUM";
      purchasedSlugs = ((session?.user as any)?.purchasedCourses || []).map((s: string) => s.toLowerCase().trim());
    }
  }

  // ==============================================================================
  // LÓGICA DE NÍVEIS
  // ==============================================================================
  const slugMaster = "3-niveis-introducao-mindfulness";
  const slugN1 = "introducao-mindfulness-nivel-1"; 
  const slugN2 = "introducao-mindfulness-nivel-2"; 
  const slugN3 = "introducao-mindfulness-nivel-3"; 

  const hasMaster = purchasedSlugs.includes(slugMaster) || purchasedSlugs.some((s: string) => s.includes("completo"));
  const hasN1 = purchasedSlugs.includes(slugN1);
  const hasN2 = purchasedSlugs.includes(slugN2);
  const hasN3 = purchasedSlugs.includes(slugN3);

  const isMindfulnessCourse = normalizedSlug.includes("introducao-ao-mindfulness") || normalizedSlug.includes("introducao-mindfulness");

  let canEnter = isPremium || purchasedSlugs.includes(normalizedSlug) || hasMaster;

  if (isMindfulnessCourse && (hasN1 || hasN2 || hasN3 || hasMaster)) {
    canEnter = true;
  }

  if (isCourseExpired && !isPremium) {
     canEnter = false;
  }

  if (!canEnter) {
    redirect(`/mindful-store/${slug}`);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.seoTitle || course.title,
    description: course.seoDescription || course.subtitle || course.description,
    provider: {
      '@type': 'Organization',
      name: 'Meditt',
      sameAs: 'https://meditt.space'
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: course.seoCourseMode || 'Online',
      courseWorkload: course.seoCourseDuration || 'P12M' 
    }
  };

  // ==============================================================================
  // 🔥 MAGIA DOS CADEADOS CORRIGIDA! (Agora não destrói a imagem hero!)
  // ==============================================================================
  if (isMindfulnessCourse) {
    // Se estivermos no Master, usamos o curso atual. Senão, vamos buscar as faixas do Master.
    const masterData = (normalizedSlug === slugMaster) 
      ? JSON.parse(JSON.stringify(course)) 
      : await client.fetch(`*[_type in ["course", "product"] && slug.current == $slugMaster][0]{
          "nivel1": courseContent.nivel1[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          "nivel2": courseContent.nivel2[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          "nivel3": courseContent.nivel3[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
          courseContent {
            nivel1[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
            nivel2[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
            nivel3[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) }
          }
        }`, { slugMaster });
    
    if (masterData) {
      const userHasFullAccess = isPremium || hasMaster;

      const lock = (tracks: any[], storeSlug: string) => {
        if (!tracks || !Array.isArray(tracks)) return [];
        return tracks.map((track: any) => ({
          ...track,
          audioUrl: null,
          cloudflareAudioUrl: null, 
          audioFile: null,
          isLocked: true, 
          storeLink: `/mindful-store/${storeSlug}`
        }));
      };

      // 🔴 IMPORTANTE: Estamos a substituir APENAS as listas de faixas!
      // A imagem Hero, o fundo, as cores e o Título do curso mantêm-se intactos!
      course.nivel1 = userHasFullAccess || hasN1 ? masterData.nivel1 : lock(masterData.nivel1, slugN1);
      course.nivel2 = userHasFullAccess || hasN2 ? masterData.nivel2 : lock(masterData.nivel2, slugN2);
      course.nivel3 = userHasFullAccess || hasN3 ? masterData.nivel3 : lock(masterData.nivel3, slugN3);

      if (!course.courseContent) course.courseContent = {};
      if (masterData.courseContent) {
        course.courseContent.nivel1 = userHasFullAccess || hasN1 ? masterData.courseContent.nivel1 : lock(masterData.courseContent.nivel1, slugN1);
        course.courseContent.nivel2 = userHasFullAccess || hasN2 ? masterData.courseContent.nivel2 : lock(masterData.courseContent.nivel2, slugN2);
        course.courseContent.nivel3 = userHasFullAccess || hasN3 ? masterData.courseContent.nivel3 : lock(masterData.courseContent.nivel3, slugN3);
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UniversalPlayer course={course} />
    </>
  );
}