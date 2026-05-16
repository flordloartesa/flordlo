import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth"; // Ajusta o caminho se necessário

// Mantemos o runtime como "nodejs" porque o bcrypt precisa do Node para correr
export const runtime = "nodejs"; 

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };