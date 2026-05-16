"use client";
import { useState } from "react";
import Link from '@/components/MyLink';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui chamaremos a API no passo 2
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) setMessage("Verifica a tua caixa de entrada!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#37374B]">Recuperar Senha</h2>
          <p className="mt-2 text-slate-500">Enviaremos um link para definires uma nova senha.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input
            type="email"
            required
            placeholder="O teu e-mail de registo"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#105ee5]"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="w-full py-3.5 bg-[#105ee5] text-white font-bold rounded-[20px] uppercase text-[11px] tracking-widest hover:bg-blue-700 transition">
            Enviar Link de Recuperação
          </button>
        </form>

        {message && <p className="text-green-600 text-center font-medium">{message}</p>}

        {/* ✅ Botão para retornar à página de login conforme pediste */}
        <div className="text-center">
          <Link href="/welcome" className="text-sm font-bold text-[#105ee5] hover:underline uppercase tracking-tight">
            ← Voltar ao Iniciar Sessão
          </Link>
        </div>
      </div>
    </div>
  );
}