
import React, { useState } from 'react';

const Logo3: React.FC<{ className?: string; logoUrl?: string }> = ({ className = "", logoUrl = "logo.png" }) => {
  const [error, setError] = useState(false);

  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      <div className="relative flex items-center justify-center">
        {!error ? (
          <img 
            src={logoUrl} 
            alt="Station Logo" 
            className="h-32 sm:h-48 md:h-64 object-contain transition-transform duration-700 hover:scale-[1.03]"
            onError={() => {
              // If the current logoUrl fails and it's not the default logo.png, try the default
              if (logoUrl !== 'logo.png') {
                // We'll let the error state handle it if the second attempt fails too
                setError(true);
              } else {
                setError(true);
              }
            }}
          />
        ) : (
          <div className="text-white font-black text-4xl sm:text-6xl italic tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            BOOK HARAJ
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo3;
