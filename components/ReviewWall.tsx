import React, { useEffect, useRef, useMemo } from 'react';
import { Review } from '../types.ts';

interface ReviewWallProps {
  reviews: Review[];
  fullScreen?: boolean;
  singleReviewId?: string | null;
  onDeleteAll?: () => void;
}

const ReviewWall: React.FC<ReviewWallProps> = ({ reviews, fullScreen = false, singleReviewId = null, onDeleteAll }) => {
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
    <div className={`relative flex flex-col items-center w-full h-full overflow-hidden bg-black ${fullScreen ? 'p-0' : 'p-4'}`}>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
        <div className="absolute top-20 left-[10%] w-20 h-20 bg-white rotate-12"></div>
        <div className="absolute bottom-40 right-[15%] w-40 h-40 bg-white -rotate-6"></div>
      </div>

      {fullScreen && (
        <div className="relative z-20 w-full pt-6 pb-6 px-12 animate-fade-in flex-shrink-0 bg-black/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {onDeleteAll && !singleReviewId && (
              <button 
                onClick={onDeleteAll}
                className="mr-6 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all flex items-center gap-2 group"
                title="Admin: Delete All Reviews"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline">Clear Feed</span>
              </button>
            )}
            <div className="flex flex-col items-start">
              <h1 className="text-3xl font-[900] text-slate-100 tracking-tighter uppercase leading-none italic">
                {singleReviewId ? 'YOUR' : 'THE'} <span className="text-white">{singleReviewId ? 'REVIEW' : 'FEED'}</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">LIVE SYNC ACTIVE</p>
              </div>
            </div>
          </div>

          {!singleReviewId && reviews.length > 0 && (
            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 opacity-60">AVG VISITOR</p>
                <p className="text-[11px] font-black text-white uppercase tracking-tighter leading-none">RATING</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-3xl font-black">{averageRating}</span>
                <span className="text-white text-2xl">★</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div 
        ref={scrollContainerRef}
        className={`w-full flex-1 overflow-y-auto no-scrollbar z-10 pt-12 px-10 ${singleReviewId ? 'flex items-center justify-center' : ''}`}
      >
        {displayReviews.length > 0 ? (
          <div className={`${singleReviewId ? 'max-w-md w-full' : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-12 max-w-[1800px]'} mx-auto pb-96`}>
            {displayReviews.map((review, index) => {
              const overallRating = typeof review.ratings === 'object' ? review.ratings.overall : (review as any).rating || 5;

              return (
              <div 
                key={`${review.id}-${index}`} 
                className={`break-inside-avoid mb-12 group relative bg-slate-900/40 backdrop-blur-md rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden flex flex-col transition-all hover:scale-[1.02] animate-fade-in-up`}
                style={{ 
                  animationDelay: `${(index % 8) * 100}ms`,
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-950">
                  <img 
                    src={review.photo} 
                    alt={review.name} 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-[6000ms] group-hover:scale-110"
                  />
                  <div className="absolute top-5 left-5 bg-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border-2 border-black">
                    <span className="text-black text-sm leading-none font-black">★ {overallRating}.0</span>
                  </div>
                </div>

                <div className="p-10">
                  <div className="w-4 h-1 bg-white rounded-full mb-6"></div>
                  <p className="text-white text-xl leading-[1.6] font-medium tracking-tight mb-10 italic">
                    "{review.comment || 'Amazing experience at the expo!'}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-100 text-lg uppercase tracking-tighter truncate">{review.name}</h4>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">VISITOR FEEDBACK</p>
                    </div>
                    <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="w-20 h-20 bg-slate-900 rounded-[30px] shadow-2xl flex items-center justify-center mb-8 border border-white/5 animate-pulse">
               <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.6em]">
              WAITING FOR UPDATES
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewWall;