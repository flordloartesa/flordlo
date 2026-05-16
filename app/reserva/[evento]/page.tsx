"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from '@/components/MyLink';

// --- CONFIGURAÇÃO DOS EVENTOS ---
// Certifica-te que estas chaves correspondem ao que puseste no RegistrationForm
const eventData: Record<string, { title: string; price: number; subtitle?: string }> = {
  
  "mbsr-8-semanas": {
    title: "MBSR - 8 Semanas",
    subtitle: "Redução de Stress e Ansiedade",
    price: 75.00,
  },

  "retiro-mindfulness-yoga": {
    title: "Retiro Mindfulness & Yoga",
    subtitle: "Um fim-de-semana de imersão",
    price: 80.00,
  },
  

  "5-Day-Mindfulness-and-Chi-Kung-Retreat": {
    title: "5-Day Mindful Heart: Mindfulness and Chi-Kung Retreat",
    subtitle: "Ways to calm the body and the mind",
    price: 160.00,
  },

"2-Day-Mindfulness-and-Chi-Kung-Retreat": {
    title: "2-Day Mindful Heart: Mindfulness and Chi-Kung Retreat",
    subtitle: "Ways to calm the body and the mind",
    price: 160.00,
  },


"Mindful-Eating-Workshop": {
    title: "Alimentação Consciente - pagamento total",
    subtitle: "Dia de Imersão de Mindfulness Aplicado à Alimentação ",
    price: 80.00,
  },

  // O "default" é usado para reservas genéricas (o valor de 80€ que tinhas antes)
  "default": {
    title: "Reserva de Evento",
    price: 160.00,
  }
};

