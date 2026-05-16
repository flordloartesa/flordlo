interface SessionCardProps {
  data: {
    title: string;
    instructor?: string;
    category?: string;
    duration?: string;
    image: string;
    type?: 'MUSIC' | 'MEDITATION'; // Para mostrar ícones diferentes se necessário
  }
}

export default function SessionCard({ data }: SessionCardProps) {
  return (
    <div className="min-w-[160px] md:min-w-[220px] cursor-pointer group snap-start">
      {/* Container da Imagem com efeito de hover suave */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 bg-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md">
        <img 
          src={data.image} 
          alt={data.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay opcional para play button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
           {/* Ícone de Play apareceria aqui */}
        </div>
      </div>

      {/* Informações de Texto */}
      <div className="flex flex-col gap-1">
        {data.instructor && (
          <p className="text-[11px] md:text-xs text-greyLight uppercase font-bold tracking-wider">
            {data.instructor}
          </p>
        )}
        <h3 className="text-sm md:text-base font-bold text-greyDark leading-tight line-clamp-2">
          {data.title}
        </h3>
        <p className="text-[11px] text-greyLight font-medium">
          {data.category} {data.duration && `· ${data.duration}`}
        </p>
      </div>
    </div>
  );
}