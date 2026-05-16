import { google } from "googleapis";
import { createTransport } from "nodemailer";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ---------------------------------------------------------
    // 1. GRAVAR NO GOOGLE SHEETS (CRÍTICO)
    // ---------------------------------------------------------
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      const sheets = google.sheets({ auth, version: "v4" });
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: "A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            new Date().toLocaleString("pt-PT"),
            body.event || "-",
            body.name || "-",
            body.email || "-",
            body.mobile || "-",
            body.emergencyMobile || "-",
            body.occupation || "-",
            body.city || "-",
            body.lodging || "-",
            body.food || "-",
            body.comments || "-",
            body.source || "-",
            body.gdpr ? "Sim" : "Não",
            body.newsletter ? "Sim" : "Não" // Grava a newsletter no sheets
          ]],
        },
      });
    } catch (sheetError) {
      console.error("ERRO SHEETS:", sheetError);
      return NextResponse.json({ error: "Erro ao gravar inscrição no Google Sheets." }, { status: 500 });
    }

    // ---------------------------------------------------------
    // 2. ENVIAR EMAILS (Sem travar o servidor)
    // ---------------------------------------------------------
    try {
        const transporter = createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          secure: false, // Geralmente false para porta 587, true para 465
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
          // IMPORTANTE: Não usar pool: true para evitar hanging em serverless
        });

        // Template simples para o Cliente
        const htmlTemplateClient = (title: string, content: string) => `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1e73be;">${title}</h2>
            ${content}
            <p style="color: #999; font-size: 12px; margin-top: 20px;">Meditt App</p>
          </div>
        `;

        // Template tipo "WordPress" COMPLETO para o Admin
        const adminEmailHtml = `
        <div style="background-color: #f0f0f1; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; color: #3c434a;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #c3c4c7; border-radius: 4px; border-top: 4px solid #2271b1; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            
            <div style="padding: 24px 24px 0 24px;">
              <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #1d2327;">Nova Inscrição: ${body.event || 'Evento não especificado'}</h2>
            </div>

            <div style="padding: 0 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; width: 40%; color: #646970; font-weight: 600;">Nome:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.name || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Email:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;"><a href="mailto:${body.email}" style="color: #2271b1; text-decoration: none;">${body.email || '-'}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Telemóvel:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.mobile || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Tlm Emergência:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.emergencyMobile || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Profissão:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.occupation || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Localidade:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.city || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Alojamento:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.lodging || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Alimentação:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.food || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #646970; font-weight: 600;">Fonte:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f1; color: #1d2327;">${body.source || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #646970; font-weight: 600;">Aceita Newsletter:</td>
                  <td style="padding: 10px 0; color: #1d2327;">${body.newsletter ? '✅ Sim' : '❌ Não'}</td>
                </tr>
              </table>
            </div>

            <div style="padding: 24px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #646970; text-transform: uppercase; letter-spacing: 0.5px;">Comentários:</h3>
              <div style="background-color: #f6f7f7; padding: 20px; border-left: 4px solid #dcdcde; color: #1d2327; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${body.comments || 'Sem comentários adicionais.'}</div>
            </div>

          </div>

          <div style="max-width: 600px; margin: 20px auto 0; text-align: center; font-size: 12px; color: #8c8f94;">
            Nova inscrição gerada através do site <a href="https://meditt.space" style="color: #2271b1; text-decoration: none;">Meditt.space</a>.
          </div>
        </div>
        `;

        const firstName = body.name ? body.name.split(' ')[0] : 'Cliente';

        // Enviamos os dois emails e aguardamos o resultado
        await Promise.all([
          // Email Cliente
          transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: body.email, 
            subject: `Inscrição Recebida - Meditt`,
            html: htmlTemplateClient(`Olá ${firstName},`, `
              <p>A sua inscrição foi recebida com sucesso.</p>
              <p><strong>Evento:</strong> ${body.event || '-'}</p>
              <p>Entraremos em contacto brevemente.</p>
            `), 
          }),
          // Email Admin (COM O NOVO LAYOUT)
          transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_ADMIN_NOTIFICATION, 
            subject: `Nova Inscrição: ${body.name || 'Desconhecido'} - ${body.event || 'Evento'}`,
            html: adminEmailHtml, 
          })
        ]);

    } catch (emailError) {
        console.error("ERRO EMAIL (Ignorado para o cliente):", emailError);
        // Não damos return error aqui. Se gravou no sheets, é sucesso para o cliente.
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("ERRO GERAL:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}