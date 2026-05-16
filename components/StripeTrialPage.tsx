"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
// 🟢 IMPORTAÇÃO DA SERVER ACTION
import { createPremiumSubscription } from "@/app/actions/stripe";

// DADOS DA TABELA DE BENEFÍCIOS (Atualizados)
const membershipFeatures = [
  { name: "Curso 'Amostra de Práticas' (7 Dias)", sub: "Acesso imediato durante o trial", cursoAvulso: true, premium: true },
  { name: "Acesso a TODOS os Cursos", sub: "Desbloqueado após os 7 dias", cursoAvulso: false, premium: true },
  { name: "Práticas de Mindfulness", sub: "Centenas de práticas avulsas", cursoAvulso: false, premium: true },
  { name: "Meditações Guiadas", sub: "Iniciante/Avançado, Ansiedade, Stress", cursoAvulso: false, premium: true },
  { name: "Novos conteúdos", sub: "Atualizações constantes", cursoAvulso: false, premium: true },
  { name: "Exercícios Respiratórios", cursoAvulso: false, premium: true },
  { name: "Dormir Melhor (Sleep)", cursoAvulso: false, premium: true },
];

export default function StripeTrialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // STATES DO CUPÃO
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" }); 
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // 🟢 STATE DA MODAL DE LOGIN
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 🟢 FUNÇÃO DE REDIRECIONAMENTO REAL PARA O STRIPE
  const handleStartTrial = async () => {
    // 1. Verifica se o user tem sessão iniciada
    if (!session) {
      setIsLoginModalOpen(true); // Abre a modal em vez de redirecionar logo
      return;
    }

    // 2. Só tranca o botão se ele realmente for para o Stripe
    setIsProcessing(true); 

    try {
      // 3. Chama a Server Action
      const response = await createPremiumSubscription();
      
      if (response && response.url) {
        // 4. Redireciona para o Stripe Checkout
        window.location.href = response.url;
      } else {
        throw new Error("URL de pagamento não recebida");
      }
    } catch (error) {
      console.error("Erro ao redirecionar para o Stripe:", error);
      alert("Erro ao ligar ao Stripe. Por favor, verifica as tuas chaves API ou tenta novamente.");
      setIsProcessing(false);
    }
  };

  // FUNÇÃO: Lidar com a validação do cupão
  const handleApplyCoupon = async () => {
    setCouponMessage({ type: "", text: "" });
    
    if (!couponCode.trim()) {
      setCouponMessage({ type: "error", text: "Por favor, insere um código." });
      return;
    }

    setIsValidatingCoupon(true);

    try {
      const response = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const textResponse = await response.text(); 

      try {
        const result = JSON.parse(textResponse);
        
        if (result.success) {
          setCouponMessage({ type: "success", text: result.message });
          setTimeout(() => setIsCouponModalOpen(false), 1500); 
        } else {
          setCouponMessage({ type: "error", text: result.message });
        }
      } catch (parseError) {
        console.error("Erro JSON:", textResponse);
        setCouponMessage({ 
          type: "error", 
          text: `Erro fatal no Servidor (Status: ${response.status}).` 
        });
      }

    } catch (error) {
       setCouponMessage({ type: "error", text: "Erro na ligação de rede." });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">A carregar...</div>;
  }

  const userEmail = session?.user?.email || "Inicia sessão para continuar";

  const renderFeaturesTable = () => (
    <div className="flex flex-col w-full">
      <h2 className="text-[26px] font-bold text-[#141313] text-center mb-2 leading-snug">
        O que está incluído no seu<br/>Acesso
      </h2>

      <p className="text-[12px] font-normal text-[#141313] text-center mb-10 leading-snug">
        No modo trial por 7 dias tem acesso a uma seleção especial de práticas. 
        Passado esse período, a biblioteca completa é desbloqueada.
      </p>

      <div className="flex justify-end mb-4 px-2">
        <div className="w-20 text-center text-[14px] font-bold text-[#37374B] leading-tight">Trial<br/>(7 Dias)</div>
        <div className="w-20 text-center text-[14px] font-bold text-[#CBA573] ml-6 leading-tight">Membro<br/>Premium</div>
      </div>

      {membershipFeatures.map((f, i) => (
        <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
          <div className="flex-1 pr-4">
            <div className="font-bold text-[#141313] text-[15px]">{f.name}</div>
            {f.sub && <div className="text-[12px] text-gray-500 font-medium mt-1">{f.sub}</div>}
          </div>
          <div className="flex items-center">
            <div className="w-20 flex justify-center">
              {f.cursoAvulso === true ? (
                <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
              ) : f.cursoAvulso === "Limitado" ? (
                <span className="text-[13px] text-gray-400 font-medium">Limitado</span>
              ) : (
                <span className="text-gray-300 font-bold">-</span>
              )}
            </div>

            <div className="w-20 flex justify-center ml-6">
              {f.premium && (
                <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-[#74A3F2] via-[#A89FE0] to-[#E3A8D2] relative font-sans lg:py-12">
      
      <style dangerouslySetInnerHTML={{ __html: `footer { display: none !important; }` }} />

      <div className="w-full max-w-[550px] bg-white min-h-screen lg:min-h-fit lg:rounded-[40px] px-6 py-10 md:px-12 flex flex-col relative z-10 shadow-2xl">
        
        {/* Account Info */}
        <div className="text-center text-[13px] text-[#4B5563] mb-10 font-medium">
          {userEmail} {session && <><span className="mx-1 text-gray-300">•</span><button onClick={() => router.push('/area-pessoal')} className="text-[#3D81F1] hover:underline font-bold">Mudar de Conta</button></>}
        </div>

        {/* Header Checkout */}
        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-[22px] font-black text-[#141313]">Checkout</h1>
          <span className="text-sm font-bold text-[#F59E0B]">1 item</span>
        </div>

        {/* Produto */}
        <div className="border border-gray-100 rounded-2xl p-4 flex gap-4 mb-6 shadow-sm">
          <div className="w-14 h-14 bg-[#3D81F1] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-[#141313] text-[15px]">Plano Premium + Trial</h3>
            <p className="text-[10px] text-[#3D81F1] font-black uppercase tracking-widest mt-0.5">7 DIAS DE ACESSO AO CURSO AMOSTRA</p>
          </div>
          <div className="text-right flex flex-col justify-center">
            <span className="text-gray-400 line-through text-[12px] font-semibold">99.00€</span>
            <span className="font-black text-[#141313] text-lg">0€</span>
          </div>
        </div>

        {/* Cupão */}
        <div className="text-center mb-8">
          <button 
            onClick={() => setIsCouponModalOpen(true)}
            className="text-[13px] text-[#4B5563] hover:text-[#141313] underline decoration-gray-300 font-medium"
          >
            Tens um Cupão / Cartão Presente?
          </button>
        </div>

        {/* MODAL DE CUPÃO */}
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#37374B]/60 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] p-8 md:p-10 max-w-[400px] w-full relative shadow-2xl animate-in zoom-in duration-200">
              <button 
                onClick={() => { setIsCouponModalOpen(false); setCouponMessage({ type: "", text: "" }); }}
                className="absolute top-5 right-5 w-7 h-7 bg-[#2D3142] text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <h2 className="text-[22px] font-bold text-[#141313] mb-6 mt-2">Aplicar um cupão</h2>
              <div className="mb-8">
                <label className="block text-[#141313] text-[15px] font-medium mb-1">Cupão</label>
                <input 
                  type="text" 
                  placeholder="Inserir cupão" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full text-[15px] text-[#141313] placeholder-gray-400 py-2 border-b border-gray-400 outline-none bg-transparent" 
                />
                {couponMessage.text && (
                    <p className={`mt-2 text-sm font-medium ${couponMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                        {couponMessage.text}
                    </p>
                )}
              </div>
              <button 
                onClick={handleApplyCoupon}
                disabled={isValidatingCoupon}
                className="w-full py-4 bg-gradient-to-r from-[#4B7CFF] to-[#665DFF] text-white rounded-full font-bold text-[16px] disabled:opacity-50"
              >
                {isValidatingCoupon ? "A validar..." : "Aplicar Cupão"}
              </button>
            </div>
          </div>
        )}

        {/* 🟢 MODAL DE LOGIN / REGISTO */}
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#37374B]/60 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] p-8 md:p-10 max-w-[400px] w-full relative shadow-2xl animate-in zoom-in duration-200 text-center">
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-5 right-5 w-7 h-7 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <div className="w-16 h-16 bg-blue-50 text-[#3D81F1] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>

              <h2 className="text-[22px] font-bold text-[#141313] mb-3">Quase lá!</h2>
              <p className="text-[14px] text-[#4B5563] mb-8 leading-relaxed font-medium">
                Para ativares o teu Trial e garantirmos que ficas com acesso aos conteúdos, precisas de iniciar sessão ou criar uma conta gratuita.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push('/login?callbackUrl=/checkout/trial')}
                  className="w-full py-4 bg-[#3D81F1] text-white rounded-full font-bold text-[16px] shadow-lg hover:bg-blue-600 transition-all active:scale-[0.98]"
                >
                  Iniciar Sessão / Registar
                </button>
                <button 
                  onClick={() => setIsLoginModalOpen(false)}
                  className="w-full py-3 text-slate-400 text-[14px] font-bold hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Totais */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-[17px] font-bold text-[#141313]">Total a pagar hoje</span>
          <span className="text-[22px] font-black text-[#141313]">0€</span>
        </div>

        {/* 🟢 BOTÃO DE PAGAMENTO SEGURO */}
        <button 
          onClick={handleStartTrial}
          disabled={isProcessing} 
          className="w-full py-5 bg-[#3D81F1] text-white rounded-full font-bold text-[18px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-[0_10px_20px_rgba(61,129,241,0.2)] active:scale-[0.98] mb-4 disabled:opacity-50"
        >
          {isProcessing ? (
            "A redirecionar..."
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              Avançar para Pagamento Seguro
            </>
          )}
        </button>

        {/* Info de Cobrança Pós-Trial */}
        <p className="text-center text-[12px] font-medium text-gray-400 mb-12 leading-relaxed">
          O Stripe pedirá os teus dados de pagamento para ativar o teste gratuito.<br/>
          Depois de 7 dias será cobrado <span className="font-bold text-[#141313]">99€/ano</span> e terás acesso a toda a biblioteca.<br/>
          Cancela em qualquer momento antes disso e não pagas nada.
        </p>

        {/* FAQs */}
        <div className="mt-auto">
          <h3 className="text-center font-bold text-[#141313] text-[15px] mb-6">Questões frequentes</h3>
          
          <div className="border-t border-gray-100 py-4">
            <button onClick={() => toggleFaq(1)} className="w-full flex justify-between items-center text-left focus:outline-none group">
              <span className="text-[13px] font-bold text-[#141313] group-hover:text-[#3D81F1] transition-colors pr-4"> Será cobrado algum valor se cancelar o meu período gratuito?</span>
              <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                <span className="text-[#3D81F1] text-lg leading-none">{openFaq === 1 ? '−' : '+'}</span>
              </div>
            </button>
            {openFaq === 1 && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                <p className="text-[12px] text-[#4B5563] leading-relaxed font-medium">
                  Pode cancelar o teste gratuito a qualquer momento durante o período de teste e não será cobrado.
                </p>
                <button onClick={() => router.push('/contacto')} className="mt-4 px-6 py-2 bg-[#3D81F1] text-white font-bold text-[12px] rounded-full">Contacta-nos</button>
              </div>
            )}
          </div>

          <div className="border-t border-b border-gray-100 py-4">
            <button onClick={() => toggleFaq(2)} className="w-full flex justify-between items-center text-left focus:outline-none group">
              <span className="text-[13px] font-bold text-[#141313] group-hover:text-[#3D81F1] transition-colors pr-4">Por que preciso fornecer meus dados de pagamento agora?</span>
              <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                <span className="text-[#3D81F1] text-lg leading-none">{openFaq === 2 ? '−' : '+'}</span>
              </div>
            </button>
            {openFaq === 2 && (
              <p className="mt-3 text-[12px] text-[#4B5563] leading-relaxed font-medium">
                Garante uma transição tranquila caso decidas continuar após os 7 dias. Não será cobrado nada agora.
              </p>
            )}
          </div>
        </div>

        {/* TABELA DE BENEFÍCIOS NO FUNDO */}
        <div className="mt-16 pt-12 border-t border-gray-100">
          {renderFeaturesTable()}
        </div>

      </div>
    </main>
  );
}