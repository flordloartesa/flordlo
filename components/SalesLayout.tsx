import Image from 'next/image';
import { PortableText } from "@portabletext/react";

export default function SalesLayout({ course }: { course: any }) {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-800">
      {/* 1. HERO SECTION */}
      <header
        className="relative pt-32 pb-24 px-4 text-center bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${course.imagemUrlExterna}')` }}
      >
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-gray-300 font-bold tracking-widest uppercase mb-6 text-sm md:text-base">
            {course.subtitulo}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-[#5E67FC] tracking-widest uppercase mb-10 drop-shadow-lg leading-tight">
            {course.titulo}
          </h1>
          <p className="text-white text-lg font-light tracking-wide">
            Led by <strong className="font-bold">{course.autor}</strong>
          </p>
        </div>
      </header>

      {/* 2. OVERVIEW & INFO */}
      <section className="py-20 px-4 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-700 mb-12">{course.titulo}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[300px] md:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl group">
              <a href={course.youtubeUrl} target="_blank" rel="noopener" className="block w-full h-full">
                <Image src={course.imagemUrlExterna} alt="Overview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
                     <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                   </div>
                </div>
              </a>
            </div>

            <div className="space-y-6 lg:pl-10">
              <div className="text-gray-600 leading-relaxed text-justify text-sm">
                <PortableText value={course.corpo} />
              </div>
              <ul className="space-y-4 mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <li className="flex items-center gap-4 text-gray-700 text-sm">
                  <span className="text-[#5E67FC]">●</span> {course.data}
                </li>
                <li className="flex items-center gap-4 text-gray-700 text-sm">
                   <span className="text-[#5E67FC]">●</span> Standard: {course.preco}€
                </li>
                <li className="flex items-center gap-4 text-gray-700 text-sm">
                   <span className="text-[#5E67FC]">●</span> {course.local}
                </li>
              </ul>
              <a href="#tickets" className="block w-full text-center bg-[#5E67FC] text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#4a54e1] transition-all">
                Ver Opções de Inscrição
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TICKETS & CHECKOUT */}
      <section id="tickets" className="bg-[#5E67FC] py-24 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-widest">Inscrição e Pagamento</h2>
            <p className="opacity-80 max-w-2xl mx-auto">
              Escolha a opção que melhor se adapta a si.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Early Bird */}
            <div className="bg-white rounded-3xl p-8 text-gray-800 flex flex-col shadow-xl border-4 border-yellow-400 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-xs font-bold py-1 px-4 rounded-full uppercase">Mais Popular</div>
              <h3 className="text-xl font-bold mb-2">Early-Bird</h3>
              <p className="text-gray-500 text-xs mb-6 italic">Até {course.dataLimiteEarlyBird}</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-[#5E67FC]">{course.precoEarlyBird}€</span>
              </div>
              <button className="w-full bg-[#5E67FC] text-white font-bold py-4 rounded-2xl">Add to Cart</button>
            </div>

            {/* Standard */}
            <div className="bg-white rounded-3xl p-8 text-gray-800 flex flex-col shadow-lg">
              <h3 className="text-xl font-bold mb-2">Standard</h3>
              <div className="mb-8">
                <span className="text-4xl font-black">{course.preco}€</span>
              </div>
              <button className="w-full border-2 border-[#5E67FC] text-[#5E67FC] font-bold py-4 rounded-2xl">Add to Cart</button>
            </div>

            {/* Reserva */}
            <div className="bg-indigo-900/40 rounded-3xl p-8 text-white flex flex-col border border-white/20">
              <h3 className="text-xl font-bold mb-2">Sinal / Reserva</h3>
              <div className="mb-8">
                <span className="text-4xl font-black">{course.precoReserva}€</span>
              </div>
              <button className="w-full bg-white text-[#5E67FC] font-bold py-4 rounded-2xl">Reserva Agora</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}