"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { client as sanityClient } from "@/app/lib/sanity"; // Atualizei para o caminho que costumas usar
import { createTransport } from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function registerUser(formData: FormData) {
  try {
    // 1. Extração dos dados do formulário
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Preenche todos os campos." };
    }

    const userEmail = email.toLowerCase().trim();

    // 🛡️ CAPTURAR IP E PAÍS
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || "IP não detetado";
    const country = reqHeaders.get("x-vercel-ip-country") || "País não detetado";

    // ====================================================================
    // 👇 2. VERIFICAÇÃO E CRIAÇÃO DIRETA NO SANITY 👇
    // ====================================================================
    
    // Verificar se o utilizador já existe
    const existingSanityUser = await sanityClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: userEmail }
    );

    if (existingSanityUser) {
      return { success: false, error: "Este email já está registado." };
    }

    // Encriptar a password (para ficar segura no Sanity)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o utilizador no Sanity
    await sanityClient.create({
      _type: "user",
      name: name || userEmail.split('@')[0], 
      email: userEmail,
      password: hashedPassword, // Adicionado para guardar a pass encriptada
      enderecoIp: ip,      
      paisRegisto: country,
      createdAt: new Date().toISOString()
    });

    // ====================================================================
    // 👇 3. ENVIO DE EMAILS (ADMIN E CLIENTE) 👇
    // ====================================================================
    try {
      // ----------------------------------------------------------------
      // 📧 EMAIL PARA O ADMIN (NODEMAILER)
      // ----------------------------------------------------------------
      const transport = createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transport.sendMail({
        to: "flordloartesa@gmail.com",
        from: process.env.EMAIL_FROM,
        subject: `🌸 Novo Registo: ${name || userEmail} (${country})`,
        html: `
          <div style="background-color: #f4f7f9; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
            <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e1e8ed; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="background-color: #9d6b73; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Novo Cliente Registado</h1>
              </div>
              <div style="padding: 40px; text-align: left;">
                <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-top: 0;">
                  Olá, um novo cliente acabou de criar conta na <strong>Flor de Ló</strong>.
                </p>
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #edf2f7;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase;">Nome</td>
                      <td style="padding: 8px 0; font-size: 15px; color: #1e293b; text-align: right;">${name || '<em>Não fornecido</em>'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase;">E-mail</td>
                      <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 15px; color: #9d6b73; text-align: right; font-weight: 500;">${userEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase;">Localização</td>
                      <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 15px; color: #1e293b; text-align: right;">${country} 📍</td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="padding: 20px; background-color: #f8fafc; border-top: 1px solid #e1e8ed; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; 2026 Flor de Ló. Notificação Automática.</p>
              </div>
            </div>
          </div>
        `,
      });

      // ----------------------------------------------------------------
      // 📧 EMAIL DE BOAS-VINDAS PARA O CLIENTE (RESEND)
      // ----------------------------------------------------------------
      const userName = name || userEmail.split('@')[0];
      const loginLink = "https://flordlo.pt/login";

      const { error: resendError } = await resend.emails.send({
        from: 'Flor de Ló <geral@flordlo.pt>',
        to: userEmail,
        subject: 'Bem-vindo(a) à Flor de Ló',
        html: `
          <div style="background-color: #f4f4f5; padding: 40px 20px; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
              <div style="background-color: #9d6b73; padding: 40px 30px; color: #ffffff;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 400;">Obrigado por se juntar a nós!</h1>
              </div>
              <div style="padding: 40px 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                <p style="margin-top: 0;">Olá ${userName},</p>
                <p>É com muita alegria que o(a) recebemos na Flor de Ló. Já pode aceder à sua conta para ver as nossas coleções exclusivas e acompanhar os seus pedidos.</p>
                <p><a href="${loginLink}" style="color: #9d6b73; text-decoration: underline;">Clique aqui para iniciar sessão.</a></p>
                <p style="margin-bottom: 0; margin-top: 30px;">Com carinho,<br>Equipa Flor de Ló</p>
              </div>
            </div>
          </div>
        `
      });

      if (resendError) {
        console.error("❌ Erro ao enviar Boas-Vindas (Cliente):", resendError);
      }
    } catch (syncError) {
      console.error("❌ Aviso: Erro no envio de Emails:", syncError);
    }

    return { success: true, message: "Conta criada com sucesso!" };

  } catch (e: any) {
    console.error("❌ ERRO REAL NO REGISTO:", e);
    return { success: false, error: e.message || "Erro no registo." };
  } 
}