"use server";

import { client } from "@/app/lib/sanity";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitReviewAction(data: any) {
  try {
    console.log("📥 DADOS RECEBIDOS NA SERVER ACTION:", data);

    const { userName, rating, comment, productId } = data;

    let referenceData: any = {};
    let itemTipo = 'Página do Site';
    
    if (productId) {
      referenceData.physicalProduct = { _type: 'reference', _ref: productId };
      itemTipo = 'Produto/Serviço';
    }

    // 🛡️ A SOLUÇÃO DO ERRO: Criar um cliente com privilégios de escrita (Admin)
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_TOKEN, // 👈 Puxa o teu token
      useCdn: false // Para gravar dados, o CDN tem de estar desligado
    });

    // 1. Grava no Sanity (Usando o writeClient em vez do client normal!)
    const createdReview = await writeClient.create({
      _type: 'review',
      userName: userName || "Anónimo",
      rating: Number(rating) || 5,
      comment: comment || "Sem comentário",
      approved: false,
      ...referenceData
    });

    // 2. Envia o E-mail para o Admin
    const emailAdmin = process.env.ADMIN_EMAIL;

    if (emailAdmin) {
      await resend.emails.send({
        from: 'Sistema Flor.d.Ló <geral@flordlo.pt>', 
        to: emailAdmin as string,                     
        subject: `🔔 Novo Testemunho para Aprovação`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #C47F8C;">Novo testemunho recebido!</h2>
            <p><strong>Nome:</strong> ${userName}</p>
            <p><strong>Classificação:</strong> ${rating} estrelas</p>
            <p><strong>Origem:</strong> ${itemTipo}</p>
            <p><strong>Mensagem:</strong></p>
            <blockquote style="background-color: #f9f9f9; border-left: 4px solid #C47F8C; padding: 15px; margin-left: 0; font-style: italic;">
              ${comment}
            </blockquote>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p>Acede ao <a href="https://flordlo.pt/studio" style="color: #C47F8C; font-weight: bold;">Sanity Studio</a> na secção Reviews para aprovar.</p>
          </div>
        `,
      });
    } else {
      console.error("❌ Variável ADMIN_EMAIL não encontrada no .env.local");
    }

    return { success: true, id: createdReview._id };

  } catch (error: any) {
    console.error("💥 Erro ao submeter review:", error);
    
    // Se o token estiver em falta no .env.local, ele avisa
    if (error.message && error.message.includes('Insufficient permissions')) {
      return { success: false, error: 'O Token do Sanity está em falta ou é inválido.' };
    }

    return { success: false, error: 'Ocorreu um erro interno ao gravar a review.' };
  }
}