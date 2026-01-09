
import React, { useMemo, useState, useEffect } from 'react';

interface HomeViewProps {
  onStart: () => void;
  onToggleMode: () => void;
  onAdmin: () => void;
  onRefresh?: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onStart, onToggleMode, onAdmin, onRefresh }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrTick, setQrTick] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update QR salt every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQrTick(Date.now());
    }, 20000);
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

  useEffect(() => {
    const handleFsChange = () => {
      const fsDoc = document as any;
      setIsFullscreen(!!(fsDoc.fullscreenElement || fsDoc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const remoteUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'remote');
    return url.toString();
  }, []);

  const displayUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'display');
    return url.toString();
  }, []);

  const qrCodeUrl = useMemo(() => {
    const dynamicUrl = `${remoteUrl}${remoteUrl.includes('?') ? '&' : '?'}salt=${qrTick}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dynamicUrl)}&bgcolor=000000&color=ffffff`;
  }, [remoteUrl, qrTick]);

  return (
    <div className="flex flex-col items-center max-w-2xl w-full h-full justify-center gap-12 text-center px-6 relative z-10">
      {/* Consolidated Action Bar at Top Right - Fixed position with high z-index and explicit interaction */}
      <div className="fixed top-8 right-8 flex flex-col items-end gap-3 z-[200] pointer-events-auto">
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            className={`w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all border border-white/20 shadow-2xl active:scale-90 ${isRefreshing ? 'animate-spin text-white' : ''}`}
            title="Refresh Data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all border border-white/20 shadow-2xl active:scale-90"
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

          <button 
            onClick={() => setShowSetup(!showSetup)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border border-white/20 active:scale-90 ${showSetup ? 'bg-white text-black rotate-90 scale-110' : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Admin Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {showSetup && (
          <div className="bg-slate-900/95 backdrop-blur-3xl p-6 rounded-[32px] shadow-2xl border border-white/10 mt-2 w-72 text-left animate-fade-in-up origin-top-right z-[210]">
            <h4 className="text-[11px] font-black text-white uppercase mb-4 tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-white animate-pulse"></div>
              Station Controls
            </h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { onToggleMode(); setShowSetup(false); }} 
                className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              >
                Launch Feed
              </button>
              <button 
                onClick={() => { onAdmin(); setShowSetup(false); }} 
                className="w-full py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 border border-white/10 active:scale-95 transition-all"
              >
                Admin Panel
              </button>
            </div>
            <div className="mt-5 pt-5 border-t border-white/5">
               <p className="text-[8px] text-slate-500 uppercase tracking-[0.3em] mb-2 font-black">Feed Endpoint:</p>
               <div className="bg-black/50 p-3 rounded-xl text-[8px] break-all font-mono text-slate-400 select-all border border-white/5 leading-relaxed">
                 {displayUrl}
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center w-full animate-fade-in-up pointer-events-auto">
        <div className="overflow-hidden mb-12">
          <p className="text-xl text-slate-400 max-w-sm mx-auto leading-relaxed font-black uppercase tracking-[0.3em]">Share Your Story</p>
        </div>

        <div className="flex flex-col items-center gap-10 w-full">
          <button
            onClick={onStart}
            className="group relative w-full max-w-md py-8 bg-white text-black rounded-[24px] text-3xl font-[900] shadow-[0_40px_80px_-20px_rgba(255,255,255,0.1)] hover:scale-[1.05] transition-all active:scale-95 overflow-hidden uppercase tracking-tight animate-glow-pulse"
          >
            <div className="absolute inset-0 animate-shimmer opacity-20"></div>
            <span className="relative z-10 flex items-center justify-center gap-5">
              POST REVIEW
              <div className="w-10 h-10 bg-black rounded-[6px] flex items-center justify-center group-hover:rotate-90 transition-transform duration-500 shadow-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
                 </svg>
              </div>
            </span>
          </button>

          <div className="flex items-center gap-6 w-full max-w-xs animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="h-px flex-1 bg-slate-800/50"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">OR</span>
            <div className="h-px flex-1 bg-slate-800/50"></div>
          </div>

          <div className="group bg-white/5 backdrop-blur-md p-6 rounded-[32px] shadow-2xl border border-white/10 flex items-center gap-8 w-full max-w-md transition-all hover:border-white/40 hover:bg-white/10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="p-4 bg-white rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-500 relative">
              <img key={qrTick} src={qrCodeUrl} alt="Scan to Review" className="w-20 h-20 mix-blend-multiply opacity-90 animate-fade-in" />
              <div className="absolute -inset-1 border-2 border-white/20 rounded-2xl animate-pulse"></div>
            </div>
            <div className="text-left">
              <h3 className="text-white font-black text-sm mb-1 uppercase tracking-widest group-hover:text-white transition-colors">SKIP THE CROWD</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight max-w-[120px]">Scan to review from your phone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
