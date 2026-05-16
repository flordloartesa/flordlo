import Image from 'next/image';

export default function FeaturesInfo({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <section className="w-full bg-slate-100 py-10 md:py-15 mt-5">
      <div className="max-w-[1100px] mx-auto px-4 md:px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
          
          {data.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-12 h-12 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mb-4 md:mb-4 shadow-sm p-2 md:p-2">
                <div className="relative w-full h-full">
                  <Image 
                    src={feature.iconUrl || '/placeholder.jpg'} 
                    alt={`Ícone ${index + 1}`} 
                    fill 
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-[11px] md:text-[12px] text-slate-900 leading-relaxed max-w-[280px]">
                {feature.text}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}