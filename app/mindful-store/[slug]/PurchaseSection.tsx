"use client";


import { useCart } from "@/app/context/CartContext";
import Link from '@/components/MyLink';

export default function PurchaseSection({ course, slug }: { course: any, slug: string }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Garante que passamos os dados no formato que o teu CartContext espera
    addToCart({
      _id: course._id,
      title: course.title,
      price: course.price,
      slug: slug,
      imageUrl: course.image 
    });
  };

  // Se o utilizador já tem acesso, o botão muda para "Continuar a Praticar"
  if (course.hasAccess) {
    return (
      <Link 
        href={`/cursos/${slug}`}
        className="bg-[#37374B] text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-black transition-all text-center flex-1 cursor-pointer"
      >
        Continuar a Praticar
      </Link>
    );
  }

  return (
    <button 
      onClick={handleAddToCart}
      className="bg-[#3D81F1] text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-[0_20px_50px_rgba(61,129,241,0.3)] hover:scale-105 transition-all text-center cursor-pointer flex-1"
    >
      Quero começar agora — {course.price}€
    </button>
  );
}