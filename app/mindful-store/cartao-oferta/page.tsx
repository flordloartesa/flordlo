"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from '@/components/MyLink';
import { client } from "@/app/sanity/client";


import { 
  ArrowRight, ShoppingCart, X, Eye, Gift, Mail, User, MessageSquare, Calendar 
} from "lucide-react"; 
import { useSession } from "next-auth/react";
import { useCart } from "@/app/context/CartContext"; 

export default function GiftCardPage() {
  const { addToCart } = useCart() as any;
  const { data: session } = useSession();
  
  // Estados do Formulário
  const [amount, setAmount] = useState("30");
  const [customAmount, setCustomAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(""); 
  
  // Estados de UI
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Estados de Dados (Sanity)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [physicalProducts, setPhysicalProducts] = useState<any[]>([]);
  const [physicalCurrentIndex, setPhysicalCurrentIndex] = useState(0);

  const finalPrice = amount === "custom" ? parseFloat(customAmount) : parseFloat(amount);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 640) setItemsPerView(2);
      else setItemsPerView(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (session?.user?.name) setSender(session.user.name);
  }, [session]);

  useEffect(() => {
    async function fetchData() {
      const programsResult = await client.fetch(`
        *[_type in ["course", "retreat"]] | order(_createdAt desc) [0...12] {
          title, price, discountPrice, _type, "slug": slug.current, 
          "image": coalesce(coverImageUrl, coverImage.asset->url, image.asset->url, imageUrl, image, mainImage.asset->url, ""),
        }
      `);
      setRelatedProducts(programsResult);

      const physicalResult = await client.fetch(`
        *[_type == "physicalProduct"] | order(_createdAt desc) [0...12] {
          title, price, discountPrice, _type, sizes, variations,
          "slug": slug.current, 
          "image": coalesce(coverImageUrl, coverImage.asset->url, images[0].url, images[0].asset->url, image.asset->url, ""),
        }
      `);
      setPhysicalProducts(physicalResult);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (relatedProducts.length > itemsPerView) {
        setCurrentIndex((prev) => (prev >= relatedProducts.length - itemsPerView ? 0 : prev + 1));
      }
      if (physicalProducts.length > itemsPerView) {
        setPhysicalCurrentIndex((prev) => (prev >= physicalProducts.length - itemsPerView ? 0 : prev + 1));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [relatedProducts.length, physicalProducts.length, itemsPerView]);

const handleAddToCart = () => {
  // Validação
  if (!recipient || !sender || (amount === "custom" && !customAmount) || !deliveryDate) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }
  
  addToCart({
    _id: `gift-card-${Date.now()}`, // Usar _id em vez de id
    title: "Cartão Oferta Digital Meditt",
    price: finalPrice,
    slug: "cartao-oferta-digital", // Adicionado para cumprir a interface
    imageUrl: "https://app.meditt.space/a/wp-content/uploads/2021/06/gift-card-img-m-1.jpg", // Mudar de image para imageUrl
    // Se quiseres testar com outra imagem caso esta falhe:
    // imageUrl: "https://64.media.tumblr.com/f214ec6752a08609c79490abd284c895/7895fc9ab09084b0-d1/s1280x1920/88c3e6508398f1fd1d72859537def85672a4e20e.jpg",
    metadata: { 
      type: "gift_card", 
      recipient, 
      sender, 
      senderEmail: session?.user?.email, 
      message,
      deliveryDate 
    }
  } as any); // O 'as any' ajuda se o TS reclamar do metadata que não está na interface base

  setIsAdded(true);
  setTimeout(() => setIsAdded(false), 3000);
};

  const handleOfferClick = (productPrice: number) => {
    if ([30, 50, 100].includes(productPrice)) {
      setAmount(productPrice.toString());
      setCustomAmount("");
    } else {
      setAmount("custom");
      setCustomAmount(productPrice.toString());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 pb-24 relative">
      

      {/* MODAL AMOSTRA */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)}>
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] p-8 md:p-12 shadow-2xl transition-all" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-black transition-colors"><X size={24} /></button>
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-black">A tua oferta digital</h3>
              <div className="border-2 border-dashed border-[#3D81F1]/30 rounded-[22px] p-8 md:p-12 bg-slate-50 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Gift size={80} /></div>
                <div className="flex justify-between items-center font-black text-3xl text-[#3D81F1]">
                  <span>€{finalPrice || 0}</span>
                  <span className="text-sm italic font-medium text-slate-400">meditt.space</span>
                </div>
                <div className="text-left space-y-4">
                  <p className="text-lg">Olá <b>{recipient || '[Nome do Amigo]'}</b>,</p>
                  <p className="italic text-slate-600 text-xl leading-relaxed">"{message || 'Um presente especial para o teu caminho de bem-estar.'}"</p>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Com carinho,</p>
                        <p className="text-lg font-black">{sender || '[Teu Nome]'}</p>
                    </div>
                    {deliveryDate && (
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Entrega agendada:</p>
                            <p className="text-sm font-bold text-[#3D81F1]">{new Date(deliveryDate).toLocaleDateString('pt-PT')}</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400">Este cartão será enviado por e-mail na data selecionada após a confirmação do pagamento.</p>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="text-white pt-10 pb-24 px-4 md:px-6" style={{ background: 'linear-gradient(45deg, #525EE3 35%, #3AB8EA 100%)' }}>
        <div className="max-w-7xl mx-auto space-y-6 text-center md:text-left">
          <nav className="flex items-center justify-center md:justify-start gap-2 text-[11px] font-black uppercase tracking-wider text-white/80">
            <Link href="/">Início</Link> <ArrowRight size={10} />
            <Link href="/mindful-store">Loja</Link> <ArrowRight size={10} />
            <span className="text-white">Cartão Oferta</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight">Oferece Bem-Estar</h1>
          <p className="text-white/80 max-w-xl text-lg">Personaliza o teu presente digital e agenda a entrega para o dia especial.</p>
        </div>
      </section>

      {/* FORMULARIO */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            <div className="bg-slate-50 p-8 md:p-12 flex flex-col justify-center items-center space-y-8">
              <div className="relative w-full aspect-video rounded-[22px] overflow-hidden shadow-2xl group">
                <Image src="https://app.meditt.space/a/wp-content/uploads/2021/06/gift-card-img-m-1.jpg" alt="Gift Card" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full font-black text-[#3D81F1] shadow-lg">
                  €{finalPrice || 0}
                </div>
              </div>
              <button onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-[#3D81F1] transition-colors">
                <Eye size={16} /> Ver Amostra Digital
              </button>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">1. Escolhe o Valor</label>
                <div className="grid grid-cols-2 gap-4">
                  <select value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 font-bold text-lg outline-none focus:ring-2 focus:ring-[#3D81F1]/20 transition-all">
                    <option value="30">€30.00</option>
                    <option value="50">€50.00</option>
                    <option value="100">€100.00</option>
                    <option value="custom">Outro Valor</option>
                  </select>
                  {amount === "custom" && (
                    <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 font-bold text-lg outline-none focus:ring-2 focus:ring-[#3D81F1]/20" placeholder="Valor €" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">2. Personaliza</label>
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="E-mail do destinatário" className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#3D81F1]/20" />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Teu Nome" className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#3D81F1]/20" />
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-slate-300" size={18} />
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem carinhosa..." rows={3} className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-4 outline-none resize-none focus:ring-2 focus:ring-[#3D81F1]/20" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">3. Agendar Entrega</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  <input type="date" min={today} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#3D81F1]/20 font-bold text-slate-600 appearance-none" />
                </div>
              </div>

              <button onClick={handleAddToCart} disabled={isAdded} className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all flex justify-center items-center gap-3 ${isAdded ? 'bg-green-500 text-white' : 'bg-[#3D81F1] text-white hover:scale-[1.02] active:scale-95'}`}>
                {isAdded ? <>Adicionado ✓</> : <><ShoppingCart size={20} /> Adicionar ao Carrinho</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARROSSEIS DE SUGESTÕES */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-32 mt-32">
        
        {/* CARROSSEL 1: PROGRAMAS (ALTERADO PARA REDIRECIONAR /T/ SE FOR RETIRO) */}
        <section>
          <h2 className="text-2xl font-black flex items-center gap-3 italic mb-12">
            <ArrowRight className="text-[#3D81F1]" /> Sugestões para oferecer
          </h2>
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * (93.5 / itemsPerView)}%)` }}>
              {relatedProducts.map((p, i) => {
                const pPrice = p.discountPrice || p.price;
                // Lógica de URL personalizada: Retiros vão para /t/, outros para mindful-store
                const productUrl = p._type === 'retreat' ? `/t/${p.slug}` : `/mindful-store/${p.slug}`;

                return (
                  <div key={i} className="flex-none px-3" style={{ width: `${(100 / itemsPerView) * 0.935}%` }}>
                    <div className="group relative aspect-[4/5] rounded-[22px] overflow-hidden shadow-lg block bg-slate-100">
                      
                      {/* Imagem clicável */}
                      <Link href={productUrl} className="relative block w-full h-full">
                        {p.image && <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
                        
                        <div className="absolute top-5 left-5 right-5 z-20 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded border border-white/20 uppercase">
                              {p._type === 'retreat' ? 'Presencial' : 'Online'}
                            </span>
                            <span className="bg-white text-slate-900 text-[11px] font-black px-3 py-1 rounded-full shadow-md">
                              €{pPrice}
                            </span>
                          </div>
                          <h3 className="text-white font-bold text-[16px] leading-tight drop-shadow-lg">{p.title}</h3>
                        </div>
                      </Link>

                      <div className="absolute bottom-5 inset-x-5 z-20 space-y-2">
                        <Link href={productUrl} className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-black text-[10px] flex justify-center items-center gap-2">
                          <Eye size={14}/> Detalhes
                        </Link>
                        <button onClick={() => handleOfferClick(pPrice)} className="w-full py-4 bg-white text-black rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl">
                          Escolher Este
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CARROSSEL 2: ACESSÓRIOS */}
        <section>
          <h2 className="text-2xl font-black flex items-center gap-3 italic mb-12">
            <ArrowRight className="text-[#3D81F1]" /> Suporte para a prática
          </h2>
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${physicalCurrentIndex * (93.5 / itemsPerView)}%)` }}>
              {physicalProducts.map((p, i) => {
                const realP = p.price || p.sizes?.[0]?.price || p.variations?.[0]?.price || 0;
                const finalP = p.discountPrice || p.sizes?.[0]?.discountPrice || realP;
                
                // ALTERAÇÃO AQUI: Atualizado para apontar para a pasta /produto/[slug]/
                const physicalUrl = `/mindful-store/produto/${p.slug}`;

                return (
                  <div key={i} className="flex-none px-3" style={{ width: `${(100 / itemsPerView) * 0.935}%` }}>
                    <div className="group relative aspect-[4/5] rounded-[22px] overflow-hidden shadow-lg block bg-slate-100">
                      <Link href={physicalUrl} className="relative block w-full h-full">
                        {p.image && <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
                        <div className="absolute top-5 left-5 right-5 z-20 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded border border-white/20 uppercase">Loja</span>
                            <span className="bg-white text-slate-900 text-[11px] font-black px-3 py-1 rounded-full shadow-md">€{finalP}</span>
                          </div>
                          <h3 className="text-white font-bold text-[16px] leading-tight drop-shadow-lg">{p.title}</h3>
                        </div>
                      </Link>

                      <div className="absolute bottom-5 inset-x-5 z-20 space-y-2">
                        <Link href={physicalUrl} className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-black text-[10px] flex justify-center items-center gap-2">
                          <Eye size={14}/> Detalhes
                        </Link>
                        <button onClick={() => handleOfferClick(finalP)} className="w-full py-4 bg-white text-black rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl">
                          Escolher Este
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      
    </main>
  );
}