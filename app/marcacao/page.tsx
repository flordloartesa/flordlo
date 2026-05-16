'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from '@/components/MyLink';

const horariosDisponiveis = ['09:00', '10:00', '11:30', '14:00', '15:00', '16:30', '18:00'];

// 1. O componente com a lógica e useSearchParams
function MarcacaoForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ESTADOS PRINCIPAIS
  const [especialidades, setEspecialidades] = useState<{_id: string, title: string}[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || '');
  const [step, setStep] = useState(1);
  const [dataEscolhida, setDataEscolhida] = useState('');
  const [horaEscolhida, setHoraEscolhida] = useState('');
  const [formatoEscolhido, setFormatoEscolhido] = useState('online');
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    email: '',
    telemovel: '',
    notas: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CARREGAR ESPECIALIDADES (Para o Dropdown)
  useEffect(() => {
    async function fetchEspecialidades() {
      try {
        const res = await fetch('/api/marcar'); 
        const data = await res.json();
        setEspecialidades(data);
      } catch (err) {
        console.error("Erro ao carregar especialidades:", err);
      }
    }
    fetchEspecialidades();
  }, []);

  // Encontrar o nome da especialidade selecionada para o resumo lateral
  const especialidadeNome = especialidades.find(e => e._id === selectedId)?.title || searchParams.get('nome') || 'Selecione uma especialidade';

  const handleNextStep = () => {
    if (step === 1 && (!selectedId || !dataEscolhida || !horaEscolhida)) {
      return alert('Por favor, selecione a especialidade, data e hora.');
    }
    if (step === 2 && (!dadosCliente.nome || !dadosCliente.email)) {
      return alert('Preencha o seu nome e email.');
    }
    setStep(step + 1);
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodoPagamento) return alert('Escolha um método de pagamento.');
    
    setIsSubmitting(true);

    try {
      const resposta = await fetch('/api/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: dadosCliente.nome,
          email: dadosCliente.email,
          telemovel: dadosCliente.telemovel,
          especialidadeId: selectedId,
          data: dataEscolhida,
          hora: horaEscolhida,
          metodoPagamento: metodoPagamento,
          notas: `Formato: ${formatoEscolhido}. ${dadosCliente.notas}`
        })
      });

      if (resposta.ok) {
        alert('Reserva submetida com sucesso!');
        router.push('/'); 
      } else {
        const errorData = await resposta.json();
        alert(`Erro: ${errorData.error || 'Tente novamente.'}`);
      }
    } catch (error) {
      alert('Erro de ligação. Verifique a sua internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9F4F2] py-12 px-6 lg:px-12 font-sans text-[#2D2C2B]">
      <div className="max-w-6xl mx-auto">
        <Link href="/especialidades" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0061EF] mb-8 transition-colors">
          <span className="mr-2">←</span> Voltar
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 bg-white rounded-[2rem] shadow-sm p-8 md:p-12">
            
            {/* Indicadores de Passo */}
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0061EF] -z-10 rounded-full transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
              {[1, 2, 3].map((num) => (
                <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= num ? 'bg-[#0061EF] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {num}
                </div>
              ))}
            </div>

            {/* PASSO 1: ESPECIALIDADE, DATA E HORA */}
            {step === 1 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h2 className="text-3xl font-bold mb-8">Agendar Consulta</h2>
                
                {/* NOVO: DROPDOWN DE ESPECIALIDADE */}
                <div className="mb-8">
                  <label className="block text-sm font-bold mb-3">Qual a especialidade?</label>
                  <select 
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#0061EF] transition-all cursor-pointer"
                  >
                    <option value="">Selecione uma opção...</option>
                    {especialidades.map((esp) => (
                      <option key={esp._id} value={esp._id}>{esp.title}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold mb-3">Onde será a sessão?</label>
                  <div className="flex gap-4">
                    {['online', 'presencial'].map((f) => (
                      <button key={f} onClick={() => setFormatoEscolhido(f)} className={`px-6 py-3 rounded-xl border font-bold capitalize transition-all ${formatoEscolhido === f ? 'bg-[#0061EF] text-white border-[#0061EF]' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold mb-3">Selecione o dia</label>
                  <input type="date" value={dataEscolhida} onChange={(e) => { setDataEscolhida(e.target.value); setHoraEscolhida(''); }} min={new Date().toISOString().split('T')[0]} className="w-full md:w-1/2 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#0061EF]" />
                </div>

                <div className={dataEscolhida ? 'opacity-100' : 'opacity-30 pointer-events-none'}>
                  <label className="block text-sm font-bold mb-3">Selecione a hora</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {horariosDisponiveis.map((hora) => (
                      <button key={hora} onClick={() => setHoraEscolhida(hora)} className={`py-3 rounded-xl border font-bold text-sm transition-all ${horaEscolhida === hora ? 'bg-[#0061EF] text-white border-[#0061EF] scale-[1.02]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                        {hora}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button onClick={handleNextStep} disabled={!selectedId || !dataEscolhida || !horaEscolhida} className="bg-[#2D2C2B] text-white px-8 py-4 rounded-full font-bold hover:bg-black disabled:opacity-50">
                    Próximo Passo →
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 2: DADOS (Mantido igual) */}
            {step === 2 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h2 className="text-3xl font-bold mb-8">Os Seus Dados</h2>
                <div className="space-y-6">
                  <input type="text" value={dadosCliente.nome} onChange={(e) => setDadosCliente({...dadosCliente, nome: e.target.value})} placeholder="Nome Completo" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#0061EF]" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="email" value={dadosCliente.email} onChange={(e) => setDadosCliente({...dadosCliente, email: e.target.value})} placeholder="Email" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#0061EF]" />
                    <input type="tel" value={dadosCliente.telemovel} onChange={(e) => setDadosCliente({...dadosCliente, telemovel: e.target.value})} placeholder="Telemóvel" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#0061EF]" />
                  </div>
                  <textarea value={dadosCliente.notas} onChange={(e) => setDadosCliente({...dadosCliente, notas: e.target.value})} placeholder="Notas (Opcional)" rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#0061EF] resize-none"></textarea>
                </div>
                <div className="mt-12 flex justify-between">
                  <button onClick={() => setStep(1)} className="text-gray-500 font-bold">← Voltar</button>
                  <button onClick={handleNextStep} className="bg-[#2D2C2B] text-white px-8 py-4 rounded-full font-bold">Ir para Pagamento →</button>
                </div>
              </div>
            )}

            {/* PASSO 3: PAGAMENTO (Mantido igual) */}
            {step === 3 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h2 className="text-3xl font-bold mb-8">Método de Pagamento</h2>
                <div className="space-y-4">
                  {['mbway', 'transferencia', 'stripe'].map((m) => (
                    <div key={m} onClick={() => setMetodoPagamento(m)} className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${metodoPagamento === m ? 'border-[#0061EF] bg-blue-50/30' : 'border-gray-100'}`}>
                       <h4 className="font-bold capitalize">{m === 'transferencia' ? 'Transferência Bancária' : m}</h4>
                    </div>
                  ))}
                </div>
                <div className="mt-12 flex justify-between items-center">
                  <button onClick={() => setStep(2)} className="text-gray-500 font-bold">← Voltar</button>
                  <button onClick={handleFinalizar} disabled={isSubmitting} className="bg-[#0061EF] text-white px-10 py-4 rounded-full font-bold shadow-lg">
                    {isSubmitting ? 'A processar...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RESUMO LATERAL DINÂMICO */}
          <div className="w-full lg:w-1/3 bg-white rounded-[2rem] shadow-sm p-8 sticky top-8 border border-gray-100">
            <h3 className="text-xl font-bold mb-6 border-b pb-4">Resumo</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Especialidade</p>
                <p className="font-bold text-[#0061EF]">{especialidadeNome}</p>
              </div>
              {dataEscolhida && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Data e Hora</p>
                  <p className="font-bold">{dataEscolhida.split('-').reverse().join('/')} às {horaEscolhida || '--:--'}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Formato</p>
                <p className="font-bold capitalize">{formatoEscolhido}</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t flex justify-between items-end">
              <span className="text-gray-500 font-medium">Total</span>
              <span className="text-3xl font-bold">60€</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// 2. A página principal exportada embrulha tudo num Suspense
export default function MarcacaoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-medium text-slate-500">A carregar marcações...</div>}>
      <MarcacaoForm />
    </Suspense>
  );
}