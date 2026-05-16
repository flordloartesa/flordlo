// app/api/checkout/transfer/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers"; // 👈 NOVA IMPORTAÇÃO OBRIGATÓRIA
import nodemailer from "nodemailer";
import { client } from "@/app/lib/sanity";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { cart, formData, total } = await req.json();
    const adminEmail = "eventos.spmbe@gmail.com";

    // 🛡️ 0. CAPTURAR O IP E O PAÍS DO CLIENTE
    const requestHeaders = headers();
    
    // Captura o IP (Funciona igual na Vercel e Netlify)
    const forwardedFor = requestHeaders.get('x-forwarded-for') || '';
    const realIp = requestHeaders.get('x-real-ip') || '';
    const rawIp = forwardedFor.split(',')[0].trim() || realIp || 'IP_Desconhecido';
    
    // 🌍 CAPTURA O PAÍS (CLOUD-AGNOSTIC)
    // Tenta primeiro o formato da Vercel. Se não existir, tenta o da Netlify. Se falhar, assume 'Desconhecido'.
    const countryCode = requestHeaders.get('x-vercel-ip-country') || requestHeaders.get('x-country') || 'Desconhecido';

    // 1. DETECTAR O TIPO DE PRODUTOS NO CARRINHO
    const eReserva = cart.some((item: any) => item._type === 'reserva');
    
    // 🟢 NOVO: Detetar se o Plano Premium está no carrinho 
    // (Ajusta a palavra 'ilimitado' ou 'premium' ao título/slug exato que dás ao teu plano na loja)
    const ePremium = cart.some((item: any) => 
      item.title?.toLowerCase().includes('ilimitado') || 
      item.title?.toLowerCase().includes('premium') || 
      item.slug === 'premium'
    );

    // 2. GERAR REFERÊNCIA CURTA E INTELIGENTE (Ex: PRM-833514, RES-833514 ou MED-833514)
    // 🟢 NOVO: Prefixo PRM adicionado com prioridade máxima
    const prefixo = ePremium ? 'PRM' : (eReserva ? 'RES' : 'MED');
    const orderNumber = `${prefixo}-${Date.now().toString().slice(-6)}`;

    // 3. FORMATAÇÃO DO VALOR
    const valorTotal = Number(total).toFixed(2);

    // 4. DEFINIR TEXTOS DE ACORDO COM O TIPO
    let assuntoEmail = `Dados de Pagamento: Pedido ${orderNumber}`;
    if (eReserva) assuntoEmail = `Reserva de Evento: Pedido ${orderNumber}`;
    if (ePremium) assuntoEmail = `Plano Ilimitado: Pedido ${orderNumber}`;

    const fraseCorpo = eReserva
      ? `Para que a <strong>inscrição no evento seja válida</strong>, deverá realizar o pagamento da reserva no valor de <strong>${valorTotal}€</strong> para:`
      : `O teu pedido <strong>${orderNumber}</strong> foi registado com sucesso! Para libertarmos o teu acesso imediato, realiza a transferência no valor de <strong>${valorTotal}€</strong> para:`;

    // 5. GRAVAR NO SANITY
    const sanityOrder = await client.create({
      _type: 'order',
      orderNumber: orderNumber,
      clienteNome: `${formData.firstName} ${formData.lastName}`,
      clienteEmail: formData.email,
      telemovel: formData.phone,
      nif: formData.nif || "Consumidor Final",
      amount: Number(total),
      metodoPagamento: 'Transferencia',
      status: 'pending',
      enderecoIp: rawIp,        // 👈 IP GUARDADO AQUI
      paisRegisto: countryCode, // 👈 PAÍS GUARDADO AQUI
      items: cart.map((item: any) => ({
        _type: 'orderItem', 
        _key: Math.random().toString(36).substring(2, 11),
        product: { _type: 'reference', _ref: item._id, _weak: true },
        price: Number(item.price),
      })),
      createdAt: new Date().toISOString(),
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // 6. TEMPLATE DO EMAIL PARA O CLIENTE
    const buyerHtml = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; line-height: 1.6;">
        <h2 style="color: #3D81F1;">Olá ${formData.firstName},</h2>
        <p style="font-size: 16px;">${fraseCorpo}</p>
        
        <div style="background: #f4f7ff; padding: 25px; border-radius: 12px; border: 1px solid #dce4ff; margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 15px;"><strong>IBAN:</strong> PT50002300004578006897994</p>
          <p style="margin: 5px 0; font-size: 15px;"><strong>Titular:</strong> Meditt Space</p>
          <p style="margin: 10px 0; color: #3D81F1; font-size: 18px;"><strong>Valor a Transferir: ${valorTotal}€</strong></p>
          <p style="margin: 5px 0; font-size: 15px;"><strong>Referência:</strong> ${orderNumber}</p>
        </div>
        
        <p>Após o pagamento, envia o comprovativo respondendo a este email para validarmos a tua vaga/acesso.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <small style="color: #888;">Equipa Meditt Space</small>
      </div>
    `;

    // 🟢 NOVO: 7. EMAIL PARA O ADMIN (Com alerta caso seja Premium)
    let tipoVenda = '';
    if (eReserva) tipoVenda = '(RESERVA)';
    if (ePremium) tipoVenda = '(PLANO PREMIUM)';

    const alertaPremium = ePremium 
      ? `<div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
          <h3 style="color: #d32f2f; margin-top: 0;">⚠️ ATENÇÃO: COMPRA DE PLANO ILIMITADO</h3>
          <p>O cliente <strong>${formData.email}</strong> comprou o Plano Premium por Transferência Bancária.</p>
          <p><strong>Acesso NÃO libertado.</strong> Quando o valor cair na conta, deves ir à Base de Dados (MongoDB) e alterar o "plan" deste cliente para "PREMIUM".</p>
         </div>`
      : '';

    // Envia email de notificação para ti (Admin) com os dados de localização
    await transporter.sendMail({
      from: `"SISTEMA MEDITT" <${process.env.EMAIL_SERVER_USER}>`,
      to: adminEmail,
      subject: `🔔 VENDA ${tipoVenda}: ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #3D81F1;">Nova Encomenda por Transferência</h2>
          <p><strong>Valor:</strong> ${valorTotal}€</p>
          <p><strong>Referência:</strong> ${orderNumber}</p>
          <p><strong>Cliente:</strong> ${formData.firstName} ${formData.lastName} (${formData.email})</p>
          <p><strong>IP do Cliente:</strong> ${rawIp}</p>
          <p><strong>País de Origem:</strong> ${countryCode}</p>
          ${alertaPremium}
          <p>Detalhes completos no Sanity Studio.</p>
        </div>
      `,
    });

    // Envia o email com o IBAN e instruções para o Cliente
    await transporter.sendMail({
      from: `"Meditt Space" <${process.env.EMAIL_SERVER_USER}>`,
      to: formData.email,
      subject: assuntoEmail,
      html: buyerHtml,
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro na API de Transferência:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}