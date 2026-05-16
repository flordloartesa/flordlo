"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Turnstile from "react-turnstile";

export default function CourseReviewForm({ 
  courseId, 
  referenceField = "physicalProduct" 
}: { 
  courseId: string, 
  referenceField?: string 
}) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState(""); 
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      alert("Por favor, aguarda a validação de segurança do Cloudflare.");
      return;
    }

    if (rating === 0) {
      alert("Por favor, seleciona uma classificação de 1 a 5 estrelas clicando nas estrelas.");
      return;
    }

    if (!session && !guestName.trim()) {
      alert("Por favor, indica o teu nome para a avaliação.");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session?.user?.name || guestName,
          email: session?.user?.email || "publico@meditt.space",
          rating,
          comment,
          courseId,      // O ID do produto/curso
          referenceField, // 🔥 ENVIA O NOME DO CAMPO (ex: physicalProduct ou course)
          turnstileToken: token
        }),
      });

      if (res.ok) {
        setStatus("success");
        setComment("");
        setGuestName("");
        setRating(0);
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 font-roboto-condensed font-light">
      <h3 className="text-[18px] mb-2 text-indigo-950 uppercase tracking-[3px] font-light text-center">
        Deixa a tua opinião
      </h3>
      <p className="text-[12px] text-indigo-400 mb-8 text-center uppercase tracking-widest">
        A tua partilha ajuda outros praticantes
      </p>

      {/* Sistema de Estrelas */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-3xl transition-all duration-200 transform ${
              (hover || rating) >= star ? "text-yellow-400 scale-125" : "text-gray-300 scale-100"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {!session && (
          <input
            type="text"
            required
            placeholder="O teu nome"
            className="w-full p-4 rounded-2xl border border-indigo-100 text-[15px] focus:ring-2 focus:ring-indigo-500 outline-none bg-white/70 text-slate-800"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        )}

        <textarea
          required
          placeholder="Partilha a tua experiência..."
          className="w-full p-5 rounded-2xl border border-indigo-100 min-h-[120px] text-[15px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white/50 text-slate-800"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="my-6 flex justify-center">
        <Turnstile
          sitekey="0x4AAAAAACf86PyF6Af3GBY9"
          onVerify={(token) => setToken(token)}
          onExpire={() => setToken(null)}
        />
      </div>

      <button
        disabled={status === "sending" || status === "success"}
        className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-[12px] transition-all duration-300 ${
          status === "success" 
            ? "bg-green-500 text-white cursor-default" 
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95"
        }`}
      >
        {status === "sending" ? "A Enviar..." : status === "success" ? "✓ Enviado com Sucesso!" : "Submeter Avaliação"}
      </button>

      {status === "success" && (
        <p className="text-green-600 text-[11px] mt-4 text-center font-bold">
          Obrigado! A tua avaliação foi enviada para aprovação.
        </p>
      )}

      {status === "error" && (
        <p className="text-red-500 text-[11px] mt-4 text-center font-bold">
          Ocorreu um erro. Tenta novamente.
        </p>
      )}
    </form>
  );
}