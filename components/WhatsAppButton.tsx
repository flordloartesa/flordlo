'use client';

import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton() {
  // Número de Portugal (351) + o número do teu Footer
  const phoneNumber = "351914770487"; 
  const message = "Olá! Gostaria de ter mais informações sobre os vossos arranjos e serviços.";
  const link = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      // Aumentei para w-14 h-14 para ser mais fácil de clicar no telemóvel
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] transition-transform hover:scale-110 active:scale-95"
      aria-label="Falar no WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8" />
      
      {/* Ponto vermelho animado para chamar a atenção (agora com borda branca) */}
      <span className="absolute top-0 right-0 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
      </span>
    </a>
  );
}