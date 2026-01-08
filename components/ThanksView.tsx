import React, { useMemo } from 'react';

interface ThanksViewProps {
  onFinish: () => void;
  isRemote?: boolean;
  reviewId?: string;
}

const ThanksView: React.FC<ThanksViewProps> = ({ onFinish, isRemote = false, reviewId }) => {
  const galleryUrl = useMemo(() => {
    return "https://book-haraj-gallery.expo.com"; 
  }, []);

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(galleryUrl)}&bgcolor=ffffff&color=000000`;

  return (
    <div className={`text-center flex flex-col items-center px-6 ${isRemote ? 'py-4' : 'py-4'} animate-fade-in`}>
      
      <div className={`${isRemote ? 'w-16 h-16 mb-4' : 'w-32 h-32 mb-10'} bg-white rounded-2xl flex items-center justify-center shadow-lg relative animate-fade-in-up`}>
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-black">
           <span className="text-black text-[10px] font-black">✓</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`${isRemote ? 'h-8 w-8' : 'h-16 w-16'} text-black`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className={`${isRemote ? 'text-2xl' : 'text-6xl'} font-black text-white uppercase tracking-tight leading-none mb-3`}>
        POSTED!
      </h2>

      <p className={`${isRemote ? 'text-xs' : 'text-xl'} text-slate-300 max-w-xs mx-auto mb-6 font-medium leading-relaxed opacity-70`}>
        Thank you! Your review is now on the Live Wall.
      </p>

      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative p-3 bg-white rounded-2xl shadow-xl">
          <img src={qrCodeImageUrl} alt="Gallery QR" className={`${isRemote ? 'w-32 h-32' : 'w-48 h-48'}`} />
        </div>
        <h4 className="text-white text-[10px] font-black uppercase tracking-widest">SCAN FOR YOUR PHOTOS</h4>
      </div>

      <div className={`${isRemote ? 'w-48' : 'w-[450px]'} h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/5`}>
        <div className="h-full bg-white origin-left animate-loading-bar rounded-full"></div>
      </div>
      
      <p className="mt-4 text-white/20 text-[8px] uppercase tracking-[0.4em] font-black">
        STATION RESETTING
      </p>

      {isRemote && (
        <button
          onClick={onFinish}
          className="mt-8 px-10 py-4 bg-white text-black rounded-xl font-black shadow-xl text-[10px] uppercase tracking-tighter active:scale-95"
        >
          SUBMIT ANOTHER
        </button>
      )}
    </div>
  );
};

export default ThanksView;