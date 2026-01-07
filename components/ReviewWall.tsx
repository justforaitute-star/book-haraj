
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
    // Only auto-scroll if we are in general wall mode and have enough items
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
      
      {/* Signature Squares Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 left-[10%] w-20 h-20 bg-[#ffb83d] rotate-12"></div>
        <div className="absolute bottom-40 right-[15%] w-40 h-40 bg-[#ffb83d] -rotate-6"></div>
      </div>

      {/* Header Branding - Ultra Compact */}
      {fullScreen && (
        <div className="relative z-20 w-full pt-4 pb-4 px-12 animate-fade-in flex-shrink-0 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-start">
              <div className="flex gap-1.5 mb-1">
                 <div className="w-2 h-2 bg-[#ffb83d] rounded-[1px]"></div>
                 <div className="w-2 h-2 bg-slate-700 rounded-[1px]"></div>
              </div>
              <h1 className="text-2xl md:text-3xl font-[900] text-slate-100 tracking-tighter uppercase leading-none">
                {singleReviewId ? 'YOUR' : 'THE'} <span className="text-[#ffb83d]">{singleReviewId ? 'REVIEW' : 'FEED'}</span>
              </h1>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-[1px] bg-[#ffb83d] animate-pulse"></span>
               <p className="text-[8px] font-[800] text-slate-400 uppercase tracking-[0.3em]">
                 {singleReviewId ? 'PERSONAL SPOTLIGHT' : 'Book Haraj 3.0 Live'}
               </p>
            </div>
          </div>

          {/* Overall Average Rating Badge */}
          {!singleReviewId && reviews.length > 0 && (
            <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Overall</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tighter leading-none">Rating</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ffb83d] text-2xl font-black">{averageRating}</span>
                <span className="text-[#ffb83d] text-xl">★</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid Container */}
      <div 
        ref={scrollContainerRef}
        className={`w-full flex-1 overflow-y-auto no-scrollbar z-10 pt-8 px-10 ${singleReviewId ? 'flex items-center justify-center' : ''}`}
      >
        {displayReviews.length > 0 ? (
          <div className={`${singleReviewId ? 'max-w-md w-full' : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-12 max-w-[1800px]'} mx-auto pb-96`}>
            {displayReviews.map((review, index) => {
              const overallRating = typeof review.ratings === 'object' ? review.ratings.overall : (review as any).rating || 5;

              return (
              <div 
                key={`${review.id}-${index}`} 
                className={`break-inside-avoid mb-12 group relative bg-slate-900/40 backdrop-blur-md rounded-[24px] shadow-2xl border border-white/5 overflow-hidden flex flex-col transition-all hover:scale-[1.02] animate-fade-in-up`}
                style={{ 
                  animationDelay: `${(index % 8) * 100}ms`,
                  animation: singleReviewId ? 'none' : `float ${6 + (index % 4)}s ease-in-out infinite alternate`,
                }}
              >
                {/* Visual Section */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-800">
                  <img 
                    src={review.photo} 
                    alt={review.name} 
                    className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110 opacity-80"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-6 left-6 bg-[#ffb83d] px-4 py-2 rounded-[8px] shadow-2xl flex items-center gap-2 border border-[#ffb83d]">
                    <span className="text-slate-900 text-lg leading-none">★</span>
                    <span className="font-black text-slate-900 text-sm tracking-tighter">{overallRating}.0</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-10">
                  <div className="w-6 h-6 bg-[#ffb83d]/10 rounded-[4px] flex items-center justify-center mb-6">
                     <div className="w-1.5 h-1.5 bg-[#ffb83d] rounded-[1px]"></div>
                  </div>
                  <p className="text-slate-100 text-xl leading-[1.6] font-semibold italic serif opacity-100 mb-8">
                    "{review.comment}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="min-w-0">
                      <h4 className="font-[900] text-slate-100 text-lg uppercase tracking-tight truncate">{review.name}</h4>
                      <p className="text-[10px] font-black text-[#ffb83d] uppercase tracking-widest mt-1">Guest Reviewer</p>
                    </div>
                    <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-[12px] flex items-center justify-center border border-white/5 group-hover:bg-[#ffb83d]/10 group-hover:border-[#ffb83d]/20 transition-all">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-[#ffb83d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-slate-900 rounded-[20px] shadow-inner flex items-center justify-center mb-8 border border-white/5 animate-pulse">
               <div className="w-8 h-8 bg-[#ffb83d] rounded-[4px]"></div>
            </div>
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">
              {singleReviewId ? 'REVIEW NOT FOUND' : 'THE WALL IS EMPTY'}
            </h3>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.4em] mt-4">
              {singleReviewId ? 'MAY HAVE BEEN REMOVED' : 'BE THE FIRST TO POST 3.0'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-25px) rotate(1deg); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ReviewWall;
