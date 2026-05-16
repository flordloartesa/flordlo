"use client";

import { useEffect, useState, useCallback } from "react";
import { client } from "@/app/sanity/client";
import { urlFor } from "@/app/sanity/imageBuilder";
import CourseReviewForm from "./CourseReviewForm";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  userImage?: any;
  courseName?: string;
}

interface SlideshowProps {
  courseId?: string;
  productId?: string;
  retreatId?: string;
  eventId?: string;
  practiceId?: string;
}

export default function ReviewSlideshow({ 
  courseId, 
  productId, 
  retreatId, 
  eventId, 
  practiceId 
}: SlideshowProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

// A lógica excludente: Garante que o ID vai para a gaveta certa
  const getReferenceInfo = () => {
    if (courseId && courseId.length > 5) return { id: courseId, field: "course" };
    if (productId && productId.length > 5) return { id: productId, field: "physicalProduct" };
    if (eventId && eventId.length > 5) return { id: eventId, field: "eventos" };
    if (practiceId && practiceId.length > 5) return { id: practiceId, field: "practice" };
    if (retreatId && retreatId.length > 5) return { id: retreatId, field: "retreat" };
    
    return { id: "", field: "" }; // Fallback de segurança
  };

  const { id: targetId, field: referenceField } = getReferenceInfo();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!targetId) return;

      // ✅ FILTRO DE APROVAÇÃO ADICIONADO
      const filter = `&& references("${targetId}") && approved == true`;
      
      const query = `*[_type == "review" ${filter}] | order(_createdAt desc) {
        _id, userName, rating, comment, userImage, 
        "courseName": coalesce(
          course->title, 
          physicalProduct->title, 
          retreat->title, 
          eventos->title, 
          practice->title
        )
      }`;
      
      const data = await client.fetch(query, {}, { cache: 'no-store' });
      setReviews(data);
    };
    fetchReviews();
  }, [targetId]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 >= reviews.length ? 0 : prev + 1));
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [handleNext, reviews.length, isPaused]);

  if (reviews.length === 0 && !targetId) return null;

  const getVisibleReviews = () => {
    if (reviews.length === 0) return [];
    if (reviews.length === 1) return reviews;
    const items = [];
    for (let i = 0; i < 2; i++) {
      items.push(reviews[(currentIndex + i) % reviews.length]);
    }
    return items;
  };

  return (
    <section 
      className="py-8 bg-transparent font-roboto-condensed relative z-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="max-w-5xl mx-auto">
        
        {/* --- SLIDESHOW SECTION --- */}
        {reviews.length > 0 && (
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full transition-all duration-500">
              {getVisibleReviews().map((review, idx) => (
                <div 
                  key={`${review._id}-${idx}`} 
                  className={`
                    bg-white border border-slate-100 p-6 md:p-10 rounded-[30px] shadow-sm 
                    text-center flex flex-col items-center h-[380px] animate-in fade-in duration-700
                    ${idx === 1 ? 'hidden md:flex' : 'flex'} 
                  `}
                >
                  <div className="mb-4">
                    {review.userImage ? (
                      <img
                        src={urlFor(review.userImage).width(120).height(120).url()}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        alt={review.userName}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {review.userName?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 mb-4 text-yellow-400 text-[10px]">
                    {"★".repeat(review.rating || 5)}{"☆".repeat(5 - (review.rating || 5))}
                  </div>

                  <div className="mt-4 text-slate-600 leading-relaxed italic flex-grow w-full text-center">
                    <div className="max-h-[120px] md:max-h-[150px] overflow-y-auto pr-2 custom-scrollbar text-[12px]">
                      "{review.comment}"
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-50 w-full">
                    <span className="block font-bold text-slate-800 uppercase tracking-[2px] text-[10px]">
                      {review.userName}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {reviews.length > 1 && (
              <div className="flex justify-center gap-3 mt-10">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIndex(i);
                      setIsPaused(true);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === currentIndex ? "w-10 bg-indigo-600" : "w-2 bg-indigo-100"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- FORMULÁRIO DE REVIEW --- */}
        <div className="mt-12 border-t border-slate-100 pt-10" onMouseEnter={(e) => e.stopPropagation()}>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-center text-[11px] uppercase tracking-[4px] font-black text-slate-400 mb-8">
              Já participaste? Deixa a tua opinião!
            </h3>
            <div className="bg-slate-50/50 border border-slate-100 rounded-[40px] p-6 md:p-12">
               <CourseReviewForm courseId={targetId} referenceField={referenceField} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}