import Link from '@/components/MyLink';
import AuthButton from './AuthButton'; // <--- Importar o componente

export default function Navbar() {
  return (
    <nav className="w-full bg-white py-4 px-6 md:px-12 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        
        {/* Esquerda: Logo + Links Principais */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-1">
            {/* Simulação do Logo M */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-xl">M</div>
            <span className="font-bold text-lg text-[#37374B] tracking-tight">meditt.space</span>
          </Link>
          
          <div className="hidden lg:flex gap-6 text-sm font-bold text-[#37374B]">
            <Link href="#" className="hover:text-primary">Home</Link>
            <Link href="#" className="hover:text-primary">Meditate</Link>
            <Link href="#" className="hover:text-primary">Mini</Link>
            <Link href="#" className="hover:text-primary">Sleep</Link>
            <Link href="#" className="hover:text-primary">Radio</Link>
          </div>
        </div>

        {/* Direita: Links Secundários + CTA + LOGIN */}
        <div className="flex items-center gap-6">
          <div className="hidden xl:flex gap-6 text-sm font-bold text-[#37374B]">
            <Link href="#" className="hover:text-primary">Community</Link>
            <Link href="#" className="hover:text-primary">For Work</Link>
          </div>
          
          <button className="bg-[#3D81F1] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition">
            Use Mobile App
          </button>
          
          {/* AQUI ESTÁ A INTEGRAÇÃO */}
          {/* O botão antigo foi removido e substituído por este componente inteligente */}
          <AuthButton />

        </div>
      </div>
    </nav>
  );
}