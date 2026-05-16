import { createTransport } from "nodemailer";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const transporter = createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false, 
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // ---------------------------------------------------------
    // LAYOUT TIPO WORDPRESS PARA O ADMIN (SEM A BARRA "/")
    // ---------------------------------------------------------
    const adminEmailHtml = `
    <div style="background-color: #f0f0f1; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; color: #3c434a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #c3c4c7; border-radius: 4px; border-top: 4px solid #2271b1; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #1d2327;">Mensagem de Contacto</h2>
        </div>

        <div style="padding: 0 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; width: 40%; color: #646970; font-weight: 600;">De:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.first_name || '-'} (<a href="mailto:${body.email}" style="color: #2271b1; text-decoration: none;">${body.email || '-'}</a>)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Assunto:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.subject || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #646970; font-weight: 600;">Aceita Newsletter:</td>
              <td style="padding: 10px 0; color: #1d2327;">${body.marketing === 'on' || body.marketing === true ? '✅ Sim' : '❌ Não'}</td>
            </tr>
          </table>
        </div>

        <div style="padding: 24px;">
          <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #646970; text-transform: uppercase; letter-spacing: 0.5px;">Conteúdo da Mensagem:</h3>
          <div style="background-color: #f6f7f7; padding: 20px; border-left: 4px solid #dcdcde; color: #1d2327; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${body.message || '-'}</div>
        </div>

      </div>

      <div style="max-width: 600px; margin: 20px auto 0; text-align: center; font-size: 12px; color: #8c8f94;">
        Enviado via Formulário de Contacto <a href="https://meditt.space" style="color: #2271b1; text-decoration: none;">Meditt.space</a>.
      </div>
    </div>
    `;

    // ---------------------------------------------------------
    // ENVIAR O EMAIL
    // ---------------------------------------------------------
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      // 👇 AQUI ESTÁ A LER DIRETAMENTE DO TEU .ENV.LOCAL 👇
      to: process.env.ADMIN_EMAIL, 
      subject: `Novo Contacto: ${body.subject || 'Mensagem do Site'}`,
      html: adminEmailHtml, 
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("ERRO AO ENVIAR CONTACTO:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}