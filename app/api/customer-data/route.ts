import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Se estiveres a usar o NextAuth

export async function GET(req: Request) {
  try {
    // 1. Verificar quem é o utilizador logado (opcional, dependendo da tua auth)
    // const session = await getServerSession();
    // if (!session) return new NextResponse("Não autorizado", { status: 401 });

    // 2. Aqui no futuro vais à base de dados buscar os dados do utilizador
    // const user = await prisma.user.findUnique({ email: session.user.email });

    // 3. Devolvemos dados vazios (ou de teste) só para parar o erro 404 no frontend
    return NextResponse.json({ 
      status: "success", 
      message: "Rota de dados do cliente conectada!",
      user: null 
    });

  } catch (error) {
    console.error("Erro no customer-data:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}