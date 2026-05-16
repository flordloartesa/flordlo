"use client";

import RegistrationForm from "@/components/RegistrationForm";
  
import { useState } from "react";
import Link from '@/components/MyLink';

export default function InscricaoPage() {
  // Estado que controla se mostramos o formulário ou a mensagem de sucesso
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col mt-10 md:mt-20">
      
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        
        {/* CENÁRIO 1: O FORMULÁRIO (Ainda não enviado) */}
        {!isSuccess && (
          <div className="w-full max-w-4xl">
            {/* Estes TÍTULOS desaparecem quando o envio é feito com sucesso */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                Inscrição / Registration
              </h1>
              <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                Insira a sua informação / Enter your information
              </h4>
              
            </div>
            
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100">
              {/* Quando o formulário diz "onSuccess", mudamos o estado para true */}
              <RegistrationForm onSuccess={() => setIsSuccess(true)} />
            </div>
          </div>
        )}

        {/* CENÁRIO 2: MENSAGEM DE SUCESSO (Aparece sozinha no ecrã) */}
        {isSuccess && (
          <div className="max-w-lg w-full bg-white p-12 rounded-2xl shadow-xl border border-blue-50 text-center animate-fade-in-up">
            
            {/* Ícone de Sucesso Animado */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Inscrição Recebida!
            </h2>
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Obrigado! Os seus dados foram registados com sucesso.<br/>
              Entraremos em contacto consigo o mais breve possível.
            </p>

            <div className="space-y-4">
              <Link href="/" className="block w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition">
                Voltar à Página Principal
              </Link>
              
              <button 
                onClick={() => setIsSuccess(false)}
                className="block w-full text-sm text-gray-500 hover:text-gray-800 font-semibold"
              >
                Fazer nova inscrição
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}