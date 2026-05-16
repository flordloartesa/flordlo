import Link from '@/components/MyLink';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopCard from '@/components/ShopCard';
import AccessoriesCarousel from '@/components/AccessoriesCarousel';
import CursosProgramas from '@/components/CursosProgramas';

import { client } from '../lib/sanity';
import { getServerSession } from "next-auth"; 
import { authOptions } from "../lib/auth"; 
import StoreFilters from '@/components/StoreFilters';
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: "Loja Meditt | Mindfulness, Psicologia, Yoga, Cursos, Retiros e Presentes",
  description: "Invista no seu bem-estar com os nossos cursos de mindfulness, retiros presenciais e acessórios para a sua prática.",
};

async function getStoreItems() {
  try {
    const query = `*[_type in ["product", "course", "retreat", "eventos", "giftCard", "cartao-oferta", "giftcard", "physicalProduct"]] | order(_createdAt desc) {
      _id, 
      _type, 
      title, 
      name, 
      titulo, 
      "slug": coalesce(slug.current, ""), 
      
      "price": coalesce(
        price, 
        preco, 
        sizes[0].price,     
        variants[0].price, 
        variacoes[0].preco,
        0
      ), 
      
      "reservaPrice": reservaPrice, 

      "priceNote": priceNote,
      "imageUrl": select(
        _type == "product" => coalesce(coverImage.asset->url, coverImageUrl, ""),
        _type == "course" => coalesce(coverImage.asset->url, coverImageUrl, ""),
        _type == "retreat" => coalesce(image.asset->url, imageUrl, ""),
        _type == "eventos" => coalesce(image.asset->url, imagemUrlExterna, imageUrl, ""),
        _type == "physicalProduct" => coalesce(images[0].asset->url, images[0].url, ""),
        coalesce(image.asset->url, imageUrl, "https://app.meditt.space/a/wp-content/uploads/2021/06/gift-card-img-m-1.jpg")
      ),
      
      "date": coalesce(dataEventoTexto, startDate, date, data, dateRange, ""),
      
      "location": coalesce(location, local, "Portugal"), 
      "format": format,
      "typology": coalesce(typology, tipologia, format, "Presencial"), 
      isOnline,

      // 👇 A CORREÇÃO ESTÁ AQUI: Agora ele tenta ler os cursos Novos E os cursos Antigos!
      "instructor": coalesce(
        autor->name, 
        array::join(instructors, ", "), 
        array::join(instructor[]->name, ", "), // 👈 Lê os cursos Novos (em formato Lista)
        instructor->name,                      // 👈 Lê os cursos Antigos (em formato Objeto)
        instructorName, 
        author->name, 
        orientador, 
        "Equipa Meditt"
      )
    }`;
    return await client.fetch(query, {}, { cache: 'no-store' });
  } catch (e) { 
    console.error("Erro no Sanity:", e);
    return []; 
  }
}

