const CardGridComponent = ({ value }: any) => {
  if (!value?.cards) return null;

  // Verifica se é layout largo
  const isWide = value.layout === 'wide';

  return (
    <div 
      className={`
        flex flex-col gap-6 my-14 not-prose
        ${isWide 
          ? 'w-[95vw] max-w-[1600px] relative left-1/2 -translate-x-1/2' 
          : 'w-full'
        }
      `}
    > 
      {value.cards.map((card: any, index: number) => (
        <div 
          key={card._key || index} 
          className="relative w-full bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-center min-h-[200px]"
        >
          {/* NÚMERO GIGANTE: À ESQUERDA e POR BAIXO */}
          <span className="absolute left-[-20px] bottom-[-60px] text-[250px] md:text-[320px] font-black text-indigo-600/[0.03] select-none leading-none z-0 pointer-events-none">
            {index + 1}
          </span>

          {/* CONTEÚDO: 90% da largura */}
          <div className="relative z-10 max-w-[90%]">
            <h3 className="text-[20px] md:text-[24px] font-bold text-[#37374B] mb-3 leading-tight">
              {card.title}
            </h3>
            
            {/* TEXTO: 13px */}
            <p className="text-[13px] leading-[22px] text-[#47374B]/90 font-normal mb-5">
              {card.description}
            </p>
            
            {/* BOTÃO CONDICIONAL */}
            {card.buttonText && (
              <div className="mt-2">
                <a 
                  href={card.link || "#"} 
                  className="inline-flex items-center gap-2 text-[#3D81F1] font-bold text-[13px] hover:underline transition-all"
                >
                  {card.buttonText} 
                  <span className="text-lg">›</span>
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};