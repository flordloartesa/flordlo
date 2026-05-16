import { NextResponse } from "next/server";
import Stripe from "stripe";
import { MongoClient } from "mongodb";
// ✅ IMPORTAR O SANITY PARA O AVISAR DAS COMPRAS
import { client as sanityClient } from "@/app/sanity/client"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

const uri = process.env.MONGODB_URI!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const event = stripe.webhooks.constructEvent(body, signature as string, webhookSecret);

    console.log("\n--- 🕵️ EVENTO RECEBIDO ---");
    console.log("Tipo:", event.type);

    if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.created') {
      const session = event.data.object as any;
      const customerEmail = session.customer_details?.email || session.email;
      const courseId = session.metadata?.courseId;

      if (customerEmail) {
        console.log(`💰 A processar acesso para: ${customerEmail}`);
        
        // 1. ATUALIZAR MONGODB (Para manter compatibilidade com o sistema antigo)
        const mongoClient = new MongoClient(uri);
        await mongoClient.connect();
        const db = mongoClient.db(); 

        if (courseId) {
          await db.collection("users").updateOne(
            { email: customerEmail },
            { $addToSet: { purchasedCourses: courseId } as any }
          );
          console.log(`✅ Curso ${courseId} adicionado ao utilizador na MongoDB!`);

          // 👇 2. ATUALIZAR SANITY (A TUA NOVA ARQUITETURA DE MATRÍCULAS) 👇
          const userInSanity = await sanityClient.fetch(`*[_type == "user" && email == $email][0]`, { email: customerEmail });
          
          if (userInSanity) {
             const token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;
             const writeClient = sanityClient.withConfig({ token: token, useCdn: false });

             // Datas: Começa hoje, Expira daqui a 1 ano (podes alterar a lógica se quiseres vitalício)
             const grantedDate = new Date();
             const expiresDate = new Date();
             expiresDate.setFullYear(grantedDate.getFullYear() + 1);

             const novaMatricula = {
               _key: Math.random().toString(36).substring(2, 9),
               course: { _type: 'reference', _ref: courseId },
               grantedAt: grantedDate.toISOString(),
               expiresAt: expiresDate.toISOString() 
             };

             // Grava na lista nova "enrollments"
             await writeClient.patch(userInSanity._id)
               .setIfMissing({ enrollments: [] })
               .insert('after', 'enrollments[-1]', [novaMatricula])
               .commit({ autoGenerateArrayKeys: true });
             
             console.log(`🚀 Matrícula criada no Sanity com sucesso!`);
          }

        } else {
          // 🟢 LOGICA PREMIUM ATUALIZADA (Assinatura/Trial)
          await db.collection("users").updateOne(
            { email: customerEmail },
            { 
              $set: { 
                isPremium: true, 
                plan: "PREMIUM", 
                trialActive: true 
              } 
            }
          );
          
          // Replica o estado Premium também para o Sanity!
          const userInSanity = await sanityClient.fetch(`*[_type == "user" && email == $email][0]`, { email: customerEmail });
          if (userInSanity) {
             const token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;
             const writeClient = sanityClient.withConfig({ token: token, useCdn: false });
             await writeClient.patch(userInSanity._id)
               .set({ isPremium: true, plan: "PREMIUM", planStatus: "active" })
               .commit();
          }
          console.log(`🌟 Utilizador marcado como PREMIUM nas duas Bases de Dados!`);
        }

        await mongoClient.close();
      }
    }

    console.log("✅ Webhook processado com sucesso!");
    return new NextResponse("OK", { status: 200 });

  } catch (err: any) {
    console.error(`❌ ERRO: ${err.message}`);
    return new NextResponse(`Erro: ${err.message}`, { status: 400 });
  }
}