import Image from 'next/image';
import Link from '@/components/MyLink';

export default function HeroSpecialties() {
  return (
    <section className="relative bg-[#fcf5e7] py-20 lg:py-32 overflow-hidden">
      {/* Elementos Decorativos (Doodles) */}
      <div className="absolute top-10 left-10 w-24 h-24 opacity-60 lg:opacity-100">
        {/* Folha Verde */}
        <Image 
          src="https://cliniq.bold-themes.com/curves/wp-content/uploads/sites/4/2021/10/floating_image_home_02-01.png" 
          alt="decoração folha" 
          width={100} height={140}
          className="animate-pulse"
        />
      </div>
      
      <div className="absolute bottom-30 left-55 w-28 h-28 hidden lg:block">
        {/* Flor Amarela */}
        <Image 
          src="https://cliniq.bold-themes.com/curves/wp-content/uploads/sites/4/2021/10/floating_image_home_02-02.png" 
          alt="decoração flor" 
          width={530} height={560}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Lado Esquerdo: Montagem de Imagens */}
          <div className="w-full lg:w-1/2 relative">
            {/* Imagem Principal (Colagem de Terapias) */}
            <div className="relative z-10">
              <Image
                src="https://cliniq.bold-themes.com/curves/wp-content/uploads/sites/4/2021/08/hero_image_02.png"
                alt="Equipa e Pacientes"
                width={750}
                height={620}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
            
            {/* Decoração gotas azuis superior direito da imagem */}
            <div className="absolute -top-10 right-10 lg:-right-4 z-0">
               <div className="flex gap-1 transform rotate-12">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-3 h-8 bg-[#175c62] opacity-80 rounded-full" />
                  ))}
               </div>
            </div>
          </div>

          {/* Lado Direito: Texto e CTA */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <h2 className="text-[#265ACC] text-4xl lg:text-6xl font-sans font-bold leading-tight">
              The right care for your journey to recovery
            </h2>
            
            <p className="text-[#175c62] italic text-lg lg:text-xl font-medium">
              Delivering world class mental healthcare
            </p>
            
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed max-w-xl">
              We offer highly-accessible mental health counseling services and programs 
              for individuals and families aimed at putting you on a path to wellness. 
              You deserve to live well, feel capable in the face of challenges, and 
              achieve your true potential. It starts here.
            </p>

            <div className="pt-4">
              <Link href="/about" 
                className="inline-block border-2 border-[#175c62] text-[#175c62] px-8 py-3 rounded-full font-bold hover:bg-[#175c62] hover:text-white transition-all duration-300">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Curva de transição inferior (Wave) */}
      <div className="absolute bottom-0 left-0 w-full leading-[0]">
        <svg className="relative block w-full h-[50px] lg:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-white"></path>
        </svg>
      </div>
    </section>
  );
}