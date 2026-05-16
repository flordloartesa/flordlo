import Link from '@/components/MyLink';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

// Adicionada a apiVersion para evitar warnings no terminal
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect('/'); 
  }

  // 1. Procurar os detalhes da compra no Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  // Vamos buscar apenas o primeiro nome para ficar mais amigável
  const customerName = session.customer_details?.name?.split(' ')[0] || "Cliente";
  // O código do checkout que fizemos guarda o orderNumber nos metadados!
  const orderNumber = session.metadata?.orderNumber || "";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[40px] p-12 shadow-xl border border-gray-100 text-center">
        
        {/* Ícone de Sucesso Visual */}
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-[#37374B] mb-4">
          Pagamento Confirmado! 🎉
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Olá <span className="font-bold">{customerName}</span>, muito obrigado pela tua encomenda! 
          {orderNumber && <span className="font-bold text-[#9d6b73]"> ({orderNumber})</span>} Os teus produtos já estão a ser preparados com todo o carinho.
        </p>

        <div className="bg-[#fcf7f8] p-6 rounded-3xl mb-10 text-left border border-[#f3e1e4]">
          <h3 className="font-bold text-[#9d6b73] mb-2 text-sm uppercase tracking-wider">Próximos passos:</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3 text-sm">
              <span className="bg-[#9d6b73] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
              Enviámos-te um e-mail com o recibo e os detalhes do teu pedido.
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="bg-[#9d6b73] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
              Vamos processar os teus artigos florais e notificar-te assim que a encomenda for expedida.
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="px-10 py-4 bg-[#9d6b73] text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-rose-200"
          >
            Continuar a Explorar
          </Link>
        </div>
      </div>
    </div>
  );
}