
import React, { useMemo, useState, useEffect } from 'react';

interface ThanksViewProps {
  onFinish: () => void;
  isRemote?: boolean;
  faceId?: string;
  faceIdEnabled?: boolean;
}

const ThanksView: React.FC<ThanksViewProps> = ({ onFinish, isRemote = false, faceId, faceIdEnabled = true }) => {
  const [qrTick, setQrTick] = useState(Date.now());

  // Update QR salt every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQrTick(Date.now());
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const personalizedUrl = useMemo(() => {
    if (!faceId || !faceIdEnabled) return null;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('mode', 'gallery');
    url.searchParams.set('faceId', faceId);
    return url.toString();
  }, [faceId, faceIdEnabled]);

  const qrCodeImageUrl = useMemo(() => {
    if (!personalizedUrl) return null;
    const dynamicUrl = `${personalizedUrl}${personalizedUrl.includes('?') ? '&' : '?'}salt=${qrTick}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(dynamicUrl)}&bgcolor=ffffff&color=000000&margin=2`;
  }, [personalizedUrl, qrTick]);

  const copyToClipboard = () => {
    if (personalizedUrl) {
      navigator.clipboard.writeText(personalizedUrl);
      alert("Gallery link copied to clipboard!");
    }
  };

  return (
    <div className="text-center flex flex-col items-center px-6 animate-fade-in max-w-sm mx-auto overflow-y-auto no-scrollbar py-10">
      <div className={`mb-8 ${isRemote ? 'w-16 h-16' : 'w-24 h-24'} bg-white rounded-[24px] flex items-center justify-center shadow-2xl animate-fade-in-up`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className={`${isRemote ? 'text-3xl' : 'text-5xl'} font-black text-white uppercase tracking-tighter leading-none mb-3`}>
        MOMENT SAVED
      </h2>

      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 opacity-60">
        Thank you for your feedback
      </p>

      {faceIdEnabled && faceId && personalizedUrl && qrCodeImageUrl ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl relative w-full animate-fade-in mb-8">
          <div className="relative p-3 bg-white rounded-3xl overflow-hidden shadow-inner">
            <img key={qrTick} src={qrCodeImageUrl} alt="Personal Gallery" className={`${isRemote ? 'w-44 h-44' : 'w-60 h-60'} animate-fade-in`} />
          </div>
          
          <div className="text-center w-full">
            <h4 className="text-white text-[11px] font-black uppercase tracking-[0.3em] mb-2">SCAN FOR HISTORY</h4>
            
            <div className="mt-2 group relative">
              <div 
                onClick={copyToClipboard}
                className="bg-black/40 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-black/60 transition-all active:scale-95"
              >
                <p className="text-[8px] text-slate-400 font-mono break-all line-clamp-2 uppercase tracking-tight">
                  {personalizedUrl}
                </p>
              </div>
              <p className="text-[7px] text-white/20 font-black uppercase tracking-[0.2em] mt-2 group-hover:text-white/40 transition-colors">Tap link to copy</p>
            </div>

            <p className="text-[9px] text-slate-500 font-medium uppercase italic max-w-[180px] mx-auto mt-4">See all photos identified by your face signature</p>
          </div>

          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20"></div>
        </div>
      ) : (
        <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl w-full mb-8">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Submission Complete</p>
          <p className="text-[8px] text-slate-600 mt-2 uppercase tracking-widest font-bold">Thank you for visiting Book Haraj!</p>
        </div>
      )}

      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-white origin-left animate-loading-bar"></div>
      </div>
      
      <p className="text-white/20 text-[8px] uppercase tracking-[0.6em] font-black mb-8">STATION RESETTING</p>

      <button onClick={onFinish} className="w-full py-6 bg-white text-black rounded-2xl font-black shadow-xl text-[10px] uppercase tracking-widest active:scale-95 hover:scale-[1.02] transition-all">
        {isRemote ? 'FINISH' : 'BACK TO HOME'}
      </button>
    </div>
  );
};

export default ThanksView;
