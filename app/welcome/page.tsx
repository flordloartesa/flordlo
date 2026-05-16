"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import Link from '@/components/MyLink';
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/mindful-store";
  const urlError = searchParams.get("error");

  // Estado para alternar entre Login e Registo
  const [isLoginView, setIsLoginView] = useState(true);

  // Estados dos campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  
  // Estado para controlar a exibição do erro
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (urlError) {
      setClientError(urlError);
      router.replace('/welcome', { scroll: false }); 
    }
  }, [urlError, router]);

  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Nome de utilizador ou senha incorretos.",
    Signin: "Tente usar outra conta ou e-mail.",
    OAuthSignin: "Erro ao tentar entrar com o fornecedor escolhido.",
    OAuthCallback: "Erro na resposta do fornecedor. Tente novamente.",
    EmailSignin: "Não foi possível enviar o e-mail. Verifique a ligação.",
    AdapterError: "Erro de ligação à base de dados. Tente novamente mais tarde.",
    default: "Ocorreu um erro inesperado. Tente novamente."
  };

  // ✅ Função de Login do Google com prompt e redirecionamento para a loja
  const handleGoogleLogin = async () => {
    setClientError(null);
    setLoading('google');
    try {
      await signIn("google", { 
        callbackUrl: "/mindful-store", 
        prompt: "select_account" 
      });
    } catch (err) {
      console.error(`Erro no login com Google:`, err);
    } finally {
      setLoading(null);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setLoading('credentials');

    if (isLoginView) {
      const res = await signIn("credentials", { 
        email, 
        password, 
        redirect: false 
      });

      if (res?.error) {
        setClientError(res.error);
      } else if (res?.ok) {
        window.location.href = "/mindful-store"; 
      }
    } else {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (!res.ok) {
          setClientError(data.message || "Erro ao registar.");
        } else {
          await signIn("credentials", { 
            email, 
            password, 
            callbackUrl: "/mindful-store" 
          });
        }
      } catch (err) {
        setClientError("Falha de ligação.");
      }
    }
    setLoading(null);
  };

  const handleMagicLink = async () => {
    setClientError(null);
    if (!email) {
      alert("Por favor, insira o seu e-mail no campo acima para receber o link.");
      return;
    }
    setLoading('email');
    const res = await signIn("email", { email, redirect: false, callbackUrl });
    
    if (res?.error) {
      setClientError(res.error);
    } else if (res?.ok) {
      alert("Link mágico enviado! Verifique o seu e-mail.");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans">
      
      {/* ================= ESQUERDA ================= */}
      <div 
        className="relative w-full md:w-[40%] h-[30vh] md:h-screen bg-cover bg-center flex-shrink-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1576595014186-c66433362597?ixlib=rb-1.2.1&auto=format&fit=crop&w=783&q=80')" 
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[85px] h-[85px] md:w-[92px] md:h-[92px]">
            <Image 
              src="https://meditt.space/img/logos/meditt-fav-icon-w-transparent.png" 
              alt="Meditt Logo" 
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>
      </div>

      {/* ================= DIREITA ================= */}
      <div className="w-full md:w-[60%] flex items-center justify-center px-6 pt-24 pb-16 md:p-12 lg:p-24 bg-white relative">
        
        <Link href="/" className="absolute top-6 right-6 md:top-8 md:right-8 text-sm text-slate-400 hover:text-slate-800 transition z-10">
          Voltar ao site
        </Link>

        <div className="w-full max-w-[450px] space-y-8 mt-6 md:mt-0">
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-[38px] font-extrabold tracking-tight">
              <span 
                onClick={() => { setIsLoginView(true); setClientError(null); }} 
                className={`cursor-pointer transition-colors ${isLoginView ? 'text-[#333]' : 'text-slate-400 font-normal hover:text-slate-600'}`}
              >
                Iniciar sessão
              </span>
              <span className="text-slate-300 font-normal mx-2">/</span>
              <span 
                onClick={() => { setIsLoginView(false); setClientError(null); }} 
                className={`cursor-pointer transition-colors ${!isLoginView ? 'text-[#333]' : 'text-slate-400 font-normal hover:text-slate-600'}`}
              >
                Registar
              </span>
            </h1>
          </div>

          {clientError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex justify-between items-center">
              <p className="text-sm text-red-700 font-medium">
                {errorMessages[clientError] || clientError || errorMessages.default}
              </p>
              <button onClick={() => setClientError(null)} className="text-red-400 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-5 mt-8">
            
            {!isLoginView && (
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">Nome Completo *</label>
                <input
                  type="text"
                  required={!isLoginView}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#105ee5] outline-none transition"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setClientError(null); }}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">E-mail *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#105ee5] outline-none transition"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setClientError(null); }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#105ee5] outline-none transition pr-10"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setClientError(null); }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={!!loading}
                className="w-full py-3.5 px-4 bg-[#105ee5] text-white font-bold rounded-[20px] hover:bg-blue-700 transition-all uppercase text-[11px] tracking-widest disabled:bg-slate-300"
              >
                {loading === 'credentials' ? "A processar..." : isLoginView ? "INICIAR SESSÃO" : "REGISTAR COM SENHA"}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={!!loading}
                className="w-full py-3.5 px-4 bg-white border-2 border-[#105ee5] text-[#105ee5] font-bold rounded-[20px] hover:bg-blue-50 transition-all uppercase text-[11px] tracking-widest disabled:opacity-50"
              >
                {loading === 'email' ? "A enviar..." : "MAGIC LINK (SEM SENHA)"}
              </button>
            </div>

            {/* ✅ FUNCIONALIDADE REINTEGRADA: Manter Sessão e Esqueci Senha */}
            {isLoginView && (
              <div className="flex justify-between items-center mt-6">
                <label className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-[#105ee5]" />
                  Manter Sessão
                </label>
                <Link href="/auth/forgot-password" className="text-[10px] font-bold text-[#105ee5] uppercase tracking-widest hover:underline">
                  Perdeu a sua senha?
                </Link>
              </div>
            )}
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-medium">Ou entre com</span></div>
          </div>

          {/* ✅ Botão Google com Seletor de Contas */}
          <button
            onClick={handleGoogleLogin}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-300 rounded-[20px] shadow-sm bg-white text-sm font-bold text-[#333] hover:bg-slate-50 transition disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M20.64 12.2045c0-.6381-.0573-1.2518-.1636-1.8409H12v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"></path>
              <path fill="#34A853" d="M12 21c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H3.9574v2.3318C5.4382 18.9832 8.4818 21 12 21z"></path>
              <path fill="#FBBC05" d="M6.964 13.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V7.9582H3.9573A8.9965 8.9965 0 0 0 3 12c0 1.4523.3477 2.8268.9573 4.0418L6.964 13.71z"></path>
              <path fill="#EA4335" d="M12 6.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C16.4632 3.8918 14.426 3 12 3 8.4818 3 5.4382 5.0168 3.9573 7.9582L6.964 10.29C7.6718 8.1627 9.6559 6.5795 12 6.5795z"></path>
            </svg>
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#105ee5] font-bold text-lg">A carregar...</div>}>
      <WelcomeContent />
    </Suspense>
  );
}