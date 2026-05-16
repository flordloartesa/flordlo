import { createClient } from 'next-sanity'

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03', // Usa a data atual ou a que tens no outro client
  useCdn: false, // Obrigatório ser false para escrita
  token: process.env.SANITY_API_WRITE_TOKEN, // 🔑 O Token que criaste no painel do Sanity
})