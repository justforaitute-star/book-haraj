
import React from 'react';

const Logo3: React.FC<{ className?: string; logoUrl?: string }> = ({ className = "", logoUrl = "logo.png" }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      <div className="relative">
        <img 
          src={logoUrl} 
          alt="Book Haraj Logo" 
          className="h-32 sm:h-48 md:h-64 object-contain filter grayscale contrast-125 brightness-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform duration-700 hover:scale-[1.03]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Only try to fallback once to avoid infinite error loop
            if (!target.src.endsWith('logo.png')) {
               target.src = 'logo.png';
            } else {
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback-text')) {
                const fallback = document.createElement('div');
                fallback.className = "fallback-text text-white font-black text-6xl italic tracking-tighter uppercase";
                fallback.innerHTML = 'BOOK HARAJ';
                parent.appendChild(fallback);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Logo3;
