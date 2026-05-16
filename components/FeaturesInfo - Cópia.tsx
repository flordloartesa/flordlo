import Image from 'next/image';

const features = [
  {
    id: 1,
    icon: 'https://64.media.tumblr.com/71a12a436f94166dcb2a160e9fa0b64f/8f8b946509312fc4-19/s400x600/58b458f68b05f24af5b0f3b199a18c7277be9741.webp',
    text: 'A flor.d.ló é um projeto artístico e profissional, de cariz familiar, dedicado à arte floral',
  },
  {
    id: 2,
    icon: 'https://64.media.tumblr.com/d2ebe7e07669d7af092639ba09f9e456/8f8b946509312fc4-7a/s250x400/ee10b66a27445691b0f77f8d6865332cee727349.pnj',
    text: 'Decoração de eventos e/ou de espaços específicos, com especial vocação para a vertente nupcial.',
  },
  {
    id: 3,
    icon: 'https://64.media.tumblr.com/e64074b8290b5766635b5f772eaa528a/8f8b946509312fc4-28/s250x400/26d48346f7f5a2cf57877c6a6e11d52200b22eda.webp',
    text: 'Décadas de experiência e dedicação a trabalhar uma das mais belas expressões da natureza: as flores.',
  },
  {
    id: 4,
    icon: 'https://64.media.tumblr.com/7814ced17e1a82fbc7e61210e3f6c3a6/8f8b946509312fc4-bd/s250x400/9ac18c5ce7ad160060c659991fe7fcb59b526794.pnj',
    text: 'E sim, a flor.d.ló tem um segredo. Fala com elas, com as flores, dizem-lhes o quão bonitas são!',
  }
];

export default function FeaturesInfo() {
  return (
    <section className="w-full bg-slate-200 py-10 md:py-20 mt-5">
      {/* Container com a mesma largura do carrossel para alinhar perfeitamente */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* Grid: 2 colunas em mobile, 4 colunas a partir de tamanho médio (tablet/desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
          
          {features.map((feature) => (
            <div key={feature.id} className="flex flex-col items-center">
              
              {/* Círculo branco para o ícone */}
              <div className="w-20 h-20 md:w-22 md:h-22 bg-white rounded-full flex items-center justify-center mb-4 md:mb-4 shadow-sm p-4 md:p-4">
                <div className="relative w-full h-full">
                  <Image 
                    src={feature.icon} 
                    alt={`Ícone ${feature.id}`} 
                    fill 
                    className="object-contain"
                  />
                </div>
              </div>
              
              {/* Texto: text-xs em mobile para caber bem, text-base (normal) em desktop */}
              <p className="text-[11px] md:text-[14px] text-slate-900 leading-relaxed max-w-[280px]">
                {feature.text}
              </p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}