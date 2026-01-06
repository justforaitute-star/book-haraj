
import React, { useMemo, useState } from 'react';

interface HomeViewProps {
  onStart: () => void;
  onToggleMode: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onStart, onToggleMode }) => {
  const [showSetup, setShowSetup] = useState(false);

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

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(remoteUrl)}&bgcolor=1e293b&color=ffb83d`;

  return (
    <div className="flex flex-col items-center max-w-2xl w-full h-full justify-center gap-12 text-center px-6 relative">
      
      {/* Action Content */}
      <div className="flex flex-col items-center w-full animate-fade-in-up">
        <div className="overflow-hidden mb-12">
          <p className="text-xl text-slate-400 max-w-sm mx-auto leading-relaxed font-black uppercase tracking-[0.3em] animate-slide-reveal">
            Share Your Story
          </p>
        </div>

        <div className="flex flex-col items-center gap-10 w-full">
          <button
            onClick={onStart}
            className="group relative w-full max-w-md py-8 bg-slate-100 text-slate-900 rounded-[24px] text-3xl font-[900] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] hover:scale-[1.05] transition-all active:scale-95 overflow-hidden uppercase tracking-tight animate-glow-pulse"
          >
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 animate-shimmer opacity-30"></div>
            
            <span className="relative z-10 flex items-center justify-center gap-5">
              POST REVIEW
              <div className="w-10 h-10 bg-[#ffb83d] rounded-[6px] flex items-center justify-center group-hover:rotate-90 transition-transform duration-500 shadow-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
                 </svg>
              </div>
            </span>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffb83d]/20 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
          </button>

          <div className="flex items-center gap-6 w-full max-w-xs animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="h-px flex-1 bg-slate-800/50"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">OR</span>
            <div className="h-px flex-1 bg-slate-800/50"></div>
          </div>

          {/* Remote Trigger Section */}
          <div className="group bg-slate-900/40 backdrop-blur-md p-6 rounded-[32px] shadow-2xl border border-slate-800/50 flex items-center gap-8 w-full max-w-md transition-all hover:border-[#ffb83d]/40 hover:bg-slate-900/60 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="p-4 bg-white rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-500 relative">
              <img 
                src={qrCodeUrl} 
                alt="Scan to Review" 
                className="w-20 h-20 mix-blend-multiply opacity-90"
              />
              <div className="absolute -inset-1 border-2 border-[#ffb83d]/20 rounded-2xl animate-pulse"></div>
            </div>
            <div className="text-left">
              <h3 className="text-slate-100 font-black text-sm mb-1 uppercase tracking-widest group-hover:text-[#ffb83d] transition-colors">POST FROM PHONE</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight max-w-[120px]">
                Scan to avoid the queue at the monitor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Utility */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 z-50">
        {showSetup && (
          <div className="bg-slate-900/90 backdrop-blur-2xl p-6 rounded-[32px] shadow-2xl border border-slate-800 mb-3 w-72 text-left animate-fade-in-up">
            <h4 className="text-[11px] font-black text-[#ffb83d] uppercase mb-3 tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-[#ffb83d] animate-pulse"></div>
              Display Setup
            </h4>
            <div className="bg-slate-950 p-3 rounded-xl text-[10px] break-all font-mono text-slate-400 mb-4 select-all border border-slate-800">
              {displayUrl}
            </div>
            <button 
              onClick={onToggleMode}
              className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white transition-colors shadow-lg relative overflow-hidden"
            >
              Launch Feed
            </button>
          </div>
        )}
        <button 
          onClick={() => setShowSetup(!showSetup)}
          className={`w-14 h-14 rounded-[16px] flex items-center justify-center transition-all shadow-xl ${showSetup ? 'bg-[#ffb83d] text-slate-900 rotate-90 scale-110' : 'bg-slate-900 text-white border border-slate-800 hover:bg-slate-800'}`}
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
