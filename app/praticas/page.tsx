// app/praticas/page.tsx
import { client } from '@/app/sanity/client';
import Link from '@/components/MyLink';

// Função auxiliar para garantir que as cores do Sanity funcionam nos cartões
const getHexColor = (colorValue: string | undefined, defaultHex: string) => {
  if (!colorValue) return defaultHex;
  const hexMatch = colorValue.match(/\[(#.*?)\]/);
  if (hexMatch) return hexMatch[1];
  return colorValue.startsWith('#') ? colorValue : defaultHex;
};

export default async function PraticasIndexPage() {
  // Query para buscar todas as práticas, ordenadas pela data de criação
  const query = `*[_type == "practice"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    duration,
    badgeText,
    colorBg,
    "instructorName": instructor->name
  }`;

  const praticas = await client.fetch(query);

  return (
    <div className="min-h-screen bg-white font-sans text-[#141313]">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        
        {/* Cabeçalho da Página */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Práticas de Meditação
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Explora a nossa coleção de meditações guiadas e exercícios de mindfulness para o teu bem-estar diário.
          </p>
        </header>

        {/* Grelha de Práticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {praticas.map((pratica: any) => {
            const cardBg = getHexColor(pratica.colorBg, '#F9F4F2');

            return (
              <Link 
                key={pratica._id} 
                href={`/praticas/${pratica.slug}`}
                className="group relative flex flex-col justify-between p-8 rounded-[40px] h-[320px] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                style={{ backgroundColor: cardBg }}
              >
                {/* Detalhe Decorativo (Círculo no canto para dar estilo) */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />

                <div className="relative z-10">
                  {/* Etiqueta (Sample, Prática Completa, etc) */}
                  <span className="inline-block px-4 py-1 bg-black/10 backdrop-blur-sm text-[#141313] text-xs font-bold rounded-full uppercase tracking-widest mb-6">
                    {pratica.badgeText || "Prática"}
                  </span>
                  
                  <h2 className="text-3xl font-bold leading-tight group-hover:text-black transition-colors">
                    {pratica.title}
                  </h2>
                  
                  {pratica.instructorName && (
                    <p className="text-sm font-medium opacity-70 mt-2">
                      com {pratica.instructorName}
                    </p>
                  )}
                </div>

                <div className="relative z-10 flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-black tracking-tighter opacity-40">Duração</span>
                    <span className="text-lg font-bold">{pratica.duration || "-- min"}</span>
                  </div>

                  {/* Botão de Play Visual */}
                  <div className="w-14 h-14 bg-[#141313] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24" className="ml-1">
                      <path d="M7 6.82v10.36c0 .8.88 1.28 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L8.54 5.98C7.88 5.54 7 6.02 7 6.82z" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Caso não existam práticas */}
        {praticas.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">Ainda não foram publicadas práticas.</p>
          </div>
        )}
      </div>
    </div>
  );
}