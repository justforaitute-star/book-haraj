import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Review } from '../types.ts';

interface ReviewWallProps {
  reviews: Review[];
  fullScreen?: boolean;
  singleReviewId?: string | null;
  onDeleteAll?: () => void;
  onExit?: () => void;
}

const ReviewWall: React.FC<ReviewWallProps> = ({ reviews, fullScreen = false, singleReviewId = null, onDeleteAll, onExit }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cross-browser Fullscreen Toggle with support for kiosk devices
  const toggleFullscreen = () => {
    const doc = document.documentElement as any;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (doc.requestFullscreen) doc.requestFullscreen().catch(() => {});
      else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
      else if (doc.mozRequestFullScreen) doc.mozRequestFullScreen();
      else if (doc.msRequestFullscreen) doc.msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      const exit = document as any;
      if (exit.exitFullscreen) exit.exitFullscreen().catch(() => {});
      else if (exit.webkitExitFullscreen) exit.webkitExitFullscreen();
      else if (exit.mozCancelFullScreen) exit.mozCancelFullScreen();
      else if (exit.msExitFullscreen) exit.msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

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
      if (scrollPosRef.current >= maxScroll) scrollPosRef.current = 0;
      scrollContainer.scrollTop = scrollPosRef.current;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [fullScreen, filteredReviews.length, singleReviewId]);

  const displayReviews = useMemo(() => {
    if (singleReviewId) return filteredReviews;
    return filteredReviews.length > 5 ? [...filteredReviews, ...filteredReviews.slice(0, 4)] : filteredReviews;
  }, [filteredReviews, singleReviewId]);

  return (
    <div className={`relative flex flex-col items-center w-full h-full overflow-hidden bg-black ${fullScreen ? 'p-0' : 'p-4'}`}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 left-[10%] w-64 h-64 border border-white rounded-full"></div>
        <div className="absolute bottom-40 right-[15%] w-80 h-80 border border-white/50 -rotate-12"></div>
      </div>

      {fullScreen && (
        <div className="relative z-30 w-full pt-6 pb-6 px-6 md:px-12 animate-fade-in flex-shrink-0 bg-black/95 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-6">
            {onDeleteAll && !singleReviewId && (
              <button 
                onClick={onDeleteAll}
                className="p-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl border border-red-500/10 transition-all"
                title="Admin: Clear Feed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <div className="flex flex-col items-start">
              <h1 className="text-xl md:text-3xl font-[900] text-slate-100 tracking-tighter uppercase leading-none italic">
                {singleReviewId ? 'YOUR' : 'THE'} <span className="text-white">{singleReviewId ? 'REVIEW' : 'FEED'}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1 md:mt-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                 <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">EXPO TESTIMONIALS</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!singleReviewId && reviews.length > 0 && (
              <div className="hidden sm:flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-2xl mr-2">
                <div className="text-right border-r border-white/10 pr-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">VISITOR AVG</p>
                  <p className="text-[11px] font-black text-white uppercase tracking-tighter leading-none">RATING</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-3xl font-black">{averageRating}</span>
                  <span className="text-white text-2xl">★</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={toggleFullscreen}
              className="w-10 h-10 md:w-14 md:h-14 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl hover:bg-slate-800 transition-all border border-white/10 active:scale-90"
              title="Toggle Fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                )}
              </svg>
            </button>

            {onExit && (
              <button 
                onClick={onExit}
                className="px-4 py-2 md:px-6 md:py-4 bg-white text-black rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform border border-white/10"
              >
                EXIT
              </button>
            )}
          </div>
        </div>
      )}

      <div 
        ref={scrollContainerRef}
        className={`w-full flex-1 overflow-y-auto no-scrollbar z-10 pt-8 md:pt-12 px-6 md:px-10 ${singleReviewId ? 'flex items-center justify-center' : ''}`}
      >
        {displayReviews.length > 0 ? (
          <div className={`${singleReviewId ? 'max-w-md w-full' : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 md:gap-8 max-w-[1800px]'} mx-auto pb-96`}>
            {displayReviews.map((review, index) => {
              const overallRating = typeof review.ratings === 'object' ? review.ratings.overall : (review as any).rating || 5;

              return (
              <div 
                key={`${review.id}-${index}`} 
                className={`break-inside-avoid mb-6 md:mb-8 group relative bg-white/[0.03] backdrop-blur-md rounded-[24px] md:rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden flex flex-col transition-all hover:bg-white/[0.05] animate-fade-in-up`}
                style={{ animationDelay: `${(index % 8) * 100}ms` }}
              >
                <div className="p-8 md:p-10 relative">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex gap-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-base md:text-lg ${i < overallRating ? 'opacity-100' : 'opacity-20 text-white'}`}>★</span>
                      ))}
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                      <span className="text-white/40 text-[8px] md:text-[9px] font-black uppercase tracking-widest">{new Date(review.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <svg className="absolute -top-4 -left-4 h-10 w-10 md:h-12 md:w-12 text-white opacity-[0.05]" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H7c0-1.7 1.3-3 3-3V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-7c0-1.7 1.3-3 3-3V8z" />
                    </svg>
                    <p className="text-white/90 text-xl md:text-2xl leading-[1.6] font-light tracking-tight mb-8 md:mb-10 italic relative z-10">
                      "{review.comment || 'An unforgettable journey through the world of books at the Haraj expo.'}"
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-white/5">
                    <div className="min-w-0">
                      <h4 className="font-black text-white text-base md:text-lg uppercase tracking-tighter truncate">{review.name}</h4>
                      <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1">VISITOR REVIEW</p>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                       <span className="text-xs md:text-sm font-black">{review.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <div className="w-16 h-16 bg-slate-900 rounded-[24px] shadow-2xl flex items-center justify-center mb-8 border border-white/5 animate-pulse">
               <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <h3 className="text-lg font-black text-slate-700 uppercase tracking-[0.6em]">
              SYNCING REVIEWS
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewWall;