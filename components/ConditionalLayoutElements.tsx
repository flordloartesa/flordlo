"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCart from "@/components/FloatingCart";
import CartSidebar from "@/components/CartSidebar";
// Se quiser manter o botão do WhatsApp, basta descomentar a linha abaixo
// import ConditionalWhatsApp from "@/components/ConditionalWhatsApp";

export default function ConditionalLayoutElements({ 
  children, 
  navData 
}: { 
  children: React.ReactNode;
  navData: any; 
}) {
  const pathname = usePathname();

  // 1. Numa loja online, normalmente só queremos esconder o menu na página de pagamento (checkout)
  const rotasSemNada = ['/checkout'];
  const rotasSemNavbar = ['/checkout'];

  // 3. Verificações de lógica
  const esconderTudo = rotasSemNada.some(rota => pathname?.startsWith(rota));
  const esconderNavbar = rotasSemNavbar.some(rota => pathname?.startsWith(rota));

  // 4. Caso "Esconder Tudo"
  if (esconderTudo) {
    return (
      <main>
        {children}
      </main>
    );
  }

  // 5. Renderização Normal
  return (
    <>
      {/* Navbar recebe os dados globais */}
      {!esconderNavbar && <Navbar initialMenuData={navData} />}
      
      {/* Aqui está o seu Carrinho Visual a funcionar em todas as páginas! */}
      <CartSidebar />
      <FloatingCart />
      
      <main>
        {children}
      </main>
      
      <Footer footerData={navData.footer} />
      
      {/* <ConditionalWhatsApp /> */}
    </>
  );
}