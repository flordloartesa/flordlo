import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from '@/components/MyLink';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoursePreviewUI from "@/components/CoursePreviewUI"; 
import Redirector from "@/components/Redirector"; // ADICIONADO AQUI
import type { Metadata } from "next";

// ✅ 1. PLAYERS ESPECÍFICOS
import MBSRPlayer from "@/components/MBSRPlayer";
import MindfulnessPlayer from "@/components/MindfulnessPlayer";

export const runtime = "nodejs"; 
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

const PLAYER_COMPONENTS: Record<string, any> = {
  "mbsr": MBSRPlayer,
  "introducao-ao-mindfulness-nivel-1": MindfulnessPlayer,
  "introducao-ao-mindfulness-nivel-2": MindfulnessPlayer,
  "introducao-ao-mindfulness-nivel-3": MindfulnessPlayer,
  "3-niveis-introducao-mindfulness": MindfulnessPlayer,
};

// ✅ 2. METADATA PROTEGIDA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { getCourseOffer } = await import("@/app/actions/course");
    const course = await getCourseOffer(slug);
    if (!course) return { title: 'Curso | Meditt' };
    return { title: `${course?.title || 'Curso'} | Meditt` };
  } catch (e) {
    return { title: 'Curso | Meditt' };
  }
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const normalizedSlug = slug?.toLowerCase().trim() || "";

  // ✅ 3. LAZY LOAD DAS AÇÕES
  const { getCourseOffer } = await import("@/app/actions/course");
  const { getUserCourses } = await import("@/app/actions/updateCustomer");

  // 🛡️ 4. VERIFICAÇÃO DE ACESSO INTELIGENTE
  const result = await getUserCourses();
  const purchasedSlugs = result?.success 
    ? result.courses.map((c: any) => c?.slug?.toLowerCase().trim()) 
    : [];

  // Lógica de Identificação de Pacotes
  const slugMasterMindfulness = "3-niveis-introducao-mindfulness";
  const temMaster = purchasedSlugs.includes(slugMasterMindfulness) || purchasedSlugs.some((s: string) => s.includes("completo"));
  const eMindfulness = normalizedSlug.includes("mindfulness");
  const temAcessoDireto = purchasedSlugs.includes(normalizedSlug);

  const temAcesso = temAcessoDireto || (temMaster && eMindfulness);

  // 🚫 5. REDIRECIONAMENTO DE SEGURANÇA (ATUALIZADO AQUI)
  if (!temAcesso) {
    return <Redirector url={`/mindful-store/${slug}?msg=acesso-negado`} />;
  }

  // 🎓 6. CARREGAR DADOS DO CURSO
  let course = await getCourseOffer(slug);
  if (!course) return notFound();

  // 🧠 7. A MAGIA: SOBREPOSIÇÃO TOTAL PARA DONOS DO MASTER
  // Se ele tem o Master, vamos substituir o objeto 'course' pelo Master
  // Isso garante que o Player receba o contexto completo (ID, Título e Tracks)
  if (temMaster && eMindfulness) {
    try {
      const masterCourse = await getCourseOffer(slugMasterMindfulness);
      if (masterCourse) {
        // Substituição total do objeto para enganar o Player
        course = masterCourse;
      }
    } catch (error) {
      console.error("Erro ao injetar curso master:", error);
    }
  }

  // Definimos as faixas baseadas no objeto atual (que agora pode ser o Master)
  const displayTracks = course?.content || course?.sessoes || [];

  // 🔍 8. SELEÇÃO DO PLAYER
  const SpecificPlayer = PLAYER_COMPONENTS[normalizedSlug] || MindfulnessPlayer;

  if (SpecificPlayer) {
    return <SpecificPlayer course={course} allTracks={displayTracks} />;
  }

  // 9. LAYOUT DE MEMBRO PADRÃO (Caso não haja player específico)
  return (
    <main className="min-h-screen bg-[#F8F9FB] font-sans">
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[#3D81F1] font-bold text-xs uppercase tracking-[0.2em] mb-3 block">
              Acesso Membro Meditt
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-[#37374B] tracking-tight">
              {course?.title || "Carregando..."}
            </h1>
            {course?.instructorName && (
              <div className="flex items-center gap-3 mt-6">
                {course?.instructorImage && (
                  <img src={course.instructorImage} alt={course.instructorName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                )}
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Instrutor</span>
                  <span className="text-[#37374B] font-medium">{course.instructorName}</span>
                </div>
              </div>
            )}
          </div>
          <Link href="/area-pessoal" className="text-sm font-bold text-gray-400 hover:text-[#37374B] transition-colors flex items-center gap-2">
            <span>←</span> Voltar à minha área pessoal
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-[#37374B] mb-8">O Teu Programa</h2>
              <CoursePreviewUI 
                tracks={displayTracks} 
                isPreview={false} 
                hasFullAccess={true} 
              />
            </div>
          </div>
          <div className="lg:col-span-1">
             <div className="sticky top-28 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                   {course?.image && <Image src={course.image} alt={course.title} fill className="object-cover" />}
                </div>
                <h3 className="font-bold text-[#37374B] mb-2">Orientações Práticas</h3>
                <p className="text-sm text-gray-500 italic">"A meditação não é uma forma de te livrares dos teus pensamentos, mas sim de deixares de ser controlado por eles."</p>
             </div>
          </div>
        </div>
      </div>
      
    </main>
  );
}