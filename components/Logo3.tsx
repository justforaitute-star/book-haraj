
import React from 'react';

const Logo3: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      <div className="relative">
        {/* 
            Displaying the provided logo image. 
            We apply grayscale filter to adhere to the Black and White theme.
        */}
        <img 
          src="logo.png" 
          alt="Book Haraj 3.0 Logo" 
          className="h-32 sm:h-48 md:h-64 object-contain filter grayscale contrast-125 brightness-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-700 hover:scale-[1.03]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // Show minimal text fallback if image is missing
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.fallback-text')) {
              const fallback = document.createElement('div');
              fallback.className = "fallback-text text-white font-black text-6xl italic tracking-tighter uppercase";
              fallback.innerHTML = 'BOOK HARAJ 3.0';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Logo3;
