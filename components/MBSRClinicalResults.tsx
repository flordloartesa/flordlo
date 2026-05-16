"use client";

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// Sub-componente para animar os números de forma fluida
const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useSpring(value, { stiffness: 60, damping: 20 });
  const display = useTransform(count, (latest) => latest.toFixed(1));

  useEffect(() => {
    count.set(value);
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
};

const ClinicalResults = () => {
  const [period, setPeriod] = useState<'8w' | '3m'>('8w');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const data = {
    '8w': {
      dep: { val: 38.6, h: "38.6%" },
      anx: { val: 46.2, h: "46.2%" },
      str: { val: 52.5, h: "52.5%" },
    },
    '3m': {
      dep: { val: 39.8, h: "39.8%" },
      anx: { val: 49.8, h: "49.8%" },
      str: { val: 52.3, h: "52.3%" },
    }
  };

  const current = data[period];

  return (
    <section className="max-w-[1100px] mx-auto px-0 md:px-4 py-10 md:py-16 text-[#102344]">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* LADO ESQUERDO: TEXTO (RESTURADO AO DESIGN ORIGINAL) */}
        <div className="flex-1 bg-white border-y md:border border-[#e1e8ed] rounded-none md:rounded-xl p-6 md:p-12 flex flex-col justify-center shadow-sm">
          <span className="text-[#009ca6] font-bold text-xs tracking-widest uppercase mb-4 block">
            Resultados clinicamente comprovados
          </span>
          <h2 className="font-sans font-bold text-3xl md:text-[2.4rem] mb-10 leading-[1.15] text-[#102344]">
            com MBSR Online
          </h2>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start gap-1 md:gap-5">
              <span className="font-serif text-5xl md:text-[3.5rem] text-[#009ca6] font-bold leading-none min-w-[120px]">
                46.5
                <span className="text-[1.8rem]">%</span>
              </span>
              <p className="text-base md:text-lg text-slate-500 pt-1 leading-relaxed">
                a <u className="decoration-[#009ca6]">8 Semanas</u> e a <u className="decoration-[#009ca6]">3 meses</u> de redução de total da sintomatologia com a participação no <strong className="text-[#102344]">iMBSR online.</strong>
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-1 md:gap-5">
              <span className="font-serif text-5xl md:text-[3.5rem] text-[#009ca6] font-bold leading-none min-w-[120px]">
                55.4
                <span className="text-[1.8rem]">%</span>
              </span>
              <p className="text-base md:text-lg text-slate-500 pt-1 leading-relaxed">
                considerou o iMBSR online mais <strong className="text-[#102344]">conveniente</strong> do que o formato presencial.
              </p>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: GRÁFICO (REFINADO) */}
        <div className="flex-1 bg-white border-y md:border border-[#e1e8ed] rounded-none md:rounded-xl p-6 md:p-12 flex flex-col items-center min-h-[500px] md:min-h-[580px] shadow-sm">
          <p className="text-center text-lg md:text-xl mb-8 font-medium text-[#102344]">
            Melhoria clínica significativa<br />por dimensão:
          </p>

          {/* TOGGLE */}
          <div 
            className="relative bg-[#ecf1f7] w-[280px] h-[54px] rounded-full p-1 flex items-center cursor-pointer mb-12"
            onClick={() => setPeriod(period === '8w' ? '3m' : '8w')}
          >
            <motion.div 
              className="absolute bg-white w-[136px] h-[46px] rounded-full shadow-md"
              animate={{ x: period === '3m' ? 136 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <span className={`relative z-10 flex-1 text-center font-bold text-sm transition-colors duration-300 ${period === '8w' ? 'text-[#102344]' : 'text-slate-400'}`}>
              8 semanas
            </span>
            <span className={`relative z-10 flex-1 text-center font-bold text-sm transition-colors duration-300 ${period === '3m' ? 'text-[#102344]' : 'text-slate-400'}`}>
              3 meses
            </span>
          </div>

          {/* ÁREA DO GRÁFICO */}
          <div className="flex items-end justify-center gap-4 md:gap-8 h-[280px] w-full border-b border-slate-100 pb-2">
            
            {/* DEPRESSÃO */}
            <div className="flex-1 flex flex-col items-center h-full justify-end">
              <motion.div 
                animate={{ height: current.dep.h }}
                className="w-full bg-[#102344] rounded-t-md relative flex justify-center"
              >
                <div className="absolute -top-8 font-bold text-lg text-[#009ca6]">
                  <AnimatedNumber value={current.dep.val} />%
                </div>
              </motion.div>
              <span className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Depressão</span>
            </div>

            {/* ANSIEDADE */}
            <div className="flex-1 flex flex-col items-center h-full justify-end">
              <motion.div 
                animate={{ height: current.anx.h }}
                className="w-full bg-[#C95840] rounded-t-md relative flex justify-center"
              >
                <div className="absolute -top-8 font-bold text-lg text-[#102344]">
                  <AnimatedNumber value={current.anx.val} />%
                </div>
              </motion.div>
              <span className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ansiedade</span>
            </div>

            {/* STRESS */}
            <div className="flex-1 flex flex-col items-center h-full justify-end">
              <motion.div 
                animate={{ height: current.str.h }}
                className="w-full bg-[#03929C] rounded-t-md relative flex justify-center"
              >
                <div className="absolute -top-8 font-bold text-lg text-[#94aab9]">
                  <AnimatedNumber value={current.str.val} />%
                </div>
              </motion.div>
              <span className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Stress</span>
            </div>

          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="flex flex-col items-center gap-2 mb-8">
            {/*<p className="text-slate-400 text-sm">
                Fonte: <strong className="text-[#009ca6]">Journal of Clinical Psychology</strong>
            </p>*/}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-[#009ca6] text-xs font-bold uppercase tracking-widest hover:underline transition-all"
            >
                Ver mais sobre o estudo
            </button>
        </div>

        <button 
          className="bg-[#103e42] text-white px-12 py-4 rounded-[20px] font-bold text-lg hover:bg-[#009ca6] transition-colors shadow-md active:scale-95"
          onClick={() => window.open('/mindful-store/mindfulness-based-stress-reduction', '_blank')}
        >
          Iniciar agora
        </button>
      </div>

      {/* MODAL DE INFORMAÇÕES DO ESTUDO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#102344]/60 backdrop-blur-sm"
            />
            
            {/* Conteúdo da Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[#009ca6] font-bold text-xs uppercase tracking-widest">Detalhes Científicos</span>
                    
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-[#102344] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 text-slate-600 leading-relaxed overflow-y-auto max-h-[60vh] pr-2">
         

              {/* Cabeçalho do Estudo */}
  <header className="mb-8 border-b border-slate-100 pb-1">
    <h2 className="text-2xl font-bold text-[#102344] mb-4">
      Eficácia do Programa MBSR Online: Evidência Empírica
    </h2>
    {/*<p className="text-lg text-slate-600">
      Este estudo foi publicado no prestigiado <span className="font-semibold text-[#009ca6]">Journal of Clinical Psychology</span>, avaliando o impacto do programa Mindfulness-Based Stress Reduction no formato digital.
    </p>*/}
  </header>

  {/* Introdução */}
  <div className="mb-8">
    <h3 className="text-[15px] uppercase tracking-wider font-bold text-[#009ca6] mb-2">Introdução</h3>
    <p className="text-[12px] ">
      O programa MBSR tem demonstrado uma eficácia substancial na redução de níveis de stress, ansiedade e depressão. Com o crescimento do acesso digital, este estudo validou a eficácia da modalidade totalmente online na redução da sintomatologia psicológica, comparando os resultados com as metas tradicionais de bem-estar (Khoury <em>et al.</em>, 2015).
    </p>
  </div>

{/* Grelha de Metodologia e Amostra */}
<div className="grid md:grid-cols-2 gap-6 mb-8">
  <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-[#009ca6]">
    <h4 className="font-bold text-[#102344] mb-3 flex items-center text-[14px] ">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-[#009ca6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      Metodologia e Procedimento
    </h4>
    <p className="text-[12px] leading-relaxed">
      Estudo com aplicação da escala clínica <span className="font-semibold">DASS-21 (Depression Anxiety and Stress Scale de Lovibond & Lovibond, 1995) - versão Portuguesa de Pais-Ribeiro et al., 2004)</span> em três momentos distintos:
    </p>
    <ul className="mt-2 text-[12px]  space-y-1 text-slate-600">
      <li>• <strong>T1:</strong> Avaliação pré-intervenção</li>
      <li>• <strong>T2:</strong> Pós-intervenção imediata (8 semanas)</li>
      <li>• <strong>T3:</strong> Follow-up (3 meses)</li>
    </ul>
  </div>

  <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-[#102344]">
    <h4 className="font-bold text-[#102344] mb-3 flex items-center text-[14px] ">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-[#102344]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      Perfil da Amostra
    </h4>
    <p className="text-[12px] ">
      <strong>121 participantes</strong> (76 mulheres e 45 homens), com idades entre os 22 e 56 anos.
    </p>
    <p className="text-[12px]  mt-2 italic text-slate-600">
      Diversidade profissional (gestores, professores, enfermeiros) e dispersão geográfica nacional (Lisboa, Porto, Braga, Faro e Aveiro).
    </p>
  </div>
</div>

  {/* Conclusões Principais */}
  <div className="mb-10">
    <h4 className="text-[15px]  font-bold text-[#102344] mb-4">Principais Conclusões</h4>
    <div className="space-y-4">
      <div className="flex items-start">
        <div className="bg-[#009ca6]/10 p-2 rounded-lg mr-4 text-[#009ca6] font-bold">01</div>
        <div>
          <h5 className="font-bold text-slate-900 text-[14px] ">Redução de Sintomas</h5>
          <p className="text-[12px] text-slate-600">Diminuição acentuada em todas as subescalas (Depressão, Ansiedade e Stress). Casos severos regrediram para valores normativos ou ligeiros após o curso.</p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="bg-[#009ca6]/10 p-2 rounded-lg mr-4 text-[#009ca6] font-bold">02</div>
        <div>
          <h5 className="font-bold text-slate-900 text-[14px] ">Acessibilidade e Adesão</h5>
          <p className="text-[12px]  text-slate-600"><span className="font-semibold">55.4%</span> dos participantes confirmaram que o formato online facilitou a conclusão do curso devido à flexibilidade de horários.</p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="bg-[#009ca6]/10 p-2 rounded-lg mr-4 text-[#009ca6] font-bold">03</div>
        <div>
          <h5 className="font-bold text-slate-900 text-[14px] ">Manutenção dos Benefícios</h5>
          <p className="text-[12px] text-slate-600">Os resultados mantiveram-se estáveis ou melhoraram ligeiramente no follow-up de 3 meses, provando a consolidação das competências.</p>
        </div>
      </div>
    </div>
  </div>

  {/* Rodapé / Conclusão */}
  <footer className="mb-12 bg-[#102344] text-white p-6 rounded-2xl">
    <p className="text-sm md:text-base italic text-center leading-relaxed">
      "Os resultados confirmam que o curso de MBSR online é uma intervenção robusta e clinicamente válida, preservando toda a eficácia do formato presencial tradicional e assumindo-se como uma resposta digital fiável e acessível."
    </p>
  </footer>

  {/* Referências Bibliográficas */}
<div className="mt-8 text-[10px] text-slate-500 leading-relaxed">
  <h5 className="font-bold mb-3 uppercase tracking-wider text-slate-600">
    Referências Bibliográficas
  </h5>
  
  <div className="space-y-3">
    <p className="pl-6 -indent-6">
      Lovibond, S. H., & Lovibond, P. F. (1995). <em>Depression Anxiety Stress Scales (DASS-21, DASS-42)</em>. APA PsycTests. <a href="https://doi.org/10.1037/t01004-000" target="_blank" rel="noopener noreferrer" className="text-[#009ca6] hover:underline">https://doi.org/10.1037/t01004-000</a>
    </p>

<p className="pl-6 -indent-6">
Khoury, B., Sharma, M., Rush, S.E. and Fournier, C. (2015) Mindfulness-Based Stress Reduction for Healthy Individuals: A Meta-Analysis. <em>Journal of Psychosomatic Research, 78</em>, 519-528. 
<a href="https://doi.org/10.1016/j.jpsychores.2015.03.009" target="_blank" rel="noopener noreferrer" className="text-[#009ca6] hover:underline">https://doi.org/10.1016/j.jpsychores.2015.03.009</a>
</p>


    <p className="pl-6 -indent-6">
      Pais-Ribeiro, J., Honrado, A., & Leal, I. (2004). Contribuição para o estudo da adaptação portuguesa das Escalas de Ansiedade, Depressão e Stress (EADS) de 21 itens de Lovibond e Lovibond. <em>Psicologia, Saúde & Doenças, 5</em>, 229-239. <a href="http://hdl.handle.net/10400.12/1058" target="_blank" rel="noopener noreferrer" className="text-[#009ca6] hover:underline">http://hdl.handle.net/10400.12/1058</a>
    </p>
  </div>
</div>



                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="bg-[#102344] text-white px-6 py-2 rounded-md font-bold hover:bg-[#009ca6] transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClinicalResults;