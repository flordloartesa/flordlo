"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth"; 
import { client } from "@/app/sanity/client"; 

export async function getUserCourses() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return { success: false, courses: [] };

  try {
    const userEmail = session.user.email.toLowerCase().trim();

    // ✅ QUERY ALINHADA com o Webhook e Checkout
    // Procuramos em múltiplos campos de email para garantir que nada escapa
    const query = `*[_type == "order" && 
      (userEmail == $email || email == $email || clienteEmail == $email) && 
      lower(status) in ["pago", "completed", "paid"]
    ] | order(_createdAt desc) {
      _createdAt, 
      _id,
      "courses": purchasedCourses[]-> {
        _id,
        title,
        "slug": slug.current,
        "image": coverImage.asset->url
      }
    }`;

    const orders = await client.fetch(query, { email: userEmail });

    if (!orders || orders.length === 0) return { success: true, courses: [] };

    // Agrupar todos os cursos de todas as encomendas do utilizador
    const courses = orders.flatMap((order: any) => {
      if (!order.courses) return [];

      const dateOfPurchase = new Date(order._createdAt);
      const dateOfExpiry = new Date(dateOfPurchase);
      dateOfExpiry.setFullYear(dateOfExpiry.getFullYear() + 1);

      return order.courses.map((item: any) => ({
        id: order._id + item._id,
        title: item.title,
        image: item.image || "/images/taca-tibetana-mi.jpg",
        purchaseDate: dateOfPurchase.toLocaleDateString('pt-PT'),
        expiryDate: dateOfExpiry.toLocaleDateString('pt-PT'),
        isActive: true,
        playerLink: `/cursos/${item.slug}` 
      }));
    });

    // Remover duplicados (caso o user tenha comprado o mesmo curso duas vezes por erro)
    const uniqueCourses = Array.from(new Map(courses.map((c: any) => [c.title, c])).values());

    return { success: true, courses: uniqueCourses };
  } catch (error) {
    console.error("Erro ao buscar cursos da Área Pessoal:", error);
    return { success: false, courses: [] };
  }
}