export default function ReservaDinamicaPage() {
  const params = useParams();
  
  // Decodifica o URL para garantir que lemos bem o nome do evento
  const eventKey = typeof params.evento === 'string' ? decodeURIComponent(params.evento) : 'default';
  
  // Se não encontrar o evento na lista, usa o default
  const data = eventData[eventKey] || eventData["default"];

  // --- CORREÇÃO IMPORTANTE PARA O PAYPAL ---
  // Usamos useRef para guardar o preço atual. 
  // Isto garante que o botão lê o valor certo (ex: 80.00) sem erros.
  const priceRef = useRef(data.price);
  priceRef.current = data.price;

  useEffect(() => {

    // --- ADICIONA ESTA LINHA AQUI ---
    document.title = `Pagamento: ${data.title} - Meditt`; 
    // --------------------------------

    
    // 1. Limpar botões antigos para não duplicar
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    const scriptId = "paypal-sdk";
    
    // 2. Carregar o Script do PayPal se ainda não existir
    if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        // Substitui pelo teu Client-ID de produção quando estiveres pronto
        script.src = "https://www.paypal.com/sdk/js?client-id=AT-GlMkUCOq8zR8j9rkWPCV3wgKzPFnZfN6cW00YTDjEF88XFbsQ-awmsijhIFm2RlL3sbX0hR6mp-Z7&enable-funding=venmo&currency=EUR";
        script.async = true;
        document.body.appendChild(script);
        script.onload = renderButton;
    } else {
        // Se já existir, renderiza o botão com um pequeno atraso
        setTimeout(renderButton, 500);
    }

    function renderButton() {
      // @ts-ignore
      if (window.paypal) {
        // @ts-ignore
        window.paypal.Buttons({
          style: { shape: 'pill', color: 'blue', layout: 'vertical', label: 'paypal' },
          
          createOrder: function(data: any, actions: any) {
            // --- AQUI ESTÁ A CORREÇÃO DO ERRO 400 ---
            // O PayPal exige o valor como TEXTO (String) e com 2 casas decimais.
            // Exemplo: 80 torna-se "80.00"
            const valorFormatado = priceRef.current.toFixed(2);
            
            console.log("A processar pagamento de:", valorFormatado, "EUR");

            return actions.order.create({
              purchase_units: [{
                description: "Reserva Meditt",
                amount: {
                  currency_code: "EUR",
                  value: valorFormatado // Agora enviamos a String correta
                }
              }] 
            });
          },
          
          onApprove: function(data: any, actions: any) {
            return actions.order.capture().then(function(orderData: any) {
              console.log('Capture result', orderData);
              const element = document.getElementById('paypal-button-container');
              if(element) {
                element.innerHTML = `
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200 animate-fade-in-up">
                    <div className="text-green-500 text-5xl mb-2">✓</div>
                    <h3 className="text-2xl text-green-700 font-bold mb-2">Pagamento Confirmado!</h3>
                    <p className="text-gray-600">A sua inscrição está finalizada.</p>
                  </div>
                `;
              }
            });
          },
          
          onError: function(err: any) {
            console.error("Erro PayPal:", err);
            alert("Ocorreu um erro técnico no PayPal. Por favor tente novamente.");
          }
        }).render('#paypal-button-container');
      }
    }
  }, [eventKey]); // Recarrega o botão se o evento mudar

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* ============================================================== */}
      {/* COLUNA DA ESQUERDA - IMAGEM ORIGINAL "EXCESSO DE PENSAMENTOS"  */}
      {/* ============================================================== */}
      <div className="w-full md:w-1/2 relative bg-gray-100 min-h-[400px] md:min-h-screen overflow-hidden">
        
        {/* Imagem de Fundo Fixa */}
        <div 
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529528744093-6f8abeee511d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2340&q=80')" }}
        >
            <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Conteúdo sobre a imagem */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white p-8 mt-[-40px] md:mt-0">
            <h3 className="text-lg md:text-xl font-medium tracking-wide mb-1 drop-shadow-md">Meditação Guiada . 12m</h3>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8 drop-shadow-lg">Excesso de<br/>Pensamentos?</h1>
            
            <a 
                href="https://app.meditt.space/a/mindfulness-curso-de-introducao-o/" 
                target="_blank"
                className="px-8 py-3 rounded-full border-2 border-[#00A9E0] text-white font-medium uppercase tracking-widest text-xs hover:bg-[#00A9E0] hover:border-transparent transition-all duration-300 shadow-lg"
            >
                Iniciar
            </a>
        </div>
        
        {/* Logo Footer da Coluna Esquerda */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center p-0 md:p-8">
             <div className="bg-white/95 backdrop-blur-md py-3 px-8 rounded-t-2xl md:rounded-full flex items-center justify-center space-x-3 shadow-xl w-full md:w-auto">
                <img src="https://meditt.space/img/logos/logomeditt-finalgd-thegreat-bold.png" alt="Meditt Logo" className="h-7 object-contain" />
                <span className="text-xs text-gray-800 font-bold leading-tight pt-1">meditt.space</span>
                <img src="https://meditt.space/img/logos/android-phone.png" alt="App Icon" className="h-5 object-contain opacity-80 pl-2" />
             </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* COLUNA DIREITA (PREÇO DINÂMICO & PAYPAL) */}
      {/* ============================================================== */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 md:p-16 text-center relative z-20 rounded-t-3xl md:rounded-none mt-[-20px] md:mt-0 shadow-[0_-5px_25px_rgba(0,0,0,0.1)] md:shadow-none">
        <div className="max-w-md w-full animate-fade-in-up">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">Confirmar Inscrição</h2>
                {data.subtitle && <p className="text-gray-500 mb-4">{data.title}</p>}
                
                {/* Mostra o preço com 2 casas decimais no ecrã (ex: €80.00) */}
                <div className="text-6xl font-extrabold text-[#009CDE] my-6">€{data.price.toFixed(2)}</div>
                
                <div className="h-1 w-16 bg-gray-100 mx-auto mb-6 rounded-full"></div>
                <p className="text-sm text-gray-500">
                    Valor de reserva para garantir a sua vaga.<br/>
                    A inscrição só é válida após este pagamento.
                </p>
            </div>

            {/* Contentor do Botão PayPal */}
            <div id="paypal-button-container" className="w-full min-h-[150px] flex justify-center z-0"></div>

            <div className="mt-8">
                <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">
                    Voltar à página inicial
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}