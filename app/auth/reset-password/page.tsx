"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// 1. O componente que contém a lógica e usa o useSearchParams
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("Senha alterada! Agora podes fazer login.");
      router.push("/area-pessoal"); // ✅ Retorna ao login automaticamente após sucesso
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleReset} className="max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold">Define a tua nova senha</h2>
        <input
          type="password"
          required
          placeholder="Nova Senha (min. 8 caracteres)"
          className="w-full px-4 py-3 border border-slate-200 rounded-xl"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button className="w-full py-3.5 bg-[#105ee5] text-white font-bold rounded-[20px] uppercase">
          Atualizar Senha
        </button>
      </form>
    </div>
  );
}

// 2. A página principal que embrulha o formulário no Suspense
export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-medium text-slate-500">A carregar...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}