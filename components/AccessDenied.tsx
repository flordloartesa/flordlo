import Link from '@/components/MyLink';
import Image from 'next/image';
import Navbar from './Navbar';
import Footer from './Footer';

interface Props {
  courseTitle: string;
  courseSlug: string;
  price: number;
  imageUrl: string;
}

export default function AccessDenied({ courseTitle, courseSlug, price, imageUrl }: Props) {
  return (
    <main className="min-h-screen bg-[#FCFCFC] flex flex-col">
      
      
      <div className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="max-w-[1000px] w-full bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 overflow-hidden flex flex-col md:flex-row">
          
          {/* Lado Esquerdo: Imagem do Curso com Overlay */}
          <div className="relative w-full md:w-5/12 h-[300px] md:h-auto bg-gray-100">
            <Image 
              src={imageUrl || '/images/placeholder.jpg'} 
              alt={courseTitle}
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#37374B]/80 to-transparent flex items-end p-8">
              <div className="text-white">
                <span className="text-xs font-bold uppercase tracking-widest bg-[#3D81F1] px-3 py-1 rounded-full mb-3 inline-block">
                  Conteúdo Premium
                </span>
                <h2 className="text-2xl font-bold leading-tight">{courseTitle}</h2>
              </div>
            </div>
          </div>

          {/* Lado Direito: Mensagem e Ação */}
          <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center text-center md:text-left">
            <div className="mb-6 inline-flex items-center justify-center md:justify-start gap-2 text-[#3D81F1] font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
              <span className="uppercase tracking-widest text-sm">Acesso Restrito</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-[#37374B] mb-4">
              Ainda não tens acesso a este programa.
            </h1>
            
            <p className="text-[#737373] text-lg mb-8 leading-relaxed">
              Este conteúdo é exclusivo para alunos inscritos. Se já compraste, verifica se fizeste login com o email correto ou aguarda a confirmação do pagamento.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Botão Principal Estilo Meditt */}
              <Link 
                href={`/mindful-store/${courseSlug}`}
                className="w-full sm:w-auto bg-[#3D81F1] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#2b6ad4] transition-all shadow-lg shadow-blue-200 text-center"
              >
                Garantir Acesso — {price}€
              </Link>

              {/* Link Secundário */}
              <Link 
                href="/mindful-store"
                className="text-[#37374B] font-bold hover:text-[#3D81F1] transition-colors"
              >
                Voltar à Loja
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-center md:justify-start gap-6 opacity-50">
                <img src="/images/payments/paypal.svg" alt="PayPal" className="h-5" />
                <img src="/images/payments/visa.svg" alt="Visa" className="h-5" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pagamento 100% Seguro</span>
            </div>
          </div>
        </div>
      </div>

      
    </main>
  );
}