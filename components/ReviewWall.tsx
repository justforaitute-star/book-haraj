
import React, { useEffect, useRef } from 'react';
import { Review } from '../types.ts';

interface ReviewWallProps {
  reviews: Review[];
  fullScreen?: boolean;
}

const ReviewWall: React.FC<ReviewWallProps> = ({ reviews, fullScreen = false }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    if (!fullScreen || reviews.length < 3) return;

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
  }, [fullScreen, reviews.length]);

  const displayReviews = reviews.length > 5 ? [...reviews, ...reviews.slice(0, 4)] : reviews;

  return (
    <div className={`relative flex flex-col items-center w-full h-full overflow-hidden bg-[#020617] ${fullScreen ? 'p-0' : 'p-4'}`}>
      
      {/* Signature Squares Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 left-[10%] w-20 h-20 bg-[#ffb83d] rotate-12"></div>
        <div className="absolute bottom-40 right-[15%] w-40 h-40 bg-[#ffb83d] -rotate-6"></div>
      </div>

      {/* Header Branding */}
      {fullScreen && (
        <div className="relative z-20 w-full pt-16 pb-12 text-center animate-fade-in flex-shrink-0 bg-[#020617]/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex flex-col items-center">
            <div className="flex gap-2 mb-4">
               <div className="w-4 h-4 bg-[#ffb83d] rounded-[2px]"></div>
               <div className="w-4 h-4 bg-slate-700 rounded-[2px]"></div>
            </div>
            <h1 className="text-6xl md:text-7xl font-[900] text-slate-100 tracking-tighter uppercase">
              THE <span className="text-[#ffb83d]">FEED</span>
            </h1>
            <div className="mt-4 px-8 py-2 bg-white rounded-[4px] flex items-center gap-3">
               <span className="w-2 h-2 rounded-[1px] bg-[#ffb83d] animate-pulse"></span>
               <p className="text-[11px] font-[800] text-slate-900 uppercase tracking-[0.4em]">Book Haraj 3.0 Live</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Container */}
      <div 
        ref={scrollContainerRef}
        className="w-full flex-1 overflow-y-auto no-scrollbar z-10 pt-16 px-10"
      >
        {reviews.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-12 max-w-[1800px] mx-auto pb-96">
            {displayReviews.map((review, index) => {
              // Safety check for legacy single rating vs new detailed ratings
              const overallRating = typeof review.ratings === 'object' ? review.ratings.overall : (review as any).rating || 5;

              return (
              <div 
                key={`${review.id}-${index}`} 
                className="break-inside-avoid mb-12 group relative bg-slate-900/40 backdrop-blur-md rounded-[24px] shadow-2xl border border-white/5 overflow-hidden flex flex-col transition-all hover:scale-[1.02] animate-fade-in-up"
                style={{ 
                  animationDelay: `${(index % 8) * 100}ms`,
                  animation: `float ${6 + (index % 4)}s ease-in-out infinite alternate`,
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
                  <p className="text-slate-200 text-xl leading-[1.6] font-semibold italic serif opacity-90 mb-8">
                    "{review.comment}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="min-w-0">
                      <h4 className="font-[900] text-slate-100 text-lg uppercase tracking-tight truncate">{review.name}</h4>
                      <p className="text-[10px] font-black text-[#ffb83d] uppercase tracking-widest mt-1">Guest Reviewer</p>
                    </div>
                    <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-[12px] flex items-center justify-center border border-white/5 group-hover:bg-[#ffb83d]/10 group-hover:border-[#ffb83d]/20 transition-all">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-[#ffb83d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <h3 className="text-2xl font-black text-slate-700 uppercase tracking-tighter">THE WALL IS EMPTY</h3>
            <p className="text-slate-800 text-xs font-bold uppercase tracking-[0.4em] mt-4">BE THE FIRST TO POST 3.0</p>
          </div>
        )}
      </div>

      {/* Sticky Action Footer */}
      {fullScreen && (
        <div className="relative z-50 w-full pt-12 pb-14 bg-[#020617] flex flex-col items-center border-t border-white/5">
          <div className="flex flex-col items-center gap-6">
             <div className="px-16 py-7 bg-white text-slate-900 rounded-[16px] text-2xl font-[900] shadow-[0_40px_80px_-20px_rgba(255,184,61,0.2)] flex items-center gap-8 group cursor-default uppercase tracking-tight">
                JOIN THE WALL
                <div className="w-12 h-12 bg-[#ffb83d] rounded-[4px] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 19l-7-7 7-7m5 14l-7-7 7-7" className="rotate-[270deg] origin-center" />
                  </svg>
                </div>
             </div>
             <p className="text-[12px] font-[800] text-slate-600 uppercase tracking-[0.8em]">SCAN TO GIVE & GRAB</p>
          </div>
        </div>
      )}

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
