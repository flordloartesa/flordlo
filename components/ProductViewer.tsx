"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext'; 
import ShopCard from './ShopCard'; 

export default function ProductViewer({ product, relatedProducts }: { product: any, relatedProducts?: any[] }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const initialSizeObj = product.sizes?.[0] || null;
  const initialColorObj = product.colors?.find((c: any) => c.inStock) || product.colors?.[0] || null;

  const [mainImage, setMainImage] = useState(product.images?.[0]?.url || '/images/placeholder.jpg');
  const [selectedColor, setSelectedColor] = useState(initialColorObj?.name || "");
  const [selectedSizeObj, setSelectedSizeObj] = useState(initialSizeObj);
  
  const [activeTab, setActiveTab] = useState("descricao");

  const buttonGradient = "bg-gradient-to-r from-[#3D81F1] to-[#204AC8] hover:from-[#3572D9] hover:to-[#1A3BA3]";

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
      weight: (selectedSizeObj.weight || 0) / 1000, 
      _type: product._type || 'physicalProduct'
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const displayPrice = selectedSizeObj?.discountPrice || selectedSizeObj?.price || 0;
  const hasDiscount = selectedSizeObj?.discountPrice && selectedSizeObj.discountPrice < selectedSizeObj.price;

  return (
    <div className="w-full font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* GALERIA */}
        <div className="w-full lg:w-[55%] flex flex-col-reverse md:flex-row gap-4 h-full">
          {product.images?.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide md:w-[80px] shrink-0">
              {product.images.map((img: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img.url)}
                  className={`relative w-[80px] h-[80px] md:w-full md:aspect-square bg-[#f0f0f0] rounded-xl transition-all overflow-hidden shrink-0
                    ${mainImage === img.url ? 'ring-2 ring-gray-400 ring-offset-2' : 'opacity-60 hover:opacity-100'}
                  `}
                >
                  <Image src={img.url} alt={`Miniatura ${idx + 1}`} fill unoptimized className="object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}

          <div className="relative w-full aspect-square md:aspect-[4/5] bg-[#f0f0f0] overflow-hidden group rounded-[25px] flex-grow">
            <Image 
              src={mainImage} 
              alt={product.title} 
              fill 
              className="object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
              unoptimized 
            />
          </div>
        </div>

        {/* INFORMAÇÕES */}
        <div className="w-full lg:w-[45%] flex flex-col pt-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 block font-bold">
            INÍCIO / {product.category || "LOJA"}
          </div>
          <h1 className="text-3xl md:text-5xl text-gray-900 leading-tight mb-8 tracking-tight">
            {product.title}
          </h1>
          <div className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
            {displayPrice.toFixed(2)}€
            {hasDiscount && (
              <span className="line-through text-gray-400 text-base ml-4">
                {selectedSizeObj?.price.toFixed(2)}€
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm md:text-base font-normal mb-10 leading-relaxed max-w-md">
            {product.description}
          </p>

          {/* CORES */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="text-[11px] font-bold text-gray-800 uppercase tracking-widest block mb-3">
                COR / COLOR: <span className="text-gray-900 ml-2">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color: any, idx: number) => (
                  <button 
                    key={idx} 
                    title={color.name}
                    disabled={!color.inStock}
                    onClick={() => handleColorChange(color.name)}
                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center
                      ${!color.inStock ? 'opacity-20 cursor-not-allowed' : 
                        selectedColor === color.name ? 'ring-2 ring-gray-400 ring-offset-4 scale-110' : 'hover:scale-110'}
                    `}
                    style={{ backgroundColor: color.hexCode || '#cccccc' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAMANHOS */}
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
                    className={`px-6 py-3 border text-[11px] rounded-[25px] uppercase tracking-widest transition-colors cursor-pointer font-bold
                      ${selectedSizeObj?.name === sizeObj.name 
                        ? 'border-gray-500 bg-gray-500 text-white' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'}
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
              className={`w-full max-w-[400px] py-4 text-[12px] font-bold uppercase tracking-[0.2em] rounded-[25px] transition-all flex items-center justify-center gap-2 shadow-md
                ${!product.isAvailable 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : isAdded 
                    ? 'bg-green-600 text-white' 
                    : `${buttonGradient} text-white`}
              `}
            >
              {isAdded ? 'Adicionado ✓' : product.isAvailable ? 'Adicionar ao Carrinho' : 'Esgotado'}
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-24 pt-10 flex flex-col items-center border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 border-b border-gray-200 w-full mb-8">
          <button onClick={() => setActiveTab('descricao')} className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-all ${activeTab === 'descricao' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Descrição</button>
          <button onClick={() => setActiveTab('informacao')} className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-all ${activeTab === 'informacao' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Informação Adicional</button>
        </div>
        
        <div className={`w-full max-w-2xl text-[14px] text-gray-600 leading-relaxed pb-10`}>
          {activeTab === 'descricao' && <div className="animate-[fadeIn_0.3s_ease-in-out] text-center">{product.description || "Descrição indisponível."}</div>}
          
          {activeTab === 'informacao' && (
            <div className="animate-[fadeIn_0.3s_ease-in-out] flex justify-center">
              {product.details?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">{product.details.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
              ) : <p>Sem info adicional.</p>}
            </div>
          )}
        </div>
      </div>

      {/* PRODUTOS RELACIONADOS - AQUI FOI ADICIONADO O _type */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-20 pt-20 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center tracking-tight">Poderá também gostar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {relatedProducts.map((item: any) => (
              <ShopCard 
                key={item._id} 
                {...item} 
                _type="physicalProduct" 
                isPurchased={false} 
                buttonText="Ver Opções" 
                courseUrl={`/mindful-store/produto/${item.slug}`} 
                hideInstructor={true} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}