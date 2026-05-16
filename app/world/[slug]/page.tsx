// 👇 ESTAS DUAS LINHAS MATAM A CACHE! O Next.js é obrigado a atualizar a página!
export const dynamic = "force-dynamic";
export const revalidate = 0;

import WorldmediaPlayer from "@/components/WorldmediaPlayer";
import { getLibraryCourseBySlug, client } from "@/app/lib/sanity";
import { notFound } from "next/navigation";
import SidebarCursos from "@/components/SidebarCursos";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Lock } from "lucide-react";

// O teu ficheiro de login
import { authOptions } from "@/app/lib/auth";

export default async function WorldSinglePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const resolvedParams = await params; 
  const slugDoUrl = resolvedParams.slug;

  const course = await getLibraryCourseBySlug(slugDoUrl);

  if (!course) {
    notFound();
  }

  const modules = course.modules || [];
  const standaloneTracks = course.standaloneTracks || []; 
  const defaultGradient = 'linear-gradient(175deg, rgba(0,0,0,0.8) 50%, rgba(105, 97, 116, 1) 80%, rgba(21, 207, 240, 0.7) 100%)';
  const hasContent = modules.length > 0 || standaloneTracks.length > 0;

  // ==============================================================================
  // 🚨 VERIFICAÇÃO DE ACESSO
  // ==============================================================================
 // ==============================================================================
  // 🚨 VERIFICAÇÃO DE ACESSO (100% BLINDADA CONTRA SESSÕES ANTIGAS)
  // ==============================================================================
  const session = await getServerSession(authOptions); 
  const userEmail = session?.user?.email;

  let hasAccess = false;

  if (userEmail) {
    const sanityUser = await client.fetch(`
      *[_type == "user" && email == $email][0]{
        plan,
        isPremium,
        "enrollments": enrollments[]{ "id": course._ref }
      }
    `, { email: userEmail }, { cache: 'no-store' });

    if (sanityUser) {
      // 1. O SANITY É A LEI! Ignoramos a cache velha do teu navegador.
      const sanityPlan = String(sanityUser.plan || "").toUpperCase();
      const sanityIsPremium = sanityUser.isPremium === true;
      const hasManualEnrollment = sanityUser.enrollments?.some((e: any) => e.id === course._id);

      if (sanityPlan === "PREMIUM" || sanityIsPremium || hasManualEnrollment) {
        hasAccess = true;
      }
    } else {
      // 2. Só usamos o que está no navegador se a base de dados falhar
      const sessionPlan = String((session?.user as any)?.plan || "").toUpperCase();
      const sessionIsPremium = (session?.user as any)?.isPremium === true;
      const purchasedSlugs = (session?.user as any)?.purchasedCourses || [];

      if (sessionPlan === "PREMIUM" || sessionIsPremium || purchasedSlugs.includes(course.slug)) {
        hasAccess = true;
      }
    }

    console.log("🔍 TESTE DE ACESSO DEFINITIVO:", {
      email: userEmail,
      temAcessoFinal: hasAccess
    });
  }

  // ==============================================================================
  // 🔴 ACESSO NEGADO (DESIGN DA IMAGEM 2 - Modal em Vidro com botão branco)
  // ==============================================================================
  if (!hasAccess) {
    return (
      <main 
        className="min-h-[100dvh] flex flex-col font-sans text-white items-center justify-center px-4 relative"
        style={{ background: course.customGradient || defaultGradient }}
      >
        <SidebarCursos customGradient={course.customGradient} />
        
        <div className="bg-[#1A1A1A]/70 backdrop-blur-xl p-8 sm:p-12 rounded-3xl max-w-md w-full border border-white/10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
          
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 bg-transparent">
            <Lock size={26} className="text-white" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-2xl sm:text-[28px] font-bold text-white mb-4 tracking-tight">Acesso Exclusivo Premium</h2>
          
          <p className="text-white/70 mb-8 text-[15px] leading-relaxed">
            As palestras e cursos do <strong className="text-white">World</strong> são de acesso restrito e estão disponíveis apenas para subscritores do plano <br className="hidden sm:block"/><strong className="text-white">Membro Ilimitado.</strong>
          </p>
          
          <Link 
            href="/mindful-store"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors w-full text-[15px]"
          >
            Fazer Upgrade para Ilimitado
          </Link>
          
        </div>
      </main>
    );
  }

  // ==============================================================================
  // ✅ ACESSO PERMITIDO
  // ==============================================================================
  return (
    <main 
      className="min-h-[100dvh] flex flex-col font-sans text-white pb-32 relative"
      style={{ background: course.customGradient || defaultGradient }}
    >
      <SidebarCursos customGradient={course.customGradient} />

      {hasContent ? (
        <WorldmediaPlayer 
          courseModules={modules} 
          standaloneTracks={standaloneTracks} 
          courseId={course._id}               
          customGradient={course.customGradient} 
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-white/50 py-20 relative z-10">
          Ainda não existem faixas disponíveis neste tema.
        </div>
      )}
    </main>
  );
}