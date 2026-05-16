// app/sonoridades-relaxantes/page.tsx

import { getCenariosRelaxantes } from '@/app/lib/sanity';
import CenariosClient from './CenariosClient';
import { Music } from 'lucide-react';

// Força o Next.js a atualizar os dados desta página e não ficar com cache eterna
export const revalidate = 60; 

export default async function SonoridadesRelaxantesPage() {
  // Vai buscar a lista de cenários ao teu Sanity
  const cenarios = await getCenariosRelaxantes();

  return (
    <main className="min-h-screen bg-[#2A3B69] text-white pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
  {/* Cabeçalho da Página */}
        <div className="mb-12 md:mb-16 flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3 text-[#2DD4BF] mb-4">
            <Music size={24} />
            <span className="text-sm font-bold tracking-widest uppercase">Santuário</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
            Sonoridades Relaxantes
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Escolhe um ambiente, ajusta o volume e deixa-te levar. Ideal para momentos
            de foco profundo, meditação ou apenas para abafar o ruído do mundo.
          </p>
        </div>

        {/* Chamada do Componente Interativo */}
        <CenariosClient cenarios={cenarios} />
        
      </div>
    </main>
  );
}