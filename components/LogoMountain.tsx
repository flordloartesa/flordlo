// components/LogoM.jsx
import React from 'react';

export default function LogoM() {
  return (
    <div className="flex items-center justify-center p-4">
      <div 
      className="flex items-center justify-center shadow-sm"
      style={{
        width: '40px',       
        height: '30px',      
        // O truque está aqui!
        // Ao usarmos a barra (/), definimos o eixo horizontal e vertical separadamente.
        // Isto faz com que os cantos superiores tenham uma curva mais longa, "apertando" o topo.
        borderRadius: '50% 50% 50% 50% / 45% 45% 65% 65%', 
        background: 'linear-gradient(135deg, #4bc2fe 0%, #4b2dbb 100%)',
        transform: 'skewX(-20deg)', 
      }}
    >
        {/* Este SVG é uma réplica do traço 'M' da tua imagem */}
       <svg
  viewBox="0 0 100 100"
  style={{
    width: '80%', 
    height: '80%',
    transform: 'rotate(-5deg) skewX(-5deg)', 
  }}
>
  <path
    d="M 5 65 
       C 10 50, 42 35, 50 40 
       C 66 44, 55 58, 63 58 
       C 71 58, 76 46, 84 48 
       C 95 50, 94 68, 92 60"
    fill="none"
    stroke="white"
    strokeWidth="9"
    strokeLinecap="round" 
    strokeLinejoin="round" 
  />
</svg>

      </div>
    </div>
  );
}