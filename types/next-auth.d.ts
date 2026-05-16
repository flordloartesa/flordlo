// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

// Define os planos possíveis
export type UserPlan = 'FREE' | 'PREMIUM';

declare module "next-auth" {
  // Estende o tipo de Sessão
  interface Session {
    user: {
      id: string;
      plan: UserPlan;
    } & DefaultSession["user"]
  }

  // Estende o tipo de Utilizador (o que vem da BD)
  interface User extends DefaultUser {
    plan?: UserPlan;
  }
}