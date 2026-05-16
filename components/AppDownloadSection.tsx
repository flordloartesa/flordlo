export default function AppDownloadSection() {
  return (
    <section className="bg-[#F2F4F4] py-20 px-6 mt-20 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Texto e Botões */}
        <div className="flex-1 max-w-lg z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#37374B] mb-4">
            Download the App
          </h2>
          <p className="text-[#737373] text-lg leading-relaxed mb-8">
            Every day you will receive a short guided practice by Melli or Cory followed by a meditation to help you deal with anxiety and overwhelm.
          </p>
          
          <button className="bg-white text-[#37374B] border border-gray-200 px-8 py-3 rounded-full font-bold shadow-sm hover:bg-gray-50 transition mb-6">
            Download Now
          </button>
          
          <div className="flex items-center gap-4 text-[#737373] text-sm font-medium">
            <span>Available on</span>
            {/* Ícones App Store / Play Store (Simulados com SVG simples) */}
            <div className="flex gap-3">
              <span className="cursor-pointer hover:text-black"> Apple Store</span>
              <span className="cursor-pointer hover:text-black">▶ Google Play</span>
            </div>
          </div>
        </div>

        {/* Imagem do Telemóvel (Mockup) */}
        <div className="flex-1 flex justify-center relative">
           {/* Círculo decorativo atrás */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white rounded-full blur-3xl opacity-50"></div>
           
           {/* Imagem do telemóvel retirada do teu HTML/Screenshots */}
           <img 
             src="https://media.prod.mindfulness.com/2f7e0f1faa361460ee8ce7e06c8eb30c0fdcb1a7-1242x933-jpg" 
             alt="App Mockup" 
             className="relative z-10 w-[280px] md:w-[320px] drop-shadow-2xl"
           />
        </div>
      </div>
    </section>
  );
}