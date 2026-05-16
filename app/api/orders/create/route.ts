import { NextResponse } from "next/server";
import { Resend } from 'resend';
import { client } from "@/app/lib/sanity";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 DADOS RECEBIDOS NA API DE ENCOMENDAS:", JSON.stringify(body, null, 2));

    const writeClient = client.withConfig({
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    });

    const finalCart = body.cart || body.cartItems || [];
    const finalEmail = (body.userEmail || body.formData?.email || body.email || "").trim();
    let finalAmount = Number(body.total || body.amount || 0);
    const formData = body.formData || {};

    if (!finalEmail || !formData.firstName || finalCart.length === 0) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const orderNumber = `FL-TRF-${Date.now()}`;
    const dataHoje = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
    const nomeCompleto = `${formData.firstName} ${formData.lastName}`;
    const adminEmail = process.env.ADMIN_EMAIL as string;
    
    const etiquetaResumo = finalCart.map((item: any) => item.title || item.name || "Produto").join(" + ");

    const productIds = finalCart.map((item: any) => (item._id || item.id || "").replace("drafts.", ""));
    const dbProducts = await writeClient.fetch(`*[_type == "product" && _id in $ids]{ _id, weight }`, { ids: productIds });
    
    const weightMap: Record<string, number> = {};
    dbProducts.forEach((p: any) => {
      weightMap[p._id] = Number(p.weight || 0);
    });

    let calculatedItemsSubtotal = 0;
    let totalWeight = 0;

    const tabelaItensHtml = finalCart.map((item: any) => {
      const nomeProduto = item.title || item.name || "Produto Flor.d.Ló";
      const qtd = Number(item.quantity || 1);
      const precoUnitario = Number(item.price || 0);
      const subtotalLinha = precoUnitario * qtd;
      
      const idLimpo = (item._id || item.id || "").replace("drafts.", "");
      const pesoProduto = weightMap[idLimpo] || 0; 
      totalWeight += pesoProduto * qtd;

      calculatedItemsSubtotal += subtotalLinha;
      
      const variacao = item.giftMessage ? `<br><span style="color: #64748b; font-size: 13px;">${item.giftMessage}</span>` : "";
      
      return `
        <tr>
          <td style="border-bottom: 1px solid #e2e8f0; padding: 16px 8px; text-align: left; color: #1e293b;"><strong>${nomeProduto}</strong>${variacao}</td>
          <td style="border-bottom: 1px solid #e2e8f0; padding: 16px 8px; text-align: center; color: #475569;">${qtd}</td>
          <td style="border-bottom: 1px solid #e2e8f0; padding: 16px 8px; text-align: right; color: #1e293b;">€${subtotalLinha.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    let shippingFee = 0;
    try {
      const settings = await writeClient.fetch(`*[_type == "storeSettings"][0]`);
      
      if (settings) {
        const custoBase = Number(settings.shippingCost || 4.80);
        const portesGratisLimite = Number(settings.freeShippingThreshold || 0);
        const pesoBaseLimite = Number(settings.baseWeightLimit || 1); 
        const custoExtraKg = Number(settings.extraPricePerKg || 1.50);

        if (portesGratisLimite > 0 && calculatedItemsSubtotal >= portesGratisLimite) {
          shippingFee = 0; 
        } else {
          shippingFee = custoBase;
          if (totalWeight > pesoBaseLimite) {
            const pesoExtra = totalWeight - pesoBaseLimite;
            const kgExtraCobrados = Math.ceil(pesoExtra); 
            shippingFee += (kgExtraCobrados * custoExtraKg);
          }
        }
      } else {
        const diferencaPortes = Math.max(0, finalAmount - calculatedItemsSubtotal);
        shippingFee = Number(body.shippingCost || body.shipping || diferencaPortes);
      }
    } catch (error) {
      const diferencaPortes = Math.max(0, finalAmount - calculatedItemsSubtotal);
      shippingFee = Number(body.shippingCost || body.shipping || diferencaPortes);
    }

    finalAmount = calculatedItemsSubtotal + shippingFee;

    // ✅ 2. CRIAR A ENCOMENDA NO SANITY (Referência Forte + Snapshot do Nome)
    const order = await writeClient.create({
      _type: 'order',
      orderNumber: orderNumber,
      resumoItens: etiquetaResumo,
      clienteNome: nomeCompleto,
      clienteEmail: finalEmail,
      telemovel: formData.phone || "",
      nif: formData.nif || "Consumidor Final",
      dataReserva: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      amount: finalAmount,
      shippingCost: shippingFee,
      metodoPagamento: 'Transferencia',
      status: 'pending',
      items: finalCart.map((item: any) => {
        const idDoProduto = item._id || item.id || item._ref || "";
        const idLimpo = idDoProduto.replace("drafts.", "");

        // 👈 SEM WEAK! Referência Forte e Segura.
        const productRef = idLimpo ? { product: { _type: 'reference', _ref: idLimpo } } : {};

        return {
          _type: 'orderItem',
          _key: Math.random().toString(36).substring(2, 11),
          ...productRef,
          productName: item.title || item.name || "Produto Flor.d.Ló", // 📸 A FOTOGRAFIA DO NOME
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          giftMessage: item.giftMessage || "",
        };
      }),
    });

    // 🚀 3. INTEGRAR PRODUTOS NA FICHA DO UTILIZADOR
    try {
      const user = await writeClient.fetch(
        `*[_type == "user" && (email == $email || email match $email)][0]`,
        { email: finalEmail }
      );

      if (user) {
        console.log(`👤 Ficha do Cliente encontrada (ID: ${user._id}). A atualizar compras...`);
        
        const novosProdutos = finalCart.map((item: any) => {
          const idDoProduto = item._id || item.id || item._ref || "";
          const idLimpo = idDoProduto.replace("drafts.", "");
          
          return {
            _type: 'purchaseEntry', 
            _key: Math.random().toString(36).substring(2, 15),
            // 👈 SEM WEAK! Referência Forte e Segura.
            product: idLimpo ? { _type: 'reference', _ref: idLimpo } : undefined,
            productName: item.title || item.name || "Produto Flor.d.Ló", // 📸 A FOTOGRAFIA DO NOME
            quantity: Number(item.quantity || 1),
            purchaseDate: new Date().toISOString(),
            pricePaid: Number(item.price || 0),
            orderRef: orderNumber 
          };
        });

        novosProdutos.forEach((p: any) => { if (!p.product) delete p.product; });

        await writeClient
          .patch(user._id)
          .setIfMissing({ purchasedProducts: [] })
          .append('purchasedProducts', novosProdutos) 
          .commit({ autoGenerateArrayKeys: true });
          
        console.log(`✅ Produtos adicionados com sucesso à ficha de ${finalEmail}.`);
      } else {
        console.log(`⚠️ Cliente não encontrado no Sanity. Email procurado: ${finalEmail}`);
      }
    } catch (patchError) {
      console.error("❌ Erro grave ao atualizar ficha do cliente:", patchError);
    }

    const eReserva = finalCart.some((item: any) => 
      item._type === 'reserva' || item.title?.toLowerCase().includes('retiro')
    );
    const avisoReservaHtml = eReserva ? `<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 25px;"><p style="margin: 0; font-size: 14px; color: #92400e;">Este valor é apenas a reserva do retiro.</p></div>` : "";

    // ✅ 4. ENVIO DOS EMAILS
    await resend.emails.send({
      from: 'Flor.d.Ló <geral@flordlo.pt>',
      replyTo: adminEmail,
      to: finalEmail,
      subject: `A sua encomenda da Flor.d.Ló: ${orderNumber}`,
      html: `
        <div style="background-color: #f8fafc; color: #1e293b; font-family: sans-serif; padding: 40px 20px; margin: 0; width: 100%;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <h1 style="margin: 0; font-size: 22px; color: #1e293b;">Pedido <span style="color: #9d6b73;">${orderNumber}</span></h1>
            </div>
            <div style="padding: 30px;">
              <p>Olá <strong>${nomeCompleto}</strong>, recebemos o seu pedido.</p>
              ${avisoReservaHtml}
              <div style="background-color: #fcf7f8; border-radius: 10px; border-left: 4px solid #9d6b73; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0 0 10px 0; color: #7a4b52; font-weight: bold; font-size: 16px;">Aguarda Pagamento</p>
                <p style="margin: 0;"><strong>IBAN:</strong> PT50 0023 0000 4578 0068 9799 4</p>
                <p style="margin-top: 10px; font-size: 13px; color: #64748b;">*Envie o comprovativo para ${adminEmail}</p>
              </div>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                <thead>
                  <tr>
                    <th style="border-bottom: 2px solid #e2e8f0; padding: 12px 8px; text-align: left; color: #64748b;">Produto</th>
                    <th style="border-bottom: 2px solid #e2e8f0; padding: 12px 8px; text-align: center; color: #64748b;">Qtd</th>
                    <th style="border-bottom: 2px solid #e2e8f0; padding: 12px 8px; text-align: right; color: #64748b;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${tabelaItensHtml}
                  <tr>
                    <td colspan="2" style="padding: 20px 8px 5px; text-align: left; color: #64748b;">Subtotal Itens:</td>
                    <td style="padding: 20px 8px 5px; text-align: right; color: #1e293b;">€${calculatedItemsSubtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 5px 8px; text-align: left; color: #64748b;">Portes (${totalWeight > 0 ? totalWeight + 'kg' : 'Fixo'}):</td>
                    <td style="padding: 5px 8px; text-align: right; color: #1e293b;">€${shippingFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 15px 8px 12px; text-align: left; font-weight: 700; color: #1e293b; font-size: 16px; border-top: 1px solid #e2e8f0;">Total a Pagar:</td>
                    <td style="padding: 15px 8px; text-align: right; font-weight: 700; color: #9d6b73; font-size: 18px; border-top: 1px solid #e2e8f0;">€${finalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <p>Obrigado,<br>Equipa Flor.d.Ló</p>
            </div>
          </div>
        </div>`
    });

    await resend.emails.send({
      from: 'Sistema <geral@flordlo.pt>',
      to: adminEmail,
      subject: `💰 Nova Encomenda: ${orderNumber} (€${finalAmount})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #9d6b73;">Nova Venda!</h2>
          <p><strong>Cliente:</strong> ${nomeCompleto} (${finalEmail})</p>
          <hr>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${tabelaItensHtml}
            <tr>
              <td colspan="2" style="padding: 10px 8px;">Subtotal Itens:</td>
              <td style="padding: 10px 8px; text-align: right;">€${calculatedItemsSubtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 5px 8px;">Portes (${totalWeight > 0 ? totalWeight + 'kg' : 'Fixo'}):</td>
              <td style="padding: 5px 8px; text-align: right;">€${shippingFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 15px 8px; font-weight: bold; border-top: 1px solid #eee;">TOTAL:</td>
              <td style="padding: 15px 8px; text-align: right; font-weight: bold; color: #9d6b73; font-size: 18px; border-top: 1px solid #eee;">€${finalAmount.toFixed(2)}</td>
            </tr>
          </table>
          <p><a href="https://flordlo.pt/studio">Abrir no Sanity Studio</a></p>
        </div>`
    });

    return NextResponse.json({ success: true, orderId: order._id });

  } catch (error: any) {
    console.error("💥 ERRO CRÍTICO NO BACKEND:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}