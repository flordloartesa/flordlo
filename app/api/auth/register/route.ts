import { NextResponse } from "next/server";
import { client } from "@/app/sanity/client"; 
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // Importa o nodemailer

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Verificar se o utilizador já existe
    const existingUser = await client.fetch(`*[_type == "user" && email == $email][0]`, { email });
    if (existingUser) {
      return NextResponse.json({ message: "E-mail já registado." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Criar utilizador no Sanity
    const newUser = {
      _type: "user",
      name,
      email,
      password: hashedPassword,
    };
    const createdUser = await client.create(newUser);

    // 3. ENVIAR E-MAIL DE BOAS-VINDAS/VALIDAÇÃO
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Meditt" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Bem-vindo à Meditt - Confirmação de Conta",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Olá, ${name}!</h2>
          <p>A tua conta na Meditt foi criada com sucesso.</p>
          <p>Já podes aceder à nossa loja e começar a tua jornada.</p>
          <a href="${process.env.NEXTAUTH_URL}/welcome" style="background: #105ee5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Aceder à minha conta</a>
        </div>
      `,
    });

    return NextResponse.json({ message: "Utilizador criado e e-mail enviado!", user: createdUser }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro no servidor." }, { status: 500 });
  }
}