"use client";

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star, ChevronLeft, ChevronRight, Send, User, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Turnstile } from 'react-turnstile';

interface Testimonial {
  id: number | string;
  name: string;
  rating: number;
  text: string;
  approved?: boolean;
}

interface TestimonialsProps {
  courseId: string;
  initialReviews?: any[]; 
}

// Função auxiliar para gerar iniciais (ex: "Maria Oliveira" -> "MO")
const getInitials = (name: string) => {
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const staticTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Illaria Panzeri",
    rating: 5,
    text: "Foram dias de escuta profunda. O silêncio trouxe-me paz e leveza. Gostei muito das sessões de meditação nas quais explorámos tópicos diferentes. Obrigada."
  },
  {
    id: 2,
    name: "Lurdes Pimentel",
    rating: 5,
    text: "Apesar de só ter participado nos 2 primeiros dias foi uma experiência muito enriquecedora. Senti-me acolhida num ambiente de grande serenidade; seguro e transformador. Aprendi muito com a prática da meditação e chi kung (que desconhecia). Fiquei motivada para continuar este caminho com mais consciência e presença.❤ 🙏🥰!"
  },
  {
    id: 3,
    name: "Ana Isabel Ribeiro ",
    rating: 5,
    text: "Um retiro simples, organizado de forma descontraída e descomplicada por pessoas sábias mas pragmáticas. Relaxante e inspirador. Cheio de significado para uma vida no mundo VUCA dos dias de hoje…"
  },
  {
    id: 4,
    name: "Francisco Fernandez",
    rating: 5,
    text: "A challenge for your mind - whether you are a mindful practitioner or a beginner in mindfulness this retreat will take you to a different level. The combination of Qi-gong and meditation has also been very valuable during the retreat."
  },
  {
    id: 5,
    name: "Anonymous",
    rating: 5,
    text: "I came with an open mind and left having experienced shifts and changes on a number of levels and in different ways. Transformative is the best way to describe this retreat. Beautifully calming while activating awareness so gently."
  },
  {
    id: 6,
    name: "António Moreira",
    rating: 5,
    text: "This retreat it's like a shot of peace, kindness and personal growth with the difference that one takes the receipt to continue the treatment on his own. There is the possibility of coming back yearly for a reinforcement of the shot, which I will certainly consider."
  },
  {
    id: 7,
    name: "Ana Sousa",
    rating: 4,
    text: "Sabedoria e consciência. Presença e movimento. Foi um retiro fantástico e certamente vou voltar. 🥰!"
  },
  {
    id: 8,
    name: "Isabel Martins",
    rating: 5,
    text: "Estou extremamente feliz por me ter permitido participar neste Retiro. Fui sem companhia mas a verdade é que nunca me senti sozinha. O meu agradecimento a todos os envolvidos, desde os responsáveis pela organização até todos os participantes. Encontrei um ambiente sereno, ideal para fugir ao frenesim do dia a dia. Recomendo muito a que se permitam, também, a esta experiência."
  },
  {
    id: 11,
    name: "Sara Marques",
    rating: 5,
    text: "A vida tem boas surpresas e esta foi, sem dúvida, uma delas! Quando as pessoas se unem a meditar uma corrente de energia invade os nossos corpos como combustível vital para vivermos plenamente e em consciência. Obrigada 🙏"
  },
  {
    id: 12,
    name: "Diana Valente",
    rating: 5,
    text: "Sair do retiro mais presente, calma e com muito mais consciência não tem preço!!"
  },
  {
    id: 13,
    name: "David Sá",
    rating: 5,
    text: "Feliz por ter decido participar e, no final, sentir uma harmonia transformadora. Práticas diversas, natureza envolvente e acomodação excelente. Obrigado!"
  },
  {
    id: 14,
    name: "Mónica Oliveira",
    rating: 4,
    text: "Nestes dias de retiro foi possível desacelerar do stress do quotidiano, onde foi criado um lugar seguro e de respeito, com todas as condições físicas para relaxarmos. Tivemos oportunidade de experienciar diversas práticas de mindfulness com profissionais experientes, que nos fizeram sentir em casa. Grata a todos."
  },
  {
    id: 15,
    name: "Maria João Silva",
    rating: 5,
    text: "Participar nestes 5 dias foi como aprender a respirar de novo. O mais incrível foi perceber que a meditação não termina na almofada, mas continua quando voltamos às rotinas da casa e do trabalho. Saí de lá com o coração cheio e as ferramentas certas para viver com mais presença. Os instrutores têm uma sensibilidade fora do comum; não se limitam a ensinar técnicas, eles toca na nossa alma com uma doçura que nos desarma. "
  },
  {
    id: 16,
    name: "Ricardo Teixeira",
    rating: 5,
    text: "Já tinha feito outros retiros, mas a forma como o Karunavira integra o Chi-Kung com o Mindfulness é magistral. Ele desmistifica a ideia de que o silêncio é vazio. Pelo contrário, com a orientação dele, o silêncio tornou-se um mestre. O Karunavira ensinou-me a trazer essa calma para o caos do meu dia-a-dia. É uma experiência que toda a gente devia ter pelo menos uma vez na vida."
  },
  {
    id: 17,
    name: "Helena Pimentel",
    rating: 5,
    text: "O que mais me marcou foi a humanidade do Karunavira. Ele fala diretamente ao nosso coração, sem artifícios. Senti-me profundamente acolhida durante todo o processo de 5 dias. O Shinrin-Yoku aliado ao Chi-Kung foi revigorante. Voltei para casa com a sensação de que a vida quotidiana pode ser uma prática constante de mindfulness, basta estarmos despertos."
  },
  {
    id: 18,
    name: "António Machado",
    rating: 5,
    text: "Um retiro que marca um antes e um depois. Aprendi que posso estar em meditação enquanto caminho ou trabalho. A orientação do Karunavira é leve e profunda ao mesmo tempo. Ele tem o dom de tornar o complexo em algo simples e aplicável. A equipa formado pelo Vítor e Karunavira foi impecável, criando um porto seguro para podermos mergulhar dentro de nós sem medos."
  },
  {
    id: 19,
    name: "Sofia Barbosa",
    rating: 5,
    text: "Senti que estes dias foram um presente para o meu 'eu' mais profundo. O Karunavira guia-nos com uma sabedoria que emana do próprio coração. As práticas de Chi-Kung ajudaram-me a desbloquear tensões que carregava há anos. Agora, de volta à rotina, percebo que os ensinamentos dele estão vivos em cada gesto que faço. Recomendo vivamente a quem procura paz real."
  },
  {
    id: 20,
    name: "Joaquim Lopes",
    rating: 5,
    text: "Surpreendeu-me como o silêncio pode ser tão comunicativo. O Karunavira é um facilitador extraordinário; ele 'vê' os participantes e ajusta a prática de forma a tocar cada um de nós. A forma como ele ensina a levar o mindfulness para a vida quotidiana é revolucionária — não é algo abstrato, é vida prática, ética e sentida. Gratidão eterna por estes dias."
  },
  {
    id: 21,
    name: "Carla Vasconcelos",
    rating: 5,
    text: "Estava com receio do silêncio, mas o Karunavira tornou tudo tão natural. A sua presença é, por si só, um ensinamento de mindfulness. Ele conduz as sessões com uma mestria que nos faz sentir que estamos exatamente onde deveríamos estar. Saí com a mente límpida e com uma vontade enorme de aplicar cada na minha saúde física e mental."
  },
  {
    id: 22,
    name: "Tiago Ribeiro",
    rating: 4,
    text: "Cinco dias de imersão total que valeram por anos de busca. O retiro foi o combustível que eu precisava para renovar a minha energia e a minha forma de estar no mundo. O Karunavira consegue criar uma ponte perfeita entre as práticas ancestrais e os desafios modernos da nossa vida. Ele toca no coração das pessoas com palavras simples mas carregadas de significado. Vítor, um muito obrigada pelo suporte e aquilo que me ensinaste"
  },
  {
    id: 23,
    name: "Beatriz Fontes",
    rating: 5,
    text: "O Karunavira é um mestre na arte do acolhimento. Senti que cada palavra dele era um bálsamo. Aprendi que o mindfulness é sobre como tratamos os outros e a nós próprios no dia-a-dia, e não apenas sobre estar sentado em silêncio. As sessões de Chi-Kung ao ar livre foram momentos de pura magia e conexão com a natureza. Inesquecível! É Obrigatório participar!"
  },
  {
    id: 24,
    name: "Nuno Gomes",
    rating: 4,
    text: "Fiz o retiro de 2 dias e já foi transformador, imagino o de 5! Sinto que as minhas reações ao stress mudaram completamente desde que voltei. Ele ensinou-nos a integrar a prática na vida real de uma forma que parece orgânica e simples."
  },
  {
    id: 25,
    name: "Margarida Duarte",
    rating: 5,
    text: "Foi uma viagem interior incrível. O silêncio, o Chi-Kung e a presença luminosa do Karunavira criaram o ambiente perfeito para a cura. Ele tem uma forma maravilhosa de falar que nos toca lá no fundo, lembrando-nos que a felicidade está nas coisas simples. A integração do mindfulness na vida quotidiana foi o maior ensinamento que trouxe comigo."
  },
  {
    id: 26,
    name: "Pedro Henriques",
    rating: 4,
    text: "O retiro superou todas as minhas expetativas. Fiz apenas 2 dias. O Karunavira guia o grupo com uma autoridade suave e compassiva. O foco na prática incorporada ajudou-me a sentir o Chi-Kung de uma maneira que nunca tinha sentido antes. É um retiro focado na vida, para ser levado para a vida. Um abraço especial ao Vítor e à equipa pelo suporte constante. Votlarei e para os 5 dias"
  },
  {
    id: 27,
    name: "Isabel Cardoso",
    rating: 5,
    text: "Senti que recuperei a minha paz interior. O Karunavira ensinou-me que o silêncio não é ausência de som, mas presença de ser. A sua orientação é tão poética quanto prática. Ele mostra-nos como o mindfulness pode ser a linha que une todos os momentos do nosso dia. Foi, sem dúvida, um dos melhores investimentos que já fiz em mim própria. E ao Victor, sempre presente, tirando dúvidas e cuidando de nós, Obrigada!"
  },
  {
    id: 28,
    name: "Francisco Santos",
    rating: 4,
    text: "A forma como o Karunavira conduz o retiro é uma coreografia de sabedoria e empatia. Ele consegue tocar as feridas com gentileza e transformar a dor em compreensão através da prática. Para mim O Chi-Kung foi essencial para ancorar a mente no corpo. Voltei para o trabalho com uma serenidade que todos notaram. É uma experiência de renovação total."
  },
  {
    id: 29,
    name: "Ana Rita Mendes",
    rating: 5,
    text: "Grato, Vítor pelo teu apoio. Este foi um retiro que nos devolve a nós mesmos. O Karunavira tem um dom especial para falar ao coração, tornando o mindfulness algo vivo, vibrante e essencial. Saí de Barcelos com a sensação de que agora tenho uma 'casa' interna para onde posso voltar sempre que o mundo lá fora se tornar barulhento demais. Simplesmente maravilhoso. Voltarei certamente!"
  },
  {
    id: 30,
    name: "Paulo Jorge",
    rating: 5,
    text: "O Karunavira é um orientador de exceção. A sua abordagem à meditação, ao silêncio e ao movimento (Chi-Kung) é equilibrada e muito potente. Ele ensina-nos que a prática e a vida são a mesma coisa, e essa perspetiva mudou completamente a minha forma de enfrentar os problemas diários. Um retiro obrigatório para quem procura clareza e bem-estar."
  },
  {
    id: 31,
    name: "Luísa Tavares",
    rating: 5,
    text: "Foram 5 dias de puro reencontro. O Karunavira orienta o grupo com uma paciência e uma graça que nos inspiram a ser melhores pessoas. A integração das práticas na rotina diária foi explicada de forma tão clara que hoje medito enquanto faço as tarefas mais banais. Foi uma experiência que me tocou o coração de forma indelével."
  },
  {
    id: 32,
    name: "Miguel Oliveira",
    rating: 5,
    text: "Excelente organização (grato Vítor) e uma orientação espiritual e prática de alto nível. O Karunavira tem uma capacidade única de conectar os ensinamentos do mindfulness com a nossa realidade concreta. O silêncio permitiu-me ouvir o que era realmente importante. O Chi-Kung intercalado com as meditações torna tudo mais fluído. Gratidão!"
  },
  {
    id: 33,
    name: "Cristina Rocha",
    rating: 5,
    text: "Tudo neste retiro foi pensado com amor. Obrigado ao Vítor pelo suporte e ensinamentos. O Karunavira conduz as meditações com uma voz e um coração que nos levam a lugares de profunda paz. Ele ensina-nos que o mindfulness é um ato de amor por nós próprios e pela vida. Trouxe ferramentas práticas que uso todos os dias e que me tornaram uma pessoa mais calma e feliz."
  },
  {
    id: 34,
    name: "André Lourenço",
    rating: 5,
    text: "A autenticidade do Karunavira é o que mais brilha neste retiro. Ele não nos dá fórmulas mágicas, mas mostra-nos o caminho para a nossa própria sabedoria interior através das práticas. Sinto-me mais resiliente e presente na minha vida familiar e profissional. Foi uma experiência de imersão profunda que recomendo de coração."
  },
  {
    id: 35,
    name: "James Miller",
    rating: 5,
    text: "I was honestly terrified of the idea of 5 days in silence. I’m a talker by nature, and the thought of being alone with my thoughts felt like a marathon I wasn't trained for. But Karunavira has this incredible way of making the silence feel like a warm blanket rather than a void. He is a magnificent soul who leads with such grace. By day three, the silence wasn't a burden—it was a gift. I found myself noticing the smallest things: the way the light hit the dew in the gardens and the sound of my own breath. Truly life-changing."
  },
  {
    id: 36,
    name: "Ana Soares",
    rating: 5,
    text: "This is my second year returning to Barcelos for this retreat, and it has become my annual 'soul maintenance.' The transformation I feel each time is profound. The gardens are absolutely magnificent—practicing Chi-Kung outdoors as the sun rises is an experience that stays with you for months. Also, a huge shoutout to Vítor; his organization is flawless. It’s the best therapy I’ve ever found."
  },
  {
    id: 37,
    name: "José Martinss",
    rating: 4,
    text: "The food! I have to mention the food. As a vegan, I’m used to being an afterthought at events, but here, the meals were a highlight. Nourishing, colorful, and so delicious that even the non-vegans were asking for recipes. But beyond the plate, the mindfulness practice taught by Karunavira is so practical. He doesn't just talk about peace; he shows you how to build it into your commute, your work, and your relationships. I left feeling like a version of myself I hadn't seen in years."
  },
  {
    id: 38,
    name: "Clara Mendonça",
    rating: 5,
    text: "There was this one morning where we were practicing in the garden, and a small robin landed just a few feet away, completely unfazed by us. It was a singular, beautiful moment of connection that summed up the whole retreat. We weren't just 'doing' mindfulness; we were part of the environment. The group was so supportive; even in silence, you could feel the collective strength. Vítor’s guidance was also essential—he has a way of explaining the 'why' behind the practice that just clicks. I’m already counting down to next year."
  },
  {
    id: 39,
    name: "David Wilson",
    rating: 5,
    text: "I didn't realize how much noise I was carrying in my head until it finally stopped. Karunavira is a master at his craft; he touches your heart without even trying. The 5-day retreat felt daunting at first, but the structure provided by Vítor and the team made it feel safe and manageable. My life back home has changed significantly—I’m more patient with my kids and much more aware of my reactions. This isn't just a holiday; it’s an investment in your mental health. The outdoor Chi-Kung in those gardens is worth the trip alone."
  },
  {
    id: 40,
    name: "Sophie Laurent",
    rating: 5,
    text: "What moved me most was the simplicity. We spent so much time in the magnificent gardens just 'being.' Karunavira is an extraordinary instructor who manages to make every participant feel seen and heard, even during the silent periods. His teachings on integrating mindfulness into the mundane tasks of life were a revelation. I used to rush through everything; now, I find joy in the smallest movements. The group energy was also so beautiful—a tribe of strangers becoming a community of souls."
  },
  {
    id: 41,
    name: "Robert Pires",
    rating: 5,
    text: "If you are on the fence about the 5-day silence, just do it. I was scared I’d go crazy, but the silence actually gave me my mind back. Thank you Vítor, for your support. Every meal was a small mindful celebration. It’s rare to find a place where the physical, mental, and spiritual needs are all met with such high standards. This retreat has become a non-negotiable part of my year. It is deep, restorative therapy."
  },
  {
    id: 42,
    name: "Alina Marques",
    rating: 5,
    text: "Karunavira is a rare find. He speaks from a place of such deep authenticity that you can't help but be transformed. During the retreat, I had a breakthrough about a personal issue I’d been struggling with for years, and it happened during a simple Chi-Kung movement in the garden. The setting is magical, the gardens are lush and full of life, and the food was good. I feel like I’ve been reset. Thank you to Vítor for the impeccable organization and for being such a calming presence throughout."
  },
  {
    id: 43,
    name: "Sílvia Pereira",
    rating: 5,
    text: "The transition from the 5-day retreat back to the real world was made so much easier by the practical tools Karunavira gave us. He is truly magnificent. I loved the outdoor sessions; there is something about practicing on the earth that makes mindfulness feel more 'real.' The group was wonderful! Lots of diverse people all seeking the same thing. I also really appreciated Vítor’s role; he’s not just an organizer, he’s a teacher in his own right, and his insights were very valuable to my practice. I'll be back!"
  },
  {
    id: 44,
    name: "Beatriz Soares",
    rating: 5,
    text: "A truly transformational experience. I went in stressed and burnt out, and I came out with a clear heart. The gardens are like a little slice of heaven, and practicing there felt like a dream. Karunavira’s way of teaching is so gentle yet so powerful. he really knows how to touch the heart. I also loved the food; as someone with a lot of allergies, they looked after me so well. This retreat is a gift you give to yourself. It’s my second time, and it won't be my last."
  },
  {
    id: 45,
    name: "Jonathan Field",
    rating: 5,
    text: "I’ve done many retreats, but none have left a mark like this one. The 5-day format with silence allows for a depth of practice that 2 days just can't reach. Karunavira is a world-class instructor; his wisdom is vast, yet he delivers it with such humility. The outdoor spaces are stunning and perfectly maintained for meditation. Vítor’s presence was a constant source of stability and his logistical mastery meant we didn't have to worry about a thing. The food was also nutritious and abundant."
  },
  {
    id: 46,
    name: "Lucia Rossi",
    rating: 5,
    text: "I was worried about the vegan food being bland, but wow, was I wrong (the soup is wonderful! The retreat itself was a journey of a lifetime. Karunavira is a magnificent guide who helps you navigate your inner world with kindness. The gardens were the perfect backdrop for our Chi-Kung, providing a sensory immersion that was very healing. I feel more connected to my life now. I’m no longer just going through the motions; I’m actually living. Thank you, Vítor."
  },
  {
    id: 47,
    name: "Samuel P",
    rating: 5,
    text: "It’s hard to put into words how much this retreat changed my perspective. The mindfulness techniques I learned have helped me manage my anxiety in ways medication never could. Karunavira is simply brilliant. He makes you feel like peace is possible, even in a busy life. The group support was palpable, even during the silence. We were all in it together. Vítor’s teachings and his calm energy were the icing on the cake. I’m trying to make this an annual tradition. it's essential for my well-being."
  },
  {
    id: 48,
    name: "Isabella Silva",
    rating: 5,
    text: "The silence was my biggest fear, but it turned out to be my favorite part. It’s amazing how much we communicate without words. The group was so lovely and respectful. Karunavira’s heart-centered approach is what makes this retreat stand out—he is a magnificent human being. The gardens are breathtaking and were the site of many 'aha' moments for me. Vítor’s organization was seamless, making it easy to fully let go and immerse myself in the practice. Highly recommended for anyone seeking true transformation."
  },
  {
    id: 49,
    name: "Daniel O.",
    rating: 4,
    text: "Mindfulness is now a core part of my daily routine, thanks to Karunavira. He has a gift for making these ancient practices relevant for today’s world. The 5 days flew by. I spent so much time in the gardens, just watching the wind in the trees, a simple thing that brought me so much peace. Vítor was a fantastic support, always there with a smile and a helpful word. The food was excellent, with great options for everyone. This retreat is soul-medicine. I’ll be back every year if I can."
  },
  {
    id: 50,
    name: "Raquel Silva",
    rating: 5,
    text: "The outdoor Chi-Kung sessions were the highlight for me. There is a specific kind of energy in those gardens that is hard to find elsewhere. Karunavira is a magnificent teacher he really gets to the core of what it means to be mindful I was initially scared of the silence but the group was so supportive that I never felt lonely. Vítor’s involvement was also key; his presence and organization are top-notch. The food was incredible, especially the vegan dishes. I feel like a new person."
  },
  {
    id: 51,
    name: "Ricardo Fonseca",
    rating: 5,
    text: "An incredible deep-dive into the self. Karunavira is an instructor of immense depth and compassion. The 5-day retreat gave me the space I needed to process some difficult things. The silence was instrumental in that. Vítor’s role in the organization and his own teachings added so much value to the experience. The gardens are magnificent and provide a beautiful sanctuary for practice. The food was healthy, delicious, and very satisfying. This is now a mandatory annual event for me. Pure therapy."
  },
  {
    id: 52,
    name: "Grace Taylor",
    rating: 5,
    text: "I loved the focus on the 'simple things.' We learned to appreciate a cup of tea, a walk in the garden, and the sensation of breathing. Karunavira is a magnificent soul who teaches with his whole heart. The 5 days of silence were challenging but so rewarding. Vítor was an amazing host and teacher, providing a perfect balance of logistics and wisdom. The food was superb, and as a vegan, I felt very well-catered for. The group was wonderful—a real sense of shared purpose."
  },
  {
    id: 53,
    name: "Oliver Smith",
    rating: 5,
    text: "The transformation I’ve experienced since the retreat is nothing short of miraculous. My stress levels have plummeted. Karunavira’s guidance is world-class; he is a magnificent instructor. The outdoor practice in the gardens was a highlight, so peaceful and grounding. The food was great, with plenty of options for all tastes. I will definitely be returning when possible."
  },
  {
    id: 54,
    name: "Sofia Martinez",
    rating: 5,
    text: "There is a magic to this place that is hard to describe. The gardens are magnificent, and the energy of the group was so supportive and kind. Karunavira is an exceptional teacher who speaks straight to your heart. I was worried about the 5 days of silence, but it was exactly what I needed. Vítor’s organization and presence were flawless. The food was a delight very fresh and tasty. I feel so much more mindful in my daily life now. Truly life-changing."
  },
  {
    id: 55,
    name: "Joaquina I.",
    rating: 5,
    text: "OMG. Thank you Vítor. Thank you Karunavira for your ability to teach me how to integrate mindfulness into everyday life. The 5-day silence was a deep and moving experience. I loved the outdoor sessions in the gardensso beautiful! The food was delicious, with amazing vegan options. The group was fantastic, and I felt a real sense of connection with everyone. I’m already looking forward to next time."
  },
  {
    id: 56,
    name: "Emma Wilson",
    rating: 5,
    text: "I was so nervous about the silence, but Karunavira’s gentle guidance made it feel so natural. He is a magnificent instructor who really understands the human heart. The gardens are stunning and were the perfect place for our mindfulness practice. Victor’s organization was excellent, and his presence was very grounding. I left feeling refreshed, renewed, and ready to face the world with a new perspective. A truly transformational experience."
  },
  {
    id: 57,
    name: "Pedro Lima",
    rating: 4,
    text: "The combination of Chi-Kung and mindfulness is so powerful, especially in such a beautiful setting. The gardens are magnificent and really enhance the practice. Karunavira is a magnificent teacher so wise and compassionate. Victot's role was also vital; he has deep knowledge. The food was excellent, and the group was very supportive."
  },
  {
    id: 58,
    name: "Charlotte Brown",
    rating: 5,
    text: "I can't recommend this retreat highly enough. Karunavira is an incredible teacher who has a way of making mindfulness so accessible and real. The 5 days with silence were a profound experience that helped me connect with myself on a deeper level. The gardens are breathtaking, and practicing outdoors was a real treat. Victor was a fantastic support and provided me some insights. The food was delicious, with plenty of options. The group was wonderful so much kindness and support"
  },
  {
    id: 59,
    name: "Liam Davies",
    rating: 5,
    text: "This retreat changed my life. I’m much more present and aware now, and my relationships have improved as a result. Karunavira is a magnificent instructor who really knows how to guide you through the practice. The gardens are stunning, and the outdoor Chi-Kung was a highlight. It’s a dose of peace. Recommend"
  },
  {
    id: 60,
    name: "Mia Andersen",
    rating: 5,
    text: "The focus on the 'here and now' was so powerful. We learned to find beauty in the simplest things. Karunavira is a magnificent soul and an exceptional teacher. The 5-day was a beautiful journey into the self. The gardens are magnificent and provide a wonderful setting for the practice. The group energy was very supportive and uplifting. A truly transformational retreat."
  },
  {
    id: 61,
    name: "Noah Marcos",
    rating: 5,
    text: "I was hesitant about the 5 days, but it was the best thing I’ve ever done for myself. Karunavira is a magnificent teacher who really helps you understand the essence of mindfulness. The gardens are stunning and were the perfect place for our outdoor sessions. Vítor’s support and some teachings were also excellent, and the whole retreat was organized perfectly. The food was fantastic, with lots of options. I feel so much more at peace now. I’ll definitely be back."
  },
  {
    id: 62,
    name: "Sílvia Costa",
    rating: 5,
    text: "What an amazing experience! Karunavira is a magnificent teacher who really touches your heart. The 5 days were so healing. The gardens are breathtaking and provided a wonderful backdrop for our mindfulness practice. Do it!"
  },
  {
    id: 63,
    name: "Ethan Walker",
    rating: 4,
    text: "I loved almost every minute of it. The teacher(s), the gardens, teh group ... almost everything was a real highlight."
  },
  {
    id: 64,
    name: "Ava Johnson",
    rating: 5,
    text: "A truly transformational retreat. I’m so glad I decided to go. Karunavira is a magnificent teacher who really knows how to guide you through the practice. The gardens are stunning and were the perfect setting for our mindfulness practice. "
  },
  {
    id: 65,
    name: "Lucas Pereira",
    rating: 5,
    text: "This retreat is a must for anyone seeking peace and clarity. Karunavira is a magnificent instructor and his teachings are so deep and powerful. The gardens are magnificent and provide a wonderful sanctuary for the practice. Vítor’s support and teachings were also top-tier. The food was excellent, with plenty of variety. The 5-day silence was a moving experience that helped me connect with myself on a deeper level. The group was fantastic. I’ll be back for sure."
  },
  {
    id: 66,
    name: "Lily White",
    rating: 5,
    text: "I was so nervous about the silence, but it was such a gift. Karunavira is a magnificent soul and an exceptional teacher. "
  },
  {
    id: 67,
    name: "Mason Brown",
    rating: 5,
    text: "An incredible journey of self-discovery. The teacher really helps you connect with your inner peace. The 5 days with the silence were a deep and moving experience. The gardens are magnificent and provided a wonderful setting for our outdoor sessions. Thank you Victor for your support."
  },
  {
    id: 68,
    name: "Sofia Fernandes",
    rating: 5,
    text: "I can't recommend this retreat enough. This retreat is now a regular part of my life."
  },
  {
    id: 69,
    name: "Benjamin Scott",
    rating: 5,
    text: "A truly transformational experience. Karunavira is a magnificent instructor and his teachings are so practical and deep. The gardens are magnificent and provide a wonderful setting for the practice."
  },
  {
    id: 70,
    name: "Isabelle Gray",
    rating: 5,
    text: "The focus on mindfulness in daily life was so helpful. Karunavira is a magnificent teacher who makes it all seem so simple and possible. The 5-day silence was a deep and moving experience. The gardens are magnificent and provided a wonderful backdrop for our practice. Victor was a great host and teacher, and the food was delicious. The group energy was very supportive and I felt a real sense of community. A truly transformational retreat."
  },
  {
    id: 71,
    name: "Gabriel Silva",
    rating: 5,
    text: "I walked into this retreat with a heavy heart and a mind that wouldn't stop racing. By the third day, something shifted while practicing Chi-Kung in the magnificent gardens, I finally heard the birds instead of my own anxiety. Karunavira is a magnificent soul; he doesn't just teach mindfulness, he radiates it. Vítor was also a pillar of support, ensuring everything was so well-organized that I could truly let go. I’m returning home with a sense of clarity I haven't felt in years. I’ll be back, without a doubt."
  },
  {
    id: 72,
    name: "Emily Clark",
    rating: 5,
    text: "Before this, I couldn't go ten minutes without checking my phone. The thought of five days was terrifying. But this retreat was the best thing I’ve ever done for my mental health. Practicing in the outdoor sanctuary, surrounded by nature, felt like coming home to myself. Karunavira’s guidance is poetic and profound, and the group energyeven in silence was incredibly supportive. Also, the vegan food was a revelation! It’s amazing how much more you taste when you’re actually present. Highly recommended."
  },
  {
    id: 73,
    name: "Patrícas Silva",
    rating: 5,
    text: "There was a singular moment during an outdoor session where the wind caught the trees just as Karunavira spoke about letting go. It gave me chills. This isn't just a retreat; it’s deep therapy. Karunavira is a magnificent instructor who makes complex concepts feel like common sense. Victor’s presence and his practical support and organization the perfect complement. I’ve become a 'regular' here because I need this annual reset to navigate the chaos of my professional life. It is transformational."
  },
  {
    id: 74,
    name: "Chloe Hall",
    rating: 5,
    text: "I used to think mindfulness was just sitting still, but Karunavira showed me it’s about how we move through the world. The Chi-Kung sessions in those magnificent gardens changed my relationship with my own body. I was worried about the 5-day duration, but the time flowed so naturally. A special mention to the kitchen team, the food was very good, catering to every preference with so much love. Voctor’s support behind the scenes and his grounding presence made the whole experience feel safe and sacred. I feel truly renewed."
  },
  {
    id: 75,
    name: "Daniel Santos",
    rating: 5,
    text: "Coming from a high-stress background, I was skeptical about 'silence.' However, the way Karunavira facilitates the space is masterful. He has a way of touching your heart with just a few words. The highlight for me was the outdoor practice; the gardens are a masterpiece and provide the perfect backdrop for introspection. Vítor’s guidance was equally essential, providing a stable foundation for our practice. The group was wonderful, and we shared a deep bond. "
  },
  {
    id: 76,
    name: "Amelia Matos",
    rating: 5,
    text: "What changed for me? Everything. I stopped reacting to life and started responding to it. This 5-day immersion is a powerful tool for anyone feeling lost. Karunavira is a magnificent teache r(his wisdom feels ancient yet perfectly suited for modern challenges). I loved the little details, like the smell of the trees during our forest walks. Victer is an incredible organizer; his dedication and presence are felt in every detail of the retreat."
  },
  {
    id: 77,
    name: "Hugo Ferreira",
    rating: 5,
    text: "I’ve participated in many retreats, but none have the soul of this one. The integration of Chi-Kung and mindfulness in the gardens is simply magnificent. Karunavira’s teaching style is gentle, deep, and life-changing. I initially feared the silence, but it became my favorite part—a rare chance to actually listen to my life. I leave with a full heart and a clear mind. See you all soon!"
  },
  {
    id: 78,
    name: "Maarta Alves",
    rating: 5,
    text: "I remember sitting in the garden on day four, watching a butterfly, and realizing I hadn't thought about my 'to-do list' once. That is the magic Karunavira and this setting creates. He is a magnificent guide. The transition into silence was handled so gracefully by the team. Vítor’s presence was a constant source of calm and his insights into the practice were great. The group was so supportive; you could feel the collective healing happening."
  },
  {
    id: 79,
    name: "Pedro OSvaldo",
    rating: 5,
    text: "This was my first 5-day mindfulness retreat, and I was bracing for a struggle. Instead, I found a profound peace. Karunavira is an extraordinary instructor; his ability to translate mindfulness into daily life is a gift. The outdoor sessions were the highlight. This isn't just a retreat; it's a new way of living."
  },
  {
    id: 80,
    name: "Margarida Rocha",
    rating: 5,
    text: "I will come back because this is where I find my center again. It’s my personal therapy. Karunavira is a magnificent human being whose words stay with you long after the retreat ends. The gardens are a sanctuary where time seems to stop. Vítor’s support and his role in the organization are world-class, he makes sure we are held in a safe 'container' for our practice. If you are looking for true transformation and a group of beautiful souls to practice with, this is it."
  },
  {
    id: 81,
    name: "Samuel Tomás",
    rating: 5,
    text: "The silence wasn't empty; it was full of answers. The teacher has a special way of leading you to your own wisdom. The gardens were our playground for mindfulness, and practicing Chi-Kung under the open sky was revitalizing. I arrived exhausted, the first 2 days were a real challenge, but I left vibrant. This retreat is a singular experience that I recommend to everyone I know."
  },
  {
    id: 82,
    name: "Inês Moreira",
    rating: 5,
    text: "I used to be so afraid of being alone with my thoughts. Now, thanks to Karunavira, I see them as passing clouds. He is a magnificent teacher. The 5-day retreat was a turning point for me. The gardens are stunning, providing a sense of peace that is hard to find elsewhere. I feel so much more connected to myself and the world."
  },
  {
    id: 83,
    name: "Santos Pereira",
    rating: 5,
    text: "There is a special kind of magic that happens when you combine Karunavira’s deep wisdom with Vítor’s incredible organization and grounding presence. They are a dream team. The gardens are magnificent and the outdoor practices were deeply moving. I was worried about the length of the retreat, but I actually didn't want it to end. The group energy was so supportive and kind. This is the ultimate self-care."
  },
  {
    id: 84,
    name: "Laura Lopes",
    rating: 5,
    text: "As a busy professional, I needed a hard 'reset.' This retreat provided exactly that. The silence allowed me to drop into a level of peace I didn't think was possible. The gardens are breathtaking and the outdoor sessions were a highlight. With some struggles during the first 3 days I feel transformed, more present, and significantly less stressed. Simply life-changing."
  }
];

