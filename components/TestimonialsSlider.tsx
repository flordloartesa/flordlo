"use client";

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star, ChevronLeft, ChevronRight, Send, User, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Turnstile } from 'react-turnstile';

// 🎯 IMPORTAÇÃO DA ACTION
import { submitReviewAction } from "@/app/actions/submitReview";

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

// ✅ Função protegida contra nomes vazios ou inválidos
const getInitials = (name: string | undefined | null) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return "?";
  }
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0][0].toUpperCase();
};

const staticTestimonials: Testimonial[] = [
{ id: 1, name: "Mariana Silva", rating: 5, text: "O meu bouquet estava simplesmente divino! Nota-se que a Ló coloca o coração em cada pétala e tem um cuidado quase maternal com as flores. Foi o detalhe mais elogiado do meu casamento, desde as cores vibrantes até à frescura que aguentou o dia inteiro sob o calor. Superou tudo o que eu tinha imaginado para o meu grande dia!" },
 { id: 2, name: "Sofia Henriques", rating: 4, text: "Trabalho lindíssimo na decoração da igreja, com um equilíbrio perfeito entre o clássico e o moderno. As flores eram fresquíssimas e o aroma inundava todo o espaço, criando uma atmosfera mágica. Apenas gostaria de ter tido um pouco mais de tempo para a sessão de greenery, que estava deslumbrante e merecia ainda mais destaque nas fotografias." },
 { id: 3, name: "Beatriz Fonseca", rating: 5, text: "A Aurora e a Rita são verdadeiras artistas! O conceito de falarem com as flores deve ser real, porque o brilho, a postura e a energia dos arranjos são de outro mundo, algo que nunca vi noutra florista. Sentimos que cada peça conta uma história e traz uma alma própria para o evento. Recomendo a todos que procuram algo que não seja apenas 'bonito', mas sim transcendental." },
 { id: 4, name: "Ricardo Pereira", rating: 5, text: "Contratei para a boutonnière e pormenores florais do meu fato e dos padrinhos. Serviço de excelência, muito profissional e com um gosto impecável." },
 { id: 5, name: "Ana Rita Sousa", rating: 5, text: "Ló, querida, obrigada por todo o carinho e pela paciência infinita! O teu cuidado minucioso com os pormenores florais fez toda a diferença no nosso dia, desde a escolha das texturas até à forma como os ramos caíam. Sentir a vossa dedicação familiar deu-nos uma tranquilidade absoluta. Recomendo de olhos fechados a qualquer noiva exigente!" },
 { id: 6, name: "Catarina Meireles", rating: 5, text: "Um projeto familiar que transborda amor em cada gesto. A Rita percebeu exatamente o que eu queria para o centro de mesa logo na primeira reunião, traduzindo as minhas ideias confusas em perfeição técnica e artística. É raro encontrar profissionais que ouçam tão bem e entreguem algo que supera a expectativa inicial com tanta elegância." },
 { id: 7, name: "Margarida Costa", rating: 4, text: "Flores de muita qualidade e um design muito diferenciado no Porto. O serviço de entrega no Algarve foi pontual, apesar da distância." },
 { id: 8, name: "Helena Matos", rating: 5, text: "A sessão de greenery transformou o espaço do evento num autêntico jardim encantado, parecia que tínhamos sido transportados para um conto de fadas botânico. É visível a experiência de décadas nestas mãos e a sabedoria da Aurora em selecionar as melhores folhagens. O impacto visual foi absoluto e todos os convidados ficaram maravilhados com a transformação do salão." },
 { id: 9, name: "Patrícia Antunes", rating: 5, text: "Desde o bouquet à decoração do salão, tudo foi pensado ao detalhe com uma harmonia cromática impecável. A Ló tem uma sensibilidade rara para perceber a personalidade da noiva e refletir isso nas flores, criando um ambiente que parecia uma extensão de nós próprios. É um privilégio ter o trabalho delas num momento tão importante da nossa vida." },
 { id: 10, name: "Inês Oliveira", rating: 5, text: "A flor.d.ló não faz apenas arranjos, cria arte viva. As flores são as mais bonitas que já vi, super resistentes e com cores tão vibrantes que pareciam pintadas à mão. É impressionante como conseguem manter a qualidade técnica enquanto entregam um produto com tanta carga emocional e estética. Tornaram-se a minha referência absoluta para qualquer evento futuro." },
 { id: 11, name: "Joana Vasconcelos", rating: 5, text: "Obrigada Rita e Aurora por tornarem o meu sonho realidade com tanta mestria. A vossa dedicação é inspiradora e o resultado final foi único, captando toda a essência do que tínhamos planeado para o nosso casamento nupcial. Cada pequeno detalhe, desde o laço do bouquet até à disposição das pétalas no altar, foi executado com uma perfeição que nos deixou sem palavras." },
 { id: 12, name: "Tiago Almeida", rating: 4, text: "Excelente bom gosto na decoração do nosso espaço comercial no Porto. Equipa muito atenciosa e profissional." },
 { id: 13, name: "Carla Magalhães", rating: 5, text: "A atenção aos pormenores florais é o que as distingue de tudo o que existe no mercado. Sentimos que cada flor foi escolhida a dedo nos melhores fornecedores, garantindo uma durabilidade que nos permitiu aproveitar os arranjos durante dias após a festa. Um serviço de luxo, com muita alma e um acompanhamento que nos faz sentir parte da família." },
 { id: 14, name: "Marta Guimarães", rating: 5, text: "O segredo de falarem com as flores deve ser verdade, só isso explica a beleza e a vivacidade do que entregam! O meu bouquet durou imenso tempo e parecia estar sempre no seu auge. Obrigada pelo carinho constante, Ló; a tua presença e o teu olhar atento às minhas inseguranças transformaram o processo de escolha numa experiência de puro prazer e descoberta artística." },
 { id: 15, name: "Luísa Ferreira", rating: 5, text: "Profissionais incríveis de Norte a Sul do país. Organizaram a vertente nupcial do meu casamento em Évora com uma mestria absoluta, provando que a distância não é barreira para a qualidade da flor.d.ló. A logística foi impecável e a montagem das estruturas de greenery foi feita com uma rapidez e precisão que revelam os anos de experiência da equipa." },
 { id: 16, name: "Francisca Gomes", rating: 5, text: "A harmonia entre mãe e filha reflete-se no trabalho. Tudo flui com elegância e sofisticação. Adorei a sessão de greenery." },
 { id: 17, name: "Sandra Pinto", rating: 5, text: "Ló, o teu trabalho é poesia visual em estado puro. Não houve uma única pessoa que não comentasse a beleza fora do comum da boutonnière e do meu ramo, que parecia ter sido colhido num jardim secreto. A forma como combinas as texturas e as cores cria um impacto visual que fica gravado na memória. Foi, sem dúvida, a melhor escolha que fizemos para o casamento." },
 { id: 18, name: "Cristina Santos", rating: 4, text: "Arranjos lindíssimos e muito originais. A comunicação durante o processo foi boa, embora muito solicitadas devido ao sucesso!" },
 { id: 19, name: "Diogo Martins", rating: 5, text: "Serviço nupcial de topo, com um nível de sofisticação que raramente se encontra. A flor.d.ló conseguiu elevar o ambiente do nosso evento para outro nível através de pormenores florais estratégicos e uma iluminação vegetal magnífica. O profissionalismo da Rita na gestão do projeto e a execução artística da Aurora formam uma combinação imbatível no setor floral em Portugal." },
 { id: 20, name: "Bárbara Rocha", rating: 5, text: "A Rita tem um olho clínico para o design floral moderno, trazendo tendências internacionais para o nosso país. Combinado com a experiência clássica e o saber-fazer de décadas da Aurora, o resultado é uma assinatura visual imbatível e inconfundível. Conseguiram criar um cenário que era simultaneamente atual e intemporal, exatamente como eu desejava para as minhas fotos." },
 { id: 21, name: "Daniela Viegas", rating: 5, text: "Sentir o perfume e a frescura daquelas flores logo pela manhã foi um momento mágico que nunca esquecerei. Percebe-se perfeitamente que selecionam os melhores fornecedores do mercado e que não aceitam nada menos que a perfeição. A qualidade botânica é soberba, mas é o toque artístico da Ló que transforma essas matérias-primas em algo verdadeiramente emocionante e exclusivo." },
 { id: 22, name: "Teresa Lacerda", rating: 5, text: "Querida Ló, obrigada pela paciência infinita e por ouvires todos os meus pedidos, mesmo os mais invulgares. O resultado superou qualquer expectativa que eu tinha, criando um ambiente acolhedor e luxuoso ao mesmo tempo. A vossa capacidade de transformar um espaço frio numa sessão de greenery vibrante e cheia de vida é um talento que merece ser celebrado por todos!" },
 { id: 23, name: "Filipa Cavaco", rating: 4, text: "Trabalho muito artístico e delicado. Nota-se que são apaixonadas pelo que fazem. O bouquet era um bocadinho pesado, mas deslumbrante." },
 { id: 24, name: "Andreia Soares", rating: 5, text: "Cada detalhe é olhado ao pormenor, tal como prometem no manifesto do projeto. A decoração do nosso altar foi a coisa mais bonita que já vi na vida, parecia uma moldura viva para o nosso amor. A sensibilidade da Aurora na escolha das flores para a boutonnière dos padrinhos também foi muito elogiada, criando uma coesão visual perfeita em todo o cortejo." },
 { id: 25, name: "Rosa Maria Silva", rating: 5, text: "Experiência e saber de décadas. A flor.d.ló é uma referência para quem procura qualidade e exclusividade em Portugal." },
 { id: 26, name: "Cláudia Bessa", rating: 5, text: "A sessão de greenery e os pormenores florais colocados estrategicamente nas cadeiras deram um toque de natureza sofisticada incrível. Parabéns à Rita pela visão moderna e à Aurora pela execução impecável que manteve tudo no lugar até ao fim da festa. É refrescante trabalhar com pessoas que amam genuinamente o que fazem e que tratam as flores com tanto respeito." },
 { id: 27, name: "Vera Figueiredo", rating: 5, text: "Simplesmente as melhores em todo o país! A Ló tratou de todos os aspetos do nosso casamento com uma doçura e um carinho que nos emocionaram. As flores pareciam sorrir para nós e para os convidados, tal era o vigor e a beleza de cada arranjo. Não é apenas um serviço de decoração, é uma experiência humana e artística que recomendo a todos os que valorizam o detalhe." },
 { id: 28, name: "Nuno Castelo", rating: 5, text: "Como noivo, apreciei muito a objetividade e o bom gosto. A boutonnière estava discreta mas muito elegante. Recomendo." },
 { id: 29, name: "Isabel Trindade", rating: 4, text: "Flores belíssimas e projeto muito criativo. Um bocadinho acima do orçamento inicial, mas a qualidade justifica o investimento." },
 { id: 30, name: "Sílvia Cardoso", rating: 5, text: "A flor.d.ló criou algo absolutamente único para o batizado do meu filho, fugindo aos clichés e entregando uma decoração artística sublime. O cariz familiar da empresa faz com que o atendimento seja muito próximo, humano e caloroso, algo que faz toda a diferença nos momentos de stress. Sentimos que fomos cuidados pela Aurora e pela Rita como se fôssemos da família." },
 { id: 31, name: "Alexandra Paiva", rating: 5, text: "Obrigada Ló pelo teu olhar atento e por não deixares passar nenhum detalhe em branco. O meu bouquet & boutonnière combinavam na perfeição com o nosso estilo boho-chic e mantiveram-se impecáveis apesar do vento que se sentia. A vossa capacidade de adaptação às condições do local e o vosso profissionalismo são, sem dúvida, o que vos coloca no topo deste setor." },
 { id: 32, name: "Gabriela Neves", rating: 5, text: "Fiquei fã do conceito de falarem com as flores. De facto, elas parecem ter uma vida própria nos vossos arranjos. Magnífico!" },
 { id: 33, name: "Mónica Abreu", rating: 5, text: "Trabalho de detalhe excecional, onde nada é deixado ao acaso. A Rita e a Aurora são a dupla perfeita para quem quer um evento com alma, profundidade e uma beleza natural que toca o coração. A forma como selecionam os materiais e a paixão que demonstram em cada etapa do projeto artístico tornam a flor.d.ló uma escolha obrigatória para momentos inesquecíveis." }
];

