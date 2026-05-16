"use server";

import { client } from "@/app/sanity/client";

export async function addTrialToUser(courseId: string, userEmail: string) {
  if (!courseId || !userEmail) return { success: false };
  
  try {
    const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email: userEmail });
    if (!user) return { success: false };

    const token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;
    const writeClient = client.withConfig({ token: token, useCdn: false });

    // 1. Prevenir duplicados na Nova Arquitetura (Verifica se já tem o trial nos enrollments)
    const jaTemNaNova = user.enrollments?.some((enr: any) => enr.course?._ref === courseId);
    if (jaTemNaNova) return { success: true };

    // 2. Calcular as datas exatas: Hoje, e Daqui a 7 dias
    const grantedDate = new Date();
    const expiresDate = new Date();
    expiresDate.setDate(grantedDate.getDate() + 7);

    // 3. Criar a estrutura exata da Nova Arquitetura (Matrículas)
    const novaMatricula = {
      _key: Math.random().toString(36).substring(2, 9), // O Sanity exige uma _key única
      course: {
        _type: 'reference',
        _ref: courseId
      },
      grantedAt: grantedDate.toISOString(),
      expiresAt: expiresDate.toISOString()
    };

    // 4. Gravar a Matrícula no sítio NOVO
    await writeClient.patch(user._id)
      .setIfMissing({ enrollments: [] })
      .insert('after', 'enrollments[-1]', [novaMatricula])
      .commit({ autoGenerateArrayKeys: true });

    return { success: true };
  } catch (err) {
    console.error("Erro ao atribuir Trial:", err);
    return { success: false };
  }
}