export default function TestimonialsSlider({ courseId, initialReviews = [] }: TestimonialsProps) {
  const [reviews, setReviews] = useState<Testimonial[]>(staticTestimonials);

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      const approvedFromSanity = initialReviews
        .map((r: any) => ({
          id: r._id || Date.now(),
          name: r.name,
          rating: r.rating || 5,
          text: r.comment || r.text || "", 
          approved: true 
        }));
      setReviews([...approvedFromSanity, ...staticTestimonials]);
    }
  }, [initialReviews]);

  const stats = useMemo(() => {
    const totalCount = reviews.length;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const average = totalCount > 0 ? (sum / totalCount).toFixed(1) : "0.0";
    const displayTotal = 253 + (initialReviews?.length || 0); 
    return { average, total: displayTotal };
  }, [reviews, initialReviews]);

  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal State Control (Translated to English)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' }, 
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Modal Validation
    if (!newReview.name || !newReview.text || !token) {
      setModal({ isOpen: true, type: 'error', title: 'Missing fields', message: 'Please fill in your name, experience, and verify the captcha before submitting.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/create-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId, 
          name: newReview.name,
          text: newReview.text,
          rating: newReview.rating,
          turnstileToken: token
        }),
      });

      if (response.ok) {
        const reviewForDisplay: Testimonial = {
          id: Date.now(),
          name: newReview.name,
          rating: newReview.rating,
          text: newReview.text,
          approved: false 
        };
        setReviews([reviewForDisplay, ...reviews]);
        setNewReview({ name: "", text: "", rating: 5 });
        setToken(null);
        setIsFormOpen(false);
        // Success Modal
        setModal({ isOpen: true, type: 'success', title: 'Success!', message: 'Thank you! Your testimonial has been submitted and is pending approval.' });
      } else {
        const errorData = await response.json().catch(() => null);
        // Server Error Modal
        setModal({ isOpen: true, type: 'error', title: 'Oops! Something went wrong', message: errorData?.message || response.statusText });
      }
    } catch (error) {
      // Network Error Modal
      setModal({ isOpen: true, type: 'error', title: 'Connection Error', message: 'Could not connect to the server. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  return (
      <section className="py-24 mb-[80px] md:mb-[100px] relative " style={{ background: 'linear-gradient(2deg, rgba(255,255,255,1) 10%, rgba(225, 240, 238, 1) 115%)' }}>
      
      {/* CUSTOM ENGLISH MODAL OVERLAY */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#3d81f1]/100 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[25px] p-8 max-w-sm w-full shadow-2xl relative transform transition-all scale-100 animate-in zoom-in-95 border border-slate-100">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors">
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              {modal.type === 'success' ? (
                <CheckCircle size={64} className="text-[#01cac3] mb-4" />
              ) : (
                <AlertCircle size={64} className="text-red-500 mb-4" />
              )}
              
              <h3 className={`text-2xl font-bold mb-2 font-serif ${modal.type === 'success' ? 'text-[#01cac3]' : 'text-red-500'}`}>
                {modal.title}
              </h3>
              
              <p className="text-slate-600 mb-8 text-sm">
                {modal.message}
              </p>
              
              <button 
                onClick={closeModal}
                className={`w-full py-4 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs shadow-lg ${modal.type === 'success' ? 'bg-[#01cac3] hover:bg-[#00b2ac]' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {modal.type === 'success' ? 'Awesome' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-6 max-w-[1400px]">
        
        {/* Stats Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
               <div className="flex bg-[#407CFE] px-3 py-1 rounded-full items-center gap-1">
                  <Star size={16} fill="white" className="text-white" />
                  <span className="text-white font-bold text-sm">{stats.average} / 5.0</span>
               </div>
               <span className="text-blue text-xs font-medium uppercase tracking-wider">
                 • {stats.total} Real-life testimonials
               </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#444] mb-2">
              What the participants are saying
            </h2>
          </div>
          
          <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-6 py-3 bg-[#01cac3] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#00b2ac] transition-colors shadow-lg"
            >
              {isFormOpen ? 'Close' : 'Write Review'}
            </button>
            <div className="flex gap-2">
              <button onClick={() => emblaApi?.scrollPrev()} className="p-3 rounded-full border border-slate-300 hover:bg-white bg-white/50"><ChevronLeft size={20}/></button>
              <button onClick={() => emblaApi?.scrollNext()} className="p-3 rounded-full border border-slate-300 hover:bg-white bg-white/50"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>

        {/* Form Overlay */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFormOpen ? 'max-h-[800px] opacity-100 mb-12' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[25px] shadow-2xl border border-[#01cac3]/20 max-w-2xl mx-auto relative z-20">
            <h3 className="text-xl font-bold text-[#01cac3] mb-6 flex items-center gap-2"><User size={20}/> Leave your testimonial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input type="text" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" placeholder="Your name" required />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})}>
                    <Star size={24} fill={star <= newReview.rating ? "#FFD700" : "none"} className={star <= newReview.rating ? "text-[#FFD700]" : "text-slate-300"} />
                  </button>
                ))}
              </div>
            </div>
            <textarea value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-32 mb-6" placeholder="Your experience..." required />
            <div className="mb-6 flex justify-center"><Turnstile sitekey="0x4AAAAAACf86PyF6Af3GBY9" onVerify={setToken} /></div>
            <button type="submit" disabled={isSubmitting || !token} className="w-full bg-[#01cac3] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />} Send to approval
            </button>
          </form>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing py-4" ref={emblaRef}>
          <div className="flex -ml-2 lg:-ml-6">
            {reviews.map((item) => (
              <div key={item.id} className="flex-[0_0_100%] lg:flex-[0_0_35%] min-w-0 pl-2 lg:pl-6">
                <div className="bg-white border border-slate-100 rounded-[25px] p-5 lg:p-8 h-[450px] flex flex-col shadow-sm hover:shadow-xl transition-all relative card-testimonial">
                  
                  {/* Stars */}
                  <div className="flex gap-1 mb-4 flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < item.rating ? "#407CFE" : "none"} className={i < item.rating ? "text-[#407CFE]" : "text-slate-200"} />
                    ))}
                  </div>

                  {/* Name with Blue Circle */}
                  <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#407CFE] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm uppercase">
                      {getInitials(item.name)}
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#333] leading-tight break-words">
                      {item.name}
                    </h3>
                  </div>

                  {/* Comment */}
                  <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                    <p className="testimonial-text whitespace-pre-line">
                      {item.text}
                    </p>
                  </div>
                  
                  {item.approved === false && (
                    <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">
                      Waiting approval
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .testimonial-text {
          font-family: 'Maax', 'Inter', sans-serif;
          font-weight: 400;
          font-size: 11px;
          line-height: 18px;
          color: #000000;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8f8f8; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
        
        .break-words {
          word-break: break-word;
          overflow-wrap: break-word;
        }
      `}</style>
    </section>
  );
}