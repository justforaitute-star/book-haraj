
import React, { useMemo } from 'react';

interface ThanksViewProps {
  onFinish: () => void;
  isRemote?: boolean;
  reviewId?: string;
  faceId?: string;
}

const ThanksView: React.FC<ThanksViewProps> = ({ onFinish, isRemote = false, faceId }) => {
  const personalizedUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'gallery');
    if (faceId) url.searchParams.set('faceId', faceId);
    return url.toString();
  }, [faceId]);

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(personalizedUrl)}&bgcolor=ffffff&color=000000`;

  return (
    <div className="text-center flex flex-col items-center px-6 animate-fade-in max-w-sm mx-auto">
      <div className={`mb-8 ${isRemote ? 'w-16 h-16' : 'w-24 h-24'} bg-white rounded-[24px] flex items-center justify-center shadow-2xl animate-fade-in-up`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className={`${isRemote ? 'text-3xl' : 'text-5xl'} font-black text-white uppercase tracking-tighter leading-none mb-3`}>
        MOMENT SAVED
      </h2>

      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 opacity-60">
        Your digital souvenir is ready
      </p>

      <div className="flex flex-col items-center gap-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl relative">
        <div className="relative p-4 bg-white rounded-3xl overflow-hidden">
          <img src={qrCodeImageUrl} alt="Personal Gallery" className={`${isRemote ? 'w-40 h-40' : 'w-56 h-56'}`} />
        </div>
        <div className="text-center">
          <h4 className="text-white text-[11px] font-black uppercase tracking-[0.3em] mb-1">SCAN FOR MEMORIES</h4>
          <p className="text-[9px] text-slate-500 font-medium uppercase italic">Groups all your expo photos</p>
        </div>
        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20"></div>
      </div>

      <div className="mt-12 w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-white origin-left animate-loading-bar"></div>
      </div>
      
      <p className="mt-4 text-white/20 text-[8px] uppercase tracking-[0.6em] font-black">STATION RESETTING</p>

      {isRemote && (
        <button onClick={onFinish} className="mt-10 px-10 py-5 bg-white text-black rounded-2xl font-black shadow-xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform">
          FINISH
        </button>
      )}
    </div>
  );
};

export default ThanksView;
