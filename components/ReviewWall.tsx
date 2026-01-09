
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Review } from '../types.ts';

interface ReviewWallProps {
  reviews: Review[];
  fullScreen?: boolean;
  singleReviewId?: string | null;
  onExit?: () => void;
  onRefresh?: () => void;
}

const ReviewWall: React.FC<ReviewWallProps> = ({ reviews, fullScreen = false, singleReviewId = null, onExit, onRefresh }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleFullscreen = () => {
    const doc = document.documentElement as any;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (doc.requestFullscreen) doc.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.ratings?.overall || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const displayReviews = useMemo(() => {
    let list = singleReviewId ? reviews.filter(r => r.id === singleReviewId) : reviews;
    if (fullScreen && list.length > 5 && !singleReviewId) return [...list, ...list.slice(0, 4)];
    return list;
  }, [reviews, singleReviewId, fullScreen]);

  useEffect(() => {
    if (!fullScreen || displayReviews.length < 3 || singleReviewId) return;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    const animate = () => {
      scrollPosRef.current += 0.45;
      if (scrollPosRef.current >= scrollContainer.scrollHeight - scrollContainer.clientHeight) scrollPosRef.current = 0;
      scrollContainer.scrollTop = scrollPosRef.current;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [fullScreen, displayReviews.length, singleReviewId]);

  return (
    <div className={`relative flex flex-col items-center w-full h-full overflow-hidden bg-black ${fullScreen ? 'p-0' : 'p-4'}`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 left-[10%] w-64 h-64 border border-white rounded-full"></div>
        <div className="absolute bottom-40 right-[15%] w-80 h-80 border border-white/50 -rotate-12"></div>
      </div>

      {fullScreen && (
        <div className="relative z-30 w-full pt-6 pb-6 px-6 md:px-12 animate-fade-in flex-shrink-0 bg-black/95 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-start">
              <h1 className="text-xl md:text-3xl font-[900] text-slate-100 tracking-tighter uppercase leading-none italic">
                {singleReviewId ? 'YOUR' : 'THE'} <span className="text-white">{singleReviewId ? 'REVIEW' : 'FEED'}</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">EXPO TESTIMONIALS</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
              onClick={handleRefresh} 
              className={`w-10 h-10 md:w-14 md:h-14 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl border border-white/10 active:scale-90 ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Feed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button onClick={toggleFullscreen} className="w-10 h-10 md:w-14 md:h-14 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl border border-white/10 active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isFullscreen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />}
              </svg>
            </button>
            {onExit && <button onClick={onExit} className="px-6 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform border border-white/10">EXIT</button>}
          </div>
        </div>
      )}

      <div ref={scrollContainerRef} className={`w-full flex-1 overflow-y-auto no-scrollbar z-10 pt-8 md:pt-12 px-6 md:px-10 ${singleReviewId ? 'flex items-center justify-center' : ''}`}>
        {displayReviews.length > 0 ? (
          <div className={`${singleReviewId ? 'max-w-md w-full' : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 md:gap-8 max-w-[1800px]'} mx-auto pb-96`}>
            {displayReviews.map((review, index) => {
              const overallRating = review.ratings?.overall || 5;
              const serialNum = review.serial_number ? `#${String(review.serial_number).padStart(3, '0')}` : `#${index + 1}`;

              return (
              <div key={`${review.id}-${index}`} className="break-inside-avoid mb-6 md:mb-8 group relative bg-white/[0.03] backdrop-blur-md rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden flex flex-col transition-all animate-fade-in-up">
                <div className="p-8 md:p-10 relative">
                  <div className="absolute top-8 right-8 px-3 py-1 bg-white/10 border border-white/10 rounded-lg backdrop-blur-xl">
                    <span className="text-[10px] font-black text-white/80 tracking-widest">{serialNum}</span>
                  </div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-base md:text-lg ${i < overallRating ? 'opacity-100' : 'opacity-20 text-white'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <svg className="absolute -top-4 -left-4 h-10 w-10 text-white opacity-[0.05]" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H7c0-1.7 1.3-3 3-3V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-7c0-1.7 1.3-3 3-3V8z" />
                    </svg>
                    <p className="text-white/90 text-xl md:text-2xl leading-[1.6] font-light tracking-tight mb-10 italic relative z-10">
                      "{review.comment || 'An unforgettable experience.'}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div>
                      <h4 className="font-black text-white text-base md:text-lg uppercase tracking-tighter truncate">{review.name}</h4>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1">{new Date(review.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                       <span className="text-xs md:text-sm font-black">{review.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <h3 className="text-lg font-black text-slate-700 uppercase tracking-[0.6em]">SYNCING REVIEWS</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewWall;
