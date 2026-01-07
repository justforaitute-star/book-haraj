
import React from 'react';

const Logo3: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      <div className="relative group">
        {/* High-fidelity SVG recreation of the Book Haraj 3.0 logo */}
        <svg 
          width="600" 
          height="200" 
          viewBox="0 0 600 200" 
          className="h-32 sm:h-48 md:h-64 object-contain drop-shadow-[0_0_50px_rgba(255,184,61,0.3)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Massive H */}
          <path d="M20 25H60V90H95V25H135V175H95V115H60V175H20V25Z" fill="white" />
          
          {/* 'BOOK' sitting at the top next to H */}
          <text x="145" y="65" fill="white" style={{ font: '900 52px Outfit, sans-serif', letterSpacing: '-2px' }}>BOOK</text>
          
          {/* 'araj' sitting below BOOK */}
          <text x="140" y="175" fill="white" style={{ font: '900 145px Outfit, sans-serif', letterSpacing: '-8px' }}>
            araj
          </text>
          
          {/* Orange square tittle for the 'j' */}
          <rect x="422" y="55" width="42" height="42" fill="#ffb83d" />
          
          {/* '3.' */}
          <text x="460" y="175" fill="white" style={{ font: '900 145px Outfit, sans-serif', letterSpacing: '-6px' }}>
            3.
          </text>
          
          {/* The '0' and its orange square accent */}
          <g transform="translate(560, 175)">
             <text x="0" y="0" fill="white" style={{ font: '900 145px Outfit, sans-serif' }}>0</text>
             <rect x="75" y="-128" width="38" height="38" fill="#ffb83d" />
          </g>
        </svg>
      </div>

      <div className="flex items-center gap-6 mt-6 opacity-40 w-full justify-center">
        <div className="h-[1px] flex-1 max-w-[80px] bg-white"></div>
        <span className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.5em] whitespace-nowrap">
          GIVE & GRAB BOOKS
        </span>
        <div className="h-[1px] flex-1 max-w-[80px] bg-white"></div>
      </div>
    </div>
  );
};

export default Logo3;
