"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext'; 

export default function ProductViewer({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Estados Iniciais
  const initialSizeObj = product.sizes?.[0] || null;
  const initialColorObj = product.colors?.find((c: any) => c.inStock) || product.colors?.[0] || null;

  const [mainImage, setMainImage] = useState(product.images?.[0]?.url || '/images/placeholder.jpg');
  const [selectedColor, setSelectedColor] = useState(initialColorObj?.name || "");
  const [selectedSizeObj, setSelectedSizeObj] = useState(initialSizeObj);
  const [activeTab, setActiveTab] = useState("descricao");

  // 👇 NOVOS ESTADOS PARA AS REVIEWS
  const [rating, setRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    const colorIndex = product.colors?.findIndex((c: any) => c.name === colorName);
    if (colorIndex !== -1 && product.images?.[colorIndex]?.url) {
      setMainImage(product.images[colorIndex].url);
    }
  };

  const handleSizeChange = (sizeName: string) => {
    const newSizeObj = product.sizes?.find((s: any) => s.name === sizeName);
    if (newSizeObj) setSelectedSizeObj(newSizeObj);
  };

  const handleAddToCart = () => {
    if (!selectedSizeObj) return;

    const variantName = `${product.title} ${selectedColor ? `(${selectedColor})` : ''} - ${selectedSizeObj.name}`;
    const finalPrice = selectedSizeObj.discountPrice || selectedSizeObj.price;
    
    addToCart({
      _id: `${product._id}-${selectedSizeObj.name}-${selectedColor}`, 
      title: variantName,
      price: finalPrice,
      imageUrl: mainImage,
      slug: product.slug,
      weight: selectedSizeObj.weight || 0
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // 👇 FUNÇÃO PARA SUBMETER A REVIEW
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    
    // Aqui no futuro entrará a chamada à tua API do Sanity (ex: fetch('/api/reviews', {...}))
    // Simulamos um delay de envio:
    setTimeout(() => {
      setIsSubmittingReview(false);
      setReviewSubmitted(true);
      setReviewName("");
      setReviewText("");
      setRating(5);
    }, 1500);
  };

  const displayPrice = selectedSizeObj?.discountPrice || selectedSizeObj?.price || 0;
  const hasDiscount = selectedSizeObj?.discountPrice && selectedSizeObj.discountPrice < selectedSizeObj.price;

  return (
    <div className="w-full font-sans">
      
      {/* LINHA SUPERIOR: IMAGENS E INFORMAÇÃO */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        <div className="w-full lg:w-[55%] flex flex-col gap-6">
          <div className="relative w-full aspect-[4/5] bg-[#EEECE8] overflow-hidden group">
            <Image src={mainImage} alt={product.title} fill className="object-cover mix-blend-multiply transition-opacity duration-500 group-hover:scale-105" unoptimized />
          </div>
          
          {product.images?.length > 1 && (
            <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
              {product.images.map((img: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img.url)}
                  className={`relative w-full aspect-square bg-[#EEECE8] transition-all
                    ${mainImage === img.url ? 'ring-1 ring-[#1A1A1A] ring-offset-2' : 'opacity-60 hover:opacity-100'}
                  `}
                >
                  <Image src={img.url} alt={`Miniatura ${idx + 1}`} fill unoptimized className="object-cover p-1 mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-[45%] flex flex-col pt-4">
          <div className="text-[10px] text-[#888888] uppercase tracking-[0.2em] mb-4 block font-medium">
            INÍCIO / {product.category || "UPEKKHA"}
          </div>
          
          <h1 className="text-3xl md:text-5xl text-[#1A1A1A] leading-tight mb-8 font-serif font-light">
            {product.title}
          </h1>
          
          <div className="text-2xl md:text-3xl font-light text-[#1A1A1A] mb-8">
            {displayPrice.toFixed(2)}€
            {hasDiscount && (
              <span className="line-through text-[#888888] text-base ml-4">
                {selectedSizeObj?.price.toFixed(2)}€
              </span>
            )}
          </div>

          <p className="text-[#666666] text-sm md:text-base font-light mb-10 leading-relaxed max-w-md">
            {product.description}
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="text-[11px] font-bold text-gray-800 uppercase tracking-widest block mb-3">
                COR / COLOR: <span className="text-[#1A1A1A] ml-2">{selectedColor}</span>
              </label>
              
              <select 
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full max-w-[400px] border border-gray-200 p-3 text-[13px] text-gray-600 bg-white focus:outline-none focus:border-gray-400 cursor-pointer appearance-none mb-4"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
              >
                <option value="" disabled>Escolha uma opção</option>
                {product.colors.map((color: any, idx: number) => (
                  <option key={idx} value={color.name} disabled={!color.inStock}>
                    {color.name} {!color.inStock && "(Esgotado)"}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-3">
                {product.colors.map((color: any, idx: number) => (
                  <button 
                    key={idx} 
                    title={color.name}
                    disabled={!color.inStock}
                    onClick={() => handleColorChange(color.name)}
                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center
                      ${!color.inStock ? 'opacity-20 cursor-not-allowed' : 
                        selectedColor === color.name ? 'ring-1 ring-[#1A1A1A] ring-offset-4 scale-110' : 'hover:scale-110'}
                    `}
                    style={{ backgroundColor: color.hexCode || '#cccccc' }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-12">
              <label className="text-[11px] font-bold text-gray-800 uppercase tracking-widest block mb-3">
                TAMANHO / SIZE
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((sizeObj: any, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSizeChange(sizeObj.name)}
                    className={`px-6 py-3 border text-[11px] uppercase tracking-widest transition-colors cursor-pointer
                      ${selectedSizeObj?.name === sizeObj.name 
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' 
                        : 'border-[#E5E5E5] text-[#666666] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}
                    `}
                  >
                    {sizeObj.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-16">
            <button 
              onClick={handleAddToCart}
              disabled={!product.isAvailable || isAdded}
              className={`px-12 py-4 text-[11px] font-medium uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2
                ${!product.isAvailable 
                  ? 'bg-[#F5F5F5] text-[#A0A0A0] cursor-not-allowed' 
                  : isAdded 
                    ? 'bg-green-800 text-white border border-green-800' 
                    : 'bg-[#1A1A1A] text-white hover:bg-transparent hover:text-[#1A1A1A] border border-[#1A1A1A]'}
              `}
            >
              {isAdded ? 'Adicionado ✓' : product.isAvailable ? 'Adicionar ao Carrinho' : 'Esgotado'}
            </button>
          </div>
        </div>
      </div>

      {/* LINHA INFERIOR: TABS */}
      <div className="mt-24 pt-10 flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 border-b border-gray-200 w-full mb-8">
          <button onClick={() => setActiveTab('descricao')} className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-all ${activeTab === 'descricao' ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]' : 'text-gray-400 hover:text-gray-600'}`}>Descrição</button>
          <button onClick={() => setActiveTab('informacao')} className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-all ${activeTab === 'informacao' ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]' : 'text-gray-400 hover:text-gray-600'}`}>Informação Adicional</button>
          <button onClick={() => setActiveTab('avaliacoes')} className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-all ${activeTab === 'avaliacoes' ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]' : 'text-gray-400 hover:text-gray-600'}`}>
            Avaliações ({product.reviews?.filter((r:any) => r.approved).length || 0})
          </button>
        </div>
        
        <div className="w-full max-w-2xl text-[14px] text-gray-600 leading-relaxed pb-20">
          
          {/* TAB DESCRIÇÃO */}
          {activeTab === 'descricao' && <div className="animate-[fadeIn_0.3s_ease-in-out] text-center">{product.description || "Descrição indisponível."}</div>}
          
          {/* TAB INFORMAÇÃO */}
          {activeTab === 'informacao' && (
            <div className="animate-[fadeIn_0.3s_ease-in-out] flex justify-center">
              {product.details?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">{product.details.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
              ) : <p>Sem info adicional.</p>}
            </div>
          )}
          
          {/* 👇 TAB AVALIAÇÕES (Formulário Adicionado Aqui!) */}
          {activeTab === 'avaliacoes' && (
            <div className="animate-[fadeIn_0.3s_ease-in-out] w-full">
              
              {/* Lista de Avaliações Existentes (Aprovadas) */}
              <div className="mb-12">
                {product.reviews && product.reviews.filter((r:any) => r.approved).length > 0 ? (
                  <div className="space-y-8">
                    {product.reviews.filter((r:any) => r.approved).map((review: any, idx: number) => (
                      <div key={idx} className="border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          {/* Desenha as estrelas */}
                          <div className="flex text-[#1A1A1A]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            ))}
                          </div>
                          <span className="font-bold text-[#1A1A1A] ml-2">{review.name}</span>
                        </div>
                        <p className="text-[#666666] font-light">{review.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[#888888] font-light">Ainda não existem avaliações para este produto. Seja o primeiro a avaliar!</p>
                )}
              </div>

              {/* Formulário para Nova Avaliação */}
              {reviewSubmitted ? (
                <div className="bg-[#FAF9F6] p-8 text-center border border-gray-200">
                  <h4 className="text-[#1A1A1A] font-serif text-2xl mb-2">Obrigado!</h4>
                  <p className="text-[#666666] font-light">A sua avaliação foi enviada e aguarda aprovação antes de ser publicada.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="bg-[#FAF9F6] p-6 md:p-10 border border-gray-100">
                  <h3 className="font-serif text-2xl text-[#1A1A1A] mb-6 text-center">Deixe a sua Avaliação</h3>
                  
                  {/* Seletor de Estrelas */}
                  <div className="flex flex-col items-center mb-6">
                    <label className="text-[10px] uppercase tracking-widest text-[#888888] mb-3">Classificação</label>
                    <div className="flex gap-1 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          onClick={() => setRating(star)}
                          width="24" height="24" 
                          viewBox="0 0 24 24" 
                          fill={star <= rating ? "#1A1A1A" : "none"} 
                          stroke="#1A1A1A" 
                          strokeWidth="1.5"
                          className="transition-colors hover:fill-[#1A1A1A]"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#888888] mb-2 block">O seu Nome</label>
                      <input 
                        type="text" 
                        required 
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full p-3 border border-gray-200 bg-white focus:outline-none focus:border-[#1A1A1A] transition-colors"
                        placeholder="Como gostaria de ser identificado?"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#888888] mb-2 block">O seu Comentário</label>
                      <textarea 
                        required 
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full p-3 border border-gray-200 bg-white focus:outline-none focus:border-[#1A1A1A] transition-colors resize-none"
                        placeholder="Partilhe a sua experiência com este produto..."
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingReview}
                      className="mt-2 w-full py-4 bg-[#1A1A1A] text-white text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-[#333333] transition-colors disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'A enviar...' : 'Enviar Avaliação'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}