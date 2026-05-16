// app/cursos/layout.tsx
import SidebarCursos from "@/components/SidebarCursos"; // Ajusta o caminho se necessário

export default function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#05051a]">
      {/* 1. A TUA NOVA BARRA LATERAL */}
      <SidebarCursos />
      
      {/* 2. O ESPAÇO PARA O PLAYER E AULAS */}
      {/* A margem md:ml-[260px] garante que o player não fica debaixo do menu no PC */}
      <div className="md:ml-[260px] w-full md:w-[calc(100%-260px)] min-h-screen relative">
        {children}
      </div>
    </div>
  );
}