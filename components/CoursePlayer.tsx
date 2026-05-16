"use client";

import { useRef, useState } from "react";
// Assumindo que usas o react-player. Se não tiveres: npm install react-player
import ReactPlayer from "react-player"; 

interface CoursePlayerProps {
  courseId: string;
  trackId: string;
  mediaUrl: string; // O link do áudio/vídeo que vem do Sanity
}

export default function CoursePlayer({ courseId, trackId, mediaUrl }: CoursePlayerProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Usamos um useRef para memorizar a última vez que guardámos na BD
  const lastSavedTime = useRef(0);

  // Função que fala com a nossa API do MongoDB
  const saveProgressToDB = async (timeWatched: number, isCompleted: boolean) => {
    setIsSaving(true);
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          trackId,
          timeWatched: Math.floor(timeWatched), // Arredondar os segundos
          isCompleted
        })
      });
      console.log(`Progresso guardado: ${Math.floor(timeWatched)}s`);
    } catch (error) {
      console.error("Erro ao guardar progresso", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Dispara sempre que o áudio avança
  const handleProgress = (state: { playedSeconds: number }) => {
    const currentTime = state.playedSeconds;

    // Se a diferença entre o tempo atual e a última vez que guardámos for maior que 10 segundos...
    if (currentTime - lastSavedTime.current >= 10) {
      saveProgressToDB(currentTime, false);
      lastSavedTime.current = currentTime; // Atualiza a memória
    }
  };

  // Dispara quando a faixa chega ao fim
  const handleEnded = () => {
    // Pegamos no tempo final e marcamos como completo (true)
    saveProgressToDB(lastSavedTime.current, true);
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <ReactPlayer
        url={mediaUrl}
        controls={true}
        width="100%"
        height="50px" // Altura pequena para parecer um player de áudio
        onProgress={handleProgress}
        onEnded={handleEnded}
        // onPause={() => saveProgressToDB(lastSavedTime.current, false)} // Opcional: Guardar ao pausar
      />
      
      {/* Um pequeno feedback visual (opcional) */}
      {isSaving && (
        <span className="text-xs text-green-500 mt-2 inline-block animate-pulse">
          A sincronizar progresso...
        </span>
      )}
    </div>
  );
}