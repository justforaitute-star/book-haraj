
import React, { useMemo } from 'react';

interface ThanksViewProps {
  onFinish: () => void;
  isRemote?: boolean;
  reviewId?: string;
}

const ThanksView: React.FC<ThanksViewProps> = ({ onFinish, isRemote = false, reviewId }) => {
  const galleryUrl = useMemo(() => {
    // In a real app, this would be a link to the photographer's database/gallery.
    // For this demo, we can use a placeholder or the existing review link.
    return "https://book-haraj-gallery.expo.com"; 
  }, []);

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(galleryUrl)}&bgcolor=ffffff&color=020617`;

  return (
    <div className={`text-center flex flex-col items-center px-10 ${isRemote ? 'py-8' : 'py-4'} animate-fade-in`}>
      
      {/* Success Badge */}
      <div className={`${isRemote ? 'w-20 h-20 mb-8' : 'w-32 h-32 mb-10'} bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_60px_rgba(255,184,61,0.4)] relative animate-fade-in-up`}>
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#ffb83d] rounded-xl shadow-lg flex items-center justify-center border-4 border-[#020617]">
           <span className="text-slate-900 text-sm font-black">✓</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`${isRemote ? 'h-10 w-10' : 'h-16 w-16'} text-slate-900`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div className="overflow-hidden mb-6">
        <h2 className={`${isRemote ? 'text-4xl' : 'text-6xl'} font-[900] text-white uppercase tracking-tight leading-none animate-slide-reveal`}>
          REVIEW <span className="text-[#ffb83d]">POSTED!</span>
        </h2>
      </div>

      <p className={`${isRemote ? 'text-sm' : 'text-xl'} text-slate-300 max-w-sm mx-auto mb-10 font-medium leading-relaxed opacity-90 animate-fade-in`} style={{ animationDelay: '0.4s' }}>
        Thank you for your feedback! Your review has been added to the Book Haraj 3.0 Live Wall.
      </p>

      {/* PHOTO DOWNLOAD SECTION - NEW REQUIREMENT */}
      <div className="flex flex-col items-center gap-8 mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="relative group p-4 bg-white rounded-[32px] shadow-2xl transition-transform hover:scale-105">
          <img src={qrCodeImageUrl} alt="Download Gallery QR" className="w-40 h-40 md:w-48 md:h-48" />
          <div className="absolute -inset-2 border-2 border-white/20 rounded-[40px] animate-pulse pointer-events-none"></div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-[#ffb83d] text-lg font-[900] uppercase tracking-wide">SCAN TO GET YOUR PHOTOS</h4>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em]">Official Expo Gallery Access</p>
        </div>
      </div>

      {/* Progress/Timeout Bar */}
      <div className={`${isRemote ? 'w-64' : 'w-[450px]'} h-3 bg-slate-900/50 rounded-full overflow-hidden relative border border-white/10 p-0.5 animate-fade-in`} style={{ animationDelay: '0.8s' }}>
        <div className="h-full bg-[#ffb83d] origin-left animate-loading-bar rounded-full shadow-[0_0_15px_rgba(255,184,61,0.6)]"></div>
      </div>
      
      <p className="mt-8 text-slate-600 text-[10px] uppercase tracking-[0.5em] font-black animate-pulse">
        STATION RESETTING SOON
      </p>

      {isRemote && (
        <button
          onClick={onFinish}
          className="mt-12 px-16 py-6 bg-white text-slate-900 rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter"
        >
          SUBMIT ANOTHER
        </button>
      )}
      
      {!isRemote && (
        <button
          onClick={onFinish}
          className="mt-12 px-8 py-4 text-slate-500 font-black hover:text-[#ffb83d] transition-all text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 group"
        >
          <div className="w-2.5 h-2.5 bg-[#ffb83d] rounded-sm group-hover:rotate-180 transition-transform duration-500"></div>
          RETURN TO HOME
        </button>
      )}
    </div>
  );
};

export default ThanksView;
