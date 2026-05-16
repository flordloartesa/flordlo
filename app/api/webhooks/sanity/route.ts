import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { writeClient } from "@/app/actions/sanityWrite"; // 🔥 Atualiza este caminho se o writeClient estiver noutro lado
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extraímos os campos que o Sanity enviou da encomenda
    const { status, clienteNome, clienteEmail, items } = body;

    // Só disparar ações se a encomenda for marcada como 🟢 Concluída
    if (status !== 'completed') {
      return NextResponse.json({ msg: "Aguardando conclusão do pagamento" });
    }

    // ==========================================
    // 1. ATUALIZAR O UTILIZADOR NO SANITY
    // ==========================================
    if (clienteEmail && items && Array.isArray(items)) {
      try {
        // Vai procurar o utilizador à BD com o email de quem comprou
        const user = await writeClient.fetch(
          `*[_type == "user" && email == $clienteEmail][0]`, 
          { clienteEmail }
        );

        if (user) {
          // Extrai os IDs dos produtos (cursos) que a pessoa comprou para ela própria
          const cursosParaOProprio = items
            .filter((item: any) => !item.recipientEmail && item.product && item.product._ref)
            .map((item: any) => ({
              _key: crypto.randomUUID(), // O Sanity obriga a que cada item numa lista tenha uma chave única
              _type: 'reference',
              _ref: item.product._ref
            }));

          // Se comprou algum curso para si, atualizamos o perfil!
          if (cursosParaOProprio.length > 0) {
            await writeClient.patch(user._id)
              .setIfMissing({ cursosAdquiridos: [] }) // Garante que o array existe
              .insert('after', 'cursosAdquiridos[-1]', cursosParaOProprio) // Insere os novos cursos no fim da lista
              .commit();
              
            console.log(`✅ Cursos adicionados ao perfil do utilizador ${clienteEmail}`);
          }
        }
      } catch (dbError) {
        console.error("⚠️ Erro ao atualizar o utilizador no Sanity:", dbError);
        // Não faz throw do erro para garantir que os e-mails são enviados na mesma!
      }
    }

    // ==========================================
    // 2. DISPARAR E-MAILS
    // ==========================================
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: { 
        user: process.env.EMAIL_SERVER_USER, 
        pass: process.env.EMAIL_SERVER_PASSWORD 
      }
    });

    const emailPromises = [];

    // 📧 EMAIL PARA O COMPRADOR
    emailPromises.push(
      transporter.sendMail({
        from: `"Meditt" <${process.env.EMAIL_SERVER_USER}>`,
        to: clienteEmail,
        subject: "Pagamento Confirmado! ✅ O seu acesso está livre",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; color: #37374B;">
            <h2>Olá ${clienteNome},</h2>
            <p>O seu pagamento foi confirmado com sucesso!</p>
            <p>Se comprou um curso para si, já pode aceder à sua <strong>Área Pessoal</strong> no site.</p>
            <p>Se comprou um presente, o destinatário acabou de receber um e-mail com a surpresa.</p>
            <br />
            <a href="https://meditt.space/welcome" style="background: #105ee5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold;">Ir para a minha Área Pessoal</a>
          </div>
        `
      })
    );

    // 📧 EMAIL PARA OS RECEPTORES (Cartão Oferta)
    if (items && Array.isArray(items)) {
      items.forEach((item: any) => {
        if (item.recipientEmail) {
          emailPromises.push(
            transporter.sendMail({
              from: `"Meditt 🎁" <${process.env.EMAIL_SERVER_USER}>`,
              to: item.recipientEmail,
              subject: `Tens um presente da Meditt enviado por ${clienteNome}!`,
              html: `
                <div style="font-family: sans-serif; text-align: center; border: 2px solid #3D81F1; border-radius: 20px; padding: 40px; max-width: 500px; margin: auto;">
                  <h1 style="color: #3D81F1;">Surpresa! 🎁</h1>
                  <p><strong>${clienteNome}</strong> ofereceu-te um momento de Presença e Bem-Estar na Meditt.</p>
                  <div style="background: #f0f4ff; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px dashed #3D81F1;">
                    <p style="font-style: italic; color: #37374B;">"${item.giftMessage || 'Aproveita este presente para a tua jornada de autodesenvolvimento.'}"</p>
                  </div>
                  <p>Para resgatares o teu presente, basta criares conta com este e-mail no nosso site ou para os retiros contactar-nos para o eventos.spmbe@gmail.com.</p>
                  <br />
                  <a href="https://meditt.space/welcome" style="background: #3D81F1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Resgatar o meu Presente</a>
                </div>
              `
            })
          );
        }
      });
    }

    // Dispara tudo em paralelo
    await Promise.all(emailPromises);

    return NextResponse.json({ success: true, emailsSent: emailPromises.length });

  } catch (err) { 
    console.error("Erro no Webhook:", err);
    return NextResponse.json({ error: "Erro no processamento do webhook" }, { status: 500 }); 
  }
}