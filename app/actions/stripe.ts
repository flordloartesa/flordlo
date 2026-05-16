"use server";

import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", 
});

export async function createPremiumSubscription() {
  try {
    // 1. Validar a sessão com os teus authOptions
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      throw new Error("Precisas de fazer login para subscrever.");
    }

    // 2. Criar a sessão de Checkout no Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'subscription', 
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: [
        {
          // ⚠️ SUBSTITUI pelo ID real do teu preço no Dashboard do Stripe (price_...)
          price: 'price_1TNdr949WG4oNQQYuggpqzF2',
          quantity: 1,
        },
      ],
      
      // 🟢 ESTA É A LÓGICA DO TRIAL (7 DIAS GRÁTIS)
      subscription_data: {
        trial_period_days: 7,
      },

      // 🟢 Redirecionamentos após pagamento CORRIGIDO
      success_url: `${process.env.NEXTAUTH_URL || 'https://meditt.space'}/cursos/7-dias-trial?trial=started`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'https://meditt.space'}/checkout/7-dias-trial`,
      
      // 🟢 METADATA PARA O TEU WEBHOOK SABER O QUE FAZER NO MONGODB
      metadata: {
        planType: 'TRIAL',
      }
    });

    // Devolvemos o URL para o componente "use client" fazer o redirecionamento
    return { url: stripeSession.url };

  } catch (error: any) {
    console.error("❌ Erro na criação da subscrição:", error.message);
    // Devolvemos o erro para que a página possa mostrar um alerta ao utilizador
    return { error: error.message };
  }
}