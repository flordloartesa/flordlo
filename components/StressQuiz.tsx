'use client';

import React, { useState } from 'react';
import { ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import Link from '@/components/MyLink'; // Importado para melhor performance no Next.js

const questions = [
  "No último mês, com que frequência se sentiu aborrecido com algo que ocorreu inesperadamente?",
  "No último mês, com que frequência sentiu que era incapaz de controlar as coisas importantes na sua vida?",
  "No último mês, com que frequência se sentiu nervoso e/ou “stressado”?",
  "No último mês, com que frequência se sentiu confiante na sua capacidade para lidar com os seus problemas pessoais?",
  "No último mês, com que frequência sentiu que as coisas estavam a correr como queria?",
  "No último mês, com que frequência reparou que não conseguia fazer todas as coisas que tinha que fazer?",
  "No último mês, com que frequência se sentiu capaz de controlar as suas irritações?",
  "No último mês, com que frequência sentiu que as coisas lhe estavam a correr pelo melhor?",
  "No último mês, com que frequência se sentiu irritado com coisas que aconteceram fora do seu controlo?",
  "No último mês, com que frequência sentiu que as dificuldades se acumulavam ao ponto de não ser capaz de as ultrapassar?"
];

const options = [
  { label: "Nunca", value: 0 },
  { label: "Quase Nunca", value: 1 },
  { label: "Algumas Vezes", value: 2 },
  { label: "Frequentemente", value: 3 },
  { label: "Muito Frequentemente", value: 4 }
];

const reverseIndices = [3, 4, 6, 7];

// --- ADICIONADO: Prop item para receber os dados da especialidade ---
export default function StressQuiz({ item }: { item?: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: number) => {
    let points = value;
    if (reverseIndices.includes(currentStep)) {
      points = 4 - value;
    }

    const newScore = score + points;
    setScore(newScore);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
  };

  const getResultInterpretation = () => {
    if (score <= 13) return {
      badge: "Stress Baixo",
      color: "bg-emerald-100 text-emerald-700",
      title: "Stress Ligeiro",
      text: "O seu resultado indica baixos níveis de stress. Continue a praticar o autocuidado para manter este equilíbrio pleno."
    };
    if (score <= 26) return {
      badge: "Stress Médio",
      color: "bg-amber-100 text-amber-700",
      title: "Stress Moderado",
      text: "Está dentro da média, mas o stress pode estar a afetar o seu dia a dia. Considere ferramentas de regulação emocional como o MBSR."
    };
    return {
      badge: "Stress Elevado",
      color: "bg-red-100 text-red-700",
      title: "Stress Elevado",
      text: "Há uma probabilidade elevada de stress crónico. Recomendamos vivamente que procure ajuda especializada ou cursos de redução de stress."
    };
  };

  const result = getResultInterpretation();
  const progress = ((currentStep) / questions.length) * 100;

  if (showResult) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-lg shadow-blue-200">
            {score}
          </div>
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${result.color}`}>
            {result.badge}
          </span>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{result.title}</h2>
          <p className="text-gray-600 leading-relaxed mb-8">{result.text}</p>
          
          <div className="flex flex-col gap-4">
            <a href="https://app.meditt.space/a/imbsr-reducao-de-stress-8-semanas-a/" className="bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
              <CheckCircle2 size={20} /> Experimentar Programa MBSR
            </a>

            {/* --- LINK DINÂMICO ATUALIZADO AQUI --- */}
            <Link 
              href={`/marcacao?id=${item?._id}&nome=${item?.title}`}
              className="bg-[#2490EB] text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} /> Agendar Consulta
            </Link>

            <button onClick={resetQuiz} className="text-gray-400 font-medium hover:text-gray-600 flex items-center justify-center gap-2 transition-colors">
              <RotateCcw size={16} /> Refazer Teste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="h-1.5 w-full bg-gray-100">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-8 md:p-12">
        <span className="text-[10px] uppercase font-black text-blue-500 tracking-[0.2em] mb-4 block">
          Questão {currentStep + 1} de {questions.length}
        </span>
        
        <h3 className="text-md md:text-md font-bold text-gray-800 leading-tight mb-0 min-h-[70px]">
          {questions[currentStep]}
        </h3>

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="w-full group flex items-center justify-between p-5 rounded-2xl border-2 border-gray-50 bg-gray-50/50 hover:border-blue-500 hover:bg-white transition-all duration-200 text-left"
            >
              <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                {opt.label}
              </span>
              <ChevronRight className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" size={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}