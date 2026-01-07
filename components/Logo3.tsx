
import React from 'react';

const Logo3: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      <div className="flex items-end justify-center font-[900] text-white tracking-tighter uppercase italic">
        <div className="text-[100px] sm:text-[140px] md:text-[180px] leading-[0.75] not-italic font-black -mr-1">H</div>
        <div className="flex flex-col items-start mb-2 md:mb-4">
          <div className="text-[20px] sm:text-[32px] md:text-[44px] leading-none tracking-[0.1em] not-italic mb-[-2px] ml-1 font-bold">
            BOOK
          </div>
          <div className="relative text-[60px] sm:text-[90px] md:text-[115px] leading-[0.8] not-italic lowercase -ml-1 flex items-baseline">
            <span>ara</span>
            <span className="relative inline-flex justify-center">
              ȷ
              <div className="absolute -top-[12px] sm:-top-[18px] md:-top-[22px] left-1/2 -translate-x-[30%] w-[12px] h-[12px] sm:w-[18px] sm:h-[18px] md:w-[24px] md:h-[24px] bg-[#ffb83d] rounded-[1px] shadow-[0_0_20px_rgba(255,184,61,0.5)] z-10"></div>
            </span>
          </div>
        </div>
        <div className="relative text-[70px] sm:text-[110px] md:text-[145px] leading-[0.8] not-italic ml-1 mb-[-2px] md:mb-[-4px]">
          3.0
          <div className="absolute top-1 -right-1 md:top-3 md:-right-2 w-[8px] h-[8px] sm:w-[14px] sm:h-[14px] md:w-[20px] md:h-[20px] bg-[#ffb83d] rounded-[1px] opacity-80"></div>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-8 opacity-50 w-full justify-center">
        <div className="h-[1px] flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-white"></div>
        <span className="text-[10px] md:text-[12px] font-bold text-white uppercase tracking-[0.4em] whitespace-nowrap">
          GIVE & GRAB BOOKS
        </span>
        <div className="h-[1px] flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-white"></div>
      </div>
    </div>
  );
};

export default Logo3;
