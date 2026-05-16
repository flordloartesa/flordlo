// components/CourseWorkbooks.tsx
import React from 'react';
import { FileDown, Download } from 'lucide-react';

interface Workbook {
  title: string;
  fileUrl: string;
}

export default function CourseWorkbooks({ workbooks }: { workbooks: Workbook[] }) {
  
  // Se não houver dados, o componente não renderiza
  if (!workbooks || workbooks.length === 0) return null;

  return (
    <div className="mt-4 p-5 bg-slate-50 rounded-[24px] border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#155DFC]/10 p-2 rounded-lg">
          <FileDown className="text-[#155DFC]" size={18} />
        </div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Recursos Disponíveis
        </h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {workbooks.map((item, index) => (
          <a
            key={index}
            href={item.fileUrl ? `${item.fileUrl}?dl=` : '#'}
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 hover:border-[#155DFC] hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col flex-1 pr-4 text-left">
              {/* ✅ O NOME DO LIVRO (TITLE) APARECE AQUI */}
              <span className="text-[10px] font-black text-slate-800 group-hover:text-[#155DFC] transition-colors uppercase tracking-tight leading-tight">
                {item.title || "Sem título definido"}
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                Download PDF
              </span>
            </div>
            
            <div className="bg-slate-50 group-hover:bg-[#155DFC] p-2 rounded-full transition-all">
              <Download size={14} className="text-slate-400 group-hover:text-white" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}