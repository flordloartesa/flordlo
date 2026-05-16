"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { 
  Infinity, 
  Calendar, 
  BarChart3, 
  Trophy, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  PlayCircle,
  Clock
} from "lucide-react";

export default function UserAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ NOVO: Estado para saber que semana estamos a ver (0 = Atual)
  const [weekOffset, setWeekOffset] = useState(0);
  // ✅ NOVO: Estado para abrir a Modal com os detalhes do dia
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    // Pede os dados passando a semana que o utilizador escolheu
    fetch(`/api/user/stats?offset=${weekOffset}&t=${Date.now()}`)
      .then(res => res.json())
      .then(stats => {
        setData(stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [weekOffset]); // Atualiza sempre que mudamos de semana

  // Função para formatar o texto "Há X semanas"
  const getWeekLabel = () => {
    if (weekOffset === 0) return "Esta Semana";
    if (weekOffset === 1) return "Semana Passada";
    return `Há ${weekOffset} semanas`;
  };

  // Função ao clicar numa barra do gráfico
  const handleBarClick = (barData: any) => {
    if (barData && barData.minutos > 0) {
      setSelectedDay(barData);
    }
  };

  if (loading && !data) return (
    <div className="h-64 flex items-center justify-center bg-white rounded-[32px] border border-slate-100">
      <div className="flex flex-col items-center gap-2">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Sincronizando...</span>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
        {/* CARTÕES KPI MINIMALISTAS (Mantêm-se globais, não mudam com a semana) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard title="Total" value={`${data.lifetime || 0}m`} icon={<Infinity size={18} strokeWidth={1.5} />} />
          <KpiCard title="Este Mês" value={`${data.monthly || 0}m`} icon={<Calendar size={18} strokeWidth={1.5} />} />
          <KpiCard title="Esta Semana" value={`${data.weekly || 0}m`} icon={<BarChart3 size={18} strokeWidth={1.5} />} />
          <KpiCard title="Recorde" value={`${data.dailyRecord || 0}m`} icon={<Trophy size={18} strokeWidth={1.5} />} />
          <KpiCard title="Sessões" value={data.completedCount || 0} icon={<CheckCircle2 size={18} strokeWidth={1.5} />} isLast />
        </div>

        {/* GRÁFICO DE CONSISTÊNCIA */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 tracking-tight">
              Consistência Semanal
              <span className="text-[10px] font-normal text-slate-400 px-2 py-0.5 bg-slate-50 rounded-full">Minutos</span>
            </h3>

            {/* ✅ NOVO: Navegação do Tempo */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full p-1">
              <button 
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="p-1.5 hover:bg-white rounded-full text-slate-400 hover:text-slate-800 transition-colors shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest w-32 text-center">
                {getWeekLabel()}
              </span>
              <button 
                onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                disabled={weekOffset === 0}
                className={`p-1.5 rounded-full transition-colors ${weekOffset === 0 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-white text-slate-400 hover:text-slate-800 shadow-sm'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="h-[200px] w-full relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                 <div className="w-5 h-5 border-2 border-slate-200 border-t-[#3D81F1] rounded-full animate-spin" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="250">
              <BarChart data={data.weeklyChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="minutos" 
                  radius={[4, 4, 4, 4]} 
                  barSize={28}
                  className="cursor-pointer"
                  onClick={handleBarClick} // Clique na barra abre Modal
                >
                  {data.weeklyChartData?.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.minutos > 0 ? '#0f172a' : '#f1f5f9'} 
                      className={entry.minutos > 0 ? "hover:fill-[#3D81F1] transition-all duration-300" : ""}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ✅ NOVO: MODAL DE DETALHES DO DIA */}
      {selectedDay && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setSelectedDay(null)} 
          />
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedDay(null)}
              className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={16} />
            </button>

            <div className="mb-6 mt-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#3D81F1] mb-1">
                {new Date(selectedDay.fullDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {selectedDay.minutos} Minutos
              </h3>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedDay.details.map((detail: any, i: number) => {
                const isTimer = detail.courseId === "meditation-timer";
                
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isTimer ? 'bg-[#3D81F1]/10 text-[#3D81F1]' : 'bg-slate-900 text-white'}`}>
                        {isTimer ? <Clock size={16} /> : <PlayCircle size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {isTimer ? "Prática Livre" : "Sessão Praticada"}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                          {isTimer ? "Timer" : "Curso"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                      {Math.round(detail.timeWatched / 60)} min
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

function KpiCard({ title, value, icon, isLast }: any) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between h-full transition-all hover:border-slate-200`}>
      <div className="flex items-center justify-between text-slate-400 mb-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{title}</span>
        {icon}
      </div>
      <span className="text-2xl font-semibold text-slate-900 tracking-tighter">{value}</span>
    </div>
  );
}