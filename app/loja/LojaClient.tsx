'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from "@/components/ProductCard";

export default function LojaClient({ initialProducts }: { initialProducts: any[] }) {
  const searchParams = useSearchParams();
  const categoriaURL = searchParams.get('categoria');

  // 🧠 Em vez de começar sempre em 'Todas', ele lê o que vem no link!
  const [categoriaAtiva, setCategoriaAtiva] = useState(categoriaURL || 'Todas');
  const [ordenacaoPreco, setOrdenacaoPreco] = useState('padrao');
  const [mostrarApenasEmStock, setMostrarApenasEmStock] = useState(false);

  // 🕵️‍♂️ Este "detetive" fica a vigiar. Se clicares no menu enquanto JÁ ESTÁS na loja, ele atualiza na hora!
  useEffect(() => {
    if (categoriaURL) {
      setCategoriaAtiva(categoriaURL);
    } else {
      setCategoriaAtiva('Todas'); 
    }
  }, [categoriaURL]);

  const categoriasUnicas = useMemo(() => {
    const cats = initialProducts.map(p => p.category).filter(Boolean);
    return ['Todas', ...Array.from(new Set(cats))].sort();
  }, [initialProducts]);

  // ⚙️ 1. APLICA OS FILTROS TODOS
  const produtosFiltrados = useMemo(() => {
    let filtrados = [...initialProducts];

    // Categoria
    if (categoriaAtiva !== 'Todas') {
      filtrados = filtrados.filter(p => p.category === categoriaAtiva);
    }
    
    // 🛠️ Stock rigoroso: Tem de ser exatamente "Em stock"
    if (mostrarApenasEmStock) {
      filtrados = filtrados.filter(p => p.status === 'Em stock');
    }
    
    // Preço
    if (ordenacaoPreco === 'crescente') {
      filtrados.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (ordenacaoPreco === 'decrescente') {
      filtrados.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return filtrados;
  }, [initialProducts, categoriaAtiva, ordenacaoPreco, mostrarApenasEmStock]);

  // 🧠 2. VOLTA A AGRUPAR POR CATEGORIA (PARA DESENHAR OS TÍTULOS)
  const produtosAgrupados = useMemo(() => {
    return produtosFiltrados.reduce((grupos: any, produto: any) => {
      const cat = produto.category || 'Outros';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(produto);
      return grupos;
    }, {});
  }, [produtosFiltrados]);

  const categoriasParaRenderizar = Object.keys(produtosAgrupados).sort();

  return (
    <div>
      {/* 🎛️ BARRA DE FILTROS (Sticky Top 0 para não cortar imagens) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md py-4 mb-12 border-y border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        
        {/* Botões de Categorias com scroll horizontal em mobile */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0 w-full md:w-auto">
          {categoriasUnicas.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-2 py-1 md:px-4 md:py-2 text-[8px] md:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap rounded-sm transition-colors border ${
                categoriaAtiva === cat 
                ? 'bg-[#9d6b73] text-white border-[#9d6b73]' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#9d6b73] hover:text-[#9d6b73]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Controlos de Stock e Preço */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
            <input 
              type="checkbox" 
              checked={mostrarApenasEmStock}
              onChange={(e) => setMostrarApenasEmStock(e.target.checked)}
              className="accent-[#9d6b73] w-4 h-4 "
            />
            Apenas em Stock
          </label>

          <select 
            value={ordenacaoPreco}
            onChange={(e) => setOrdenacaoPreco(e.target.value)}
            className="border border-slate-200 bg-white text-slate-600 text-[9px] text-[11px] px-3 py-2 rounded-sm focus:outline-none focus:border-[#9d6b73]"
          >
            <option value="padrao">Ordenar por Preço</option>
            <option value="crescente">Mais Barato Primeiro</option>
            <option value="decrescente">Mais Caro Primeiro</option>
          </select>
        </div>
      </div>

      {/* 📦 GRELHA DE PRODUTOS ORGANIZADA COM TÍTULOS */}
      {categoriasParaRenderizar.length > 0 ? (
        categoriasParaRenderizar.map((categoria) => (
          <section key={categoria} className="mb-16">
            
            {/* Título da Categoria com a linha fina */}
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-serif text-[#9d6b73] whitespace-nowrap tracking-wide">
                {categoria}
              </h2>
              <div className="h-[1px] w-full bg-slate-100"></div>
            </div>

            {/* Grelha de Cartões */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {produtosAgrupados[categoria].map((produto: any) => (
                <ProductCard key={produto._id} produto={produto} />
              ))}
            </div>
            
          </section>
        ))
      ) : (
        /* Se os filtros não devolverem nenhum resultado */
        <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-sm">
          <p className="text-slate-500 text-lg mb-4">Ups! Não encontrámos produtos com esses filtros.</p>
          <button 
            onClick={() => {
              setCategoriaAtiva('Todas');
              setMostrarApenasEmStock(false);
              setOrdenacaoPreco('padrao');
            }}
            className="text-[#9d6b73] font-bold underline underline-offset-4"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
      
    </div>
  );
}