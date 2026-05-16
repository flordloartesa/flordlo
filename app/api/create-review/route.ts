import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { client } = await import("@/app/lib/sanity");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    
    // 🟢 Extraímos os dados que vêm do formulário do site
    const { courseId, productId, practiceId, name, text, rating } = body;

    let referenceData: any = {};
    let itemTipo = 'Geral (Site)';
    let itemId = 'N/A';

    // Verifica se a review vem colada a algum produto específico
    if (courseId) {
      referenceData.course = { _type: 'reference', _ref: courseId };
      itemTipo = 'Curso/Retiro';
      itemId = courseId;
    } else if (productId) {
      referenceData.physicalProduct = { _type: 'reference', _ref: productId };
      itemTipo = 'Produto Físico';
      itemId = productId;
    } else if (practiceId) {
      referenceData.practice = { _type: 'reference', _ref: practiceId };
      itemTipo = 'Prática';
      itemId = practiceId;
    }

    console.log(`A processar Review para ${itemTipo}:`, itemId);

    // 2. GRAVAÇÃO NO SANITY
    const createdReview = await client.create({
      _type: 'review', 
      userName: name || "Anónimo",  
      rating: Number(rating) || 5,
      comment: text || "Sem comentário",   
      approved: false, 
      ...referenceData 
    });

    console.log("✅ Review criada no Sanity! ID:", createdReview._id);

    // 3. ENVIAR EMAIL AO ADMIN VIA RESEND
    const { error: emailError } = await resend.emails.send({
      // 👇 AQUI ESTAVA O ERRO! Tem de ser o domínio que verificaste no Resend!
      from: 'Site Flor.d.Ló <geral@flordlo.pt>', 
      to: process.env.ADMIN_EMAIL as string, // Lê do .env.local
      subject: `🔔 Novo Testemunho (${itemTipo}) para Aprovação`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #01cac3;">Novo testemunho recebido!</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Classificação:</strong> ${rating} estrelas</p>
          <p><strong>Origem:</strong> ${itemTipo} (ID: ${itemId})</p>
          <p><strong>Mensagem:</strong></p>
          <blockquote style="background-color: #f9f9f9; border-left: 4px solid #01cac3; padding: 15px; margin-left: 0; font-style: italic;">
            ${text}
          </blockquote>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p>Acede ao teu Sanity Studio para aprovar e publicar no site.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("❌ Erro no envio de email (Resend):", emailError);
    } else {
      console.log("✅ Email de notificação enviado para o Admin!");
    }

    return NextResponse.json({ message: 'Review submetida com sucesso!' }, { status: 200 });

  } catch (error: any) {
    console.error("💥 Erro Crítico na API Create Review:", error);
    return NextResponse.json({ message: 'Erro interno ao processar review', details: error.message }, { status: 500 });
  }
}