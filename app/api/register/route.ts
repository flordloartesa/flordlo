import { NextResponse } from "next/server";
import { Resend } from 'resend';
import { client } from "@/app/lib/sanity";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // 🔑 Puxar o email do admin do ambiente
    const adminEmail = process.env.ADMIN_EMAIL;

    // 🛡️ Configurar cliente de escrita para o Sanity
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    });

    // 🛑 NOVO: 1. Verificar se o utilizador já existe antes de criar
    const existingUser = await writeClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (existingUser) {
      // Se já existir, paramos o processo aqui e devolvemos um erro
      return NextResponse.json(
        { error: "Este e-mail já está registado. Tenta fazer login." }, 
        { status: 400 }
      );
    }

    // 2. Criar o utilizador (com password encriptada)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await writeClient.create({
      _type: 'user',
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    // ⚡ NOVO: 3. Preparar o envio dos e-mails em simultâneo
    const emailPromises = [];

    // ENVIO PARA O ADMIN (A Aurora e a Rita recebem isto)
    if (adminEmail) {
      emailPromises.push(
        resend.emails.send({
          from: 'Sistema Flor.d.Ló <geral@flordlo.pt>',
          to: adminEmail as string,
          subject: `🌸 Novo Membro no Jardim: ${name}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h2 style="color: #C47F8D;">Novo Registo no Site</h2>
              <p>Olá! Acaba de ser criada uma nova conta:</p>
              <ul>
                <li><strong>Nome:</strong> ${name}</li>
                <li><strong>E-mail:</strong> ${email}</li>
              </ul>
              <p>Podes gerir os utilizadores no <a href="https://flordlo.pt/studio">Sanity Studio</a>.</p>
            </div>
          `,
        })
      );
    }

    // ENVIO PARA O CLIENTE (Boas-vindas)
    emailPromises.push(
      resend.emails.send({
        from: 'Flor.d.Ló <geral@flordlo.pt>',
        to: email,
        subject: 'Bem-vinda à Flor.d.Ló! 🌸',
        html: `
          <div style="font-family: sans-serif; text-align: center; max-width: 500px; margin: 0 auto;">
            <h1 style="color: #C47F8D;">Olá ${name}!</h1>
            <p>É um prazer ter-te connosco. A tua conta foi criada com sucesso.</p>
            <p>Já podes entrar e explorar as nossas coleções.</p>
            <br />
            <a href="https://flordlo.pt/login" style="background-color: #C47F8D; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Entrar na minha conta
            </a>
          </div>
        `,
      })
    );

    // Dispara todos os e-mails ao mesmo tempo sem bloquear a execução um do outro
    await Promise.all(emailPromises);

    return NextResponse.json({ success: true, userId: newUser._id });

  } catch (error: any) {
    console.error("Erro no registo:", error.message);
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  }
}