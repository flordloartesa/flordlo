import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Importamos APENAS o Providers (porque ele já tem o Login e o Carrinho lá dentro!)
import { Providers } from "./providers"; 
import ConditionalLayoutElements from "@/components/ConditionalLayoutElements";
import { client } from "@/app/lib/sanity"; 

// 👇 1. IMPORTAMOS O BOTÃO DO WHATSAPP AQUI 👇
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flor de Ló - Flores & Presentes",
  description: "Arranjos florais únicos e feitos com amor.",
};

async function getNavigation() {
  const query = `{
    "navConfig": *[_type == "siteNavigation"] | order(_updatedAt desc)[0]{
      displaySearch,
      // 👉 Buscamos o array dinâmico
      menuItems[] {
        _type,
        label,     // Existe no navLink
        href,      // Existe no navLink
        title,     // Existe no navDropdown
        links[] {  // Existe no navDropdown
          label,
          href
        }
      },
      ctaButton { label, href }
    },
    "footerConfig": *[_type == "siteFooter"] | order(_updatedAt desc)[0]{
      ...,
      // 👇 A MAGIA DO COALESCE ENTRA AQUI 👇
      "livroReclamacoesImgUrl": coalesce(livroReclamacoesImg.asset->url, livroReclamacoesImgExternal),
      "extraLogo1ImgUrl": coalesce(extraLogo1Img.asset->url, extraLogo1ImgExternal),
      "extraLogo2ImgUrl": coalesce(extraLogo2Img.asset->url, extraLogo2ImgExternal),
      "extraLogo3ImgUrl": coalesce(extraLogo3Img.asset->url, extraLogo3ImgExternal),
      "extraLogo4Url": extraLogo4Url,
      "extraLogo4ImgUrl": coalesce(extraLogo4Img.asset->url, extraLogo4ImgExternal)
    }
  }`;

  try {
    // Usamos cache: 'no-store' para garantir que vê as mudanças do Sanity instantaneamente
    const data = await client.fetch(query, {}, { cache: 'no-store' });
    
    return {
      ...(data.navConfig || {}),
      footer: data.footerConfig || {}
    };
  } catch (error) {
    console.error("Erro no Sanity:", error);
    return { footer: {} };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navData = await getNavigation();
 
  return (
    <html lang="pt" suppressHydrationWarning> 
      <body 
        className={`${inter.className} bg-[#F8F9FA] antialiased`}
        suppressHydrationWarning={true}
      >
        {/* 2. O <Providers> abraça tudo e trata do Auth e do Cart num só sítio! */}
        <Providers>
            <ConditionalLayoutElements navData={navData}>
              {children}
            </ConditionalLayoutElements>
        </Providers>

        {/* 👇 2. O BOTÃO ENTRA AQUI, MESMO ANTES DE FECHAR O BODY 👇 */}
        {/* Assim ele fica por cima de tudo em qualquer página! */}
        <WhatsAppButton />

      </body>
    </html>
  );
}