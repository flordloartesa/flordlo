import Image from "next/image";

interface Props {
  image: string;
  title: string;
  category: string;
  author: string;
  duration: string;
  slug?: string; // ✅ O "?" diz ao TypeScript: "Pode ter slug ou não"
}

export default function TrackRow({ image, title, category, author, duration, slug }: Props) {
  return (
    <div className="group flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-xl px-2 cursor-pointer">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        {/* Imagem com cantos arredondados */}
        <div className="relative h-16 w-16 min-w-[64px] rounded-xl overflow-hidden shadow-sm">
          <img src={image} alt={title} className="object-cover w-full h-full" />
        </div>
        
        {/* Informação Principal */}
        <div className="flex flex-col md:flex-row md:items-center md:flex-1 gap-1 md:gap-4">
          <h4 className="font-bold text-[#37374B] text-base md:text-lg flex-1">
            {title}
          </h4>
          
          <div className="flex items-center gap-3 text-xs md:text-sm text-[#737373] font-medium">
            <span className="hidden md:block uppercase tracking-wider text-[10px]">{category}</span>
            <span className="hidden md:block text-gray-300">•</span>
            <span>{author}</span>
            <span className="text-gray-300">•</span>
            <span className="uppercase">{duration}</span>
          </div>
        </div>
      </div>

      {/* Ícones de Ação */}
      <div className="flex items-center gap-3 pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4-4 4m4-4v13"></path></svg>
        </button>
        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>
      </div>
    </div>
  );
}