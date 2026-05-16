import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { createClient } from "next-sanity";

// 👈 CLIENTE DE ESCRITA DEDICADO PARA O SANITY
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "bzcq0ztm", // Mantive o teu project ID
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-10-16",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, formData, discountAmount, couponCode, total } = body;

    const orderNumber = `flordlo-STR-${Date.now()}`;
    const adminEmail = "flordloartesa@gmail.com";

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(',')[0] : "IP não detectado";

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // 🔥 Gerar o texto com o nome do produto para o resumo no Sanity
    const etiquetaResumo = cart.map((item: any) => item.title || item.name || "Produto Flor de Ló").join(" + ");

    // 👇 MODO PRO: Limpar o nome do produto para o MBWay/Bancos
    const descritivoBancario = etiquetaResumo
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .substring(0, 22)
      .trim() || "flordlo-STR-";

    // ✅ 1. GRAVAR NO SANITY
    const sanityOrder = await writeClient.create({
      _type: 'order',
      orderNumber: orderNumber,
      resumoItens: etiquetaResumo,
      clienteNome: `${formData.firstName} ${formData.lastName}`,
      clienteEmail: formData.email,
      telemovel: formData.phone,
      nif: formData.nif || "Consumidor Final",
      ipAddress: ip, 
      amount: Number(total),

      metodoPagamento: 'Stripe', 
      status: 'pending', 

      dataReserva: new Date().toISOString(),
      createdAt: new Date().toISOString(),

      items: cart.map((item: any) => {
        const rawId = item._id || item.id || "";
        const cleanId = rawId.replace("drafts.", "").substring(0, 36);
        const variation = rawId.length > 36 ? rawId.substring(37) : "";

        return {
          _type: 'orderItem', 
          _key: Math.random().toString(36).substring(2, 11),
          product: { 
            _type: 'reference', 
            _ref: cleanId, 
            _weak: true 
          },
          price: Number(item.price),
          giftMessage: variation ? `Opção: ${variation}` : "",
        };
      }),
    });

    // ✅ 2. PREPARAR ITENS PARA O STRIPE
    const lineItems = cart.map((item: any) => {
      const rawId = item._id || item.id || "";
      const cleanId = rawId.replace("drafts.", "").substring(0, 36);

      return {
        price_data: {
          currency: 'eur',
          product_data: { 
            name: item.title || item.name || "Arranjo Flor de Ló",
            images: item.image && item.image.startsWith('http') ? [item.image] : [],
            metadata: { id: cleanId } 
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || item.qty || 1, 
      };
    });

    // ✅ 3. LÓGICA DE CUPÃO
    let stripeDiscounts: any[] = [];
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: 'eur',
        duration: 'once',
        name: couponCode ? `Cupão: ${couponCode}` : 'Desconto Especial',
      });
      stripeDiscounts.push({ coupon: coupon.id });
    }

   // ✅ 4. CRIAR SESSÃO DO STRIPE
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "mb_way", "multibanco"],
      line_items: lineItems,
      mode: "payment",
      
      payment_intent_data: {
        statement_descriptor: descritivoBancario, 
      },

      customer_email: formData.email,
      discounts: stripeDiscounts,
      metadata: {
        sanityOrderId: sanityOrder._id,
        orderNumber: orderNumber
      },
      success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    // 🎨 Gerar as linhas da tabela de produtos para o e-mail
    const cartItemsHtml = cart.map((item: any) => {
      const itemQty = item.quantity || item.qty || 1;
      return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${itemQty}x ${item.title || item.name || "Produto Flor de Ló"}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #333;">${(Number(item.price) * itemQty).toFixed(2)}€</td>
      </tr>
      `;
    }).join('');

    // ✅ 5. NOTIFICAR ADMIN (Nodemailer)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Flor de Ló Sistema" <${process.env.EMAIL_SERVER_USER}>`,
      to: adminEmail,
      subject: `🌸 Nova Encomenda: Aguarda Pagamento Stripe: ${orderNumber}`,
      html: `
        <div style="background-color: #f7f7f7; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #9d6b73; padding: 30px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Nova Tentativa de Encomenda</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A aguardar pagamento no Stripe</p>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #555; line-height: 1.5;">O cliente <strong>${formData.firstName} ${formData.lastName}</strong> iniciou o processo de checkout na Flor de Ló.</p>
              
              <h2 style="font-size: 18px; color: #333; margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Detalhes da Encomenda (${orderNumber})</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px; background-color: #f9f9f9; color: #555; border-bottom: 2px solid #eee; font-weight: 600;">Produto</th>
                    <th style="text-align: right; padding: 12px; background-color: #f9f9f9; color: #555; border-bottom: 2px solid #eee; font-weight: 600;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${cartItemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="text-align: right; padding: 15px 12px; font-weight: bold; color: #333; border-top: 2px solid #eee;">Total a Pagar:</td>
                    <td style="text-align: right; padding: 15px 12px; font-weight: bold; color: #9d6b73; font-size: 18px; border-top: 2px solid #eee;">${Number(total).toFixed(2)}€</td>
                  </tr>
                </tfoot>
              </table>

              <h2 style="font-size: 18px; color: #333; margin-top: 40px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Dados do Cliente</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 15px; color: #555;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Nome:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${formData.firstName} ${formData.lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>E-mail:</strong></td>
                  <td style="padding: 8px 0; text-align: right;"><a href="mailto:${formData.email}" style="color: #9d6b73; text-decoration: none;">${formData.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Telemóvel:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${formData.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>NIF:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${formData.nif || "Consumidor Final"}</td>
                </tr>
              </table>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 13px; border-top: 1px solid #eee;">
              Este é um e-mail automático da loja Flor de Ló.<br>O sistema processará o estado da encomenda quando o Stripe confirmar o pagamento.
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("ERRO CRÍTICO STRIPE BACKEND:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}