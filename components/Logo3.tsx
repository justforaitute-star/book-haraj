import React from 'react';

const Logo3: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      {/* Main Brand Layout */}
      <div className="flex items-end justify-center font-[900] text-white tracking-tighter uppercase italic">
        
        {/* Large H */}
        <div className="text-[120px] md:text-[180px] leading-[0.75] not-italic font-black -mr-1">H</div>
        
        {/* Stacked BOOK + araj */}
        <div className="flex flex-col items-start mb-2 md:mb-4">
          <div className="text-[32px] md:text-[50px] leading-none tracking-widest not-italic mb-[-2px] ml-1">
            BOOK
          </div>
          <div className="relative text-[75px] md:text-[115px] leading-[0.8] not-italic lowercase -ml-1 flex items-baseline">
            <span>ara</span>
            {/* 
                Relative container for the 'j' part. 
                We use a dotless 'j' (ȷ) to avoid the font's default dot.
                The box is centered horizontally relative to the 'j' container.
            */}
            <span className="relative inline-flex justify-center">
              ȷ
              {/* 
                  Yellow/Orange Box:
                  - top: Positioned above the character
                  - left-1/2 -translate-x-[30%]: Precisely aligned to the center of the slanted j stem
              */}
              <div className="absolute -top-[14px] md:-top-[22px] left-1/2 -translate-x-[30%] w-[16px] h-[16px] md:w-[24px] md:h-[24px] bg-[#ffb83d] rounded-[1px] shadow-[0_0_25px_rgba(255,184,61,0.5)] z-10"></div>
            </span>
          </div>
        </div>

        {/* 3.0 Versioning */}
        <div className="relative text-[90px] md:text-[145px] leading-[0.8] not-italic ml-1 mb-[-2px] md:mb-[-4px]">
          3.0
          {/* Orange square on the top right of the '0' - precisely sized and placed */}
          <div className="absolute top-1 -right-1 md:top-3 md:-right-2 w-[12px] h-[12px] md:w-[20px] md:h-[20px] bg-[#ffb83d] rounded-[1px] shadow-[0_0_15px_rgba(255,184,61,0.3)]"></div>
        </div>
      </div>

      {/* Give & Grab Books Tagline */}
      <div className="flex items-center gap-6 mt-4 opacity-50 w-full justify-center">
        <div className="h-[2px] flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-white"></div>
        <span className="text-[10px] md:text-[13px] font-black text-white uppercase tracking-[0.8em] whitespace-nowrap">
          give & grab books
        </span>
        <div className="h-[2px] flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-white"></div>
      </div>
    </div>
  );
};

export default Logo3;