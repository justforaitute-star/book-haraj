
import React, { useEffect, useRef, useMemo } from 'react';
import { Review } from '../types.ts';

interface ReviewWallProps {
  reviews: Review[];
  fullScreen?: boolean;
  singleReviewId?: string | null;
}

const ReviewWall: React.FC<ReviewWallProps> = ({ reviews, fullScreen = false, singleReviewId = null }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => {
      const val = typeof r.ratings === 'object' ? r.ratings.overall : (r as any).rating || 5;
      return acc + val;
    }, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (singleReviewId) {
      return reviews.filter(r => r.id === singleReviewId);
    }
    return reviews;
  }, [reviews, singleReviewId]);

  useEffect(() => {
    if (!fullScreen || filteredReviews.length < 3 || singleReviewId) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const animate = () => {
      if (!scrollContainer) return;

      scrollPosRef.current += 0.45;
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

      if (scrollPosRef.current >= maxScroll) {
        scrollPosRef.current = 0;
      }

      scrollContainer.scrollTop = scrollPosRef.current;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [fullScreen, filteredReviews.length, singleReviewId]);

  const displayReviews = useMemo(() => {
    if (singleReviewId) return filteredReviews;
    return filteredReviews.length > 5 ? [...filteredReviews, ...filteredReviews.slice(0, 4)] : filteredReviews;
  }, [filteredReviews, singleReviewId]);

  return (
    <div className={`relative flex flex-col items-center w-full h-full overflow-hidden bg-[#020617] ${fullScreen ? 'p-0' : 'p-4'}`}>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 left-[10%] w-20 h-20 bg-[#ffb83d] rotate-12"></div>
        <div className="absolute bottom-40 right-[15%] w-40 h-40 bg-[#ffb83d] -rotate-6"></div>
      </div>

      {fullScreen && (
        <div className="relative z-20 w-full pt-4 pb-4 px-6 md:px-12 animate-fade-in flex-shrink-0 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex flex-col items-start">
              <div className="flex gap-1 mb-1">
                 <div className="w-1.5 h-1.5 bg-[#ffb83d] rounded-sm"></div>
                 <div className="w-1.5 h-1.5 bg-slate-700 rounded-sm"></div>
              </div>
              <h1 className="text-xl md:text-3xl font-[800] text-slate-100 tracking-tight uppercase leading-none">
                {singleReviewId ? 'YOUR' : 'THE'} <span className="text-[#ffb83d]">{singleReviewId ? 'REVIEW' : 'FEED'}</span>
              </h1>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
            <div className="items-center gap-2 hidden md:flex">
               <span className="w-1.5 h-1.5 rounded-full bg-[#ffb83d] animate-pulse"></span>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 {singleReviewId ? 'PERSONAL SPOTLIGHT' : 'Book Haraj 3.0 Live'}
               </p>
            </div>
          </div>

          {!singleReviewId && reviews.length > 0 && (
            <div className="flex items-center gap-3 bg-white/5 px-4 md:px-6 py-2 rounded-xl border border-white/10 shadow-lg">
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">OVERALL</p>
                <p className="text-[10px] font-bold text-white uppercase tracking-tight leading-none">RATING</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#ffb83d] text-xl md:text-2xl font-black">{averageRating}</span>
                <span className="text-[#ffb83d] text-lg">★</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div 
        ref={scrollContainerRef}
        className={`w-full flex-1 overflow-y-auto no-scrollbar z-10 pt-8 px-6 md:px-10 ${singleReviewId ? 'flex items-center justify-center' : ''}`}
      >
        {displayReviews.length > 0 ? (
          <div className={`${singleReviewId ? 'max-w-md w-full' : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 md:gap-12 max-w-[1800px]'} mx-auto pb-96`}>
            {displayReviews.map((review, index) => {
              const overallRating = typeof review.ratings === 'object' ? review.ratings.overall : (review as any).rating || 5;

              return (
              <div 
                key={`${review.id}-${index}`} 
                className={`break-inside-avoid mb-8 md:mb-12 group relative bg-slate-900/40 backdrop-blur-md rounded-[24px] shadow-2xl border border-white/5 overflow-hidden flex flex-col transition-all hover:scale-[1.01] animate-fade-in-up`}
                style={{ 
                  animationDelay: `${(index % 8) * 80}ms`,
                  animation: singleReviewId ? 'none' : `float ${8 + (index % 4)}s ease-in-out infinite alternate`,
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-800">
                  <img 
                    src={review.photo} 
                    alt={review.name} 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-[4000ms] group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-[#ffb83d] px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 border border-[#ffb83d]">
                    <span className="text-slate-900 text-sm leading-none">★</span>
                    <span className="font-bold text-slate-900 text-sm">{overallRating}.0</span>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <div className="w-1.5 h-1.5 bg-[#ffb83d] rounded-sm mb-6"></div>
                  <p className="text-white text-lg md:text-xl leading-[1.6] font-medium tracking-tight mb-8">
                    "{review.comment || 'Amazing experience at the expo!'}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-200 text-base md:text-lg uppercase tracking-tight truncate">{review.name}</h4>
                      <p className="text-[10px] font-bold text-[#ffb83d]/70 uppercase tracking-widest mt-1">Visitor</p>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl shadow-inner flex items-center justify-center mb-8 border border-white/5">
               <div className="w-4 h-4 bg-[#ffb83d] rounded-sm animate-pulse"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">
              {singleReviewId ? 'REVIEW NOT FOUND' : 'THE WALL IS EMPTY'}
            </h3>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-15px); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ReviewWall;
