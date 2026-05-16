// components/SiteImage.tsx
import Image, { ImageProps } from 'next/image';

// Aceita todas as propriedades de uma imagem normal do Next.js
interface SiteImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export default function SiteImage({ src, alt, ...props }: SiteImageProps) {
  if (!src) return null;

  // 🧹 LIMPEZA MÁGICA UNIVERSAL
  let highResSrc = src;
  
  // 1. Limpa parâmetros do Sanity
  if (highResSrc.includes('cdn.sanity.io')) {
    highResSrc = highResSrc.split('?')[0];
  }
  
  // 2. Limpa miniaturas do WordPress/WooCommerce
  highResSrc = highResSrc.replace(/-\d+x\d+(\.[a-zA-Z]+)(?:\?.*)?$/, '$1');

  // 3. O Truque Supremo do Tumblr
  if (highResSrc.includes('tumblr.com')) {
    highResSrc = highResSrc.replace(/\/s\d+x\d+\//, '/s2048x2048/');
  }

  return (
    <Image
      src={highResSrc}
      alt={alt || "Imagem do site"}
      quality={100}
      unoptimized={true}
      {...props} // 👈 Isto permite passar className, fill, width, height livremente!
    />
  );
}