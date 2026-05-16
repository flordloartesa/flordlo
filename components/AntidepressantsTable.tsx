import React from 'react';

export default function AntidepressantsTable() {
  return (
    <div className="w-full max-w-7xl mx-auto bg-white p-4 md:p-6 font-sans text-slate-800">
      
      {/* CABEÇALHO DA TABELA */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Tabela 1.</h3>
        <p className="text-[15px] text-slate-600">
          Revisão de antidepressivos: mecanismo terapêutico e efeitos secundários.
        </p>
      </div>

      {/* TABELA RESPONSIVA */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
        <table className="w-full min-w-[1000px] border-collapse text-sm text-left">
          
          <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold border-r border-slate-200">Classe de Antidepressivo</th>
              <th className="p-4 font-semibold border-r border-slate-200">Droga</th>
              <th className="p-4 font-semibold border-r border-slate-200 w-[25%]">Ação Terapêutica</th>
              <th className="p-4 font-semibold border-r border-slate-200 w-[20%]">Ação Farmacológica Não Desejada</th>
              <th className="p-4 font-semibold">Efeitos Secundários</th>
            </tr>
          </thead>
          
          <tbody className="align-top divide-y divide-slate-200">
            
            {/* --- TCAs --- */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td rowSpan={3} className="p-4 border-r border-slate-200 font-medium">Antidepressivos tricíclicos (TCAs)</td>
              <td rowSpan={3} className="p-4 border-r border-slate-200">Clomipramina, imipramina, amitriptilina, desipramina, trimipramina, nortriptilina, protriptilina, maprotilina, amoxapina, doxepina</td>
              <td rowSpan={3} className="p-4 border-r border-slate-200">Bloqueio dos transportadores de recaptação da serotonina e norepinefrina e, em menor grau, da dopamina</td>
              <td className="p-4 border-r border-slate-200 border-b border-slate-100">Bloqueio dos receptores muscarínicos (anticolinérgico)</td>
              <td className="p-4 border-b border-slate-100">Boca seca, taquicardia, visão turva, glaucoma, obstipação, retenção urinária. Disfunção sexual, comprometimento cognitivo</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200 border-b border-slate-100">Bloqueio Adrenoreceptor-α<sub>1</sub></td>
              <td className="p-4 border-b border-slate-100">Sonolência, hipotensão postural, disfunção sexual</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200">Bloqueio do receptor da Histamina H<sub>1</sub></td>
              <td className="p-4">Sonolência, aumento de peso</td>
            </tr>

            {/* --- MAOIs --- */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td rowSpan={2} className="p-4 border-r border-slate-200 font-medium">Inibidores da monoamina oxidases (MAOIs)</td>
              <td className="p-4 border-r border-slate-200 border-b border-slate-100">Irreversível: fenelzina, tranilcipromina, isocarboxazida</td>
              <td className="p-4 border-r border-slate-200 border-b border-slate-100">Irreversível e inibição não-seletiva da monoamina oxidase (MOA)</td>
              <td className="p-4 border-r border-slate-200 border-b border-slate-100">Bloqueio irreversível da monoamina oxidase</td>
              <td className="p-4 border-b border-slate-100">O risco de hipertensão pelas aminas na dieta - tiramina deve ser evitada, risco de hemorragia intracerebral</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200">Reversível: moclobemida</td>
              <td className="p-4 border-r border-slate-200">Reversível e inibição seletiva da MOA</td>
              <td className="p-4 border-r border-slate-200 text-slate-400 italic">--</td>
              <td className="p-4 text-slate-400 italic">--</td>
            </tr>

            {/* --- SSRIs --- */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200 font-medium">Inibidores seletivos da recaptação da serotonina (SSRIs)</td>
              <td className="p-4 border-r border-slate-200">Fluoxetina<br />paroxetina<br />sertralina<br />fluvoxamina<br />citalopram<br />escitalopram</td>
              <td className="p-4 border-r border-slate-200">Inibição seletiva da recaptação do transportador do 5HT</td>
              <td className="p-4 border-r border-slate-200">Agonista do receptor 5HT<sub>2C</sub></td>
              <td className="p-4">Gastrintestinal: apetite reduzido, náusea, constipação, boca seca <br /> Sist Nervoso Central: dor de cabeça, insónia, ansiedade, fadiga, tremor <br /> Outros: atraso no orgasmo, anorgasmia</td>
            </tr>

            {/* --- NDRIs --- */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200 font-medium">Inibidores da recaptação de noradrenalina e dopamina (NDRIs)</td>
              <td className="p-4 border-r border-slate-200">Bupropiona</td>
              <td className="p-4 border-r border-slate-200">Bloqueio dos transportadores da NE e DA</td>
              <td className="p-4 border-r border-slate-200 text-slate-400 italic">--</td>
              <td className="p-4">Maior risco de convulsões</td>
            </tr>

            {/* --- SNRIs --- */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200 font-medium">Inibidores duplos da recaptação de serotonina e norepinefrina (SNRIs)</td>
              <td className="p-4 border-r border-slate-200">Venlafaxina, duloxetina</td>
              <td className="p-4 border-r border-slate-200">Bloqueio dos transportadores da recaptação 5HT e NE</td>
              <td className="p-4 border-r border-slate-200 text-slate-400 italic">--</td>
              <td className="p-4">Náuseas, tonturas, dor de cabeça, boca seca, insónia, aumento da pressão arterial</td>
            </tr>

            {/* --- SARIs --- */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td rowSpan={4} className="p-4 border-r border-slate-200 font-medium">Inibidores seletivos da recaptação de 5-HT/NE (SARIs)</td>
              <td rowSpan={3} className="p-4 border-r border-slate-200">Trazodona</td>
              <td rowSpan={3} className="p-4 border-r border-slate-200">Bloqueia fortemente os receptores da serotonina-2 com inibição menos potente da recaptação do 5HT</td>
              <td className="p-4 border-r border-slate-200 border-b border-slate-100">Histamina H<sub>1</sub> Bloqueio dos receptores</td>
              <td className="p-4 border-b border-slate-100">Sedação, diminuição cognitiva</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200 border-b border-slate-100">Bloqueio Adrenoreceptor-α<sub>1</sub></td>
              <td className="p-4 border-b border-slate-100">Diminui a pressão arterial, hipotensão postural</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200 border-b border-slate-200 text-slate-400 italic">--</td>
              <td className="p-4 border-b border-slate-200">Outros: priapismo (ereções prolongadas)</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200">Nefazodona</td>
              <td className="p-4 border-r border-slate-200 text-slate-400 italic">--</td>
              <td className="p-4 border-r border-slate-200">Histamina H<sub>1</sub> Bloqueio dos receptores</td>
              <td className="p-4">Sedativa, porém menos do que a Trazodona</td>
            </tr>

            {/* --- NaSSA --- */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200 font-medium">Antidepressivo (Tetracíclico) específico para a noradrenalina e a serotonina (NaSSA)</td>
              <td className="p-4 border-r border-slate-200">Mianserina e Mirtazepina</td>
              <td className="p-4 border-r border-slate-200">Antagonismo 5HT<sub>2</sub> <br/>Antagonista dos adrenoreceptores-α<sub>2</sub></td>
              <td className="p-4 border-r border-slate-200">Bloqueio dos receptores histamina H<sub>1</sub></td>
              <td className="p-4">Sonolência, boca seca, sedação, aumento de peso</td>
            </tr>

            {/* --- NARI --- */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 border-r border-slate-200 font-medium">Inibidores seletivos da recaptação da noradrenalina (NARI)</td>
              <td className="p-4 border-r border-slate-200">Reboxetina</td>
              <td className="p-4 border-r border-slate-200">Inibição seletiva da recaptação da NA</td>
              <td className="p-4 border-r border-slate-200">Bloqueio dos receptores muscarínicos</td>
              <td className="p-4">Boca seca, prisão de ventre, dores de cabeça</td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* NOTA DE RODAPÉ */}
      <div className="mt-4 text-xs text-slate-500 leading-relaxed">
        <p>
          <span className="font-semibold text-slate-700">Tabela 1</span> para uma revisão seletiva de antidepressivos; Observe, no entanto, que esta tabela não representa uma revisão exaustiva dos antidepressivos atualmente disponíveis [Gelder <em>et al.</em> 2006].
        </p>
      </div>

    </div>
  );
}