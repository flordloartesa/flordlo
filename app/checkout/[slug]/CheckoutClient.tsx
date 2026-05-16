"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/app/context/CartContext"; // ✅ Importamos o teu carrinho

export default function CheckoutClient() {
  const { data: session } = useSession();
  const { cart, totalPrice, clearCart } = useCart(); // ✅ Obtemos os dados reais do evento
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // ✅ ESTADO PARA O FORMULÁRIO DE CONVIDADO
  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(" ")[0] || "",
    lastName: session?.user?.name?.split(" ")[1] || "",
    email: session?.user?.email || "",
    phone: "",
    nif: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("O carrinho está vazio!");

    setIsProcessing(true);

    try {
      // ✅ ENVIA PARA A TUA API DE TRANSFERÊNCIA (que criámos antes)
      const response = await fetch("/api/checkout/transferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          formData,
          total: totalPrice,
        }),
      });

      if (response.ok) {
        setIsProcessing(false);
        setShowModal(true);
        clearCart(); // Limpa o carrinho após sucesso
      } else {
        throw new Error("Erro ao processar o pedido");
      }
    } catch (err) {
      alert("Ocorreu um erro. Tenta novamente.");
      setIsProcessing(false);
    }
  };

  // Se o carrinho estiver vazio e não estivermos a mostrar o sucesso, avisamos o user
  if (cart.length === 0 && !showModal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <h2 className="text-xl font-bold mb-4">O teu carrinho está vazio</h2>
        <button onClick={() => router.push("/")} className="text-blue-600 underline">Voltar aos eventos</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex justify-center bg-gradient-to-br from-[#74A3F2] via-[#A89FE0] to-[#E3A8D2] relative font-sans py-10">
      
      {/* 🌟 MODAL DE SUCESSO */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#37374B]/80 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 className="text-2xl font-black text-[#37374B] mb-4">Pedido Recebido!</h2>
            <p className="text-gray-500 mb-8">Enviámos um e-mail para <strong>{formData.email}</strong> com os dados para o pagamento da reserva.</p>
            <button onClick={() => router.push("/")} className="w-full py-4 bg-[#3D81F1] text-white rounded-[15px] font-bold hover:bg-blue-600 transition-all">
              Voltar ao Início
            </button>
          </div>
        </div>
      )}

      {/* 🌟 CONTAINER CENTRAL */}
      <div className="w-full max-w-[600px] bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-8 md:p-12">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Finalizar Reserva</h1>
          <p className="text-sm text-gray-500 mb-8">Preenche os teus dados para receberes as informações de pagamento.</p>

          {/* LISTA DE PRODUTOS (DINÂMICA) */}
          <div className="space-y-4 mb-8">
            {cart.map((item) => (
              <div key={item._id} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Reserva de Vaga</p>
                  </div>
                </div>
                <span className="font-black text-gray-900">{item.price}€</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-8 px-2">
            <span className="text-gray-500 font-medium">Total a pagar hoje:</span>
            <span className="text-3xl font-black text-gray-900">{totalPrice}€</span>
          </div>

          {/* FORMULÁRIO DE DADOS DE FATURAÇÃO */}
          <form onSubmit={handleSubmitPedido} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Nome</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Apelido</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">E-mail para contacto</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Telemóvel</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">NIF (Opcional)</label>
                <input type="text" name="nif" value={formData.nif} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-5 bg-[#3D81F1] text-white rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessing ? "A processar..." : "Confirmar e Receber Dados"}
                {!isProcessing && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Pagamento via Transferência Bancária / MBWay</p>
            </div>
          </form>
        </div>

        {/* FOOTER DO CHECKOUT */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
           <p className="text-[11px] text-gray-500 leading-relaxed">
             Ao confirmar, concordas com os termos de reserva do evento. Receberás um e-mail com o IBAN e instruções para validar a tua vaga.
           </p>
        </div>
      </div>
    </main>
  );
}