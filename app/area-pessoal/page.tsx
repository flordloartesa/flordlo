"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { client } from '@/app/lib/sanity';
import { 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  Package, 
  ExternalLink 
} from "lucide-react";

export default function AreaPessoalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session && !hasFetched.current) {
      hasFetched.current = true;
      fetchUserOrders(session.user?.email);
    }
  }, [status, session, router]);

  const fetchUserOrders = async (email: string | null | undefined) => {
    if (!email) return;
    try {
      // Procura as encomendas do utilizador e faz o JOIN com o produto para ter o título
      const data = await client.fetch(`
        *[_type == "order" && clienteEmail == $email] | order(createdAt desc) {
          orderNumber,
          createdAt,
          amount,
          status,
          metodoPagamento,
          items[] {
            price,
            "productTitle": product->title,
            "productSlug": product->slug.current
          }
        }
      `, { email }, { cache: 'no-store' });

      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar encomendas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-[#C47F8D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFBFC] text-slate-900 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* CABEÇALHO */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-2">
            Área Pessoal
          </h1>
          <p className="text-slate-500">
            Olá, {session?.user?.name?.split(' ')[0]}. Aqui está o histórico das tuas flores e escolhas.
          </p>
        </div>

        {/* LISTA DE ENCOMENDAS */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#C47F8D] font-bold uppercase tracking-widest text-xs mb-4">
            <ShoppingBag size={16} />
            As Minhas Encomendas
          </div>

          {orders.length > 0 ? (
            orders.map((order, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* TOPO DA ENCOMENDA */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Data</p>
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
                      <p className="text-sm font-bold text-[#C47F8D]">
                        {Number(order.amount).toFixed(2)}€
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Nº Pedido</p>
                      <p className="text-sm font-mono text-slate-500">{order.orderNumber}</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </div>
                </div>

                {/* ITENS DA ENCOMENDA */}
                <div className="p-6">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 last:border-0 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[#C47F8D]">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.productTitle}</p>
                          <p className="text-xs text-slate-400">{order.metodoPagamento}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700">{Number(item.price).toFixed(2)}€</p>
                        {item.productSlug && (
                          <a 
                            href={`/loja/${item.productSlug}`} 
                            className="text-[10px] text-[#C47F8D] hover:underline flex items-center gap-1 justify-end"
                          >
                            Ver produto <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Ainda não tens nenhuma encomenda realizada.</p>
              <a href="/loja" className="text-[#C47F8D] font-bold text-sm mt-4 inline-block hover:underline">
                Ir para a Loja
              </a>
            </div>
          )}
        </div>

        {/* RODAPÉ APOIO */}
        <div className="mt-20 p-8 bg-[#C47F8D]/5 rounded-3xl border border-[#C47F8D]/10 text-center">
          <p className="text-slate-600 text-sm mb-4">
            Tens alguma dúvida sobre as tuas encomendas ou queres fazer um pedido especial?
          </p>
          <a 
            href="/contacto" 
            className="inline-flex items-center gap-2 bg-[#C47F8D] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#b36d7b] transition-all"
          >
            Contactar Apoio Flor.d.Ló
          </a>
        </div>

      </div>
    </main>
  );
}