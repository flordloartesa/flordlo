import { NextResponse } from "next/server";
import { client } from "@/app/lib/sanity"; // 👉 Caminho atualizado para o projeto atual

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: "Código não fornecido." }, { status: 400 });
    }

    // Procura o cupão no Sanity (tiramos os espaços e forçamos maiúsculas para evitar erros de digitação)
    const cleanCode = code.trim().toUpperCase();
    const query = `*[_type == "coupon" && code == $code && isActive == true][0]`;
    const coupon = await client.fetch(query, { code: cleanCode }, { cache: 'no-store' });

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Cupão inválido ou inexistente." }, { status: 404 });
    }

    // Verifica a data de validade
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return NextResponse.json({ success: false, message: "Este cupão já expirou." }, { status: 400 });
    }

    // Cupão válido! Retorna os dados
    return NextResponse.json({
      success: true,
      message: "Cupão aplicado com sucesso!",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });

  } catch (error) {
    console.error("Erro ao validar cupão:", error);
    return NextResponse.json({ success: false, message: "Erro de servidor." }, { status: 500 });
  }
}