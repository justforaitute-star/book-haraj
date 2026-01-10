
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrTick, setQrTick] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Community Sentiment Calculation
  const communityStats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const validRatings = reviews.filter(r => r.ratings && typeof r.ratings.overall === 'number');
    if (validRatings.length === 0) return { avg: 0, count: 0 };
    const sum = validRatings.reduce((acc, r) => acc + r.ratings.overall, 0);
    return {
      avg: (sum / validRatings.length).toFixed(1),
      count: validRatings.length
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
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleFullscreen = () => {
    const doc = document.documentElement as any;
    const fsDoc = document as any;
    const isCurrentlyFs = fsDoc.fullscreenElement || fsDoc.webkitFullscreenElement || fsDoc.mozFullScreenElement || fsDoc.msFullscreenElement;
    if (!isCurrentlyFs) {
      if (doc.requestFullscreen) doc.requestFullscreen().catch(() => {});
      else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
    } else {
      if (fsDoc.exitFullscreen) fsDoc.exitFullscreen().catch(() => {});
    }
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
    <div className="flex flex-col items-center max-w-2xl w-full h-full justify-center gap-8 text-center px-6 relative z-10">
      <div className="fixed top-8 right-8 flex flex-col items-end gap-3 z-[200] pointer-events-auto">
        <div className="flex gap-3">
          <button onClick={handleRefresh} className={`w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-slate-300 transition-all border border-white/20 shadow-2xl active:scale-90 ${isRefreshing ? 'animate-spin' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button onClick={() => setShowSetup(!showSetup)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl border border-white/20 active:scale-90 ${showSetup ? 'bg-white text-black' : 'bg-white/10 text-slate-300'}`}>
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

      <div className="flex flex-col items-center w-full animate-fade-in-up">
        {/* Community Sentiment Badge */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[32px] shadow-2xl inline-flex flex-col items-center gap-1 group hover:border-white/30 transition-all">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Community Sentiment</span>
             </div>
             <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white">{communityStats.avg}</span>
                <span className="text-xl text-yellow-500">★</span>
                <div className="w-px h-6 bg-white/10 mx-2"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{communityStats.count} REVIEWS</span>
             </div>
          </div>
        </div>

        <p className="text-xl text-slate-400 max-w-sm mx-auto mb-10 leading-relaxed font-black uppercase tracking-[0.3em]">Share Your Story</p>

        <div className="flex flex-col items-center gap-10 w-full">
          <button
            onClick={onStart}
            className="group relative w-full max-w-md py-8 bg-white text-black rounded-[24px] text-3xl font-[900] shadow-[0_40px_80px_-20px_rgba(255,255,255,0.1)] hover:scale-[1.05] transition-all active:scale-95 overflow-hidden uppercase tracking-tight"
          >
            <span className="relative z-10 flex items-center justify-center gap-5">POST REVIEW</span>
          </button>

          {faceIdEnabled && (
            <>
              <div className="flex items-center gap-6 w-full max-w-xs opacity-30">
                <div className="h-px flex-1 bg-white"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">OR</span>
                <div className="h-px flex-1 bg-white"></div>
              </div>

              <div className="group bg-white/5 backdrop-blur-md p-6 rounded-[32px] shadow-2xl border border-white/10 flex items-center gap-8 w-full max-w-md transition-all hover:bg-white/10">
                <div className="p-4 bg-white rounded-2xl shrink-0">
                  <img key={qrTick} src={qrCodeUrl} alt="Scan to Review" className="w-20 h-20 mix-blend-multiply" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-black text-sm mb-1 uppercase tracking-widest">SKIP THE CROWD</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight max-w-[120px]">Scan to review from your phone</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
