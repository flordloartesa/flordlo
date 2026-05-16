
import SimpleMediaPlayer from "@/components/SimpleMediaPlayer"; 
import { getFreeMedia } from "@/app/actions/updateCustomer"; 

export default async function BibliotecaLivrePage() {
  const { success, media } = await getFreeMedia();

  return (
    <main className="min-h-screen bg-[#0A0B1E]">
      
      
      {/* Espaço para o cabeçalho não ficar colado à Navbar
      <div className="pt-24 pb-8 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-light text-white tracking-wide mb-2">
          Biblioteca <span className="font-bold text-[#2DD4BF]">Livre</span>
        </h1>
        <p className="text-white/60 font-light">
          Práticas abertas para te apoiarem no dia a dia.
        </p>
      </div>  */}

      {success && media && media.length > 0 ? (
        <SimpleMediaPlayer mediaItems={media} />
      ) : (
        <div className="text-center text-white/50 py-20">
          Ainda não existem faixas disponíveis nesta secção.
        </div>
      )}
    </main>
  );
}