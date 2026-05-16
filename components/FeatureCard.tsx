interface Props {
  title: string;
  subtitle?: string; // Opcional, como "MEMBER EXCLUSIVE"
  image: string;
  bgColor?: string; // Para controlar o gradiente de fundo se necessário
  isProgram?: boolean; // Para distinguir o estilo dos programas
  sessions?: string; // "COURSE - 16 SESSIONS"
}

export default function FeatureCard({ title, subtitle, image, isProgram, sessions }: Props) {
  return (
    <div className="relative rounded-2xl overflow-hidden cursor-pointer group min-w-[300px] md:min-w-[48%] h-[240px] shadow-sm hover:shadow-md transition-shadow">
      {/* Imagem de Fundo */}
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {/* Overlay escuro subtil para garantir leitura */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Conteúdo */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        {subtitle && (
          <span className="text-[10px] font-bold tracking-widest uppercase mb-1 opacity-90">{subtitle}</span>
        )}
        <h3 className={`font-bold leading-tight ${isProgram ? 'text-2xl mb-1' : 'text-3xl mb-2'}`}>
          {title}
        </h3>
        {sessions && (
          <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-sm px-2 py-1 rounded inline-block w-fit mt-2">
            {sessions}
          </span>
        )}
      </div>
    </div>
  );
}