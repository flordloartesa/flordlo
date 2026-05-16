"use client";

import { useState } from "react";

interface AvatarProps {
  name?: string | null;
  image?: string | null;
}

export default function Avatar({ name, image }: AvatarProps) {
  // Estado para controlar se a imagem falhou ao carregar
  const [imageError, setImageError] = useState(false);

  // Função para extrair a 1ª letra do primeiro e último nome
  const getInitials = (fullName?: string | null) => {
    if (!fullName) return "U"; // "U" de Utilizador se não houver nome

    const parts = fullName.trim().split(" ");
    
    // Se só tiver um nome (ex: "Vítor"), devolve só a 1ª letra
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    // Se tiver vários nomes, pega na 1ª letra da 1ª palavra e 1ª letra da última palavra
    const firstLetter = parts[0].charAt(0);
    const lastLetter = parts[parts.length - 1].charAt(0);
    
    return (firstLetter + lastLetter).toUpperCase();
  };

  // Se existir um URL de imagem e ainda não tiver dado erro, tenta mostrar a imagem
  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={`Avatar de ${name || "Utilizador"}`}
        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
        // Se a imagem estiver quebrada (link falhar), muda o estado para mostrar as iniciais
        onError={() => setImageError(true)} 
      />
    );
  }

  // FALLBACK: O Círculo com as Iniciais
  return (
    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm border border-gray-200 shadow-sm">
      {getInitials(name)}
    </div>
  );
}