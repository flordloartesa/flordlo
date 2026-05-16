"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Redirector({ url }: { url: string }) {
  const router = useRouter();

  useEffect(() => {
    // Faz o redirecionamento assim que o componente carrega no browser
    router.replace(url);
  }, [url, router]);

  // Enquanto redireciona, podes mostrar um ecrã vazio ou um loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <p className="text-[#37374B] font-medium animate-pulse">
        A verificar acessos...
      </p>
    </div>
  );
}