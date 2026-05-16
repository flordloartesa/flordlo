"use client";

import React, { useState } from 'react';
import Link from '@/components/MyLink';
import Image from 'next/image';
import { Turnstile } from "react-turnstile";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      alert("Por favor, verifique que é humano através da caixa de segurança.");
      return;
    }

    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const payload = { ...data, turnstileToken };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
        setTurnstileToken(null);
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 flex flex-col mt-20">
      
      {/* SECÇÃO 1: FORMULÁRIO (GET IN TOUCH) */}
      <section className="max-w-2xl mx-auto px-6 py-10 w-full">
        <h1 className="text-3xl font-bold text-[#333] mb-16 md:mb-20 text-center md:text-left">
          Entre em Contacto
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col border-b border-slate-300 focus-within:border-[#9d6b73] transition-colors">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</label>
              <input 
                type="text" 
                name="first_name" 
                placeholder="Mariana" 
                required 
                className="py-2 bg-transparent outline-none text-slate-800 placeholder:text-slate-300" 
              />
            </div>
          </div>

          <div className="flex flex-col border-b border-slate-300 focus-within:border-[#9d6b73] transition-colors">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</label>
            <input 
              type="email" 
              name="email" 
              placeholder="O seu endereço de email" 
              required 
              className="py-2 bg-transparent outline-none text-slate-800 placeholder:text-slate-300" 
            />
          </div>

          <div className="flex flex-col border-b border-slate-300 focus-within:border-[#9d6b73] transition-colors">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assunto</label>
            <input 
              type="text" 
              name="subject" 
              placeholder="Em que podemos ser úteis?" 
              required 
              className="py-2 bg-transparent outline-none text-slate-800 placeholder:text-slate-300" 
            />
          </div>

          <div className="flex flex-col border-b border-slate-300 focus-within:border-[#9d6b73] transition-colors">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mensagem</label>
            <textarea 
              name="message" 
              placeholder="Escreva a sua mensagem aqui..." 
              rows={2} 
              required 
              className="py-2 bg-transparent outline-none text-slate-800 placeholder:text-slate-300 resize-none"
            ></textarea>
          </div>

          <div className="flex items-start gap-3 py-2">
            <input 
              type="checkbox" 
              id="marketing" 
              name="marketing" 
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#9d6b73] focus:ring-[#9d6b73]" 
            />
            <label htmlFor="marketing" className="text-sm text-slate-600 leading-tight">
              Sim! Gostaria de receber novidades e ofertas especiais da <em>Flor d'Ló.</em>
            </label>
          </div>

          <div className="flex justify-center pt-2">
            <Turnstile 
              sitekey="0x4AAAAAACf86PyF6Af3GBY9"
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => setStatus("error")}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || !turnstileToken}
            className="w-full bg-gradient-to-r from-[#C47F8C] to-[#C47F6C] text-white font-bold py-4 rounded-full shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "A Enviar..." : "Enviar"}
          </button>

          {status === "success" && <p className="text-green-600 text-center font-bold">Mensagem enviada com sucesso!</p>}
          {status === "error" && <p className="text-red-600 text-center font-bold">Erro no envio da mensagem. Tentar novamente.</p>}
        </form>
      </section>

      {/* 👇 SECÇÃO 2: PROMOÇÃO COM NOVO FUNDO E SEPARAÇÃO ELEGANTE 👇 */}
      <section className="bg-[#FCFAFA] py-24 mt-16 border-t border-[#9d6b73]/10 overflow-hidden flex-grow relative">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-[#9d6b73]">Descubra as Nossas Criações</h2>
            <p className="text-slate-600 leading-relaxed">
              Enquanto não recebe resposta, aproveite para conhecer as nossas coleções feitas à mão com todo o amor e dedicação.
            </p>
            <ul className="space-y-3 text-slate-500 text-sm font-medium">
              <li className="flex items-center gap-2">🌸 Arranjos Florais Exclusivos</li>
              <li className="flex items-center gap-2">🎁 Presentes Personalizados</li>
              <li className="flex items-center gap-2">🔮 Redomas com Flores Secas</li>
              <li className="flex items-center gap-2">🌿 Grinaldas Artesanais</li>
              <li className="flex items-center gap-2">💍 Decoração para Casamentos e Eventos</li>
            </ul>
            
            <div className="pt-4">
              <Link href="/loja" passHref>
                <button className="bg-[#9d6b73] hover:bg-[#865961] text-white font-bold py-3 px-10 rounded-full transition-all shadow-md active:scale-95">
                  Visitar a Loja
                </button>
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center md:justify-end">
            <div className="relative w-[320px] h-[480px] md:w-[400px] md:h-[550px]">
              <Image 
                src="https://images.unsplash.com/photo-1542995096-2e8bc2e739ba?q=80&w=988&auto=format&fit=crop"
                alt="Arranjo floral da Flor de Ló"
                fill
                sizes="(max-width: 768px) 320px, 400px"
                className="object-cover rounded-xl shadow-2xl"
              />
            </div>
          </div>
          
        </div>
      </section>

    </main>
  );
}