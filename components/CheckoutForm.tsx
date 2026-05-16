"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Exemplo de item do carrinho
interface CartItem {
  _id: string;
  title: string;
  price: number;
}

export default function CheckoutForm({ cartItems }: { cartItems: CartItem[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [method, setMethod] = useState<'paypal' | 'bank'>('paypal');
  const [loading, setLoading] = useState(false);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price, 0);

  // Função genérica para chamar a nossa API
  const handleCreateOrder = async (paymentMethod: string, transactionId?: string) => {
    setLoading(true);
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: session?.user?.email,
        cartItems,
        amount: totalAmount,
        paymentMethod,
        transactionId
      })
    });

    if (res.ok) {
      if (paymentMethod === 'paypal') {
        router.push('/sucesso'); // Página de agradecimento
      } else {
        router.push('/pagamento-pendente'); // Página com instruções IBAN
      }
    } else {
      alert("Erro ao processar encomenda.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', background: '#f9f9f9', borderRadius: '10px' }}>
      <h2>Finalizar Compra</h2>
      <div style={{ marginBottom: '20px' }}>
        <strong>Total a Pagar: {totalAmount}€</strong>
      </div>

      {/* SELETOR DE MÉTODO */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setMethod('paypal')}
          style={{ 
            flex: 1, padding: '10px', 
            background: method === 'paypal' ? '#0070ba' : '#eee', 
            color: method === 'paypal' ? 'white' : 'black',
            border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}
        >
          PayPal / Cartão
        </button>
        <button 
          onClick={() => setMethod('bank')}
          style={{ 
            flex: 1, padding: '10px', 
            background: method === 'bank' ? '#4C38A3' : '#eee', 
            color: method === 'bank' ? 'white' : 'black',
            border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}
        >
          Transferência
        </button>
      </div>

      {/* OPÇÃO 1: PAYPAL */}
      {method === 'paypal' && (
        <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
           <PayPalButtons 
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                  //return actions.order.create({
                    //  purchase_units: [{
                         // amount: { value: totalAmount.toString() }
                return actions.order.create({
    intent: "CAPTURE",
    purchase_units: [{
        amount: { 
            currency_code: "EUR",
            value: totalAmount.toString() 
        }
    }]
});
                   
              }}
              onApprove={async (data, actions) => {
                  const details = await actions.order!.capture();
                  // Pagamento feito no PayPal! Agora salvamos no Sanity.
                  await handleCreateOrder('paypal', details.id);
              }}
           />
        </PayPalScriptProvider>
      )}

      {/* OPÇÃO 2: TRANSFERÊNCIA BANCÁRIA */}
      {method === 'bank' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Ao confirmar, receberás um email com o IBAN para transferência.
            O acesso será liberado após envio do comprovativo.
          </p>
          <button 
            onClick={() => handleCreateOrder('bank')}
            disabled={loading}
            style={{ 
              width: '100%', padding: '15px', 
              background: '#22c55e', color: 'white', 
              border: 'none', borderRadius: '5px', 
              fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
            }}
          >
            {loading ? "A processar..." : "Confirmar Encomenda"}
          </button>
        </div>
      )}
    </div>
  );
}