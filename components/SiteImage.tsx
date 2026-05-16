export default function SiteImage({ src, alt, className, style, ...props }: any) {
  if (!src) return null;

  // Zero truques. Zero alterações ao teu link. O que tu colas é o que aparece.
  return (
    <img
      src={src}
      alt={alt || "Imagem"}
      className={`object-cover ${className || ''}`}
      style={style}
      {...props}
    />
  );
}