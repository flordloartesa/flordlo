import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// import EmailProvider from "next-auth/providers/email"; // 👈 Pausado (requer Adapter)

import { client as sanityClient } from "@/app/sanity/client"; 
import bcrypt from "bcryptjs";
import { createTransport } from "nodemailer";
// import { magicLinkHTML } from "./email-templates";

export const authOptions: NextAuthOptions = {
  // 🧹 Removido o MongoDBAdapter
  
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, 

  session: {
    strategy: "jwt", 
    maxAge: 90 * 24 * 60 * 60, // 90 dias
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account" } }
    }),
    
    /* // 🛑 MAGIC LINKS PAUSADOS: Exigem um Adapter para guardar os tokens.
    EmailProvider({
      // ... a tua configuração anterior do EmailProvider
    }),
    */

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Preencha todos os campos.");
        }

        const email = credentials.email.toLowerCase().trim();

        // 🌸 1. Procurar o utilizador DIRETAMENTE no Sanity
        const user = await sanityClient.fetch(
          `*[_type == "user" && email == $email][0]`,
          { email }
        );

        if (!user) {
          throw new Error("Utilizador não encontrado. Já se registou?");
        }

        if (!user.password) {
          throw new Error("Esta conta foi criada via Google. Faça login com o Google.");
        }

        // 🌸 2. Verificar a Password com o Bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Email ou password incorretos.");
        }

        // 🌸 3. Sucesso!
        return { 
          id: user._id, 
          name: user.name, 
          email: user.email,
        };
      }
    })
  ],

  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login",
  },

  callbacks: {
    // 🔄 Sincroniza quem faz login com o Google para dentro do Sanity
    async signIn({ user }) {
      if (user.email) {
        try {
          const existingUser = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: user.email }
          );

          if (!existingUser) {
            await sanityClient.create({
              _type: "user",
              name: user.name || user.email.split('@')[0], 
              email: user.email,
              image: user.image || "",
              purchasedProducts: [] 
            });

            // 📩 NOTIFICAÇÃO PROFISSIONAL PARA O ADMIN
            try {
              const transport = createTransport({
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                  user: process.env.EMAIL_SERVER_USER,
                  pass: process.env.EMAIL_SERVER_PASSWORD,
                },
              });

              const emailAdmin = process.env.ADMIN_EMAIL || "geral@flordlo.pt";

              await transport.sendMail({
                to: emailAdmin,
                from: process.env.EMAIL_FROM,
                subject: `🌸 Novo Cliente: ${user.name || user.email}`,
                html: `
                  <div style="background-color: #fcf7f8; padding: 40px 20px; font-family: sans-serif;">
                    <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #9d6b7340;">
                      <h2 style="color: #9d6b73; margin-top: 0;">Novo Registo Flor.d.Ló</h2>
                      <p>Um novo cliente registou-se na loja.</p>
                      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                      <p><strong>Email:</strong> ${user.email}</p>
                      <p><strong>Nome:</strong> ${user.name || 'Não fornecido'}</p>
                    </div>
                  </div>
                `,
              });
            } catch (emailError) {
              console.error("Erro email admin:", emailError);
            }
          }
        } catch (error) {
          console.error("Erro SignIn Sanity Sync:", error);
        }
      }
      return true; 
    },

    async jwt({ token, user, trigger }: any) {
      if (user || trigger === "update") {
        if (user) token.id = user.id;

        try {
          const sanityData = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]{ 
              name, 
              image, 
              "purchasedProducts": coalesce(purchasedProducts[].product->_ref, [])
            }`,
            { email: token.email }
          );

          if (sanityData) {
            token.name = sanityData.name || token.name;
            token.image = sanityData.image; 
            token.purchasedProducts = sanityData.purchasedProducts; 
          }
          
        } catch (e) {
          console.error("Erro Sanity Sync:", e);
        }
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.purchasedProducts = token.purchasedProducts || [];
      }
      return session;
    }
  },
  debug: false,
};