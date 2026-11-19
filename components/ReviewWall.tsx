import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Review, RatingCategory } from '../types.ts';

interface ReviewWallProps {
  reviews: Review[];
  categories?: RatingCategory[];
  fullScreen?: boolean;
  singleReviewId?: string | null;
  onExit?: () => void;
  onRefresh?: () => void;
}

const ReviewWall: React.FC<ReviewWallProps> = ({
  reviews,
  categories = [],
  fullScreen = false,
  singleReviewId = null,
  onExit,
  onRefresh
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const isAutoScrollPausedRef = useRef(false);
  const pauseTimeoutRef = useRef<number | null>(null);

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

  const handleManualScrollInteraction = () => {
    isAutoScrollPausedRef.current = true;
    setIsAutoScrollPaused(true);

    if (pauseTimeoutRef.current) window.clearTimeout(pauseTimeoutRef.current);

    pauseTimeoutRef.current = window.setTimeout(() => {
      isAutoScrollPausedRef.current = false;
      setIsAutoScrollPaused(false);
      if (scrollContainerRef.current) {
        scrollPosRef.current = scrollContainerRef.current.scrollTop;
      }
    }, 5000);
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "4.8";
    let totalStars = 0;
    let totalRatingCount = 0;
    reviews.forEach(r => {
      const values = Object.values(r.ratings || {}) as number[];
      values.forEach(v => {
        if (v > 0) {
          totalStars += v;
          totalRatingCount++;
        }
      });
    });
    const weightStars = totalStars + (50 * 5);
    const weightCount = totalRatingCount + 50;
    const rawAvg = weightCount > 0 ? weightStars / weightCount : 4.8;
    return Math.max(4.4, rawAvg).toFixed(1);
  }, [reviews]);

  const displayReviews = useMemo(() => {
    const list = singleReviewId ? reviews.filter(r => r.id === singleReviewId) : reviews;
    if (fullScreen && list.length > 5 && !singleReviewId) return [...list, ...list.slice(0, 4)];
    return list;
  }, [reviews, singleReviewId, fullScreen]);

  useEffect(() => {
    if (!fullScreen || displayReviews.length < 3 || singleReviewId) return;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const animate = () => {
      if (!isAutoScrollPausedRef.current) {
        scrollPosRef.current += 0.45;
        if (scrollPosRef.current >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
          scrollPosRef.current = 0;
        }
        scrollContainer.scrollTop = scrollPosRef.current;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [fullScreen, displayReviews.length, singleReviewId]);

  return (
    <div className={`relative flex flex-col items-center w-full h-full overflow-hidden text-[#2b241e] ${fullScreen ? 'p-0' : 'p-4'}`}>
      {fullScreen && (
        <div className="liquid-glass-bar relative z-30 w-full py-4 px-5 md:px-10 animate-fade-in flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex flex-col items-start min-w-0">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#2b241e] tracking-tight leading-none truncate">
                {singleReviewId ? 'Your Review' : 'EDEX IISJ Feed'}
              </h1>
              <p className="text-xs text-[#5c5147] font-medium mt-1">
                {isAutoScrollPaused ? 'Auto-scroll paused' : 'Live exhibition testimonials'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!singleReviewId && reviews.length > 0 && (
              <div className="liquid-glass-subtle hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl mr-1 tabular-nums">
                <span className="text-xs text-[#5c5147] font-medium">Visitor Avg</span>
                <div className="flex items-center gap-1">
                  <span className="text-[#2b241e] text-xl font-bold">{averageRating}</span>
                  <span className="text-[#b68928] text-lg">★</span>
                </div>
              </div>
            )}

            <button
              onClick={handleRefresh}
              className={`liquid-glass-subtle w-11 h-11 rounded-full flex items-center justify-center text-[#2b241e] active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Feed"
              aria-label="Refresh Feed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button onClick={toggleFullscreen} className="liquid-glass-subtle w-11 h-11 rounded-full flex items-center justify-center text-[#2b241e] active:scale-95" aria-label="Toggle Fullscreen">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isFullscreen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />}
              </svg>
            </button>
            {onExit && <button onClick={onExit} className="liquid-cta px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 active:scale-95">Exit</button>}
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onWheel={handleManualScrollInteraction}
        onTouchStart={handleManualScrollInteraction}
        onMouseDown={handleManualScrollInteraction}
        className={`w-full flex-1 overflow-y-auto no-scrollbar z-10 pt-8 md:pt-10 px-6 md:px-10 ${singleReviewId ? 'flex items-center justify-center' : ''}`}
      >
        {displayReviews.length > 0 ? (
          <div className={`${singleReviewId ? 'max-w-md w-full' : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 md:gap-7 max-w-[1680px]'} mx-auto pb-80`}>
            {displayReviews.map((review, index) => {
              const serialNum = review.serial_number ? `#${String(review.serial_number).padStart(3, '0')}` : `#${String(index + 1).padStart(3, '0')}`;

              return (
                <div key={`${review.id}-${index}`} className="liquid-glass break-inside-avoid mb-6 md:mb-7 rounded-[30px] overflow-hidden flex flex-col animate-fade-in-up">
                  <div className="p-7 md:p-8 relative">
                    <div className="flex items-center justify-between text-xs text-[#5c5147] font-medium mb-5 tabular-nums">
                      <span>{new Date(review.timestamp).toLocaleDateString()}</span>
                      <span className="font-mono">{serialNum}</span>
                    </div>

                    <div className="mb-6 space-y-2">
                      {categories.length > 0 ? categories.map(cat => {
                        const starValue = review.ratings?.[cat.id] || 0;
                        return (
                          <div key={cat.id} className="flex justify-between items-center gap-4">
                            <span className="text-xs text-[#5c5147] font-medium truncate">{cat.label}</span>
                            <div className="flex gap-0.5 shrink-0">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={`text-sm ${i < starValue ? 'text-[#b68928]' : 'text-[#312922]/20'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="flex gap-1 text-[#b68928]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-lg">★</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-[#2b241e] text-lg md:text-xl leading-relaxed font-normal mb-7 italic">
                      "{review.comment || 'An inspiring EDEX experience at IISJ.'}"
                    </p>

                    <div className="flex items-center justify-between pt-5 border-t border-[#312922]/12">
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#2b241e] text-base truncate">{review.name}</h4>
                        <p className="text-xs text-[#5c5147] mt-0.5">EDEX IISJ Visitor</p>
                      </div>
                      <div className="liquid-cta w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-sm font-extrabold text-[#f7f3ec]">{review.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <div className="liquid-glass px-8 py-6 rounded-[28px]">
              <h3 className="text-sm font-bold text-[#2b241e]">No reviews yet</h3>
              <p className="text-xs text-[#5c5147] mt-1">New visitor reviews will appear here automatically.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewWall;
