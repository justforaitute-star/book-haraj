import React, { useMemo, useState, useEffect } from 'react';
import { Review, RatingCategory } from '../types.ts';

interface HomeViewProps {
  reviews: Review[];
  visitCount?: number;
  categories: RatingCategory[];
  onStart: () => void;
  onToggleMode: () => void;
  onAdmin: () => void;
  onRefresh?: () => void;
  faceIdEnabled?: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ reviews, visitCount = 0, categories, onStart, onToggleMode, onAdmin, onRefresh }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [showOverallStats, setShowOverallStats] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [qrTick, setQrTick] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = () => {
    const doc = document.documentElement as any;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (doc.requestFullscreen) {
        doc.requestFullscreen().catch(() => {});
      } else if (doc.webkitRequestFullscreen) {
        doc.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const stats = useMemo(() => {
    const categoryAverages: Record<string, string> = {};
    if (reviews.length === 0) {
      categories.forEach(cat => {
        categoryAverages[cat.id] = "0.0";
      });
      return {
        avg: "0.0",
        count: 0,
        visits: visitCount,
        recent: [],
        categoryAverages
      };
    }

    let totalStars = 0;
    let totalRatingCount = 0;
    const catSums: Record<string, number> = {};
    const catCounts: Record<string, number> = {};

    reviews.forEach(r => {
      categories.forEach(cat => {
        const val = r.ratings?.[cat.id] || 0;
        if (val > 0) {
          totalStars += val;
          totalRatingCount++;
          catSums[cat.id] = (catSums[cat.id] || 0) + val;
          catCounts[cat.id] = (catCounts[cat.id] || 0) + 1;
        }
      });
    });

    const finalAvg = totalRatingCount > 0 ? (totalStars / totalRatingCount).toFixed(1) : "0.0";

    categories.forEach(cat => {
      const sum = catSums[cat.id] || 0;
      const count = catCounts[cat.id] || 0;
      categoryAverages[cat.id] = count > 0 ? (sum / count).toFixed(1) : "0.0";
    });

    const recentComments = reviews
      .filter(r => r.comment && r.comment.trim().length > 0)
      .slice(0, 5)
      .map(r => ({ name: r.name, text: r.comment }));

    return {
      avg: finalAvg,
      count: reviews.length,
      visits: Math.max(visitCount, reviews.length),
      recent: recentComments,
      categoryAverages
    };
  }, [reviews, categories, visitCount]);

  useEffect(() => {
    const interval = setInterval(() => setQrTick(Date.now()), 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setQrTick(Date.now());
    if (onRefresh) await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const remoteUrl = useMemo(() => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('mode', 'remote');
    return url.toString();
  }, []);

  const qrCodeUrl = useMemo(() => {
    const dynamicUrl = `${remoteUrl}${remoteUrl.includes('?') ? '&' : '?'}salt=${qrTick}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(dynamicUrl)}&bgcolor=ffffff&color=2b241e&margin=2`;
  }, [remoteUrl, qrTick]);

  const handleCopyRemoteUrl = async () => {
    try {
      await navigator.clipboard.writeText(remoteUrl);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-full flex-1 justify-between pt-4 pb-8 px-6 relative z-10 text-[#2b241e]">
      {/* Top Action Bar */}
      <div className="fixed top-4 right-6 flex flex-col items-end gap-3 z-[200] pointer-events-auto">
        <div className="flex gap-2.5">
          <button
            onClick={toggleFullscreen}
            className="liquid-glass-subtle w-11 h-11 rounded-full flex items-center justify-center text-[#2b241e] hover:text-[#1a1510] active:scale-95"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              )}
            </svg>
          </button>

          <button
            onClick={handleRefresh}
            className={`liquid-glass-subtle w-11 h-11 rounded-full flex items-center justify-center text-[#2b241e] hover:text-[#1a1510] active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Feed"
            aria-label="Refresh Feed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={() => setShowSetup(!showSetup)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${showSetup ? 'liquid-cta' : 'liquid-glass-subtle text-[#2b241e] hover:text-[#1a1510]'}`}
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {showSetup && (
          <div className="liquid-glass-modal p-3.5 rounded-[28px] mt-1 w-60 text-left animate-fade-in-up origin-top-right space-y-2">
            <button onClick={() => { onToggleMode(); setShowSetup(false); }} className="liquid-glass-subtle w-full py-3.5 px-4 text-[#2b241e] rounded-2xl text-xs font-semibold text-left whitespace-nowrap">Launch Live Feed</button>
            <button onClick={() => { setShowOverallStats(true); setShowSetup(false); }} className="liquid-glass-subtle w-full py-3.5 px-4 text-[#2b241e] rounded-2xl text-xs font-semibold text-left whitespace-nowrap">Overall Stats</button>
            <button onClick={() => { onAdmin(); setShowSetup(false); }} className="liquid-glass-subtle w-full py-3.5 px-4 text-[#2b241e] rounded-2xl text-xs font-semibold text-left whitespace-nowrap">Admin Panel (PIN)</button>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#2b241e]/45 backdrop-blur-xl animate-fade-in overflow-y-auto" onClick={() => setShowQrModal(false)}>
          <div className="liquid-glass-modal p-7 md:p-8 rounded-[36px] w-full max-w-sm text-center animate-fade-in-up my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-left">
                <h3 className="text-xl font-bold tracking-tight text-[#2b241e]">Scan on Your Phone</h3>
                <p className="text-xs text-[#5c5147] mt-0.5">EDEX IISJ · One review per phone</p>
              </div>
              <button onClick={() => setShowQrModal(false)} className="liquid-glass-subtle w-10 h-10 rounded-full flex items-center justify-center text-[#2b241e]" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 bg-white rounded-[24px] inline-block shadow-lg border border-[#312922]/10 mb-5">
              <img key={qrTick} src={qrCodeUrl} alt="Scan to review on your phone" className="w-56 h-56" />
            </div>

            <p className="text-xs text-[#5c5147] leading-relaxed mb-6">
              Point your phone camera at this QR code to submit your EDEX Educational Exhibition review directly from your device.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleCopyRemoteUrl}
                className="liquid-glass-subtle w-full py-3.5 text-[#2b241e] rounded-2xl text-xs font-semibold active:scale-[0.98]"
              >
                {qrCopied ? 'Link Copied' : 'Copy Mobile Link'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="liquid-cta w-full py-3.5 rounded-2xl text-xs font-bold active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overall Stats Modal */}
      {showOverallStats && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#2b241e]/45 backdrop-blur-xl animate-fade-in overflow-y-auto" onClick={() => setShowOverallStats(false)}>
          <div className="liquid-glass-modal p-7 md:p-8 rounded-[36px] w-full max-w-md animate-fade-in-up my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-left">
                <h3 className="text-xl font-bold tracking-tight text-[#2b241e]">Category Breakdown</h3>
                <p className="text-xs text-[#5c5147] mt-0.5">Average visitor ratings at IISJ</p>
              </div>
              <button onClick={() => setShowOverallStats(false)} className="liquid-glass-subtle w-10 h-10 rounded-full flex items-center justify-center text-[#2b241e]" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="divide-y divide-[#312922]/12">
              {categories.map(cat => (
                <div key={cat.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-[#5c5147] font-medium mb-0.5">{cat.label}</p>
                    <p className="text-sm font-semibold text-[#2b241e] leading-snug">{cat.question}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end tabular-nums">
                      <span className="text-2xl font-bold text-[#2b241e]">{stats.categoryAverages[cat.id] || "0.0"}</span>
                      <span className="text-[#b68928] text-lg">★</span>
                    </div>
                    <div className="w-14 h-1.5 bg-[#312922]/12 rounded-full mt-1.5 overflow-hidden ml-auto">
                      <div
                        className="h-full bg-[#312922] rounded-full"
                        style={{ width: `${(parseFloat(stats.categoryAverages[cat.id] || "0") / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowOverallStats(false)}
              className="liquid-cta w-full py-3.5 rounded-2xl text-xs font-bold mt-6 active:scale-[0.98]"
            >
              Close Overview
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-xl py-4">
        {/* Main Frosted Sentiment Card */}
        <div className="w-full animate-fade-in-up flex flex-col items-center">
          <div className="liquid-glass px-10 py-7 rounded-[36px] flex flex-col items-center min-w-[300px] sm:min-w-[350px]">
            <div className="flex items-center gap-2 text-xs text-[#5c5147] font-semibold mb-2.5 tracking-wide">
              <span>EDEX Educational Exhibition</span>
              <span aria-hidden="true">·</span>
              <span>IISJ</span>
            </div>

            <div className="flex items-baseline gap-2.5 mb-1 tabular-nums">
              <span className="font-display text-7xl sm:text-8xl font-extrabold editorial-gradient-text tracking-tight">{stats.avg}</span>
              <span className="text-4xl text-[#b68928] animate-glow-pulse">★</span>
            </div>

            <div className="w-full h-px bg-[#312922]/12 my-4"></div>

            <div className="flex justify-center items-center gap-10 tabular-nums">
              <div className="text-center">
                <p className="text-xs text-[#5c5147] font-medium mb-0.5">Total Visits</p>
                <p className="text-xl font-bold text-[#2b241e]">{stats.visits}</p>
              </div>
              <div className="w-px h-9 bg-[#312922]/12"></div>
              <div className="text-center">
                <p className="text-xs text-[#5c5147] font-medium mb-0.5">Reviews</p>
                <p className="text-xl font-bold text-[#2b241e]">{stats.count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA & Phone QR Section */}
        <div className="flex flex-col items-center gap-3.5 w-full max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={onStart}
            className="liquid-cta group relative w-full py-4 sm:py-5 rounded-full text-xl sm:text-2xl font-bold tracking-tight active:scale-[0.98] overflow-hidden flex items-center justify-center gap-3"
          >
            <span className="relative z-10">Post Review</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="liquid-glass-subtle flex items-center gap-4 w-full p-3.5 rounded-[26px] cursor-pointer text-left active:scale-[0.98]"
          >
            <div className="p-2 bg-white rounded-2xl shrink-0 shadow-sm border border-[#312922]/10">
              <img key={qrTick} src={qrCodeUrl} alt="Scan to review on your phone" className="w-14 h-14" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[#2b241e] font-bold text-sm mb-0.5">Scan with your phone</h3>
              <p className="text-[#5c5147] text-xs font-medium">1 review per phone · Tap to enlarge</p>
            </div>
            <div className="ml-auto w-9 h-9 rounded-full bg-[#312922]/10 flex items-center justify-center text-[#2b241e] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Live Recent Feedback Ticker */}
      {stats.recent.length > 0 && (
        <div className="w-full max-w-4xl pt-4 border-t border-[#312922]/12 animate-fade-in">
          <div className="flex items-center gap-4 mb-2.5 justify-center md:justify-start">
            <span className="text-xs font-semibold text-[#5c5147]">Recent Visitor Notes</span>
            <div className="h-px flex-1 bg-[#312922]/12 hidden md:block"></div>
          </div>
          <div className="overflow-hidden whitespace-nowrap relative">
            <div className="flex gap-4 animate-shimmer py-1 w-max">
              {[...stats.recent, ...stats.recent].map((comment, i) => (
                <div key={i} className="liquid-glass-subtle inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl">
                  <div className="w-7 h-7 bg-[#312922] rounded-full flex items-center justify-center text-xs font-bold text-[#f7f3ec] shrink-0">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs">
                    <span className="text-[#2b241e] font-bold mr-2">{comment.name}</span>
                    <span className="text-[#5c5147] italic">"{comment.text.length > 42 ? comment.text.substring(0, 42) + '...' : comment.text}"</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="mt-4 text-xs font-medium text-[#5c5147]">
        EDEX Educational Exhibition · IISJ
      </footer>
    </div>
  );
};

export default HomeView;
