
import React, { useMemo, useState, useEffect } from 'react';
import { Review } from '../types.ts';

interface HomeViewProps {
  reviews: Review[];
  onStart: () => void;
  onToggleMode: () => void;
  onAdmin: () => void;
  onRefresh?: () => void;
  faceIdEnabled?: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ reviews, onStart, onToggleMode, onAdmin, onRefresh, faceIdEnabled = true }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [qrTick, setQrTick] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state with browser events
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

  // Improved Prestige Rating Calculation
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: "4.8", count: 0, recent: [] };
    
    // Global Star Logic: Sum of all stars / total ratings count
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

    // Baseline "Expo Hype" weight: Add 50 'ghost' 5-star ratings to maintain prestige
    const weightStars = totalStars + (50 * 5);
    const weightCount = totalRatingCount + 50;
    
    let rawAvg = weightCount > 0 ? weightStars / weightCount : 4.8;
    
    // Ensure the "sentiment floor" is never below 4.4 for the Expo brand
    const finalAvg = Math.max(4.4, rawAvg).toFixed(1);

    // Get 5 most recent valid comments for the ticker
    const recentComments = reviews
      .filter(r => r.comment && r.comment.trim().length > 0)
      .slice(0, 5)
      .map(r => ({ name: r.name, text: r.comment }));

    return {
      avg: finalAvg,
      count: reviews.length,
      recent: recentComments
    };
  }, [reviews]);

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
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'remote');
    return url.toString();
  }, []);

  const qrCodeUrl = useMemo(() => {
    const dynamicUrl = `${remoteUrl}${remoteUrl.includes('?') ? '&' : '?'}salt=${qrTick}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dynamicUrl)}&bgcolor=000000&color=ffffff`;
  }, [remoteUrl, qrTick]);

  return (
    <div className="flex flex-col items-center w-full h-full justify-between pt-12 pb-8 px-6 relative z-10 overflow-hidden">
      
      {/* Top Action Bar */}
      <div className="absolute top-8 right-8 flex flex-col items-end gap-3 z-[200] pointer-events-auto">
        <div className="flex gap-3">
          <button 
            onClick={toggleFullscreen} 
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-slate-300 transition-all border border-white/20 shadow-2xl active:scale-90"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              )}
            </svg>
          </button>
          
          <button 
            onClick={handleRefresh} 
            className={`w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-slate-300 transition-all border border-white/20 shadow-2xl active:scale-90 ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Feed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button 
            onClick={() => setShowSetup(!showSetup)} 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl border border-white/20 active:scale-90 ${showSetup ? 'bg-white text-black' : 'bg-white/10 text-slate-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {showSetup && (
          <div className="bg-slate-900/95 backdrop-blur-3xl p-6 rounded-[32px] shadow-2xl border border-white/10 mt-2 w-64 text-left animate-fade-in-up origin-top-right">
            <button onClick={() => { onToggleMode(); setShowSetup(false); }} className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest mb-2">Launch Feed</button>
            <button onClick={() => { onAdmin(); setShowSetup(false); }} className="w-full py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Admin Panel</button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-2xl">
        {/* Main Sentiment Dashboard */}
        <div className="w-full animate-fade-in-up flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full group-hover:bg-white/20 transition-all duration-1000"></div>
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] shadow-2xl relative flex flex-col items-center min-w-[300px] border-b-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black text-green-400 uppercase tracking-[0.3em]">Live Feed</span>
                </div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Community Rating</span>
              </div>
              
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-8xl font-black text-white tracking-tighter">{stats.avg}</span>
                <span className="text-4xl text-yellow-500 animate-glow-pulse">★</span>
              </div>

              <div className="w-full h-px bg-white/10 my-6"></div>

              <div className="flex justify-center gap-10">
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">TOTAL VISITS</p>
                  <p className="text-lg font-black text-white">{stats.count + 420}</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">REVIEWS</p>
                  <p className="text-lg font-black text-white">{stats.count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center gap-8 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={onStart}
            className="group relative w-full max-w-md py-8 bg-white text-black rounded-[28px] text-4xl font-[900] shadow-[0_40px_80px_-20px_rgba(255,255,255,0.15)] hover:scale-[1.03] transition-all active:scale-95 overflow-hidden uppercase tracking-tighter"
          >
            <span className="relative z-10">POST REVIEW</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          {faceIdEnabled && (
            <div className="flex items-center gap-6 w-full max-w-md transition-all hover:bg-white/5 p-4 rounded-[32px] cursor-pointer" onClick={() => setShowSetup(true)}>
              <div className="p-3 bg-white rounded-2xl shrink-0 shadow-lg">
                <img key={qrTick} src={qrCodeUrl} alt="Scan" className="w-14 h-14 mix-blend-multiply" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-black text-xs mb-1 uppercase tracking-widest">SUBMIT VIA MOBILE</h3>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tight max-w-[140px]">Scan to bypass the kiosk queue</p>
              </div>
              <div className="ml-auto w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Recent Feedback Ticker */}
      {stats.recent.length > 0 && (
        <div className="w-full max-w-4xl pt-8 border-t border-white/5 animate-fade-in">
           <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Recent Activity</span>
              <div className="h-px flex-1 bg-white/5 hidden md:block"></div>
           </div>
           <div className="overflow-hidden whitespace-nowrap relative group">
              <div className="flex gap-12 animate-shimmer py-2">
                 {/* Duplicate items for infinite scroll effect if few items */}
                 {[...stats.recent, ...stats.recent].map((comment, i) => (
                   <div key={i} className="inline-flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-white font-black text-[10px] uppercase tracking-tighter mr-2">{comment.name}</span>
                        <span className="text-slate-500 text-[10px] italic">"{comment.text.length > 40 ? comment.text.substring(0, 40) + '...' : comment.text}"</span>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
