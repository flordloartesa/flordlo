import Link from '@/components/MyLink';
import type { Metadata } from "next";

// CONFIGURAÇÃO DE SEO
export const metadata: Metadata = {
  title: "Verifique o seu E-mail | flordlo",
  description: "Enviámos um link mágico para a sua caixa de entrada.",
};

export default function VerifyRequestPage() {
  // O teu logótipo
  const logoUrl = "https://64.media.tumblr.com/26da1fd05cccc7c62bbbadb99037f89c/38a7414419d108b1-79/s250x400/d8a9f56f8548fe59e279e8dab09983f33ff0c439.pnj";

  return (
    // Fundo do ecrã (Cinza muito claro)
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 sm:p-8">
      
      {/* O Cartão Branco Largo (Estilo da imagem) */}
      <div className="bg-white w-full max-w-3xl rounded-[1.0rem] p-12 md:p-20 text-center  overflow-hidden relative">
        
        {/* ✅ Logótipo 50% MAIOR (w-21 h-21 = 84px) */}
        <div className="flex justify-center mb-8 relative z-10">
          <img 
            src={logoUrl} 
            alt="flordlo Logo" 
            className="w-15 h-15 rounded-xl object-cover shadow-sm"
          />
        </div>

        {/* Título Principal */}
        <h1 className="text-2xl md:text-[28px] font-extrabold text-[#111827] mb-6 tracking-tight relative z-10">
          Verifique o seu e-mail
        </h1>

        {/* Texto do Corpo */}
        <div className="text-[#4B5563] text-[15px] md:text-base leading-relaxed mb-10 relative z-10">
          <p>
            Enviámos um <strong>Link Mágico</strong> para a sua caixa de entrada.
          </p>
          <p>
            Clique no link para entrar automaticamente com toda a segurança.
          </p>
        </div>

        {/* Botão Azul (Formato Pílula) */}
        <div className="mb-14 relative z-10">
          <Link 
            href="/auth/signin" 
            className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[13px] font-bold tracking-wider uppercase px-10 py-3.5 rounded-full shadow-md transition-transform hover:-translate-y-0.5"
          >
            Voltar para o Login
          </Link>
        </div>

        {/* Texto de Rodapé (Aviso de Spam) */}
        <div className="text-[#9CA3AF] text-[13px] leading-relaxed relative z-10">
          <p>
            Não encontra o e-mail? Não se esqueça de verificar a pasta de <br className="hidden md:block"/> 
            Spam ou Lixo Eletrónico.
          </p>
        </div>

      </div>
    </div>
  );
}