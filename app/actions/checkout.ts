"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { client } from "@/app/lib/sanity"; 

import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; 
import { ShoppingBag, CreditCard, Landmark, ArrowLeft, CheckCircle2, ArrowRight, Wallet, Tag, Trash2, Plus, Minus, X, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart, addToCart, removeFromCart, decreaseQuantity } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'transfer'>('stripe');
  
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const [shippingSettings, setShippingSettings] = useState<any>(null);
  const [productWeights, setProductWeights] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nif: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Portugal'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await client.fetch(`*[_type == "storeSettings"][0]`);
        setShippingSettings(settings);
      } catch (error) {
        console.error("Erro ao carregar portes do Sanity:", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchWeights = async () => {
      if (cart.length === 0) return;
      
      const ids = cart.map((item: any) => (item._id || item.id || "").replace("drafts.", ""));
      try {
        const results = await client.fetch(`*[_type == "product" && _id in $ids]{ _id, weight }`, { ids });
        const weightMap: Record<string, number> = {};
        results.forEach((p: any) => {
          weightMap[p._id] = Number(p.weight || 0);
        });
        setProductWeights(weightMap);
      } catch (err) {
        console.error("Erro ao buscar pesos", err);
      }
    };
    fetchWeights();
  }, [cart]);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({ 
        ...prev, 
        email: session.user?.email || prev.email,
        firstName: prev.firstName || session.user?.name?.split(" ")[0] || "" 
      }));
    }
  }, [session]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = subtotal * (appliedCoupon.discountValue / 100);
    } else if (appliedCoupon.discountType === "fixed") {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  useEffect(() => {
    setDiscount(discountAmount);
  }, [discountAmount]);

  const totalWeight = cart.reduce((acc: number, item: any) => {
    const idLimpo = (item._id || item.id || "").replace("drafts.", "");
    const pesoReal = productWeights[idLimpo] ?? Number(item.weight || 0);
    return acc + (pesoReal * (item.quantity || 1));
  }, 0);
  
  const hasPhysicalProduct = true;

  let shippingCost = 0;
  
  if (hasPhysicalProduct) {
    if (shippingSettings) {
      const custoBase = shippingSettings.shippingCost ?? 4.80;
      const portesGratisLimite = shippingSettings.freeShippingThreshold ?? null;
      const pesoBaseLimite = shippingSettings.baseWeightLimit ?? 1;
      const custoExtraKg = shippingSettings.extraPricePerKg ?? 1.50;

      if (portesGratisLimite !== null && portesGratisLimite > 0 && subtotal >= portesGratisLimite) {
        shippingCost = 0; 
      } else {
        shippingCost = Number(custoBase);
        if (totalWeight > Number(pesoBaseLimite)) {
          const pesoExtra = totalWeight - Number(pesoBaseLimite);
          const kgExtraCobrados = Math.ceil(pesoExtra);
          shippingCost += (kgExtraCobrados * Number(custoExtraKg));
        }
      }
    } else {
      shippingCost = 4.80; 
    }
  }

  const totalFinal = Math.max(0, subtotal - discountAmount) + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponMessage({ type: '', text: 'A verificar...' });
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponMessage({ type: 'success', text: data.message });
      } else {
        setAppliedCoupon(null);
        setCouponMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setAppliedCoupon(null);
      setCouponMessage({ type: 'error', text: "Erro ao validar cupão." });
    }
  };

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isBasicValid = formData.firstName.trim() !== "" && formData.lastName.trim() !== "" && emailRegex.test(formData.email);
    
    if (hasPhysicalProduct) {
      return isBasicValid && formData.address.trim() !== "" && formData.postalCode.trim() !== "" && formData.city.trim() !== "";
    }
    return isBasicValid;
  };

  // ✅ GARANTIA DE LIMPEZA DO ID SEM CORTAR O TEXTO (SEM SUBSTRING)
  const getCleanedCart = () => cart.map(item => {
    const itemId = item._id || item.id || "";
    return {
      ...item,
      _id: itemId.replace("drafts.", ""),
      name: item.title || item.name, 
      price: item.price,
      quantity: item.quantity || 1
    };
  });

  const handleStripeCheckout = async () => {
    if (!isFormValid()) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: getCleanedCart(),
          formData: formData,
          discountAmount: discount, 
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          total: totalFinal,
          shippingCost: shippingCost, 
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorModal({ show: true, message: data.error || "Ocorreu um erro ao gerar o pagamento. Por favor, tente novamente." });
        setIsProcessing(false); // 👈 DESCONGELA BOTÃO NO ERRO
      }
    } catch (err) {
      console.error("Erro Stripe:", err);
      setErrorModal({ show: true, message: "Ocorreu um erro de ligação ao processar o pagamento com cartão." });
      setIsProcessing(false); // 👈 DESCONGELA BOTÃO NO ERRO
    }
  };

  const handleTransferSubmit = async () => {
    // 🛡️ Previne duplos cliques se o carrinho estiver vazio ou já a processar
    if (!isFormValid() || isProcessing || cart.length === 0) return; 
    
    setIsProcessing(true);

    const payload = { 
      userEmail: formData.email,
      cartItems: getCleanedCart(),
      amount: totalFinal, 
      paymentMethod: 'transfer',
      formData: formData,
      shippingCost: shippingCost 
    };

    try {
      const response = await fetch('/api/orders/create', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });

      const result = await response.json();

      if (response.ok && result.success) {
        clearCart();
        setIsProcessing(false); // 👈 ESTA FOI A LINHA MÁGICA QUE FALTAVA (DESCONGELA BOTÃO!)
        setShowModal(true);
      } else {
        setErrorModal({ show: true, message: result.details || result.error || "Não foi possível concluir o pedido. Verifique os dados e tente novamente." });
        setIsProcessing(false); // 👈 DESCONGELA BOTÃO NO ERRO
      }
    } catch (err) {
      console.error("Erro de ligação:", err);
      setErrorModal({ show: true, message: "Erro de rede. Verifique a sua ligação à internet e tente novamente." });
      setIsProcessing(false); // 👈 DESCONGELA BOTÃO NO ERRO DE REDE
    }
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center font-light">A verificar sessão...</div>;

  return (
    <PayPalScriptProvider options={{ 
        clientId: "AR_gx4ub19ZyacUauAWQx7Vnype-wpWCREzEUPRJPh4SBP_qkyQsRYWEf8WhX-ASibyJq5VhhgSFpW9B", 
        currency: "EUR",
        intent: "capture",
    }}>
      <main className="min-h-screen bg-[#F8F9FA] text-slate-800 relative font-sans">
        
        {/* ✅ MODAL DE SUCESSO BLINDADO COM Z-INDEX GIGANTE */}
        {showModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl p-8 md:p-12 max-w-lg w-full shadow-2xl text-center animate-in zoom-in duration-300">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2"><X size={24} /></button>
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
              <h2 className="text-3xl font-serif mb-4 text-slate-900">Pedido Registado!</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">Enviámos um e-mail para <span className="font-bold text-slate-800">{formData.email}</span> com os dados para transferência bancária.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => router.push("/")} className="w-full py-4 bg-[#9d6b73] text-white rounded-sm font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-colors hover:bg-[#85585f]">
                  Voltar à Loja <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ MODAL DE ERRO */}
        {errorModal.show && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer" onClick={() => setErrorModal({ show: false, message: "" })}></div>
            <div className="relative bg-white rounded-2xl p-8 md:p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
              <button onClick={() => setErrorModal({ show: false, message: "" })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2"><X size={24} /></button>
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle size={40} strokeWidth={2.5} /></div>
              <h2 className="text-2xl font-serif mb-3 text-slate-900">Oops!</h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">{errorModal.message}</p>
              <button onClick={() => setErrorModal({ show: false, message: "" })} className="w-full py-4 bg-[#9d6b73] text-white rounded-sm font-bold tracking-widest uppercase transition-colors hover:bg-[#85585f]">
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#9d6b73] mb-8 transition-colors">
            <ArrowLeft size={14} /> Voltar à Loja
          </Link>

          <h1 className="text-3xl md:text-4xl font-serif mb-10 text-slate-900">Finalizar Compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-serif mb-6 flex items-center gap-2 text-slate-800">
                  <ShoppingBag size={20} className="text-[#9d6b73]" /> 1. Dados de Envio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="firstName" onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-transparent rounded-md outline-none focus:border-[#9d6b73] focus:bg-white transition-all text-sm" placeholder="Nome *" value={formData.firstName} />
                  <input name="lastName" onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-transparent rounded-md outline-none focus:border-[#9d6b73] focus:bg-white transition-all text-sm" placeholder="Apelido *" value={formData.lastName} />
                  <input name="email" onChange={handleInputChange} className={`w-full p-4 border rounded-md outline-none focus:border-[#9d6b73] transition-all text-sm ${session ? 'bg-slate-100 border-transparent text-slate-500' : 'bg-slate-50 border-transparent focus:bg-white'}`} placeholder="E-mail *" value={formData.email} readOnly={!!session} />
                  <input name="phone" type="tel" onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-transparent rounded-md outline-none focus:border-[#9d6b73] focus:bg-white transition-all text-sm" placeholder="Telefone" value={formData.phone} />
                  <input name="nif" type="text" maxLength={9} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-transparent rounded-md outline-none focus:border-[#9d6b73] focus:bg-white transition-all text-sm md:col-span-2" placeholder="NIF (Opcional)" value={formData.nif} />
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Morada de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="address" onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-transparent rounded-md outline-none focus:border-[#9d6b73] focus:bg-white transition-all text-sm md:col-span-2" placeholder="Morada Completa (Rua, Nº, Andar) *" value={formData.address} />
                    <input name="postalCode" onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-transparent rounded-md outline-none focus:border-[#9d6b73] focus:bg-white transition-all text-sm" placeholder="Código Postal *" value={formData.postalCode} />
                    <input name="city" onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-transparent rounded-md outline-none focus:border-[#9d6b73] focus:bg-white transition-all text-sm" placeholder="Localidade / Cidade *" value={formData.city} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-serif mb-6 flex items-center gap-2 text-slate-800">
                  <CreditCard size={20} className="text-[#9d6b73]" /> 2. Método de Pagamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={() => setPaymentMethod('stripe')} className={`p-4 border rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-3 ${paymentMethod === 'stripe' ? 'bg-[#fcf7f8] border-[#9d6b73] text-[#9d6b73]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                    <div className={`p-3 rounded-full transition-colors ${paymentMethod === 'stripe' ? 'bg-[#9d6b73] text-white' : 'bg-slate-100 text-slate-400'}`}><Wallet size={20} /></div>
                    <span className="text-xs uppercase tracking-wide">Cartão / MB WAY</span>
                  </button>
                  <button onClick={() => setPaymentMethod('paypal')} className={`p-4 border rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-3 ${paymentMethod === 'paypal' ? 'bg-[#fcf7f8] border-[#9d6b73] text-[#9d6b73]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                    <div className={`p-3 rounded-full transition-colors ${paymentMethod === 'paypal' ? 'bg-[#9d6b73] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.727a1.22 1.22 0 0 1 1.205-1.033h9.757c.776 0 1.49.186 2.122.554.632.369 1.127.922 1.47 1.645.343.723.493 1.57.447 2.522-.036 1.116-.312 2.164-.816 3.107a6.262 6.262 0 0 1-2.185 2.51 7.218 7.218 0 0 1-3.23 1.05c-.6.064-1.206.096-1.815.096H9.79a.62.62 0 0 0-.61.517l-1.463 7.33a.641.641 0 0 1-.632.55z"/></svg>
                    </div>
                    <span className="text-xs uppercase tracking-wide">PayPal</span>
                  </button>
                  <button onClick={() => setPaymentMethod('transfer')} className={`p-4 border rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-3 ${paymentMethod === 'transfer' ? 'bg-[#fcf7f8] border-[#9d6b73] text-[#9d6b73]' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                    <div className={`p-3 rounded-full transition-colors ${paymentMethod === 'transfer' ? 'bg-[#9d6b73] text-white' : 'bg-slate-100 text-slate-400'}`}><Landmark size={20} /></div>
                    <span className="text-xs uppercase tracking-wide">Transferência</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-100 lg:sticky lg:top-24">
                <h3 className="font-bold uppercase tracking-widest text-slate-800 mb-6 text-sm">Resumo do Pedido</h3>
                
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                  {cart.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-4">O carrinho está vazio</p>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50 group">
                        <div className="flex items-center flex-1 overflow-hidden">
                          <button onClick={() => removeFromCart && removeFromCart(item._id)} className="p-1 mr-2 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0" title="Remover"><Trash2 size={14} /></button>
                          <span className="text-slate-600 text-xs font-medium truncate pr-2">{item.title}</span>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 gap-1.5">
                          <span className="font-bold text-slate-800 text-sm">€{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                          {addToCart && decreaseQuantity && (
                            <div className="flex items-center gap-2 border border-slate-200 rounded px-1.5 py-0.5">
                              <button onClick={() => decreaseQuantity(item._id)} className="text-slate-400 hover:text-slate-800"><Minus size={10} /></button>
                              <span className="text-[10px] font-medium w-3 text-center">{item.quantity || 1}</span>
                              <button onClick={() => addToCart(item)} className="text-slate-400 hover:text-slate-800"><Plus size={10} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 pt-6 mb-6">
                  <div className="flex gap-2">
                    <div className="relative w-full">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Código Promocional" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-transparent rounded-md outline-none focus:border-[#9d6b73] focus:bg-white text-xs uppercase transition-all text-slate-800" />
                    </div>
                    <button onClick={handleApplyCoupon} className="px-4 py-3 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-black transition-colors">Aplicar</button>
                  </div>
                  {couponMessage.text && <p className={`text-[10px] mt-2 font-medium italic ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{couponMessage.type === 'success' ? '✓' : '⚠'} {couponMessage.text}</p>}
                </div>

                <div className="border-t border-slate-100 pt-4 mb-8 space-y-3">
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Subtotal</span><span>€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-[#9d6b73]">
                      <span>Desconto</span><span className="font-bold">-€{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Portes de Envio</span>
                    {shippingCost === 0 ? (
                      <span className="font-bold text-green-500 uppercase tracking-widest text-[10px] bg-green-50 px-2 py-1 rounded">
                        Grátis
                      </span>
                    ) : (
                      <span>€{shippingCost.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-100 font-serif">
                    <span className="text-lg text-slate-800">Total</span>
                    <span className="text-2xl text-[#9d6b73] font-bold">€{totalFinal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentMethod === 'stripe' ? (
                    <button onClick={handleStripeCheckout} disabled={isProcessing || !isFormValid() || cart.length === 0} className="w-full py-4 bg-[#9d6b73] text-white rounded-sm font-bold uppercase text-xs tracking-[0.15em] transition-colors hover:bg-[#85585f] disabled:opacity-50 disabled:cursor-not-allowed">
                      {isProcessing ? 'A processar...' : 'Pagar Agora'}
                    </button>
                  ) : paymentMethod === 'paypal' ? (
                    <div key={totalFinal + status} className={`w-full animate-in fade-in duration-500 ${(!isFormValid() || cart.length === 0) ? 'opacity-50 pointer-events-none' : ''}`}>
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect", label: "pay" }}
                        disabled={!isFormValid() || totalFinal <= 0}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [{ amount: { currency_code: "EUR", value: totalFinal.toFixed(2) } }]
                          });
                        }}
                        onApprove={async (data, actions) => {
                          if (actions.order) {
                            await actions.order.capture();
                            clearCart();
                            setShowModal(true);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button onClick={handleTransferSubmit} disabled={isProcessing || !isFormValid() || cart.length === 0} className="w-full py-4 bg-[#9d6b73] text-white rounded-sm font-bold uppercase text-xs tracking-[0.15em] transition-colors hover:bg-[#85585f] disabled:opacity-50 disabled:cursor-not-allowed">
                      {isProcessing ? 'A registar pedido...' : 'Receber IBAN'}
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 mt-6 text-center uppercase tracking-widest">
                  Pagamento 100% Seguro
                </p>

                {!isFormValid() && (
                  <p className="text-red-400 text-xs mt-4 text-center">
                    Preencha os campos obrigatórios (*) para concluir.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </main>
    </PayPalScriptProvider>
  );
}