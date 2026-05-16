import Image from 'next/image';
import Link from '@/components/MyLink';
import { eventos } from '@/data/eventos'; 

export default function ListaEventos() {
  return (
    <section className="bg-[#fafafa] py-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Título da Secção */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-[#005C65] tracking-widest uppercase mb-4">
            Em destaque
          </h1>
          <div className="w-24 h-1 bg-[#C9A555] mx-auto rounded-full"></div>
        </div>
        
        {/* Grelha de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {eventos.map((evento) => {
            // ✅ CRIAR O OBJETO DE DADOS ESTRUTURADOS PARA O GOOGLE
            const eventSchema = {
              "@context": "https://schema.org",
              "@type": "Event",
              "name": evento.titulo,
              "description": evento.descricao || `Evento de Mindfulness: ${evento.titulo}`, // Resolve campo "description"
              "image": evento.imagem,
              "startDate": evento.startDateISO || "2026-01-01T09:00", // Substitui pelo campo real ISO do teu data
              "endDate": evento.endDateISO || evento.startDateISO || "2026-01-01T18:00", // Resolve campo "endDate"
              "location": {
                "@type": "Place",
                "name": evento.local,
                "address": { // Resolve campo "address"
                  "@type": "PostalAddress",
                  "streetAddress": evento.morada || "Online / Ver detalhes",
                  "addressLocality": "Portugal",
                  "addressCountry": "PT"
                }
              },
              "organizer": {
                "@type": "Organization",
                "name": "Meditt",
                "url": "https://meditt.space" // Resolve campo "url" no organizer
              },
              "offers": { // Resolve campo "offers"
                "@type": "Offer",
                "url": `https://meditt.space${evento.link}`,
                "price": evento.preco,
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock",
                "validFrom": "2026-01-01"
              }
            };

            return (
              <div 
                key={evento.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border border-gray-100 group"
              >
                {/* ✅ INJETAR O SCHEMA NO HTML (Invisível para o utilizador, visível para o Google) */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
                />

                {/* Área da Imagem */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image 
                    src={evento.imagem} 
                    alt={evento.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 bg-[#5E67FC] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                    Novo
                  </div>
                </div>

                {/* Informação do Evento */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
                    {evento.titulo}
                  </h3>
                  <p className="text-[#00A9E0] font-medium mb-6">
                    {evento.autor}
                  </p>
                  
                  <div className="space-y-3 mb-8 flex-grow">
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-3 text-lg">📅</span> 
                      {evento.data}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-3 text-lg">📍</span> 
                      {evento.local}
                    </div>
                    <div className="flex items-center text-gray-800 font-bold text-sm">
                      <span className="mr-3 text-lg">💶</span> 
                      {evento.preco}€
                    </div>
                  </div>

                  {/* Botão */}
                  <Link 
                    href={evento.link} 
                    className="block w-full text-center bg-transparent border-2 border-[#005C65] text-[#005C65] hover:bg-[#005C65] hover:text-white py-3 px-6 rounded-full font-semibold transition-colors duration-300"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}