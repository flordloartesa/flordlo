'use client';

import { useState } from 'react';
import { Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '@/app/context/CartContext'; 
import { PortableText } from '@portabletext/react';
import TestimonialsSlider from "@/components/TestimonialsSlider";


export default function ProductClient({ product }: { product: any }) {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descricao');
  const { addToCart } = useCart();

  const increase = () => setQuantity(prev => prev + 1);
  const decrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrls?.[0] || '/placeholder.jpg',
      quantity: quantity,
      weight: product.weight // Passamos o peso para calcular os portes!
    });
  };

  const images = product.imageUrls || ['/placeholder.jpg'];
  const reviewsCount = product.reviews?.length || 0;

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 pt-24 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20">
          
          {/* Galeria de Imagens */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible w-full md:w-24 shrink-0 custom-scrollbar">
              {images.map((img: string, index: number) => (
                <button 
                  key={index} 
                  onClick={() => setMainImageIndex(index)}
                  className={`relative aspect-[3/4] w-20 md:w-full overflow-hidden border-2 transition-all ${mainImageIndex === index ? 'border-[#9d6b73] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Miniatura ${index + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
            <div className="relative aspect-[3/4] w-full bg-slate-50">
              <img 
                src={images[mainImageIndex]} 
                alt={product.title} 
                className="object-cover w-full h-full transition-opacity duration-300"
              />
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="flex flex-col pt-2 md:pt-4">
            <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-2 leading-tight">
              {product.title}
            </h1>
            <p className="text-xl md:text-2xl text-[#9d6b73] font-medium mb-2">
              €{product.price?.toFixed(2)}
            </p>
            
            {/* Estado e Prazo de Produção */}
            <div className="flex flex-col gap-1 mb-6 m">
              <span className="text-yellow-600 font-medium text-[11px]">{product.status}</span>
              {product.productionTime && (
                <span className="text-slate-500 text-[10px]">Prazo de produção: {product.productionTime}</span>
              )}
            </div>

            {/* Breve Descrição */}
            {product.shortDescription && (
              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                {product.shortDescription}
              </p>
            )}

            {/* Tamanhos e Cores */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block mb-2">Tamanhos Disponíveis</span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-sm">{size}</span>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block mb-2">Cores</span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-[#fcf7f8] border border-[#9d6b73]/20 text-[#9d6b73] text-xs rounded-sm">{color}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionar ao Carrinho */}
            <div className="flex items-center gap-4 mb-6 mt-4">
              <div className="flex items-center border border-slate-300 rounded-sm">
                <button onClick={decrease} className="p-3 text-slate-500 hover:text-slate-800 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-medium text-slate-800">{quantity}</span>
                <button onClick={increase} className="p-3 text-slate-500 hover:text-slate-800 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.status === 'Esgotado'}
                className="bg-[#9d6b73] text-white px-8 py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-[#85585f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm flex-grow md:flex-grow-0"
              >
                {product.status === 'Esgotado' ? 'Esgotado' : 'Adicionar'}
              </button>
            </div>

            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#9d6b73] w-max mb-10 transition-colors">
              <Heart size={18} /> ADICIONAR À LISTA DE INTERESSES
            </button>

            <div className="text-xs text-slate-400 pt-6 border-t border-slate-100 space-y-2 uppercase tracking-wide">
              <p>Categoria: <span className="text-slate-800 font-medium">{product.category || 'Não definida'}</span></p>
            </div>
          </div>
        </div>

        {/* Tabs (Descrição, Avaliações, Vídeo) */}
        <div className="flex flex-col items-center mb-20 w-full">
          <div className="flex items-center gap-8 border-b border-slate-200 w-full justify-center mb-8 flex-wrap">
            <button 
              onClick={() => setActiveTab('descricao')}
              className={`py-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${activeTab === 'descricao' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              O que inclui
              {activeTab === 'descricao' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#9d6b73]"></span>}
            </button>
            
            {product.youtubeVideoUrl && (
              <button 
                onClick={() => setActiveTab('video')}
                className={`py-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${activeTab === 'video' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Vídeo
                {activeTab === 'video' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#9d6b73]"></span>}
              </button>
            )}

            <button 
              onClick={() => setActiveTab('avaliacoes')}
              className={`py-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${activeTab === 'avaliacoes' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Avaliações ({reviewsCount})
              {activeTab === 'avaliacoes' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#9d6b73]"></span>}
            </button>
          </div>

          <div className="w-full text-center text-slate-600 leading-relaxed text-[11px] md:text-[13px] flex justify-center">
            {activeTab === 'descricao' && (
              <div className="text-left w-full max-w-3xl">
                {product.description ? (
                  <PortableText 
                    value={product.description} 
                    components={{
                      block: {
                        normal: ({children}) => <p className="mb-4 text-slate-600 leading-relaxed">{children}</p>,
                        h3: ({children}) => <h3 className="text-lg font-serif text-[#9d6b73] mb-3 mt-6">{children}</h3>,
                      },
                      list: {
                        bullet: ({children}) => <ul className="list-disc list-inside mb-4 text-slate-600 space-y-2">{children}</ul>,
                        number: ({children}) => <ol className="list-decimal list-inside mb-4 text-slate-600 space-y-2">{children}</ol>,
                      },
                      marks: {
                        strong: ({children}) => <strong className="font-bold text-slate-800">{children}</strong>,
                        em: ({children}) => <em className="italic text-[#9d6b73]">{children}</em>,
                      }
                    }}
                  />
                ) : (
                  <p className="text-center">Nenhuma descrição detalhada disponível.</p>
                )}
              </div>
            )}

            {activeTab === 'avaliacoes' && (
              <div className="w-full">
                {reviewsCount > 0 ? (
                  <TestimonialsSlider 
                    courseId={product._id}  
                    initialReviews={product.reviews} 
                  />
                ) : (
                  <p className="italic text-center max-w-3xl mx-auto">Ainda não existem avaliações para este produto.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}