// app/praticas/[slug]/page.tsx

import { client } from '@/app/sanity/client';
import PraticasPlayer from './PraticasPlayer';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Query para buscar os dados da Prática e Publicidade
  const query = `{
    "practice": *[_type == "practice" && slug.current == $slug][0]{
      ..., 
      "coverImage": coverImage.asset->url,
      fullscreenExternalImage, 
      layoutTemplate,
      category,
      isLocked,
      useDripContent, 
      sidebarCourses,
      
      "instructor": instructor->name,
      "instructorImage": coalesce(
        instructor->image.asset->url, 
        instructor->imageUrl, 
        instructor->externalImageUrl
      ),
      
      "finalAudioUrl": coalesce(
        externalAudioUrl,                
        internalAudioFile.asset->url,   
        meditationRef->cloudflareAudioUrl, 
        meditationRef->audioFile.asset->url 
      ),

      "relatedPractices": relatedPractices[]->{
        title,
        "slug": slug.current,
        "coverImage": coverImage.asset->url,
        fullscreenExternalImage, 
        badgeText,
        category,
        duration
      },

      variations[]{
        "instructorName": instructor->name,
        "instructorImage": coalesce(
          instructor->image.asset->url, 
          instructor->imageUrl, 
          instructor->externalImageUrl
        ),
        durationLabel,
        "audioUrl": coalesce(
          externalAudioUrl, 
          meditationRef->cloudflareAudioUrl, 
          meditationRef->audioFile.asset->url, 
          audioFile.asset->url
        )
      }
    },
    
    "globalPromos": *[_type == "sidebarPromo"][0].events[showPromo == true]{
      tag,
      description,
      "imageUrl": coalesce(image.asset->url, externalImageUrl, "https://via.placeholder.com/150"),
      link
    }
  }`;

  const data = await client.fetch(query, { slug }, { cache: 'no-store' });

  if (!data.practice) {
    notFound();
  }




// =======================================================================
  // 🔐 LÓGICA DE DASHBOARD: GOTEJAMENTO E STATUS DE ACESSO
  // =======================================================================
  
  // ⚙️ CONTROLO DE TESTES (À prova do tempo)
  // Muda este número para testar diferentes dias. 
  // 0 = Começou hoje. 3 = Começou há 3 dias. 8 = Trial já expirou.
  const DIAS_DE_TRIAL = 0; 
  
  // O sistema calcula automaticamente a data de início com base no dia de hoje
  const dataDinamica = new Date();
  dataDinamica.setDate(dataDinamica.getDate() - DIAS_DE_TRIAL);

  // mockUser: Simula os dados do utilizador logado
  const mockUser = {
    subscriptionStatus: 'trialing', // 'active', 'trialing', ou 'none'
    enrollmentDate: dataDinamica.toISOString() // <-- Agora é sempre dinâmico!
  };

  const lessons = data.practice.relatedPractices || [];
  const today = new Date();
  const enrollmentDate = new Date(mockUser.enrollmentDate);

  // Diferença de dias (Dia 1 = 0, Dia 2 = 1, etc.)
  const daysSinceStart = Math.floor((today.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
  const isPranayama = slug === 'pranayama-breathwork-12-semanas';

  const processedLessons = lessons.map((lesson: any, index: number) => {
    let status = "locked_premium"; // Por defeito, assume-se bloqueado para segurança

    // 🟢 1. REGRAS PARA UTILIZADOR PAGANTE (ACTIVE)
    if (mockUser.subscriptionStatus === 'active') {
      // No pagante, todas as práticas aparecem, mas respeitam o gotejamento de 1 por dia
      if (index <= daysSinceStart) {
        status = "available";
      } else {
        status = "locked_drip"; // "Disponível amanhã / em X dias"
      }
    } 

    // 🟡 2. REGRAS PARA UTILIZADOR EM TRIAL (7 DIAS)
    else if (mockUser.subscriptionStatus === 'trialing') {
      if (isPranayama && index >= 7) {
        // No Pranayama Trial, as semanas 2 a 12 ficam com cadeado Premium
        status = "locked_premium";
      } else if (index <= daysSinceStart && index < 7) {
        // Liberta 1 por dia até ao limite de 7 dias
        status = "available";
      } else {
        // Ainda não chegou o dia desta aula no trial
        status = "locked_drip";
      }
    }

    return { 
      ...lesson, 
      accessStatus: status, 
      releaseDay: index + 1 // Útil para mostrar "Dia 3" na UI
    };
  });

  // Criamos o objeto da prática com as lições processadas para a Dashboard
  const practiceWithDashboardLogic = {
    ...data.practice,
    relatedPractices: processedLessons,
    userSubscription: mockUser.subscriptionStatus // Passamos o status para o Player mostrar o aviso
  };
  // =======================================================================

 return (
   <main className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 overflow-x-hidden">
      {/* Aviso de Trial (Opcional: podes colocar dentro do PraticasPlayer também) */}
  
      <PraticasPlayer 
        practice={practiceWithDashboardLogic} 
        globalPromos={data.globalPromos || []} 
      />
    </main>
  );
 }