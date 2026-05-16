import { NextResponse } from 'next/server';
import { client } from "@/app/sanity/client"; 

export async function POST(req: Request) {
  try {
    // 1. Extraímos os dados enviados pelo formulário
    const { name, email, rating, comment, courseId, referenceField, turnstileToken } = await req.json();

    // ✅ VALIDAÇÃO DE SEGURANÇA (Cloudflare Turnstile)
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!(isDevelopment && turnstileToken === "bypass_local")) {
      const secretKey = process.env.TURNSTILE_SECRET_KEY;
      
      if (!secretKey) {
        console.error("❌ Erro: TURNSTILE_SECRET_KEY não configurada.");
        return NextResponse.json({ error: 'Erro de configuração no servidor.' }, { status: 500 });
      }

      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', turnstileToken);

      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });

      const captchaRes = await verification.json();
      
      if (!captchaRes.success) {
        console.error("❌ Cloudflare rejeitou o token:", captchaRes['error-codes']);
        return NextResponse.json({ error: 'Falha no sistema anti-spam.' }, { status: 400 });
      }
    }

    // 2. Determinar o campo de destino dinâmico
    // Se por algum motivo o referenceField vier vazio, o fallback é "course"
    const targetField = referenceField || "course";

    // 3. Gravar no Sanity usando a chave dinâmica [targetField]
    const result = await client.create({
      _type: "review",
      userName: name,
      userEmail: email, 
      rating: Number(rating), // Garante que é gravado como número
      comment: comment,
      approved: false, // Fica "escondido" até tu aprovares no Sanity
      
      // 👇 A MAGIA DINÂMICA 👇
      // Se targetField for "physicalProduct", o Sanity recebe a chave "physicalProduct"
      [targetField]: {
        _type: "reference",
        _ref: courseId
      }
    });

    console.log(`✅ Review criada com sucesso! Campo: [${targetField}] | ID: ${result._id}`);
    
    return NextResponse.json({ 
      message: 'Review submetida com sucesso!',
      id: result._id 
    });
    
  } catch (err: any) {
    console.error("🔥 Erro na API de Reviews:", err.message);
    return NextResponse.json({ error: 'Erro interno no servidor: ' + err.message }, { status: 500 });
  }
}