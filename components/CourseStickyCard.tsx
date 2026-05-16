"use client";
import { PlayCircle, ShieldCheck, Infinity, Smartphone, FileText, Award } from "lucide-react";

export default function CourseStickyCard({ course }: any) {
  return (
    <div className="lg:absolute lg:-top-[350px] right-0 w-full lg:w-[350px] bg-white shadow-2xl border border-slate-200 z-20 rounded-sm overflow-hidden transition-all">
      
      {/* Imagem/Vídeo Preview */}
      <div className="relative aspect-video group cursor-pointer">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <PlayCircle size={60} className="text-white opacity-90 group-hover:scale-110 transition-transform" />
        </div>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-bold text-shadow">Pré-visualizar este curso</span>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold">€{course.price || "89,00"}</span>
          <span className="text-slate-500 line-through text-lg">€149,00</span>
          <span className="text-green-700 font-medium">40% de desconto</span>
        </div>

        <div className="flex flex-col gap-2">
          <button className="w-full bg-indigo-600 text-white py-3 font-bold hover:bg-indigo-700 transition-colors">
            Adicionar ao carrinho
          </button>
          <button className="w-full border border-slate-900 py-3 font-bold hover:bg-slate-50 transition-colors">
            Comprar agora
          </button>
        </div>

        <p className="text-center text-xs text-slate-500">Garantia de reembolso de 30 dias</p>

        <div className="space-y-3">
          <h4 className="font-bold text-sm">Este curso inclui:</h4>
          <ul className="text-sm space-y-2 text-slate-700">
            <li className="flex items-center gap-3"><Infinity size={16}/> Acesso vitalício total</li>
            <li className="flex items-center gap-3"><Smartphone size={16}/> Acesso no dispositivo móvel e na TV</li>
            <li className="flex items-center gap-3"><FileText size={16}/> 15 recursos para download</li>
            <li className="flex items-center gap-3"><Award size={16}/> Certificado de conclusão</li>
          </ul>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button className="font-bold text-sm underline">Partilhar</button>
          <button className="font-bold text-sm underline">Oferecer este curso</button>
          <button className="font-bold text-sm underline">Aplicar Cupão</button>
        </div>
      </div>
    </div>
  );
}