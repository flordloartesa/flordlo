"use client";
import RegistrationForm from "@/components/RegistrationForm";
import Navbar from "@/components/"; // Assume que tens a Navbar aqui

export default function InscricaoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        {/* Título e Subtítulo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Inscrição / Registration
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Insira a sua informação / Enter your information
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Por favor preencha o formulário com o maior rigor possível para que seja mais fácil respondermos ao seu pedido.
          </p>
        </div>
        
        {/* O Formulário */}
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100">
          <RegistrationForm onSuccess={() => {}} />
        </div>

      </main>
    </div>
  );
}