export default async function MindfulStorePage() {
  const session = await getServerSession(authOptions);
  const items = await getStoreItems();
  const purchasedIds = (session?.user as any)?.purchasedCourses || [];

  const courses = items.filter((i: any) => i._type === 'course' || i._type === 'product');
  const retreats = items.filter((i: any) => i._type === 'retreat');
  const eventos = items.filter((i: any) => i._type === 'eventos');
  const accessories = items.filter((i: any) => i._type === 'physicalProduct');
  const giftCards = items.filter((i: any) => i._type === 'giftCard' || i._type === 'cartao-oferta' || i._type === 'giftcard');

  return (
    <main className="min-h-screen bg-[#FCFCFC] scroll-smooth font-inter">
      
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 md:py-24">
        
        <header className="mb-8 md:mb-16 text-center flex flex-col items-center px-4 md:px-0">
          <span className="text-slate-400 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mb-3 md:mb-4 block">
            Catálogo Meditt
          </span>
          <h1 className="text-3xl md:text-6xl font-black text-[#2A2A32] mb-4 md:mb-6 tracking-tight leading-tight">
            Mindful Store
          </h1>
          <p className="text-slate-500 text-sm md:text-lg max-w-xl mx-auto font-light leading-relaxed mb-8">
            Formação, Equipamento e inspiração. Ferramentas desenhadas com propósito para nutrir a sua Saúde e Bem-Estar.
          </p>

          <div className="w-full flex flex-col items-center group">
            <div className="w-full overflow-x-auto scrollbar-hide flex items-center gap-6 px-4 pb-2">
              <div className="flex items-center gap-8 md:gap-12 mx-auto">
                {/* Categorias / Icons aqui se necessário */}
              </div>
            </div>

            <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 opacity-40 animate-pulse">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-400">Scroll</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </header>

        <div className="mb-16"><StoreFilters /></div>

        {/* 1. CURSOS ONLINE (A imagem continua clicável por defeito, se não alterares o ShopCard) */}
        {courses.length > 0 && (
          <section id="cursos" className="mb-32 scroll-mt-32">
            <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#2A2A32]">Cursos e Programas</h2>
            </div>
            <CursosProgramas courses={courses} purchasedIds={purchasedIds} />
          </section>
        )}

        {/* 2. RETIROS E EVENTOS */}
        {(() => {
          const retirosEEventos = [...(retreats || []), ...(eventos || [])];
          if (retirosEEventos.length === 0) return null;

          const retirosEEventosAdaptados = retirosEEventos.map((item: any) => {
            const isEvent = item._type === 'eventos';
            const itemUrl = isEvent ? `/eventos/${item.slug}` : `/t/${item.slug}`;

            return {
              ...item,
              title: item.title || item.name || item.titulo || "Evento Meditt",
              date: item.date,
              instructor: item.instructor,
              location: item.location || "Portugal",
              isOnline: item.isOnline || false,
              price: item.reservaPrice || item.price,
              totalPrice: item.price,
              priceNote: item.reservaPrice ? "Sinal de Reserva" : item.priceNote,
              buttonText: isEvent ? "Comprar" : "Reservar",
              courseUrl: itemUrl,
              detailsUrl: itemUrl,
              isOverlay: true,
              disableImageLink: true 
            };
          });

          return (
            <section id="retiros" className="mb-32 scroll-mt-32">
              <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-4">
                <h2 className="text-xl md:text-2xl font-bold text-[#2A2A32]">Retiros e Eventos</h2>
              </div>
              <CursosProgramas courses={retirosEEventosAdaptados} purchasedIds={purchasedIds} />
            </section>
          );
        })()}

        {/* 3. ACESSÓRIOS PARA PRÁTICA */}
        {accessories.length > 0 && (
          <section id="acessorios" className="mb-40 scroll-mt-32">
            <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#2A2A32]">Acessórios para Prática</h2>
            </div>
            <CursosProgramas 
              courses={accessories.map((item: any) => ({
                ...item,
                typology: "Equipamento",
                courseUrl: `/mindful-store/produto/${item.slug}`, 
                detailsUrl: `/mindful-store/produto/${item.slug}`,
                buttonText: "Ver detalhes",
                disableImageLink: true 
              }))} 
              purchasedIds={purchasedIds} 
            />
          </section>
        )}

        {/* 4. SECÇÃO CARTÃO PRESENTE */}
        {giftCards.length > 0 && (
          <section id="presentes" className="mb-32 scroll-mt-32 px-4">
            <div className="max-w-[1200px] mx-auto">
              <div className="text-center mb-16 md:mb-24 relative">
                <h2 className="text-6xl md:text-8xl font-black text-[#2A2A32] tracking-tighter opacity-[0.03] absolute inset-0 flex items-center justify-center select-none">Store</h2>
                <h3 className="text-2xl md:text-3xl font-bold text-[#2A2A32] relative z-10">O Cartão Presente Meditt</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-4">
                <div className="lg:col-span-3 space-y-12 md:space-y-20 text-left order-1">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="font-bold text-base md:text-lg whitespace-nowrap text-[#2A2A32]">Flexibilidade Total</h4>
                      <div className="h-[1px] flex-grow bg-slate-200"></div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">Válido para qualquer curso, retiro ou acessório da nossa loja.</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="font-bold text-base md:text-lg whitespace-nowrap text-[#2A2A32]">Entrega Digital</h4>
                      <div className="h-[1px] flex-grow bg-slate-200"></div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">Recebe o código instantaneamente no e-mail.</p>
                  </div>
                </div>
                <div className="lg:col-span-6 flex justify-center order-2 py-8 lg:py-0">
                  <div className="relative w-full max-w-[400px] aspect-[16/10] transform hover:scale-[1.05] transition-transform duration-700 shadow-2xl rounded-2xl overflow-hidden border border-slate-100">
                    <Image src={giftCards[0].imageUrl} alt="Cartão Presente Meditt" fill className="object-cover" />
                  </div>
                </div>
                <div className="lg:col-span-3 space-y-12 md:space-y-20 text-right order-3">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-[1px] flex-grow bg-slate-200"></div>
                      <h4 className="font-bold text-base md:text-lg whitespace-nowrap text-[#2A2A32]">Personalização</h4>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">Adiciona uma mensagem especial ao teu presente.</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-[1px] flex-grow bg-slate-200"></div>
                      <h4 className="font-bold text-base md:text-lg whitespace-nowrap text-[#2A2A32]">Sem Validade</h4>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">O saldo do cartão nunca expira.</p>
                  </div>
                </div>
              </div>
              <div className="mt-20 flex justify-center">
                <Link href="/mindful-store/cartao-oferta" className="group flex items-center gap-6 bg-white border border-slate-200 pl-8 pr-2 py-2 rounded-full hover:border-[#2A2A32] transition-all shadow-sm active:scale-95">
                  <span className="text-[13px] font-bold uppercase tracking-widest text-[#2A2A32]">Personalizar Cartão</span>
                  <div className="bg-[#2A2A32] text-white p-4 rounded-full group-hover:bg-black transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* BANNER FINAL */}
        <section className="bg-[#1C1C22] rounded-[32px] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-white mt-10">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-light mb-4">Simplicidade e Segurança.</h2>
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed">Acesso imediato aos cursos e pagamentos encriptados.</p>
          </div>
          <Link href="/checkout" className="bg-white text-[#1C1C22] px-10 py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all flex-shrink-0">Finalizar Encomenda</Link>
        </section>
      </div>
      
    </main>
  );
}