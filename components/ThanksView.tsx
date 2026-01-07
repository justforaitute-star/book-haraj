
import React, { useMemo } from 'react';

interface ThanksViewProps {
  onFinish: () => void;
  isRemote?: boolean;
  reviewId?: string;
}

const ThanksView: React.FC<ThanksViewProps> = ({ onFinish, isRemote = false, reviewId }) => {
  const qrUrl = useMemo(() => {
    if (!reviewId) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'review');
    url.searchParams.set('id', reviewId);
    return url.toString();
  }, [reviewId]);

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=020617`;

  return (
    <div className={`text-center flex flex-col items-center px-10 ${isRemote ? 'py-8' : 'py-4'}`}>
      <div className={`${isRemote ? 'w-16 h-16 mb-6' : 'w-32 h-32 mb-8'} bg-white rounded-[20px] flex items-center justify-center shadow-[0_40px_80px_-20px_rgba(255,184,61,0.3)] relative animate-fade-in-up`}>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ffb83d] rounded-[8px] animate-star-pop shadow-lg flex items-center justify-center">
           <span className="text-slate-900 text-xs font-black">✓</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`${isRemote ? 'h-8 w-8' : 'h-16 w-16'} text-slate-900 animate-glow-pulse`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div className="overflow-hidden mb-4">
        <h2 className={`${isRemote ? 'text-4xl' : 'text-6xl'} font-[900] text-slate-100 uppercase tracking-tighter animate-slide-reveal`}>
          STORY <span className="text-[#ffb83d]">POSTED!</span>
        </h2>
      </div>

      <p className={`${isRemote ? 'text-sm' : 'text-lg'} text-slate-500 max-w-sm mx-auto mb-8 font-bold uppercase tracking-widest animate-fade-in`} style={{ animationDelay: '0.4s' }}>
        YOUR FEEDBACK IS NOW PART OF THE BOOK HARAJ 3.0 WALL.
      </p>

      {/* QR Code Section */}
      {reviewId && (
        <div className="flex flex-col items-center gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="p-3 bg-white rounded-[24px] shadow-2xl scale-110">
            <img src={qrCodeImageUrl} alt="Review QR Code" className="w-32 h-32 md:w-40 md:h-40" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[#ffb83d] text-[11px] font-black uppercase tracking-[0.4em]">SCAN TO SEE YOUR REVIEW</p>
            <div className="h-[2px] w-12 bg-white/10 rounded-full mt-2"></div>
          </div>
        </div>
      )}

      <div className={`${isRemote ? 'w-56' : 'w-[400px]'} h-3 bg-slate-900 rounded-full overflow-hidden relative border border-white/5 shadow-inner p-1 animate-fade-in`} style={{ animationDelay: '0.8s' }}>
        <div className="h-full bg-[#ffb83d] origin-left animate-loading-bar shadow-[0_0_30px_rgba(255,184,61,0.8)] rounded-full relative">
           <div className="absolute inset-0 animate-shimmer"></div>
        </div>
      </div>
      
      <p className="mt-8 text-slate-700 text-[9px] uppercase tracking-[1em] font-black animate-pulse">
        REFRESHING STATION
      </p>

      {isRemote && (
        <button
          onClick={onFinish}
          className="mt-12 px-16 py-5 bg-white text-slate-900 rounded-[14px] font-[900] shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tight relative overflow-hidden group"
        >
          <div className="absolute inset-0 animate-shimmer opacity-20"></div>
          <span className="relative z-10">POST ANOTHER</span>
        </button>
      )}
      
      {!isRemote && (
        <button
          onClick={onFinish}
          className="mt-12 px-10 py-5 text-slate-400 font-[900] hover:bg-white/5 rounded-[14px] transition-all text-[10px] uppercase tracking-[0.4em] flex items-center gap-4 group"
        >
          <div className="w-2.5 h-2.5 bg-[#ffb83d] group-hover:rotate-180 transition-transform duration-500"></div>
          BACK TO HOME
        </button>
      )}
    </div>
  );
};

export default ThanksView;
