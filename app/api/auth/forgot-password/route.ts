import { NextResponse } from "next/server";
import { client } from "@/app/sanity/client";
import nodemailer from "nodemailer";
import crypto from "crypto";
// ✅ Importação do template profissional
import { passwordResetHTML } from "@/app/lib/email-templates"; 

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Verificar se o utilizador existe no Sanity
    const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email });
    
    // Por segurança, não confirmamos se o email existe ou não para evitar "user enumeration"
    if (!user) {
      return NextResponse.json({ message: "Se o e-mail existir, receberá um link." });
    }

    // 2. Gerar um token único e a data de expiração (1 hora)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000).toISOString(); 

    // 3. Guardar o token e a expiração no Sanity
    await client.patch(user._id).set({ 
      resetToken, 
      resetTokenExpires 
    }).commit();

    // 4. Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: { 
        user: process.env.EMAIL_SERVER_USER, 
        pass: process.env.EMAIL_SERVER_PASSWORD 
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // 5. Enviar o e-mail usando o template "bonitão"
    await transporter.sendMail({
      to: email,
      from: `"Meditt" <${process.env.EMAIL_SERVER_USER}>`,
      subject: "Recuperação de Senha - Meditt",
      html: passwordResetHTML({ 
        userName: user.firstName || user.name || "Membro", 
        resetUrl 
      })
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro na API de Forgot Password:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}