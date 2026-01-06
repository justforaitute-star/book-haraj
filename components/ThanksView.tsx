
import React from 'react';

interface ThanksViewProps {
  onFinish: () => void;
  isRemote?: boolean;
}

const ThanksView: React.FC<ThanksViewProps> = ({ onFinish, isRemote = false }) => {
  return (
    <div className={`text-center flex flex-col items-center px-10 ${isRemote ? 'py-12' : ''}`}>
      <div className={`${isRemote ? 'w-24 h-24' : 'w-48 h-48'} bg-white rounded-[24px] flex items-center justify-center mb-12 shadow-[0_40px_80px_-20px_rgba(255,184,61,0.3)] relative animate-fade-in-up`}>
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#ffb83d] rounded-[10px] animate-star-pop shadow-lg flex items-center justify-center">
           <span className="text-slate-900 text-sm font-black">✓</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`${isRemote ? 'h-12 w-12' : 'h-24 w-24'} text-slate-900 animate-glow-pulse`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div className="overflow-hidden mb-6">
        <h2 className={`${isRemote ? 'text-5xl' : 'text-8xl'} font-[900] text-slate-100 uppercase tracking-tighter animate-slide-reveal`}>
          STORY <span className="text-[#ffb83d]">POSTED!</span>
        </h2>
      </div>

      <p className={`${isRemote ? 'text-lg' : 'text-2xl'} text-slate-500 max-w-sm mx-auto mb-20 font-bold uppercase tracking-widest animate-fade-in`} style={{ animationDelay: '0.4s' }}>
        YOUR FEEDBACK IS NOW PART OF THE BOOK HARAJ 3.0 WALL.
      </p>

      <div className={`${isRemote ? 'w-64' : 'w-[500px]'} h-4 bg-slate-900 rounded-full overflow-hidden relative border border-white/5 shadow-inner p-1 animate-fade-in`} style={{ animationDelay: '0.6s' }}>
        <div className="h-full bg-[#ffb83d] origin-left animate-loading-bar shadow-[0_0_30px_rgba(255,184,61,0.8)] rounded-full relative">
           <div className="absolute inset-0 animate-shimmer"></div>
        </div>
      </div>
      
      <p className="mt-12 text-slate-700 text-[11px] uppercase tracking-[1em] font-black animate-pulse">
        REFRESHING STATION
      </p>

      {isRemote && (
        <button
          onClick={onFinish}
          className="mt-20 px-20 py-6 bg-white text-slate-900 rounded-[16px] font-[900] shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tight relative overflow-hidden group"
        >
          <div className="absolute inset-0 animate-shimmer opacity-20"></div>
          <span className="relative z-10">POST ANOTHER</span>
        </button>
      )}
      
      {!isRemote && (
        <button
          onClick={onFinish}
          className="mt-20 px-14 py-6 text-slate-400 font-[900] hover:bg-white/5 rounded-[16px] transition-all text-xs uppercase tracking-[0.4em] flex items-center gap-4 group"
        >
          <div className="w-3 h-3 bg-[#ffb83d] group-hover:rotate-180 transition-transform duration-500"></div>
          BACK TO HOME
        </button>
      )}
    </div>
  );
};

export default ThanksView;