export default function TestimonialsSlider({ courseId, initialReviews = [] }: TestimonialsProps) {
  const [reviews, setReviews] = useState<Testimonial[]>(staticTestimonials);
  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      const approvedFromSanity = initialReviews.map((r: any) => ({
        id: r._id || Date.now(),
        name: r.userName || r.name,
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

    // 1. Definimos o número base de testemunhos reais históricos
    const baseHistorica = 33; 

    // 2. Calculamos quantos testemunhos novos temos no estado atual 
    // (Total de reviews no estado menos a lista estática de 33 itens)
    const novosTestemunhos = reviews.length - staticTestimonials.length;

    // 3. O total final será a base + o que foi acrescentado (via Sanity ou Formulário)
    const displayTotal = baseHistorica + (novosTestemunhos > 0 ? novosTestemunhos : 0);

    return { average, total: displayTotal };
  }, [reviews]); // Depende de 'reviews' para atualizar mal uma nova seja submetida

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' }, 
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.name || !newReview.text) {
      setModal({ 
        isOpen: true, 
        type: 'error', 
        title: 'Campos em falta', 
        message: 'Por favor, preencha o seu nome e a sua experiência antes de enviar.' 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReviewAction({
        userName: newReview.name,
        rating: newReview.rating,
        comment: newReview.text,
        productId: courseId 
      });

      if (result.success) {
        const reviewForDisplay = {
          id: result.id || Date.now(),
          name: newReview.name,
          rating: newReview.rating,
          text: newReview.text,
          approved: false 
        };
        
        setReviews([reviewForDisplay, ...reviews]);
        setNewReview({ name: "", text: "", rating: 5 });
        setIsFormOpen(false);
        setModal({ 
          isOpen: true, 
          type: 'success', 
          title: 'Sucesso!', 
          message: 'Obrigado! O seu testemunho foi enviado e aguarda aprovação por parte da nossa equipa.' 
        });
      } else {
        setModal({ 
          isOpen: true, 
          type: 'error', 
          title: 'Erro de Permissão', 
          message: result.error || 'Não foi possível gravar a review.' 
        });
      }
    } catch (error) {
      setModal({ 
        isOpen: true, 
        type: 'error', 
        title: 'Erro Crítico', 
        message: 'Ocorreu um erro ao comunicar com o servidor.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  return (
    <section className="py-24 -mb-[100px] md:-mb-[200px] relative "> {/*style={{ background: 'linear-gradient(2deg, rgba(255,255,255,1) 10%, rgba(214, 156, 169, 0.5) 115%)' }}*/}
      
      {modal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[25px] p-8 max-w-sm w-full shadow-2xl relative transform transition-all scale-100 animate-in zoom-in-95 ">
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
              <p className="text-slate-600 mb-8 text-sm">{modal.message}</p>
              <button 
                onClick={closeModal}
                className={`w-full py-4 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs shadow-lg ${modal.type === 'success' ? 'bg-[#01cac3] hover:bg-[#00b2ac]' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {modal.type === 'success' ? 'Fantástico' : 'Tentar Novamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-6 max-w-[1400px]">
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
               <div className="flex bg-[#407CFE] px-3 py-1 rounded-full items-center gap-1">
                  <Star size={16} fill="white" className="text-white" />
                  <span className="text-white font-bold text-sm">{stats.average} / 5.0</span>
               </div>
               <span className="text-blue text-xs font-medium uppercase tracking-wider">
                 • {stats.total} testemunhos reais
               </span>
            </div>
           {/* <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#444] mb-2">
              O que dizem os nossos clientes
            </h2>*/}
          </div>
          
          <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-6 py-3 bg-[#C47F8D] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#00b2ac] transition-colors shadow-lg"
            >
              {isFormOpen ? 'Fechar' : 'Dar Opinião'}
            </button>
            <div className="flex gap-2">
              <button onClick={() => emblaApi?.scrollPrev()} className="p-3 rounded-full border border-slate-300 hover:bg-white bg-white/50"><ChevronLeft size={20}/></button>
              <button onClick={() => emblaApi?.scrollNext()} className="p-3 rounded-full border border-slate-300 hover:bg-white bg-white/50"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFormOpen ? 'max-h-[800px] opacity-100 mb-12' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[25px] shadow-2xl border border-[#C47F8C]/20 max-w-2xl mx-auto relative z-20">
            <h3 className="text-xl font-bold text-[#C47F8C] mb-6 flex items-center gap-2"><User size={20}/> Deixe o seu testemunho</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input type="text" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" placeholder="O seu nome" required />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})}>
                    <Star size={24} fill={star <= newReview.rating ? "#FFD700" : "none"} className={star <= newReview.rating ? "text-[#FFD700]" : "text-slate-300"} />
                  </button>
                ))}
              </div>
            </div>
            <textarea value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-32 mb-6" placeholder="A sua experiência..." required />
            <div className="mb-6 flex justify-center"><Turnstile sitekey="0x4AAAAAACf86PyF6Af3GBY9" onVerify={setTurnstileToken} /></div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#C47F8C] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />} Enviar para aprovação
            </button>
          </form>
        </div>

        <div className="overflow-hidden cursor-grab active:cursor-grabbing py-4" ref={emblaRef}>
          <div className="flex -ml-2 lg:-ml-6">
            {reviews.map((item) => (
              <div key={item.id} className="flex-[0_0_100%] lg:flex-[0_0_35%] min-w-0 pl-2 lg:pl-6">
                <div className="bg-white border border-slate-100 rounded-[25px] p-5 lg:p-8 h-[450px] flex flex-col shadow-sm hover:shadow-xl transition-all relative card-testimonial">
                  <div className="flex gap-1 mb-4 flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < item.rating ? "#407CFE" : "none"} className={i < item.rating ? "text-[#407CFE]" : "text-slate-200"} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#C47F8D] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm uppercase">
                      {getInitials(item.name)}
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#333] leading-tight break-words">
                      {item.name}
                    </h3>
                  </div>
                  <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                    <p className="testimonial-text whitespace-pre-line">
                      {item.text}
                    </p>
                  </div>
                  {item.approved === false && (
                    <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">
                      AGUARDA APROVAÇÃO
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
          font-size: 13px;
          line-height: 20px;
          color: #000000;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8f8f8; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
        .break-words { word-break: break-word; overflow-wrap: break-word; }
      `}</style>
    </section>
  );
}