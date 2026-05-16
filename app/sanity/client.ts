import { createClient } from "next-sanity";

// Variáveis públicas (disponíveis no servidor e no browser)
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "9eeq6tte";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Variável privada (disponível APENAS no servidor)
// O Next.js garante que esta variável será uma string vazia no browser
const token = process.env.SANITY_API_TOKEN || "";

/**
 * Cliente configurado para funções de servidor.
 * useCdn: false garante que os dados são sempre frescos (necessário para o token).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-02-12",
  useCdn: false, // Garantido como false para evitar cache de dados protegidos
  token,
  perspective: 'published',
  ignoreBrowserTokenWarning: true, 
});

/**
 * Helper para verificar se estamos a correr no servidor
 */
const isServer = typeof window === 'undefined';

if (!isServer && token) {
  console.warn("⚠️ Segurança: Um token do Sanity foi detetado no lado do cliente!");
}