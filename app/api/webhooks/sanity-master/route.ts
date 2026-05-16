import { NextResponse } from 'next/server';
import { clientPromise } from '../../../lib/mongodb'; 
import { client as sanityClient } from "@/app/lib/sanity";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { _type, _id, status } = body;

    if (!_id) return NextResponse.json({ message: 'Falta ID' }, { status: 400 });

    const currentStatus = status?.toLowerCase().trim();
    console.log(`🚀 [WEBHOOK] Documento: ${_type} | ID: ${_id} | Status: "${currentStatus}"`);

    const mongoClient = await clientPromise;
    const db = mongoClient.db();

    const token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;
    const writeClient = sanityClient.withConfig({ token: token, useCdn: false });

    if (_type === 'order') {
      const order = await sanityClient.fetch(`*[_type == "order" && _id == $id][0]`, { id: _id });
      if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

      const targetEmail = (order.clienteEmail || order.userEmail)?.toLowerCase().trim();
      if (!targetEmail) return NextResponse.json({ message: 'Email em falta' }, { status: 400 });

      const userInSanity = await sanityClient.fetch(`*[_type == "user" && email == $email][0]`, { email: targetEmail });
      if (!userInSanity) return NextResponse.json({ message: 'User not found' }, { status: 404 });

      let envolvePremium = false;
      const cursosNaEncomenda: string[] = [];

      // Verifica o que está dentro da encomenda
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const refId = item?.product?._ref || item?._ref || item?._id;
          if (!refId) continue;

          const produto = await sanityClient.fetch(`*[_id == $id][0]`, { id: refId });
          if (!produto) continue;

          const isPremiumProduct = produto.title?.toLowerCase().includes("ilimitado") || 
                                   produto.slug?.current?.toLowerCase().includes("ilimitado") ||
                                   produto.slug?.current?.toLowerCase().includes("premium");

          if (isPremiumProduct) envolvePremium = true;
          else cursosNaEncomenda.push(produto._id);
        }
      }

      // =========================================================================
      // 🟢 1. LÓGICA DE ATIVAÇÃO (Se a encomenda for Concluída)
      // =========================================================================
      if (currentStatus === 'ativo' || currentStatus === 'concluída' || currentStatus === 'concluida' || currentStatus === 'completed') {
        
        const updateDataMongo: any = { updatedAt: new Date() };
        const patch = writeClient.patch(userInSanity._id);

        if (envolvePremium) {
          updateDataMongo.plan = 'PREMIUM';
          updateDataMongo.isPremium = true;
          updateDataMongo.planStatus = 'active';
          
          patch.set({ plan: 'PREMIUM', isPremium: true, planStatus: 'active' });
        }

        // Injeta matrículas novas
        const novasMatriculas: any[] = [];
        for (const cursoId of cursosNaEncomenda) {
          const jaTem = userInSanity.enrollments?.some((enr: any) => enr.course?._ref === cursoId);
          if (!jaTem) {
            novasMatriculas.push({
              _key: Math.random().toString(36).substring(2, 9),
              course: { _type: 'reference', _ref: cursoId },
              grantedAt: new Date().toISOString()
            });
          }
        }

        if (novasMatriculas.length > 0) {
          patch.setIfMissing({ enrollments: [] }).insert('after', 'enrollments[-1]', novasMatriculas);
        }

        await db.collection("users").updateOne({ email: targetEmail }, { $set: updateDataMongo });
        await patch.commit({ autoGenerateArrayKeys: true });
        console.log(`✅ ACESSOS ATRIBUÍDOS a ${targetEmail}`);
      }

      // =========================================================================
      // 🔴 2. LÓGICA DE CANCELAMENTO / REVOGAÇÃO (Corta acessos imediatamente)
      // =========================================================================
      else if (['cancelada', 'cancelled', 'falhada', 'failed', 'reembolsada', 'refunded', 'pendente', 'pending'].includes(currentStatus)) {
        console.log(`🚨 REVOGANDO ACESSOS PARA: ${targetEmail}`);
        
        const patch = writeClient.patch(userInSanity._id);

        // Se era uma encomenda de Premium, tira o Premium
        if (envolvePremium) {
          await db.collection("users").updateOne(
            { email: targetEmail },
            { $set: { plan: 'FREE', isPremium: false, planStatus: 'inactive', updatedAt: new Date() } }
          );
          patch.set({ plan: 'FREE', isPremium: false, planStatus: 'inactive' });
        }

        // Se era uma encomenda de Cursos Avulsos, apaga esses cursos da pasta dele
        if (cursosNaEncomenda.length > 0) {
          const rotasParaApagar = cursosNaEncomenda.map(id => `enrollments[course._ref == "${id}"]`);
          patch.unset(rotasParaApagar);
        }

        await patch.commit({ autoGenerateArrayKeys: true });
        console.log(`🚫 ACESSOS REMOVIDOS de ${targetEmail} (Status: ${currentStatus})`);
      }
    }

    return NextResponse.json({ message: 'Processado com sucesso' });

  } catch (err: any) {
    console.error("❌ ERRO NO WEBHOOK:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook Ativo" });
}