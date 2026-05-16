// app/data/courses-content.ts

export const coursesDetails: Record<string, any> = {
  "introducao-ao-mindfulness-completo": {
    originalPrice: 75,
    sessionsCount: 46,
    audiosCount: 58,
    durationInMonths: 12,
    whatYouWillLearn: [
      "Estabilizar e serenar a mente, o corpo e o coração",
      "Sair do piloto automático e viver com maior consciência",
      "Integrar Mindfulness nas tarefas do dia a dia",
      "Reduzir significativamente os níveis de Stress",
      "Trabalhar com o crítico interior e cultivar autocompaixão",
      "Desenvolver uma consciência aberta (Prática sem objeto)"
    ],
    levels: [
      {
        title: "Nível 1 - Fundamentos e Presença",
        sessions: 16,
        audios: 28,
        description: "Convidando interesse e curiosidade para o seu mundo interior. Foco em sair do piloto automático e redução de stress."
      },
      {
        title: "Nível 2 - Reatividade e Mente",
        sessions: 14,
        audios: 14,
        description: "Viver com menor reatividade e enfrentar dificuldades. Trabalho com as 'Qualidades do Coração'."
      },
      {
        title: "Nível 3 - Consciência Avançada",
        sessions: 16,
        audios: 16,
        description: "Relacionamento sem apego com a vida. Trabalho com o crítico interior e Consciência Aberta."
      }
    ],
    requirements: [
      "Nenhum conhecimento prévio necessário",
      "Disposição para praticar 15-20 minutos por dia",
      "Um local calmo para ouvir as meditações"
    ],
    targetAudience: [
      "Iniciantes absolutos em meditação",
      "Pessoas com altos níveis de stress ou ansiedade",
      "Profissionais que procuram foco e equilíbrio emocional"
    ]
  }
};