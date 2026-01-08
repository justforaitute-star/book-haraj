import React, { useMemo, useState, useEffect } from 'react';

interface HomeViewProps {
  onStart: () => void;
  onToggleMode: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onStart, onToggleMode }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const doc = document.documentElement as any;
    const fsDoc = document as any;
    
    const isCurrentlyFs = fsDoc.fullscreenElement || 
                          fsDoc.webkitFullscreenElement || 
                          fsDoc.mozFullScreenElement || 
                          fsDoc.msFullscreenElement;

    if (!isCurrentlyFs) {
      if (doc.requestFullscreen) doc.requestFullscreen().catch(() => {});
      else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
      else if (doc.mozRequestFullScreen) doc.mozRequestFullScreen();
      else if (doc.msRequestFullscreen) doc.msRequestFullscreen();
    } else {
      if (fsDoc.exitFullscreen) fsDoc.exitFullscreen().catch(() => {});
      else if (fsDoc.webkitExitFullscreen) fsDoc.webkitExitFullscreen();
      else if (fsDoc.mozCancelFullScreen) fsDoc.mozCancelFullScreen();
      else if (fsDoc.msExitFullscreen) fsDoc.msExitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const fsDoc = document as any;
      setIsFullscreen(!!(
        fsDoc.fullscreenElement || 
        fsDoc.webkitFullscreenElement || 
        fsDoc.mozFullScreenElement || 
        fsDoc.msFullscreenElement
      ));
    };
    
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
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

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(remoteUrl)}&bgcolor=000000&color=ffffff`;

  return (
    <div className="flex flex-col items-center max-w-2xl w-full h-full justify-center gap-12 text-center px-6 relative">
      
      {/* Tiny Fullscreen Toggle */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        className="fixed top-8 right-8 w-12 h-12 md:w-14 md:h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/10 z-[100] shadow-2xl active:scale-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isFullscreen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          )}
        </svg>
      </button>

      <div className="flex flex-col items-center w-full animate-fade-in-up">
        <div className="overflow-hidden mb-12">
          <p className="text-xl text-slate-400 max-w-sm mx-auto leading-relaxed font-black uppercase tracking-[0.3em] animate-slide-reveal">
            Share Your Story
          </p>
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
              <img src={qrCodeUrl} alt="Scan to Review" className="w-20 h-20 mix-blend-multiply opacity-90" />
              <div className="absolute -inset-1 border-2 border-white/20 rounded-2xl animate-pulse"></div>
            </div>
            <div className="text-left">
              <h3 className="text-white font-black text-sm mb-1 uppercase tracking-widest group-hover:text-white transition-colors">SKIP THE CROWD</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight max-w-[120px]">
                Scan to review from your phone
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 z-50">
        {showSetup && (
          <div className="bg-slate-900/90 backdrop-blur-2xl p-6 rounded-[32px] shadow-2xl border border-white/10 mb-3 w-72 text-left animate-fade-in-up">
            <h4 className="text-[11px] font-black text-white uppercase mb-3 tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-white animate-pulse"></div>
              Display Setup
            </h4>
            <div className="bg-black p-3 rounded-xl text-[10px] break-all font-mono text-slate-400 mb-4 select-all border border-white/10">
              {displayUrl}
            </div>
            <button onClick={onToggleMode} className="w-full py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-lg">
              Launch Feed
            </button>
          </div>
        )}
        <button 
          onClick={() => setShowSetup(!showSetup)}
          className={`w-14 h-14 rounded-[16px] flex items-center justify-center transition-all shadow-xl ${showSetup ? 'bg-white text-black rotate-90 scale-110' : 'bg-slate-900 text-white border border-white/10 hover:bg-slate-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomeView;