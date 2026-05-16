"use client";

import { signIn } from "next-auth/react";
import clientPromise from "@/app/lib/mongodb";
import { useState, Suspense } from "react";
import Link from '@/components/MyLink';
import { useSearchParams, useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth"; 
import { Loader2, Mail, Lock, User, Chrome } from "lucide-react";

function SignInContent() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  // Tradução de erros do NextAuth para debug
  const errorMessages: Record<string, string> = {
    Signin: "Tente usar outra conta ou e-mail.",
    OAuthSignin: "Erro ao tentar entrar com o fornecedor escolhido.",
    OAuthCallback: "Erro na resposta do fornecedor. Tente novamente.",
    EmailSignin: "Não foi possível enviar o e-mail. Verifique o servidor SMTP.",
    AdapterError: "Erro de ligação à base de dados. Verifique o Token e os Schemas.",
    default: "Ocorreu um erro inesperado. Tente novamente."
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("submit");
    setMessage({ type: "", text: "" });

    if (mode === "register") {
      // 📝 LÓGICA DE REGISTO (EMAIL + PASS)
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const res = await registerUser(formData);

      if (res.success) {
        setMessage({ type: "success", text: "Conta criada! A iniciar sessão..." });
        // Após registar, fazemos login automático via Credentials
        await signIn("credentials", { email, password, callbackUrl });
      } else {
        setMessage({ type: "error", text: res.error || "Erro ao registar." });
        setLoading(null);
      }
    } else {
      // 🔑 LÓGICA DE LOGIN (CREDENTIALS)
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setMessage({ type: "error", text: "Email ou password incorretos." });
        setLoading(null);
      } else {
        router.push(callbackUrl);
      }
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Introduz o teu email para receber o link." });
      return;
    }
    setLoading("magic");
    await signIn("email", { email, callbackUrl });
  };

  const logoUrl = "https://64.media.tumblr.com/a61f9037de0a73e8161bb4b2ba661d9c/d03a5d8c83d77852-db/s500x750/d45cd2861c043e93c9b5c2839ec42909e2c06b36.pnj";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FAFBFC]">
      <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100">
        
        {/* CABEÇALHO COM LOGÓTIPO */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img 
            src={logoUrl} 
            alt="Meditt Space Logo" 
            className="w-12 h-12 rounded-2xl object-cover mb-4 shadow-sm"
          />
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meditt Space</h2>
          <p className="text-slate-500 mt-2">
            {mode === "login" ? "Bem-vindo de volta!" : "Cria a tua conta gratuita"}
          </p>
        </div>

        {/* MENSAGENS DE ERRO DO URL */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
            <p className="text-sm text-red-700">
              {errorMessages[error] || errorMessages.default}
            </p>
          </div>
        )}

        {/* ALTERNADOR DE MODO (LOGIN / REGISTO) */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => { setMode("login"); setMessage({type:"", text:""}); }}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === "login" ? "bg-white text-[#3b82f6] shadow-sm" : "text-slate-500"}`}
          >
            Entrar2
          </button>
          <button 
            onClick={() => { setMode("register"); setMessage({type:"", text:""}); }}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === "register" ? "bg-white text-[#3b82f6] shadow-sm" : "text-slate-500"}`}
          >
            Registar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Nome completo" required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#3b82f6]/20 text-black shadow-sm"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" placeholder="O teu e-mail" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#3b82f6]/20 text-black shadow-sm"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" placeholder="Palavra-passe" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#3b82f6]/20 text-black shadow-sm"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ALERTAS DE FEEDBACK */}
          {message.text && (
            <div className={`p-4 rounded-2xl text-xs font-bold animate-in fade-in zoom-in duration-200 ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" disabled={!!loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:bg-slate-400 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading === "submit" ? <Loader2 className="animate-spin" size={20} /> : (mode === "login" ? "Entrar na conta" : "Criar conta agora")}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest text-slate-400"><span className="bg-white px-4 font-bold">Ou continuar com</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialLogin('google')}
            disabled={!!loading}
            className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 shadow-sm disabled:opacity-50"
          >
            {loading === 'google' ? <Loader2 className="animate-spin" size={18}/> : <Chrome size={18} className="text-[#4285F4]" />} Google
          </button>
          
          <button 
            onClick={handleMagicLink}
            disabled={!!loading}
            className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 shadow-sm disabled:opacity-50"
          >
            {loading === "magic" ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} className="text-[#3b82f6]" />} Magic Link
          </button>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-xs text-slate-400 hover:text-[#3b82f6] transition-colors font-medium">Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">A carregar...</div>}>
      <SignInContent />
    </Suspense>
  );
}