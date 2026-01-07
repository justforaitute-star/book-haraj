
import React from 'react';

const Logo3: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      <div className="relative group">
        {/* Using the image provided by the user. Ensure the file is named logo.png in the project root. */}
        <img 
          src="logo.png" 
          alt="Book Haraj 3.0 Logo" 
          className="h-32 sm:h-48 md:h-64 object-contain drop-shadow-[0_0_40px_rgba(255,184,61,0.25)] transition-transform duration-500 group-hover:scale-[1.02]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // Show fallback only if image fails
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.fallback-text')) {
              const fallback = document.createElement('div');
              fallback.className = "fallback-text text-white font-black text-5xl italic tracking-tighter uppercase";
              fallback.innerHTML = 'BOOK <span class="text-[#ffb83d]">HARAJ</span> 3.0';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>

      <div className="flex items-center gap-6 mt-8 opacity-30 w-full justify-center">
        <div className="h-[1px] flex-1 max-w-[60px] bg-white"></div>
        <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-[0.6em] whitespace-nowrap">
          GIVE & GRAB BOOKS
        </span>
        <div className="h-[1px] flex-1 max-w-[60px] bg-white"></div>
      </div>
    </div>
  );
};

export default Logo3;
