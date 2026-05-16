'use client';
import { useState } from 'react';

const AccordionPrograma = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full text-center">
      {/* BOTÃO DE CONTROLO */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#F0DFD1] text-black px-8 py-4 rounded-full font-bold shadow-lg hover:bg-white transition-all uppercase tracking-widest text-xs"
      >
        {isOpen ? 'Fechar Programa' : 'Clique para ver o Programa Resumido'}
      </button>
      
      {/* CONTEÚDO EXPANSÍVEL */}
      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
        
        {/* Adicionado !bg-white e w-full para forçar o fundo branco e a largura total */}
        <div className="!bg-white w-full block rounded-[40px] p-8 md:p-12 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* SEXTA-FEIRA */}
            <div>
              <h4 className="font-bold text-[#01cac3] mb-4 uppercase">6ª Feira</h4>
              <p className="text-[#37374B]">
                Chegada às 18:00<br/>
                20:00: Jantar<br/>
                21:00: Introdução
              </p>
            </div>

            {/* SÁBADO */}
            <div>
              <h4 className="font-bold text-[#01cac3] mb-4 uppercase">Sábado</h4>
              <p className="text-[#37374B]">
                08:00: Yoga<br/>
                11:00: Mindfulness<br/>
                18:00: Concerto Meditativo<br/>
                20:00: Jantar
              </p>
            </div>

            {/* DOMINGO */}
            <div>
              <h4 className="font-bold text-[#01cac3] mb-4 uppercase">Domingo</h4>
              <p className="text-[#37374B]">
                08:00: Yoga<br/>
                11:00: Mindfulness<br/>
                13:45: Fecho e Perguntas
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccordionPrograma;