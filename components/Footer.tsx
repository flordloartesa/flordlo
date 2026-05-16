import Link from '@/components/MyLink';
import { Facebook, Instagram, Youtube } from 'lucide-react';

// Tipagem básica para os links que vêm do Sanity
interface FooterLink {
  label: string;
  href: string;
}

export default function Footer({ footerData }: { footerData: any }) {
  // Fallbacks de segurança caso o Sanity ainda não tenha dados
  const {
    blogLinks = [],
    acercaLinks = [],
    suporteLinks = [],
    socialFacebook = "",
    socialInstagram = "",
    socialX = "",
    socialYoutube = "",
    copyrightText = "© flordlo.pt - Todos os direitos reservados.",
    termosHref = "/termos-e-condicoes",
    privacidadeHref = "/politica-de-privacidade",
    livroReclamacoesUrl = "https://www.livroreclamacoes.pt/",
    livroReclamacoesImgUrl = "",
    extraLogo1Url = "",
    extraLogo1ImgUrl = "",
    extraLogo2Url = "",
    extraLogo2ImgUrl = "",
    extraLogo3Url = "",
    extraLogo3ImgUrl = "",
    extraLogo4Url = "",
    extraLogo4ImgUrl = ""
  } = footerData || {};

  return (
    <footer className="bg-[#C47F8C] pt-16 pb-8 border-t border-gray-100 text-[#ffffff]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* AS 4 COLUNAS DE TEXTO E REDES SOCIAIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Coluna 1: Blog */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm mb-1">Atendimento</h4>
            {blogLinks.map((link: FooterLink, i: number) => (
              <Link key={i} href={link.href || "#"} className="text-xs text-[#ffffff] hover:text-[yellow] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Coluna 2: Acerca */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm mb-1">Acerca</h4>
            {acercaLinks.map((link: FooterLink, i: number) => (
              <Link key={i} href={link.href || "#"} className="text-xs text-[#ffffff] hover:text-[yellow] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Coluna 3: Suporte */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm mb-1">Suporte</h4>
            {suporteLinks.map((link: FooterLink, i: number) => (
              <Link key={i} href={link.href || "#"} className="text-xs text-[#ffffff] hover:text-[yellow] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Coluna 4: Social */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm mb-1">Segue-nos</h4>
            <div className="grid grid-cols-2 md:flex gap-3 w-fit">
              {socialFacebook && (
                <Link href={socialFacebook} target="_blank" className="w-11 h-11 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#64748b] hover:text-[#3D81F1] transition-all">
                  <Facebook size={20} strokeWidth={1.5} />
                </Link>
              )}
              {socialInstagram && (
                <Link href={socialInstagram} target="_blank" className="w-11 h-11 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#64748b] hover:text-[#3D81F1] transition-all">
                  <Instagram size={20} strokeWidth={1.5} />
                </Link>
              )}
              {socialX && (
                <Link href={socialX} target="_blank" className="w-11 h-11 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#64748b] hover:text-[#3D81F1] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
                  </svg>
                </Link>
              )}
              {socialYoutube && (
                <Link href={socialYoutube} target="_blank" className="w-11 h-11 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#64748b] hover:text-[#3D81F1] transition-all">
                  <Youtube size={20} strokeWidth={1.5} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 👇 LINHA CONTÍNUA DE SELOS E PARCEIROS 👇 */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pb-8">
          
          {/* Livro de Reclamações */}
          {livroReclamacoesUrl && (
            <Link href={livroReclamacoesUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
              {livroReclamacoesImgUrl ? (
                <img 
                  src={livroReclamacoesImgUrl} 
                  alt="Livro de Reclamações" 
                  className="h-8 md:h-10 w-auto object-contain  hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <span className="text-[10px] underline text-gray-400">Livro de Reclamações Eletrónico</span>
              )}
            </Link>
          )}

          {/* Imagem Extra 1 */}
          {extraLogo1ImgUrl && (
            <Link href={extraLogo1Url || "#"} target={extraLogo1Url ? "_blank" : "_self"} className={`block hover:opacity-80 transition-opacity ${!extraLogo1Url ? 'pointer-events-none' : ''}`}>
              <img src={extraLogo1ImgUrl} alt="Selo 1" className="h-8 md:h-10 w-auto object-contain  hover:grayscale-0 transition-all duration-300" />
            </Link>
          )}

          {/* Imagem Extra 2 */}
          {extraLogo2ImgUrl && (
            <Link href={extraLogo2Url || "#"} target={extraLogo2Url ? "_blank" : "_self"} className={`block hover:opacity-80 transition-opacity ${!extraLogo2Url ? 'pointer-events-none' : ''}`}>
              <img src={extraLogo2ImgUrl} alt="Selo 2" className="h-8 md:h-10 w-auto object-contain  hover:grayscale-0 transition-all duration-300" />
            </Link>
          )}

          {/* Imagem Extra 3 */}
          {extraLogo3ImgUrl && (
            <Link href={extraLogo3Url || "#"} target={extraLogo3Url ? "_blank" : "_self"} className={`block hover:opacity-80 transition-opacity ${!extraLogo3Url ? 'pointer-events-none' : ''}`}>
              <img src={extraLogo3ImgUrl} alt="Selo 3" className="h-8 md:h-10 w-auto object-contain  hover:grayscale-0 transition-all duration-300" />
            </Link>
          )}

          {/* 👇 CORRIGIDO AQUI: Imagem Extra 4 👇 */}
          {extraLogo4ImgUrl && (
            <Link href={extraLogo4Url || "#"} target={extraLogo4Url ? "_blank" : "_self"} className={`block hover:opacity-80 transition-opacity ${!extraLogo4Url ? 'pointer-events-none' : ''}`}>
              <img src={extraLogo4ImgUrl} alt="Selo 4" className="h-8 md:h-10 w-auto object-contain  hover:grayscale-0 transition-all duration-300" />
            </Link>
          )}

        </div>

        {/* Rodapé do Rodapé */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-50 text-[10px] text-[#ffffff]">
          <p>{copyrightText}</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href={termosHref} className="hover:text-[yellow] transition-colors">Termos e Condições</Link>
            <Link href={privacidadeHref} className="hover:text-[yellow] transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}