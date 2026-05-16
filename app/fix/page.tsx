"use client";
import { useState } from "react";
import { client } from "@/app/sanity/client"; // Confirma se este é o teu caminho para o cliente

export default function FixOrdersPage() {
  const [status, setStatus] = useState("A aguardar início...");
  const [loading, setLoading] = useState(false);

  async function runFix() {
    setLoading(true);
    setStatus("🚀 A iniciar resgate de encomendas...");
    
    try {
      // O ID do curso que vimos nos teus logs
      const CORRECT_COURSE_ID = "90855daf-19f7-42ca-9e4e-51437fd14894";
      
      // 1. Procurar todas as encomendas
      const orders = await client.fetch(`*[_type == "order"]`);
      
      if (orders.length === 0) {
        setStatus("ℹ️ Nenhuma encomenda encontrada para corrigir.");
        setLoading(false);
        return;
      }

      // 2. Corrigir uma a uma
      for (const order of orders) {
        setStatus(`🔄 A corrigir encomenda: ${order._id}...`);
        
        await client
          .patch(order._id)
          .set({
            // Garante que o email está no campo certo
            userEmail: order.userEmail || order.email || "eventos.spmbe@gmail.com",
            // Força a referência correta para o curso
            purchasedCourses: [
              {
                _type: 'reference',
                _ref: CORRECT_COURSE_ID,
                _key: Math.random().toString(36).substring(7)
              }
            ],
            // Garante o status em minúsculas
            status: "pago"
          })
          .commit();
      }

      setStatus("✅ SUCESSO! Encomendas ligadas ao curso. Já podes voltar à página de vendas.");
    } catch (err: any) {
      console.error(err);
      setStatus("❌ ERRO: " + err.message + " (Verifica se o teu Token do Sanity tem permissão de escrita)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl border border-gray-100 text-center">
        <h1 className="text-2xl font-black text-[#37374B] mb-4">Resgate de Acessos</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Este script vai forçar a ligação entre as tuas encomendas e o curso correto no Sanity.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-2xl mb-8 min-h-[60px] flex items-center justify-center">
          <p className="text-sm font-bold text-[#3D81F1]">{status}</p>
        </div>

        <button 
          onClick={runFix}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
            loading ? 'bg-gray-300' : 'bg-[#3D81F1] hover:scale-[1.02] active:scale-95 shadow-blue-100'
          }`}
        >
          {loading ? "A processar..." : "EXECUTAR CORREÇÃO AGORA"}
        </button>
      </div>
    </div>
  );
}