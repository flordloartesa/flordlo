"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, Mail, Phone, MapPin, ShieldCheck, CreditCard, 
  Save, Loader2, CheckCircle2, Lock, History, ExternalLink 
} from "lucide-react";

import { updateCustomerData, getUserOrders, updateUserPassword } from "@/app/actions/updateCustomer";

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("geral");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", location: "" });

  // ESTADOS PARA A PASSWORD
  const [passData, setPassData] = useState({ old: "", new: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name?.split(" ") || ["", ""];
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        phone: (session.user as any).phone || "",
        location: (session.user as any).location || "",
      });
      loadOrders();
    }
  }, [session]);

  const loadOrders = async () => {
    if (session?.user?.email) {
      const res = await getUserOrders(session.user.email);
      if (res.success) setOrders(res.orders);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateCustomerData(session?.user?.email!, formData);
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage({ type: "", text: "" });
    setPassLoading(true);

    const res = await updateUserPassword(session?.user?.email!, passData.old, passData.new);
    
    if (res.success) {
      setPassMessage({ type: "success", text: "Senha atualizada com sucesso!" });
      setPassData({ old: "", new: "" }); 
    } else {
      setPassMessage({ type: "error", text: res.error || "Erro ao atualizar." });
    }
    setPassLoading(false);
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-slate-400">A carregar...</div>;

  return (
    <main className="min-h-screen bg-[#FAFBFC] text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight italic">Definições</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* MENU LATERAL */}
          <aside className="space-y-2">
            {[
              { id: "geral", label: "Informação Geral", icon: User },
              { id: "seguranca", label: "Segurança", icon: ShieldCheck },
              { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? "bg-white border border-slate-100 text-[#9d6b73] shadow-sm" 
                  : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
                {tab.label}
              </button>
            ))}
          </aside>

          {/* CONTEÚDO DINÂMICO */}
          <div className="md:col-span-3">
            <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm min-h-[500px]">
              
              {/* ABA: GERAL */}
              {activeTab === "geral" && (
                <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Primeiro Nome" value={formData.firstName} onChange={(v: string) => setFormData({...formData, firstName: v})} />
                    <InputField label="Apelido" value={formData.lastName} onChange={(v: string) => setFormData({...formData, lastName: v})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">E-mail</label>
                    <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-sm">
                      <Mail size={16} /> {session?.user?.email}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Telemóvel" icon={Phone} value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
                    <InputField label="Localização" icon={MapPin} value={formData.location} onChange={(v: string) => setFormData({...formData, location: v})} />
                  </div>
                  <button type="submit" className="bg-[#9d6b73] text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#85585f] transition-all shadow-lg shadow-[#9d6b73]/20">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Gravar Alterações"}
                  </button>
                </form>
              )}

              {/* ABA: SEGURANÇA */}
              {activeTab === "seguranca" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Palavra-passe</h3>
                    <p className="text-sm text-slate-500 mb-6">Recomendamos que alteres a tua senha a cada 6 meses.</p>

                    {/* AVISO VISUAL ADAPTADO AO ROSA VELHO */}
                    <div className="mb-6 flex gap-3 p-4 bg-[#fcf7f8] border border-[#9d6b73]/20 rounded-2xl text-[#7a4b52] text-sm leading-relaxed">
                      <ShieldCheck className="text-[#9d6b73] shrink-0" size={20} />
                      <p>
                        <strong>Nota de Acesso:</strong> Se entraste via <strong>Google</strong> ou <strong>Magic Link</strong> e nunca definiste uma senha, deixa o campo "Senha Atual" vazio para criares a tua primeira senha.
                      </p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <input 
                        type="password" 
                        placeholder="Senha Atual" 
                        value={passData.old}
                        onChange={(e) => setPassData({...passData, old: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#9d6b73]/20" 
                      />
                      <input 
                        type="password" 
                        placeholder="Nova Senha" 
                        required
                        value={passData.new}
                        onChange={(e) => setPassData({...passData, new: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#9d6b73]/20" 
                      />
                      
                      {passMessage.text && (
                        <div className={`p-3 rounded-xl text-xs font-semibold ${passMessage.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                          {passMessage.text}
                        </div>
                      )}

                      <button type="submit" disabled={passLoading} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center min-w-[160px] hover:bg-black transition-colors">
                        {passLoading ? <Loader2 className="animate-spin" size={16} /> : "Atualizar Senha"}
                      </button>
                    </form>
                  </div>

                  <div className="pt-8 border-t border-slate-50">
                    <h3 className="text-lg font-semibold text-red-500 mb-1">Zona de Perigo</h3>
                    <p className="text-sm text-slate-500 mb-4">Ao apagar a conta, perderás acesso ao teu histórico permanentemente.</p>
                    <button className="text-red-500 font-bold text-xs uppercase tracking-widest hover:underline">Eliminar minha conta flor.d.ló</button>
                  </div>
                </div>
              )}

              {/* ABA: PAGAMENTOS */}
              {activeTab === "pagamentos" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold italic">Histórico de Compras</h3>
                    <button className="text-[10px] font-bold uppercase text-[#9d6b73] flex items-center gap-1 hover:text-[#85585f] transition-colors">
                      Portal Stripe <ExternalLink size={12} />
                    </button>
                  </div>
                  
                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-5 border border-slate-50 rounded-2xl hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                              <History size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{order.items?.[0] || "Artigo Flor.d.Ló"}</p>
                              <p className="text-[11px] text-slate-400">{new Date(order._createdAt).toLocaleDateString('pt-PT')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{order.totalAmount}€</p>
                            <span className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-1 rounded-md ${order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 italic">Ainda não realizaste nenhuma compra.</div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Componente Auxiliar para Inputs
function InputField({ label, icon: Icon, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />}
        <input 
          type="text" 
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${Icon ? 'pl-12' : 'px-5'} py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#9d6b73]/20 outline-none transition-all text-sm font-medium`}
        />
      </div>
    </div>
  );
}