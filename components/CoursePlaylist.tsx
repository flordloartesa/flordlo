import Link from '@/components/MyLink';

interface Session {
  _id: string;
  title: string;
  slug: string;
  duration: string;
  courseLevel: 'nivel-1' | 'nivel-2' | 'nivel-3'; // Deve bater certo com o value do Sanity
  sessionNumber: number;
}

interface Props {
  currentSlug: string;
  allSessions: Session[];
}

export default function CoursePlaylist({ currentSlug, allSessions }: Props) {
  
  // Função para desenhar cada bloco de nível
  const renderLevelGroup = (levelValue: string, levelTitle: string, headerColor: string) => {
    // 1. Filtrar sessões deste nível
    const levelSessions = allSessions.filter(s => s.courseLevel === levelValue);
    
    // 2. Ordenar por número
    levelSessions.sort((a, b) => a.sessionNumber - b.sessionNumber);

    // Se não houver aulas neste nível, não mostra o bloco
    if (levelSessions.length === 0) return null;

    return (
      <div className="mb-6 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Cabeçalho do Nível */}
        <div className={`p-4 border-b border-gray-100 ${headerColor}`}>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[#37374B] text-sm uppercase tracking-wide">{levelTitle}</h3>
            <span className="text-[10px] font-bold bg-white/50 px-2 py-1 rounded text-gray-600">
              {levelSessions.length} Aulas
            </span>
          </div>
        </div>

        {/* Lista de Aulas */}
        <div className="bg-white max-h-[300px] overflow-y-auto custom-scrollbar">
          {levelSessions.map((session) => {
            const isActive = session.slug === currentSlug;
            
            return (
              <Link 
                key={session._id} 
                // --- ALTERAÇÃO AQUI: Adicionado o courseLevel ao URL ---
                href={`/cursos/introducao-mindfulness/${session.courseLevel}/${session.slug}`}
                className={`flex items-center gap-3 p-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors group ${isActive ? 'bg-blue-50/60' : ''}`}
              >
                {/* Ícone de Estado (Número ou Play) */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${isActive ? 'bg-[#3D81F1] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                  {isActive ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  ) : (
                    <span>{session.sessionNumber}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold truncate ${isActive ? 'text-[#3D81F1]' : 'text-[#37374B]'}`}>
                    {session.title}
                  </h4>
                  <p className="text-[9px] text-[#737373] uppercase tracking-wide">
                    {session.duration || "AUDIO"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {renderLevelGroup('nivel-1', 'Nível 1: Fundamentos', 'bg-blue-50')}
      {renderLevelGroup('nivel-2', 'Nível 2: Aprofundamento', 'bg-purple-50')}
      {renderLevelGroup('nivel-3', 'Nível 3: Consolidação', 'bg-emerald-50')}
    </div>
  );
}