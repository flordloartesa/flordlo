"use client";

import { useState, useRef, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { CustomImage } from "@/components/CustomImage"; 
import Link from '@/components/MyLink';
import { client } from "@/app/sanity/client";

import ReviewSlideshow from "@/components/ReviewSlideshow";
import { useCart } from "@/app/context/CartContext"; 
import { getUserCourses } from "@/app/actions/updateCustomer";
import { addTrialToUser } from "@/app/actions/addTrial"; 
import { getSession, useSession } from "next-auth/react"; 

import { 
  ChevronDown, BookOpen, Play, Pause, Check, ShieldCheck, 
  Star, Globe, X, ArrowRight, Clock, Users, BadgeCheck, 
  MonitorPlay, CalendarCheck, Headset, Award, Lock 
} from "lucide-react";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

// --- DADOS DA TABELA DE BENEFÍCIOS (Trazidos do teu design) ---
const membershipFeatures = [
  { name: "Cursos avulso", sub: "Acesso imediato durante 12 meses", cursoAvulso: true, premium: true },
  { name: "Acesso a TODOS os Cursos", sub: "Desbloqueado após os 7 dias", cursoAvulso: false, premium: true },
  { name: "Práticas de Mindfulness", sub: "Centenas de práticas avulsas", cursoAvulso: false, premium: true },
  { name: "Meditações Guiadas", sub: "Iniciante/Avançado, Ansiedade, Stress", cursoAvulso: false, premium: true },
  { name: "Novos conteúdos", sub: "Atualizações constantes", cursoAvulso: false, premium: true },
  { name: "Exercícios Respiratórios", cursoAvulso: false, premium: true },
  { name: "Dormir Melhor (Sleep)", cursoAvulso: false, premium: true },
];

// --- COMPONENTE DE LINHA ÚNICA DE ÁUDIO ---
const TrackRow = ({ track }: { track: any }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`flex items-center justify-between p-2.5 px-4 rounded-xl transition-all ${track.isFree ? 'bg-white border-[1px] border-blue-50 shadow-sm' : 'bg-slate-50/50'}`}>
      <div className="flex items-center gap-3 flex-1 truncate">
        <div onClick={track.isFree ? togglePlay : undefined} className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${track.isFree ? 'bg-[#EBF3FF] text-[#3D81F1] hover:bg-[#3D81F1] hover:text-white' : 'bg-slate-100 text-slate-300'}`}>
          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} className={track.isFree ? "ml-0.5 fill-current" : "ml-0.5"} />}
        </div>
        <div className="flex items-center gap-2 truncate">
          <h4 className={`text-[14px] font-medium leading-[1.6] truncate ${track.isFree ? 'text-slate-700' : 'text-slate-400'}`}>{track.title}</h4>
          <span className="text-[11px] text-slate-400 font-medium shrink-0">{track.duration || "15:00"}</span>
        </div>
      </div>
      {track.isFree && (
        <div className="flex items-center shrink-0">
          <audio ref={audioRef} src={track.audioUrl} onEnded={() => setIsPlaying(false)} preload="none" />
          <span className="text-[9px] font-black text-white bg-[#3D81F1] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">Grátis</span>
        </div>
      )}
    </div>
  );
};

export default function CourseSalesPage({ params }: { params: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlreadyOwnedModal, setShowAlreadyOwnedModal] = useState(false);
  
  // 🟢 NOVO STATE: Modal de Expiração com o teu design
  const [showExpiredModal, setShowExpiredModal] = useState(false); 
  
  const [activeTab, setActiveTab] = useState<'pessoal' | 'equipas'>('pessoal');
  const [currentUrl, setCurrentUrl] = useState("");
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [userPurchasedSlugs, setUserPurchasedSlugs] = useState<string[]>([]);
  const [hasOwnership, setHasOwnership] = useState(false);
  
  const [isTrialCourse, setIsTrialCourse] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [courseSlug, setCourseSlug] = useState<string>("");
  
  const router = useRouter();
  const cartContext = useCart() as any; 
  const instructorSectionRef = useRef<HTMLDivElement>(null);
  
  const { update: updateSession } = useSession();

  const scrollToInstructor = () => {
    instructorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasFetched.current) return;
    
    hasFetched.current = true;

    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== "");
    const breadcrumb = pathSegments.slice(-2).join(' / ');
    setCurrentUrl(breadcrumb);

    async function loadData() {
      try {
        const resolvedParams = await params;
        const normalizedSlug = resolvedParams.slug?.toLowerCase().trim();
        
        setCourseSlug(normalizedSlug);
        setIsTrialCourse(normalizedSlug === '7-dias-trial');

        if (updateSession) {
          await updateSession();
        }

        const session = await getSession() as any;
        setUserSession(session); 

        const userCoursesResult = await getUserCourses();
        const purchased = userCoursesResult?.success 
          ? userCoursesResult.courses.map((c: any) => c?.slug?.toLowerCase().trim()) 
          : [];
        setUserPurchasedSlugs(purchased);

       const result = await client.fetch(`{
          "course": *[_type in ["course", "product", "physicalProduct", "giftCard", "cartao-oferta", "retreat"] && slug.current == $slug][0]{
            ...,
            "heroColor": heroColor,
            "customGradient": customGradient,
            "priceNote": priceNote,
            "sizes": sizes,
            "variations": variations,
            "variants": variants,
          "image": coalesce(coverImageUrl, coverImage.asset->url, image.asset->url, imageUrl, image, ""),
            "descriptionImage": coalesce(descriptionImage.asset->url, descriptionImageUrl, ""),
            
            "instructors": instructors[]->{
               "name": coalesce(name, ""),
               "photo": coalesce(image.asset->url, photo.asset->url, imageUrl, ""),
               "shortBio": coalesce(shortBio, ""),
               "detailedBio": coalesce(pt::text(bio), bio, detailedBio, "")
            },
            "instructorName": coalesce(instructorName, author->name, "Equipa Meditt"),
            "instructorPhoto": coalesce(instructorPhoto.asset->url, author->image.asset->url, author->imageUrl),
            "instructorDetailedBio": coalesce(instructorDetailedBio, author->bio),
            "instructorShortBio": coalesce(instructorShortBio, author->shortBio),
            "totalInstructors": coalesce(totalInstructors, 1),
            
            "nivel1": courseContent.nivel1[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
            "nivel2": courseContent.nivel2[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
            "nivel3": courseContent.nivel3[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) },
            "modules": modules[]{ title, "content": content[]->{ ..., "audioUrl": coalesce(cloudflareAudioUrl, audioFile.asset->url) } },
            "ratings": *[_type == "review" && references(^._id) && approved == true].rating,
            "language": coalesce(language, "Português"),
            "lastUpdate": _updatedAt,
            "manualStudentOffset": coalesce(manualStudentOffset, 0)
          }
        }`, { slug: normalizedSlug });

        if (!result?.course) {
          notFound();
          return;
        }

        // =========================================================================
        // 🚨 NOVA LÓGICA BLINDADA DE ACESSO & EXPIRAÇÃO (CORRIGIDA) 🚨
        // Vamos buscar as matrículas diretamente ao Sanity para termos a certeza absoluta da data!
        // =========================================================================
// =========================================================================
        // 🚨 NOVA LÓGICA DE ACESSO: 100% BLINDADA (IGNORA COOKIES POR COMPLETO)
        // =========================================================================
        let isCourseExpiredTime = false;
        let isRealTimePremium = false;
        let hasCourseInSanity = false;

        if (session?.user?.email) {
            // Vamos buscar os dados FRESCOS e obrigamos o site a não usar cache!
            const sanityUser = await client.fetch(`*[_type == "user" && email == $email][0]{
               enrollments,
               createdAt,
               isPremium,
               plan,
               planStatus
            }`, { email: session.user.email }, { cache: 'no-store' }); // <-- IMPEDE O CACHE

            // 1. Verifica se é PREMIUM real no Sanity neste exato segundo
            const livePlan = String(sanityUser?.plan || "").toUpperCase();
            const livePlanStatus = String(sanityUser?.planStatus || "").toLowerCase();
            
            if ((livePlan === "PREMIUM" || sanityUser?.isPremium) && livePlanStatus === "active") {
                isRealTimePremium = true;
            }

            // 2. Verifica se ele tem a Matrícula Avulsa no Sanity
            const myEnrollment = sanityUser?.enrollments?.find((e: any) => e.course?._ref === result.course._id);

            if (myEnrollment) {
                hasCourseInSanity = true;
                if (myEnrollment.expiresAt && new Date() > new Date(myEnrollment.expiresAt)) {
                    isCourseExpiredTime = true;
                }
            } 
        }

        const isRetreat = result.course._type === 'retreat';
        const isPhysicalProduct = result.course._type === 'physicalProduct';
        
        // 🔴 AQUI ESTÁ A CORREÇÃO: Cortámos o 'purchased' (o cookie velho) completamente! 
        // Ele agora SÓ olha para a base de dados real!
        const isPremiumDigital = isRealTimePremium && !isRetreat && !isPhysicalProduct;
        const isOwnedIndividually = hasCourseInSanity; 

        if (!isCourseExpiredTime && (isPremiumDigital || isOwnedIndividually)) {
           // ✅ ACESSO VÁLIDO E CONFIRMADO PELO SANITY
           setHasOwnership(true);
           if (!isRetreat && !isPhysicalProduct) {
             setShowAlreadyOwnedModal(true);
           }
        } else {
           // ❌ ACESSO INVÁLIDO OU REVOGADO PELO WEBHOOK (Corta na hora!)
           setHasOwnership(false);
           setShowAlreadyOwnedModal(false);
           
           if (isOwnedIndividually && isCourseExpiredTime) {
               setShowExpiredModal(true);
           }
        }

        setData(result);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (!loading && data?.course && userSession) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('activate') === 'true') {
        window.history.replaceState({}, '', window.location.pathname);
        handleAddToCart();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, userSession]);

  if (loading) return <div className="min-h-screen bg-white" />;
  const { course } = data; 

  const reviewCount = course.ratings?.length || 0;
  const averageRating = reviewCount > 0 ? (course.ratings.reduce((a: any, b: any) => a + b, 0) / reviewCount) : 5.0;

  let totalSessions = (course.nivel1?.length || 0) + (course.nivel2?.length || 0) + (course.nivel3?.length || 0);
  if (course.modules && course.modules.length > 0) {
    totalSessions += course.modules.reduce((sum: number, mod: any) => sum + (mod.content?.length || 0), 0);
  }

  const accordionData: any[] = [
    { d: course.nivel1, l: "Nível 1", t: "Fundamentos" }, 
    { d: course.nivel2, l: "Nível 2", t: "Práticas Intermédias" }, 
    { d: course.nivel3, l: "Nível 3", t: "Consolidação" }
  ];
  if (course.modules && course.modules.length > 0) {
    course.modules.forEach((mod: any, index: number) => {
      accordionData.push({ d: mod.content, l: `Semana ${index + 1}`, t: mod.title });
    });
  }

  const productPrice = course.price || course.sizes?.[0]?.price || course.variations?.[0]?.price || course.variants?.[0]?.price || 0;
  const productDiscountPrice = course.discountPrice || course.sizes?.[0]?.discountPrice || course.variations?.[0]?.discountPrice || course.variants?.[0]?.discountPrice || null;
  const finalPrice = productDiscountPrice || productPrice;

  const handleAddToCart = async () => {
    if (hasOwnership) {
      if (course._type !== 'retreat') router.push(`/cursos/${courseSlug}`);
      return;
    }

    if (isTrialCourse) {
      if (!userSession) {
        const redirectPath = encodeURIComponent(`${window.location.pathname}?activate=true`);
        router.push(`/login?callbackUrl=${redirectPath}`);
        return;
      } else {
        await addTrialToUser(course._id, userSession.user.email);
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (updateSession) await updateSession();
        router.push('/area-pessoal');
        return;
      }
    }

    if (cartContext) {
      const item = {
        _id: course._id,        
        title: course.title,    
        price: Number(finalPrice), 
        imageUrl: course.image, 
        slug: courseSlug,      
        quantity: 1
      };
      if (cartContext.addItem) {
        cartContext.addItem(item);
      } else {
        cartContext.addToCart(item);
      }
      if (cartContext.setIsOpen) {
        cartContext.setIsOpen(true);
      } else if (cartContext.openCart) {
        cartContext.openCart();
      } else {
        cartContext.toggleCart?.();
      }
    }
  };

  const getYouTubeId = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length >= 11) ? match[2] : '';
  };

  const videoIdFinal = getYouTubeId(course?.youtubeUrl);

  const headerInstructorName = course.instructors && course.instructors.length > 0
    ? course.instructors.map((i: any) => i.name).join(" | ")
    : course.instructorName || "Equipa Meditt";

  const headerInstructorPhoto = course.instructors && course.instructors.length > 0 && course.instructors[0].photo
    ? course.instructors[0].photo
    : course.instructorPhoto;

  // 🟢 TABELA DE BENEFÍCIOS PARA A MODAL DE EXPIRAÇÃO (IGUAL AO TEU DESIGN)
  const renderFeaturesTable = () => (
    <div className="flex flex-col w-full px-2 sm:px-6">
      <h2 className="text-[20px] sm:text-[24px] font-bold text-[#141313] text-center mb-2 leading-snug">
        O que está incluído no seu<br/>Acesso Premium
      </h2>

      <p className="text-[12px] font-normal text-[#141313] text-center mb-8 leading-snug">
        O seu período experimental terminou. Desbloqueie agora a biblioteca completa e aceda a centenas de práticas para a sua evolução pessoal.
      </p>

      <div className="flex justify-end mb-4 px-2">
        <div className="w-16 sm:w-20 text-center text-[12px] sm:text-[14px] font-bold text-[#37374B] leading-tight">Cursos<br/>Individuais</div>
        <div className="w-16 sm:w-20 text-center text-[12px] sm:text-[14px] font-bold text-[#CBA573] ml-4 sm:ml-6 leading-tight">Membro<br/>Premium</div>
      </div>

      {membershipFeatures.map((f, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div className="flex-1 pr-4">
            <div className="font-bold text-[#141313] text-[13px] sm:text-[15px] leading-tight">{f.name}</div>
            {f.sub && <div className="text-[11px] sm:text-[12px] text-gray-500 font-medium mt-1">{f.sub}</div>}
          </div>
          <div className="flex items-center">
            <div className="w-16 sm:w-20 flex justify-center">
              {f.cursoAvulso === true ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
              ) : f.cursoAvulso === "Limitado" ? (
                <span className="text-[11px] sm:text-[13px] text-gray-400 font-medium">Limitado</span>
              ) : (
                <span className="text-gray-300 font-bold">-</span>
              )}
            </div>

            <div className="w-16 sm:w-20 flex justify-center ml-4 sm:ml-6">
              {f.premium && (
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 pb-24 relative">
      
      {/* MODAL VÍDEO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => setIsModalOpen(false)}>
          <button className="absolute top-6 right-6 text-white hover:text-[#3D81F1]"><X size={40} /></button>
          <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {videoIdFinal ? (
              <iframe 
                className="w-full h-full" 
                src={`https://www.youtube.com/embed/${videoIdFinal}?autoplay=1`} 
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                Vídeo não disponível.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚨 NOVA MODAL DE EXPIRAÇÃO COM DESIGN PERSONALIZADO 🚨 */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center  pt-80 md:pt-40 bg-gradient-to-br from-[#74A3F2] via-[#A89FE0] to-[#E3A8D2] backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[24px] lg:rounded-[40px] pt-10 pb-8 px-4 sm:px-6 max-w-[550px] w-full relative shadow-2xl animate-in zoom-in duration-300 my-8">
            <button 
              onClick={() => setShowExpiredModal(false)}
              className="absolute top-5 right-5 w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X size={16} strokeWidth={3} />
            </button>

            <div className="w-16 h-16 bg-blue-50 text-[#3D81F1] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
               <Lock size={30} />
            </div>

            <div className="border-t border-gray-100 pt-6 mb-8 mt-2">
               {renderFeaturesTable()}
            </div>

            <div className="px-4 md:px-8 flex flex-col gap-3">
              <Link 
                href="/mindful-store" 
                className="w-full py-4 bg-[#3D81F1] text-white rounded-full font-bold text-[16px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-[0_10px_20px_rgba(61,129,241,0.2)] active:scale-[0.98]"
              >
                Ver Cursos <ArrowRight size={18} />
              </Link>
              <button 
                onClick={() => setShowExpiredModal(false)} 
                className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-all text-sm"
              >
                Agora não, fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JÁ COMPRADO (Acesso Válido) */}
      {showAlreadyOwnedModal && !showExpiredModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheck size={40} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">Já tens acesso!</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Verificámos que tens acesso ao <span className="font-bold text-slate-900">{course?.title}</span>. Podes aceder a todos os teus conteúdos na tua área pessoal.
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Link href="/area-pessoal" className="w-full bg-[#3D81F1] text-white py-4 rounded-xl font-bold shadow-md hover:bg-blue-600 transition-all text-center">
                Ir para a Área Pessoal
              </Link>
              <button 
                onClick={() => setShowAlreadyOwnedModal(false)} 
                className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-all"
              >
                Fechar e continuar a ver a página
              </button>
            </div>
          </div>
        </div>
      )}

      {/*ASIDE  MOBILE: IMAGEM NO TOPO */}
      <div className={` mt-13 lg:hidden w-full relative aspect-[16/9] ${course._type !== 'retreat' ? 'cursor-pointer' : ''}`} onClick={() => course._type !== 'retreat' && setIsModalOpen(true)}>
        <CustomImage 
          src={course.image || "/placeholder.jpg"} 
          alt={course.title} 
          fill 
          unoptimized 
          className="object-cover" 
          hasBlueGradient 
        />
        {course._type !== 'retreat' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <div className="bg-white/90 p-4 rounded-full shadow-lg">
              <Play size={28} fill="#3D81F1" className="text-[#3D81F1] ml-1" />
            </div>
          </div>
        )}
      </div>

 {/* HERO SECTION */}
      <section className="text-white md:mt-12 pt-11 lg:pt-16 pb-6 lg:pb-24 px-4 md:px-6" style={{ background: 'linear-gradient(45deg, #525EE3 35%, #3AB8EA 100%)' }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12 relative">
          <div className="lg:col-span-2 space-y-6">
            <div className="hidden md:flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-white/80">
              <span className="normal-case">{currentUrl}</span>
              <ArrowRight size={10} className="text-white" />
              <span>{course._type === 'retreat' ? 'Retiros Presenciais' : (course._type === 'physicalProduct' ? 'Equipamento' : 'Cursos Online')}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-medium leading-tight">{course.title}</h1>
            <p className="text-sm md:text-lg text-white/90">
              {course.subtitle} {totalSessions > 0 && <> em <span className="text-yellow-400 font-bold">{totalSessions} áudios</span>.</>}
            </p>
            <div className="flex flex-col gap-y-3 pt-4 lg:border-t lg:border-white/20 -mt-8 md:mt-0">
              <div className="text-[11px] md:text-[14px]">
                <div className="flex items-center gap-3">
  <span>Com</span>
  <span onClick={scrollToInstructor} className="underline font-bold cursor-pointer transition-all hover:text-blue-100">
    {headerInstructorName}
  </span>
                  {course.instructors && course.instructors.length > 0 ? (
                    <div className="flex items-center -space-x-2 ml-1">
                      {course.instructors.map((inst: any, index: number) => {
                        if (!inst.photo) return null;
                        return (
                          <div key={index} className="relative w-[38px] h-[38px] rounded-full border-2 border-[#525EE3] bg-white overflow-hidden shrink-0 z-10 hover:z-20 hover:scale-110 transition-all duration-200">
                            <CustomImage src={inst.photo} alt={inst.name || "Instrutor"} fill unoptimized className="object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    headerInstructorPhoto && (
                      <div className="relative w-[38px] h-[38px] rounded-full border-2 border-[#525EE3] bg-white overflow-hidden shrink-0">
                        <CustomImage src={headerInstructorPhoto} alt={headerInstructorName} fill unoptimized className="object-cover" />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* PREÇO MOBILE */}
              <div className="lg:hidden pt-4 pb-2">
                <div className="flex items-baseline gap-3 mb-4">
                  {hasOwnership && course._type !== 'physicalProduct' ? (
                    <span className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-black border border-white/30">✓ {course._type === 'retreat' ? 'Reserva Efetuada' : 'Programa Adquirido'}</span>
                  ) : (
                    <>
                      {course.priceNote && <span className="text-xl font-bold text-white/90 mr-1">{course.priceNote}</span>}
                      {finalPrice > 0 ? (
                        <span className="text-3xl font-black">{finalPrice}€</span>
                      ) : (
                        !isTrialCourse && <span className="text-3xl font-black">Ver Opções</span>
                      )}
                      {productDiscountPrice && <span className="text-white/50 line-through text-lg italic">{productPrice}€</span>}
                    </>
                  )}
                </div>
                <button onClick={handleAddToCart} className={`w-full ${hasOwnership && course._type !== 'physicalProduct' ? 'bg-green-500' : 'bg-white text-[#525EE3]'} py-4 rounded-2xl font-black shadow-xl`}>
                  {hasOwnership && course._type !== 'physicalProduct' ? (course._type === 'retreat' ? "Reserva Confirmada" : "Continuar Prática") : (isTrialCourse ? "Experimentar" : "Comprar Agora")}
                </button>
              </div>

              <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-white text-[11px] font-semibold">
                  <div className="flex items-center gap-2 shrink-0">
                    <MonitorPlay size={13} className="text-blue-200 shrink-0" />
                    <span className="capitalize">{course.typology || (course._type === 'retreat' ? 'Presencial' : 'Online')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-blue-200 shrink-0" />
                    <span>{course.language}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-8 md:mb-0">
                    <Clock size={13} className="text-blue-200 shrink-0" />
                    <span>{course.cronograma || "Acesso vitalício / Flexível"}</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESTO DO CONTEÚDO */}
     <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        <div className="lg:col-span-2 space-y-8 lg:mt-12 mt-4 order-2 lg:order-1">
          <div className="relative z-30 lg:-mt-24 -mt-10">
            <div className="bg-white border border-slate-200 shadow-xl rounded-md overflow-hidden">
              <div className="grid items-stretch grid-cols-[2fr_1fr_1fr] md:grid-cols-[auto_1fr_auto_auto] min-h-[60px] text-[10px] uppercase font-bold tracking-tight">
                <div className="hidden md:flex bg-[linear-gradient(159deg,#4B0082_0%,#0892D0_100%)] text-white items-center justify-center px-5 gap-2 border-r border-white/10 italic shrink-0">
                  <BadgeCheck size={14} fill="currentColor" />  C/  {isTrialCourse ? "Trial" : "Premium"} 
                </div>
                <div className="relative flex items-center px-4 py-3">
                   <p className="text-slate-700 leading-tight lowercase first-letter:uppercase">
                     <Link href="/mindful-store/membro-ilimitado" className="hover:text-blue-600 hover:underline cursor-pointer transition-colors">
                       Acesso a todos os conteúdos Meditt por <br className="hidden xs:block"/> 
                       {isTrialCourse ? "7 dias" : "12 meses"} incluído
                     </Link>
                   </p>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3/5 w-px bg-slate-200"></div>
                </div>
                <div className="relative flex flex-col items-center justify-center px-2 md:px-4 py-3">
                   <div className="flex items-center gap-1.5 mb-0.5">
                     <span className="text-sm font-black text-slate-800">{averageRating.toFixed(1)}</span>
                     <div className="flex gap-0.5 text-yellow-500">
                        <Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/>
                     </div>
                   </div>
                   <span className="text-slate-400 font-medium lowercase">({reviewCount} classif.)</span>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3/5 w-px bg-slate-200"></div>
                </div>
                <div className="flex flex-col items-center justify-center px-2 md:px-4 py-3 shrink-0">
                   <div className="flex items-center gap-2 mb-0.5">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-sm font-black text-slate-800">{course.manualStudentOffset}</span>
                   </div>
                   <span className="text-slate-400 font-medium lowercase">participantes</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="rounded-[9px] p-[1px] bg-gradient-to-r from-[#4A55D4] via-[#3BB2E0] to-[#46E2FF] shadow-sm">
              <details open className="group rounded-[8px] bg-white overflow-hidden transition-all">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none bg-white border-b border-slate-50">
                  <div className="flex items-center gap-4 text-[#1E293B] font-bold text-[16px] lg:text-[18px]"><ShieldCheck size={22} className="text-[#3D81F1]" />
                    <span>O que vais aprender e praticar</span></div>
                  <ChevronDown size={22} className="text-slate-400 group-open:rotate-180 transition-all" />
                </summary>
                
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {course.descriptionImage && (
                    <div className="lg:col-span-4 relative aspect-square rounded-2xl overflow-hidden shadow-md">
                      <CustomImage src={course.descriptionImage} alt="Descritivo" fill className="object-cover" unoptimized hasBlueGradient />
                    </div>
                  )}
                  <div className={`text-[12px] font-medium leading-[1.6] text-slate-700 space-y-4 ${course.descriptionImage ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {course.whatYouWillLearn?.map((item: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start">
                          <Check size={14} className="text-[#3D81F1] shrink-0 mt-1" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            </div>
            
            {(accordionData.some(n => n.d?.length > 0)) && (
              <div className="rounded-[9px] p-[1px] bg-gradient-to-r from-[#4A55D4] via-[#3BB2E0] to-[#46E2FF] shadow-sm">
                <details className="group rounded-[8px] bg-white overflow-hidden transition-all">
                  <summary className="flex justify-between items-center p-6 cursor-pointer list-none bg-white border-b border-slate-50">
                    <div className="flex items-center gap-4 text-[#1E293B] font-bold text-[16px]">
                      <BookOpen size={18} className="text-[#3D81F1]" />
                      <span>Conteúdo do programa</span>
                    </div>
                    <ChevronDown size={18} className="text-slate-400 group-open:rotate-180 transition-all" />
                  </summary>
                  <div className="p-4 md:p-6 space-y-8 bg-[#F8FAFC]">
                    {accordionData.map((n, i) => n.d?.length > 0 && (
                      <div key={i}>
                        <div className="flex items-baseline gap-2 mb-4 px-1">
                          <span className="text-[10px] font-black uppercase text-[#3D81F1] tracking-widest">{n.l}</span>
                          <h3 className="text-[12px] font-bold text-[#1E293B]">{n.t}</h3>
                        </div>
                        <div className="space-y-1 bg-white p-2 rounded-2xl border-[1px] border-slate-100 shadow-sm font-medium text-[12px] leading-[1.6]">
                          {n.d.map((track: any, trackIndex: number) => (
                            <TrackRow key={`${track._id}-${trackIndex}`} track={track} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {((course.instructors && course.instructors.length > 0) || (course.instructorName && course.instructorName !== "Equipa Meditt")) && (
              <div ref={instructorSectionRef} className="pt-10 scroll-mt-20">
                <h2 className="text-2xl font-black text-slate-900 mb-8">
                  {(course.instructors?.length > 1 || course.totalInstructors > 1) ? "Instrutores do Programa" : "Instrutor do Programa"}
                </h2>

                <div className="flex flex-col gap-12">
                  {course.instructors && course.instructors.length > 0 ? (
                    course.instructors.map((inst: any, index: number) => (
                      <div key={index} className="relative mt-12 bg-[#F8FAFC] border border-slate-100 rounded-[24px] p-8 md:p-12 shadow-sm">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
                          <div className="p-1 bg-white rounded-full shadow-lg">
                             <div className="relative w-[90px] h-[90px] rounded-full border-4 border-white overflow-hidden">
                               <CustomImage src={inst.photo || "/placeholder.jpg"} alt={inst.name || "Instrutor"} fill unoptimized className="object-cover" />
                             </div>
                          </div>
                        </div>
                        <div className="mt-14 md:mt-0 md:pl-32 text-left">
                           <h3 className="text-2xl font-black text-slate-900 mb-1">{inst.name}</h3>
                           <p className="text-[#3D81F1] font-bold text-xs mb-6 capitalize">{inst.shortBio}</p>
                           <p className={`text-slate-600 font-medium text-[13px] leading-relaxed whitespace-pre-line ${!isBioExpanded ? 'line-clamp-6' : ''}`}>{inst.detailedBio}</p>
                           {inst.detailedBio && inst.detailedBio.length > 300 && (
                             <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="mt-3 text-[#3D81F1] font-bold text-xs hover:underline">
                                {isBioExpanded ? "Ver menos" : "Ver mais..."}
                             </button>
                           )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative mt-12 bg-[#F8FAFC] border border-slate-100 rounded-[24px] p-8 md:p-12 shadow-sm">
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
                        <div className="p-1 bg-white rounded-full shadow-lg">
                           <div className="relative w-[90px] h-[90px] rounded-full border-4 border-white overflow-hidden">
                             <CustomImage src={course.instructorPhoto || "/placeholder.jpg"} alt={course.instructorName || "Equipa Meditt"} fill unoptimized className="object-cover" />
                           </div>
                        </div>
                      </div>
                      <div className="mt-14 md:mt-0 md:pl-32 text-left">
                         <h3 className="text-2xl font-black text-slate-900 mb-1">{course.instructorName || "Equipa Meditt"}</h3>
                         <p className="text-[#3D81F1] font-bold text-xs mb-6 capitalize">{course.instructorShortBio}</p>
                         <p className={`text-slate-600 font-medium text-[13px] leading-relaxed whitespace-pre-line ${!isBioExpanded ? 'line-clamp-6' : ''}`}>{course.instructorDetailedBio}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:block relative order-1 lg:order-2">
          <div className="lg:sticky lg:top-[110px] lg:-mt-80 z-50">
            <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100">
               <div className={`relative aspect-video overflow-hidden ${course._type !== 'retreat' ? 'cursor-pointer group' : ''}`} onClick={() => course._type !== 'retreat' && setIsModalOpen(true)}>
                  <CustomImage src={course.image || "/placeholder.jpg"} alt={course.title} fill unoptimized className="object-cover" priority hasBlueGradient />
                  {course._type !== 'retreat' && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all z-10">
                         <div className="bg-white/90 p-4 rounded-full shadow-2xl scale-95 group-hover:scale-105 transition-transform">
                            <Play fill="#3D81F1" className="text-[#3D81F1]" size={32} />
                         </div>
                      </div>
                      <div className="absolute bottom-0 w-full bg-black/60 py-2.5 text-center text-white text-[10px] font-black uppercase tracking-widest italic z-10">Ver Vídeo</div>
                    </>
                  )}
               </div>

               <div className="flex border-b border-slate-100">
                  <button onClick={() => setActiveTab('pessoal')} className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'pessoal' ? 'border-b-[3px] border-slate-900 text-slate-900' : 'text-slate-400'}`}>Pessoal</button>
                  <button onClick={() => setActiveTab('equipas')} className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'equipas' ? 'border-b-[3px] border-slate-900 text-slate-900' : 'text-slate-400'}`}>Equipas</button>
               </div>

               <div className="p-8 space-y-6">
                {activeTab === 'pessoal' ? (
                  <>
                    <div className="flex justify-start items-baseline gap-3">
                      {hasOwnership && course._type !== 'physicalProduct' ? (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 w-full justify-center">
                          <ShieldCheck size={18} />
                          <span className="text-sm font-black">{course._type === 'retreat' ? 'Reserva Efetuada' : 'Programa Adquirido'}</span>
                        </div>
                      ) : (
                        <>
                          {course.priceNote && <span className="text-xl font-bold text-slate-500 mr-1">{course.priceNote}:</span>}
                          {finalPrice > 0 ? (
                            <span className="text-3xl font-black text-[#1E293B]">{finalPrice}€</span>
                          ) : (
                            !isTrialCourse && <span className="text-3xl font-black text-[#1E293B]">Ver Opções</span>
                          )}
                          {productDiscountPrice && <span className="text-slate-400 line-through text-lg italic">{productPrice}€</span>}
                        </>
                      )}
                    </div>
                    <button onClick={handleAddToCart} className={`w-full ${hasOwnership && course._type !== 'physicalProduct' ? 'bg-[#37374B]' : 'bg-[#3D81F1]'} text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all`}>
                      {hasOwnership && course._type !== 'physicalProduct' ? (course._type === 'retreat' ? "Reserva Confirmada" : "Continuar Prática") : (isTrialCourse ? "Experimentar" : "Comprar agora")}
                    </button>
                    <ul className="space-y-3 text-sm font-medium text-slate-600 pt-4">
                        <li className="flex items-center gap-3">
                            {course._type === 'retreat' ? (
                                <CalendarCheck size={18} className="text-slate-500 shrink-0" />
                            ) : course._type === 'physicalProduct' ? (
                                <ShieldCheck size={18} className="text-slate-500 shrink-0" />
                            ) : (
                                <Clock size={18} className="text-slate-500 shrink-0" />
                            )}
                            <span>
                                {course._type === 'retreat' 
                                    ? 'Vaga Garantida' 
                                    : (course._type === 'physicalProduct' ? 'Qualidade Premium' : `Acesso ${isTrialCourse ? "7 dias" : "12 meses"}`)}
                            </span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Headset size={18} className="text-slate-500 shrink-0" />
                            <span>Suporte personalizado</span>
                        </li>
                        
                        {!isTrialCourse && (
                          <li className="flex items-center gap-3">
                              <Award size={18} className="text-slate-500 shrink-0" />
                              <span>Certificado</span>
                          </li>
                        )}
                        {isTrialCourse && (
                          <li className="flex items-start gap-3 mt-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                             <span className="text-xs leading-relaxed font-semibold text-slate-600">
                                Nesta semana experimental podes experimentar algumas das muitas práticas dos cursos disponíveis.
                             </span>
                          </li>
                        )}
                        
                    </ul>
                  </>
                ) : (
                  <div className="space-y-5">
                     <div className="flex items-center gap-2"><span className="font-black text-xl italic text-slate-800">meditt.space</span><span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">Business</span></div>
                     <p className="text-sm text-slate-600 font-medium leading-relaxed">Leve o bem-estar para a sua empresa com acessos corporativos.</p>
                     <Link href="/contacto" className="block w-full text-center border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all">Pedir Orçamento</Link>
                  </div>
                )}
               </div>
            </div>
          </div>
        </aside>
      </div>

      {/* SECÇÃO REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 border-t border-slate-100 mt-12 relative overflow-hidden bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-4">O que dizem os nossos participantes</h2>
          <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
            <Star size={24} fill="currentColor" />
            <Star size={24} fill="currentColor" />
            <Star size={24} fill="currentColor" />
            <Star size={24} fill="currentColor" />
            <Star size={24} fill="currentColor" />
          </div>
          <p className="text-slate-500 font-medium text-lg">Classificação média de {averageRating.toFixed(1)} em 5 ({reviewCount} avaliações)</p>
        </div>
        <ReviewSlideshow productId={course._id} />
      </section>

    </main>
  );
}