"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth"; 
import { client } from "@/app/lib/sanity"; // Confirmar se o caminho é lib/sanity ou sanity/client no teu projeto atual
import { writeClient } from "./sanityWrite"; 
import bcrypt from "bcryptjs"; 

// ============================================================================
// ✅ 1. BUSCAR PRODUTOS COMPRADOS (BASEADO NAS ENCOMENDAS DO SANITY)
// ============================================================================
export async function getUserProducts() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();

    if (!email) return { success: false, error: "Sem sessão ativa" };

    const rawData = await client.fetch(`
      *[_type == "order" && clienteEmail == $email && status == "completed"] | order(_createdAt desc) {
        "purchaseDate": _createdAt,
        "items": items[] {
          "id": product->_id,
          "title": product->title,
          "slug": product->slug.current,
          "categories": coalesce(product->categories, ["Produto"]),
          "image": coalesce(product->coverImageUrl, product->image.asset->url),
          "price": product->price
        }
      }
    `, { email }, { next: { revalidate: 0 } });

    // Desdobrar todos os itens comprados numa lista única para o utilizador ver
    const allProducts = rawData.flatMap((order: any) => 
      (order.items || []).map((item: any) => ({ 
        ...item, 
        purchaseDate: order.purchaseDate
      }))
    );

    // Remover produtos duplicados (caso tenha comprado o mesmo produto duas vezes)
    const uniqueProductsMap = new Map();
    allProducts.forEach((item: any) => {
      if (item.slug && !uniqueProductsMap.has(item.slug)) {
        uniqueProductsMap.set(item.slug, item);
      }
    });

    const products = Array.from(uniqueProductsMap.values());

    return { success: true, products };
  } catch (error) {
    console.error("Erro ao buscar produtos do utilizador:", error);
    return { success: false, error: "Erro na sincronização" };
  }
}

// ============================================================================
// ✅ 2. BUSCAR HISTÓRICO COMPLETO DE COMPRAS (FATURAÇÃO)
// ============================================================================
export async function getUserOrders(email: string) {
  try {
    const query = `*[_type == "order" && clienteEmail == $email] | order(_createdAt desc) {
      _id,
      _createdAt,
      totalAmount,
      status,
      "items": items[].product->title
    }`;
    
    const orders = await client.fetch(query, { email }, { next: { revalidate: 0 } });
    
    return { success: true, orders: orders || [] };
  } catch (error) {
    console.error("Erro ao buscar encomendas:", error);
    return { success: false, orders: [] };
  }
}

// ============================================================================
// ✅ 3. ATUALIZAR OS DADOS DO UTILIZADOR NO PERFIL
// ============================================================================
export async function updateCustomerData(email: string, data: any) {
  try {
    const query = `*[_type == "user" && email == $email][0]`;
    const user = await client.fetch(query, { email });

    if (!user) {
      return { success: false, message: "Utilizador não encontrado." };
    }

    const fullName = `${data.firstName} ${data.lastName}`.trim();

    await writeClient.patch(user._id)
      .set({
        name: fullName,
        phone: data.phone,
        location: data.location
      })
      .commit();

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, error };
  }
}

// ============================================================================
// ✅ 4. ATUALIZAR PASSWORD DIRETAMENTE NO SANITY
// ============================================================================
export async function updateUserPassword(email: string, oldPass: string, newPass: string) {
  try {
    // 1. Procurar o utilizador no Sanity
    const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email: email.toLowerCase() });
    
    if (!user) return { success: false, error: "Utilizador não encontrado." };

    const hasPassword = user.password && user.password !== "";

    // 2. Lógica de Segurança
    if (hasPassword) {
      if (!oldPass) {
        return { success: false, error: "Precisas de introduzir a senha atual." };
      }
      const isValid = await bcrypt.compare(oldPass, user.password);
      if (!isValid) {
        return { success: false, error: "A senha atual está incorreta." };
      }
    }

    // 3. Validar a nova senha
    if (!newPass || newPass.length < 6) {
      return { success: false, error: "A nova senha deve ter pelo menos 6 caracteres." };
    }

    // 4. Encriptar e guardar no Sanity
    const hashedPassword = await bcrypt.hash(newPass, 10);
    
    await writeClient.patch(user._id)
      .set({ password: hashedPassword })
      .commit();

    return { success: true, message: "Senha atualizada com sucesso!" };

  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return { success: false, error: "Ocorreu um erro técnico ao guardar a senha." };
  }
}