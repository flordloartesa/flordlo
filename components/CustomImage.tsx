'use client'; // Obrigatório porque vamos usar o "useState" para saber se a imagem carregou

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface CustomImageProps extends ImageProps {
  hasBlueGradient?: boolean;
  containerClassName?: string; // Caso precises de passar margens ou classes para a div pai
}

export function CustomImage({ 
  src, 
  alt, 
  hasBlueGradient = false, 
  className,
  containerClassName,
  ...props 
}: CustomImageProps) {
  // Estado que controla se a imagem já terminou de carregar
  const [isLoading, setIsLoading] = useState(true);

  return (
    // O contentor tem a cor de fundo (o teu gradiente azul).
    // Quando a imagem está com opacity-0, é este fundo que o utilizador vê.
    <div 
      className={`relative w-full h-full overflow-hidden transition-colors duration-700 ${
        isLoading 
          ? (hasBlueGradient ? "bg-gradient-to-br from-blue-400 to-blue-700" : "bg-slate-200") 
          : "bg-transparent" // <--- A MAGIA ESTÁ AQUI: Fica transparente mal a imagem carrega!
      } ${containerClassName || ""}`}
    >
      <Image
        src={src}
        alt={alt}
        {...props}
        // Quando a imagem carrega, chamamos a função que muda o estado
        onLoad={() => setIsLoading(false)}
        className={`
          object-cover 
          transition-all duration-700 ease-in-out
          ${
            isLoading 
              ? "scale-110 blur-xl opacity-0" // Estado inicial: Ampliada, com blur e invisível
              : "scale-100 blur-0 opacity-100" // Estado final: Tamanho normal, nítida e visível
          }
          ${className || ""}
        `}
      />
    </div>
  );
}