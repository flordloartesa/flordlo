"use client";

import { usePathname } from "next/navigation";
import WhatsAppButton from "./WhatsAppButton";

export default function ConditionalWhatsApp() {
  const pathname = usePathname();

  // 📝 Lista de rotas onde o WhatsApp deve estar ESCONDIDO
  // Adiciona aqui o slug das tuas páginas de player
  const hiddenRoutes = ["/cursos/", "/praticas/", "/world/"];

  // Verifica se a rota atual contém algum dos termos proibidos
  const shouldHide = hiddenRoutes.some((route) => pathname.includes(route));

  if (shouldHide) return null;

  return <WhatsAppButton />;
}