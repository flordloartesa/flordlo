import Link from '@/components/MyLink';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100 text-[#37374B]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Coluna 1 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm mb-1">Blog</h4>
            <Link href="/blog/mindfulness-em-que-consiste-como-praticar" className="text-xs text-[#737373] hover:text-primary">Fundamentos do Mindfulness</Link>
            <Link href="#" className="text-xs text-[#737373] hover:text-primary">Como Meditar</Link>
            <Link href="#" className="text-xs text-[#737373] hover:text-primary">O Que é a Meditação?</Link>
          </div>

          {/* Coluna 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm mb-1">Acerca</h4>
            <Link href="#" className="text-xs text-[#737373] hover:text-primary">A Nossa História</Link>
            {/*<Link href="#" className="text-xs text-[#737373] hover:text-primary">Jobs</Link>*/}
            <Link href="#" className="text-xs text-[#737373] hover:text-primary">Parcerias</Link>
          </div>

          {/* Coluna 3 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm mb-1">Suporte</h4>
            <Link href="#" className="text-xs text-[#737373] hover:text-primary">Contacta-nos</Link>
            <Link href="#" className="text-xs text-[#737373] hover:text-primary">FAQs</Link>
            {/*<Link href="#" className="text-xs text-[#737373] hover:text-primary">Help Center</Link>*/}
          </div>

        {/* Coluna 4 (Social) */}
<div className="flex flex-col gap-3">
  <h4 className="font-bold text-sm mb-1">Segue-nos</h4>
  
  {/* Container ajustado: Grid com 2 colunas no mobile, Flex no desktop */}
  <div className="grid grid-cols-2 md:flex gap-3 w-fit">
    
    {/* Facebook */}
    <Link 
      href="https://www.facebook.com/meditt.mi" 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-11 h-11 shrink-0 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#005C65] transition-all"
      aria-label="Facebook"
    >
      <Facebook strokeWidth={1.5} size={20} />
    </Link>

    {/* Instagram */}
    <Link 
      href="https://www.instagram.com/vitor_bertocchini/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-11 h-11 shrink-0 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#005C65] transition-all"
      aria-label="Instagram"
    >
      <Instagram strokeWidth={1.5} size={20} />
    </Link>

    {/* X (Twitter) */}
    <Link 
      href="https://x.com/Mindfulness_pt" 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-11 h-11 shrink-0 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#005C65] transition-all"
      aria-label="X (Twitter)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
      </svg>
    </Link>

    {/* YouTube */}
    <Link 
      href="https://www.youtube.com/@medittspace" 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-11 h-11 shrink-0 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#005C65] transition-all"
      aria-label="YouTube"
    >
      <Youtube strokeWidth={1.5} size={20} />
    </Link>

  </div>
</div>
        </div>

        {/* Rodapé do Rodapé */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-50 text-[10px] text-[#737373]">
          <p>© meditt.space - Todos os direitos reservados.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="#" className="hover:text-primary">Termos e Condições</Link>
            <Link href="/politica-de-privacidade" className="hover:text-primary">Política de Privacidade</Link>
          </div>
        </div>
      </div>

      
    </footer>
  );
}