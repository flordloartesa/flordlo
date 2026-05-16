"use client";

import { useCart } from "@/app/context/CartContext"; 
import { useState } from "react";
import Link from '@/components/MyLink';
import { useRouter } from "next/navigation";
import { CustomImage } from "@/components/CustomImage";

interface Props {
  _id: string; title: string; instructor?: string; price?: number; priceNote?: string;
  imageUrl: string; slug: string; duration?: string; courseUrl?: string;       
  detailsUrl?: string; 
  buttonText?: string; hideInstructor?: boolean; dateRange?: string;
  location?: string; _type?: string; format?: string; typology?: string;
  isPurchased?: boolean; isAccessory?: boolean; isOverlay?: boolean;
  sizes?: any[]; 
  variations?: any[];
  variants?: any[];
  isPhysicalProductConfig?: boolean;
  disableImageLink?: boolean;
}

export default function ShopCard({ 
  _id, title, instructor, price, priceNote, imageUrl, slug, duration,
  courseUrl, detailsUrl, buttonText, hideInstructor, dateRange, location, _type,
  format, typology, isPurchased, isAccessory = false, isOverlay = false,
  sizes, variations, variants, isPhysicalProductConfig = false, disableImageLink = false
}: Props) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();

  const isPhysical = _type === 'physicalProduct' || _type === 'product' || isPhysicalProductConfig;

  const realPrice = price || sizes?.[0]?.price || variations?.[0]?.price || variants?.[0]?.price || 0;
  const isFree = realPrice === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isFree) {
      addToCart({ _id, title, price: realPrice, imageUrl: imageUrl || '', slug: slug || '' });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleVerOpcoes = (e: React.MouseEvent) => {
     e.preventDefault(); e.stopPropagation();
     if (courseUrl) router.push(courseUrl);
  };

  const handleGoToDetails = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (detailsUrl) router.push(detailsUrl);
  };

  const innerContent = (
    <div className={`flex flex-col w-full group h-full transition-all duration-500 overflow-hidden rounded-[10px] ${isOverlay ? 'relative' : ''} ${!disableImageLink ? 'cursor-pointer' : ''}`}>
      
      {/* IMAGEM COM OVERLAY */}
      <div className={`relative w-full aspect-[3/4] overflow-hidden rounded-[10px] ${!isOverlay ? 'bg-[#F0F0F0] mb-3' : 'bg-[#F0F0F0]'}`}>
        
        <CustomImage 
          src={imageUrl || '/images/placeholder.jpg'} 
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          hasBlueGradient
          className={`transition-transform duration-700 group-hover:scale-105 ${isPhysical && !isOverlay ? 'object-contain p-3' : 'object-cover'}`}
        />

        {isOverlay && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent z-10" />
        )}

        {/* EFEITO GLASSMORPHISM NO HOVER SÓ PARA PRODUTOS FÍSICOS */}
        {isPhysicalProductConfig && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 z-30 pointer-events-none">
              <button 
                 onClick={handleGoToDetails}
                 className="bg-white/30 backdrop-blur-md border border-white/40 text-white text-[11px] font-bold py-2.5 px-6 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:bg-white/40 transition-all pointer-events-auto"
              >
                Ver detalhes
              </button>
            </div>
        )}

        {/* Preço Original */}
        {!isPhysicalProductConfig && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 text-[9px] rounded-full font-black text-[#37374B] shadow-sm flex items-center gap-1 z-30">
            <span>{isFree ? 'Gratuito' : `${realPrice}€`}</span>
          </div>
        )}

        {/* TEXTO OVERLAY (Eventos e Retiros) */}
        {isOverlay && (
          <div className="absolute top-0 left-0 w-full p-4 z-20 text-white flex flex-col gap-1 pointer-events-none">
             <div className="self-start bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-[4px] border border-white/20 mb-1">
                <p className="text-[8px] font-bold uppercase tracking-widest">
                  {isPhysical ? 'Equipamento' : (_type === 'retreat' ? 'Presencial' : (typology || format || 'Curso'))}
                </p>
             </div>
             
             <h3 className={`font-bold leading-tight drop-shadow-lg ${isAccessory ? 'text-[13px] md:text-[14px]' : 'text-[14px] md:text-[15px]'}`}>
                {title}
             </h3>

             {/* 👇 AQUI ESTÁ A CORREÇÃO: Esconde o instrutor se o produto for físico 👇 */}
             {instructor && !hideInstructor && !isPhysical && (
               <p className="text-[10px] opacity-90 font-medium">{instructor}</p>
             )}

             {_type === 'retreat' && (
               <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 mt-0.5">
                 {dateRange} {location && `| ${location}`}
               </p>
             )}
          </div>
        )}
      </div>

      {/* DESIGN SEM OVERLAY (Acessórios e Cursos) */}
      {!isOverlay && (
        <div className="flex flex-col flex-grow px-2 text-left">
          <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">{typology || format}</p>
          <h3 className="text-[#37374B] font-bold text-[14px] leading-snug mb-1 transition-colors">{title}</h3>
          
          <div className="mt-auto pt-2 flex items-center justify-between">
              <span className="text-xl font-black text-[#2A2A32]">
                {realPrice ? `${realPrice}€` : (isFree ? 'Gratuito' : 'Ver opções')}
              </span>
          </div>
        </div>
      )}

      {/* ✅ ZONA DO BOTÃO INFERIOR (Comprar) */}
      <div className={`mt-auto pt-4 pb-3 ${isOverlay ? 'absolute bottom-0 left-0 w-full p-4 z-20 flex flex-col gap-2' : 'px-2'}`}>
        
        {isOverlay && detailsUrl && (
          <button 
            onClick={handleGoToDetails}
            className="w-full py-2 text-[9px] font-bold uppercase tracking-[0.1em] bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-[10px] hover:bg-white/20 transition-all z-30 relative"
          >
            Saber mais detalhes
          </button>
        )}

        <button 
          onClick={isPhysical && buttonText === "Ver Opções" ? handleVerOpcoes : handleAddToCart}
          disabled={isAdded}
          className={`w-full py-2.5 px-3 border text-[10px] font-bold uppercase tracking-widest transition-all rounded-[10px] flex items-center justify-center gap-2 z-30 relative
            ${isAdded 
              ? 'border-green-600 bg-green-600 text-white' 
              : isOverlay 
                ? 'bg-white text-black border-transparent hover:bg-slate-100'
                : 'border-gray-200 text-[#37374B] hover:border-black hover:bg-black hover:text-white'
            }`}
        >
          {isAdded ? 'Adicionado ✓' : (buttonText === 'Ver detalhes' ? 'Comprar' : (buttonText || 'Comprar'))}
        </button>
      </div>
    </div>
  );

  const defaultHref = isPurchased ? `/cursos/${slug}` : `/mindful-store/${slug}`;
  const finalHref = courseUrl || defaultHref;

  if (disableImageLink) {
    return (
      <div className="block h-full">
         {innerContent}
      </div>
    );
  }

  return (
    <Link 
      href={finalHref} 
      className="block h-full"
    >
      {innerContent}
    </Link>
  );
}