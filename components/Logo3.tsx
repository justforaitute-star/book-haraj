
import React from 'react';

const Logo3: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      {/* 
        User requested to use the provided image as the logo. 
        Assuming the image is saved as 'logo.png' in the root directory.
      */}
      <div className="relative group">
        <img 
          src="logo.png" 
          alt="Book Haraj 3.0 Logo" 
          className="h-32 sm:h-48 md:h-64 object-contain drop-shadow-[0_0_30px_rgba(255,184,61,0.2)]"
          onError={(e) => {
            // Fallback text if logo.png is missing
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = "text-white font-black text-6xl italic uppercase tracking-tighter";
              fallback.innerHTML = 'BOOK <span class="text-[#ffb83d]">HARAJ</span> 3.0';
              parent.appendChild(fallback);
            }
          }}
        />
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
