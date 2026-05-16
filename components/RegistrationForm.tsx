"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

// =====================================================================
// 1. CONFIGURAÇÃO DOS LINKS DE PAGAMENTO (MAPA DE EVENTOS)
// =====================================================================
const eventPaymentLinks: Record<string, string> = {
  // ESQUERDA: O texto exato que está no <option> mais abaixo
  // DIREITA: O link da página de reserva que definiste no outro ficheiro (chaves do eventData)
  
  "Redução de Stress - 8 Semanas": "/reserva/mbsr-8-semanas",
  
  "1ºRetiro - Mindfulness & Yoga": "/reserva/retiro-mindfulness-yoga",
  
  "5-Day Mindful Heart: Mindfulness and Chi-Kung Retreat": "/reserva/5-Day-Mindfulness-and-Chi-Kung-Retreat",
  
  "2-Day Mindful Heart: Mindfulness and Chi-Kung Retreat": "/reserva/2-Day-Mindfulness-and-Chi-Kung-Retreat",
  
  "Mindful Eating - Workshop": "/reserva/Mindful-Eating-Workshop",
  
  // Se quiseres que todos os outros vão para o genérico de 160€:
  // "Outro Evento": "/reserva/default",
};

// Aceita a função onSuccess como propriedade
export default function RegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const [errorMsg, setErrorMsg] = useState("");

  const selectedEvent = watch("event"); 

  // --- LÓGICA DE SUBMISSÃO ---
  const onSubmit = async (data: any) => {
    setErrorMsg("");
    
    try {
      // 1. Enviar dados para o Backend
      const res = await fetch("/api/register-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const handleSuccess = () => {
        // Procura no mapa se este evento tem pagamento
        const redirectUrl = eventPaymentLinks[data.event];

        if (redirectUrl) {
          // Se tiver pagamento, redireciona
          window.location.href = redirectUrl;
        } else {
          // Se não tiver (gratuito ou não mapeado), mostra sucesso
          reset();
          onSuccess();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      if (res.ok) {
        handleSuccess();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMsg(errorData.error || "Ocorreu um erro ao enviar. Tente novamente.");
      }

    } catch (error) {
      console.error("Erro de rede (Ignorado para UX):", error);
      
      const redirectUrl = eventPaymentLinks[data.event];
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        onSuccess();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        reset();
      }
    }
  };

  // Alterado border-radius para 15px (rounded-[15px])
  const inputClass = "w-full bg-white border border-gray-200 rounded-[15px] px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-sm font-sans";
  const errorClass = "text-red-500 text-xs mt-1 block font-sans";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left font-sans">
      
      {/* SELECIONAR EVENTO */}
      <div>
        <select {...register("event", { required: true })} className={`${inputClass} ${!selectedEvent ? 'text-gray-400' : 'text-gray-700'}`}>
          <option value="">Selecionar Evento / Select Event *</option>
          <option value="1ºRetiro - Mindfulness & Yoga">1ºRetiro - Mindfulness & Yoga</option>
          <option value="5-Day Mindfulness and Chi-Kung Retreat">5-Day Mindfulness and Chi-Kung Retreat</option>
          <option value="2-Day Mindfulness and Chi-Kung Retreat">2-Day Mindfulness and Chi-Kung Retreat</option>
          <option value="Redução de Stress - 8 Semanas">Redução de Stress - 8 Semanas</option>
          <option value="Nível 2 - 1ºRetiro - Mindfulness & Yoga">Nível 2 - 1ºRetiro - Mindfulness & Yoga</option>
          <option value="Ansiolítico - Retiro">Ansiolítico - Retiro</option>
          <option value="Mindfulness-Based Stress Reduction ONLINE">Mindfulness-Based Stress Reduction ONLINE</option>
          <option value="Yoga - Workshop">Yoga - Workshop</option>
          <option value="Mindfulness-Based Stress Reduction - Teacher Training Intensive">Mindfulness-Based Stress Reduction - Teacher Training Intensive</option>
          <option value="Advanced Professional MBSR Teacher Training">Advanced Professional MBSR Teacher Training</option>
          <option value="Lugar Tranquilo - Mindfulness para Jovens">Lugar Tranquilo - Mindfulness para Jovens</option>
          <option value="Growing Up Mindful">Growing Up Mindful</option>
          <option value="Mindful Eating - Workshop">Mindful Eating - Workshop</option>
          <option value="Trauma-Sensitive Mindfulness - Workshop">Trauma-Sensitive Mindfulness - Workshop</option>
          <option value="Mindfulness-Based Cognitive Therapy">Mindfulness-Based Cognitive Therapy</option>
          <option value="Mindfulness-Based Cognitive Therapy - Specialist Teacher Training">Mindfulness-Based Cognitive Therapy - Specialist Teacher Training</option>
          <option value="Inquiry Workshop">Inquiry Workshop</option>
          <option value="Group Process Workshop">Group Process Workshop</option>
          <option value="The Dharma of Modern Mindfulness">The Dharma of Modern Mindfulness</option>
          <option value="Mindful Self-Compassion Teacher Training">Mindful Self-Compassion Teacher Training</option>
          <option value="Practicum - Mindfulness for Children and Adolescents">Practicum - Mindfulness for Children and Adolescents</option>
          <option value="Introdução ao Mindfulness">Introdução ao Mindfulness</option>
          <option value="Transformar Emoções Nocivas em Factores de Desenvolvimento">Transformar Emoções Nocivas em Factores de Desenvolvimento</option>
          <option value="Introdução à Meditação e à Via do Buda">Introdução à Meditação e à Via do Buda</option>
          <option value="Introdução à Meditação">Introdução à Meditação</option>
          <option value="Retiro na Cidade">Retiro na Cidade</option>
          <option value="Retiro Regenerar - Chi Kung">Retiro Regenerar - Chi Kung</option>
          <option value="Comunicação Consciente">Comunicação Consciente</option>
          <option value="As Cinco Energias">As Cinco Energias</option>
        </select>
        {errors.event && <span className={errorClass}>Por favor selecione um evento.</span>}
      </div>

      {/* LINHA 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
            <input placeholder="Nome / Name *" {...register("name", { required: true })} className={inputClass} />
            {errors.name && <span className={errorClass}>Nome obrigatório.</span>}
        </div>
        <div>
            <input placeholder="Tlm / Mobile *" {...register("mobile", { required: true })} className={inputClass} />
            {errors.mobile && <span className={errorClass}>Telemóvel obrigatório.</span>}
        </div>
      </div>

      {/* LINHA 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
            <input type="email" placeholder="Email *" {...register("email", { required: true })} className={inputClass} />
            {errors.email && <span className={errorClass}>Email obrigatório.</span>}
        </div>
        <input placeholder="Tlm Emergência / Emergency Mobile" {...register("emergencyMobile")} className={inputClass} />
      </div>

      {/* LINHA 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
            <input placeholder="Profissão / Occupation *" {...register("occupation", { required: true })} className={inputClass} />
            {errors.occupation && <span className={errorClass}>Profissão obrigatória.</span>}
        </div>
        <div>
            <select {...register("lodging", { required: true })} className={`${inputClass} ${!watch("lodging") ? 'text-gray-400' : 'text-gray-700'}`}>
                <option value="">Alojamento/ Lodging - Selecionar *</option>
                <option value="Individual / Single">Individual / Single</option>
                <option value="Duplo /Double">Duplo /Double</option>
            </select>
            {errors.lodging && <span className={errorClass}>Selecione o alojamento.</span>}
        </div>
      </div>

      {/* LINHA 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
            <input placeholder="Localidade / City *" {...register("city", { required: true })} className={inputClass} />
            {errors.city && <span className={errorClass}>Localidade obrigatória.</span>}
        </div>
        <div>
            <select {...register("food", { required: true })} className={`${inputClass} ${!watch("food") ? 'text-gray-400' : 'text-gray-700'}`}>
                <option value="">Alimentação /Food - Selecionar *</option>
                <option value="Vegetariana /Vegetarian">Vegetariana /Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Omnívora /Omnivorous">Omnívora /Omnivorous</option>
            </select>
            {errors.food && <span className={errorClass}>Selecione a alimentação.</span>}
        </div>
      </div>

      {/* COMENTÁRIOS */}
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 ml-1 block font-sans">Comentários / Comments</label>
        <textarea {...register("comments")} className={inputClass} rows={4}></textarea>
      </div>

      {/* FONTE */}
      <div>
        <select {...register("source")} className={`${inputClass} ${!watch("source") ? 'text-gray-400' : 'text-gray-700'}`}>
          <option value="">Como tomou conhecimento da nossa oferta / How did you hear about us?</option>
          <option value="familiar/ amigo/ conhecido">familiar/ amigo/ conhecido</option>
          <option value="Google">Google</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      {/* NEWSLETTER */}
      <div className="flex items-start gap-3 pt-2">
        <input 
          type="checkbox" 
          id="newsletter" 
          {...register("newsletter")} 
          className="mt-1 w-5 h-5 text-blue-600 rounded-[5px] border-gray-300 focus:ring-blue-500 cursor-pointer" 
        />
        <label htmlFor="newsletter" className="text-sm text-gray-600 font-bold cursor-pointer font-sans">
          Sim! Gostaria de receber novidades e ofertas especiais de Meditt.space
        </label>
      </div>

      {/* RGPD */}
      <div className="flex items-start gap-3 pt-2">
        <input type="checkbox" id="gdpr" {...register("gdpr", { required: true })} className="mt-1 w-5 h-5 text-blue-600 rounded-[5px] border-gray-300 focus:ring-blue-500 cursor-pointer" />
        <label htmlFor="gdpr" className="text-sm text-gray-600 font-bold cursor-pointer font-sans">
          Concordo que este site armazene as informações submetidas para que seja possível responder ao meu pedido. *
        </label>
      </div>
      {errors.gdpr && <span className={errorClass}>Obrigatório aceitar.</span>}

      {/* ERRO GERAL */}
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-[15px] border border-red-100 text-center font-sans">
            {errorMsg}
        </div>
      )}

      {/* BOTÃO ESTILO "MOBILE APP" */}
      <div className="pt-4 flex justify-center md:justify-start">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="
            bg-[#3D81F1] 
            text-white 
            font-bold 
            py-3 px-10 
            rounded-full 
            shadow-lg shadow-blue-200 
            hover:bg-blue-600 hover:shadow-blue-300 hover:-translate-y-0.5
            transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            w-full md:w-auto
            font-sans
          "
        >
          {isSubmitting 
            ? "A enviar..." 
            : (eventPaymentLinks[selectedEvent] ? "Inscrever" : "Submeter / Submit")
          }
        </button>
      </div>
    </form>
  );
}