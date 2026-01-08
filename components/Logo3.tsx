
import React, { useState, useEffect } from 'react';

const Logo3: React.FC<{ className?: string; logoUrl?: string }> = ({ className = "", logoUrl = "logo.png" }) => {
  const [error, setError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(logoUrl);

  // Sync currentUrl with logoUrl prop when it changes
  useEffect(() => {
    setError(false);
    setCurrentUrl(logoUrl);
  }, [logoUrl]);

  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      <div className="relative flex items-center justify-center">
        {!error && currentUrl ? (
          <img 
            src={currentUrl} 
            alt="Station Logo" 
            className="h-32 sm:h-48 md:h-64 object-contain transition-all duration-700 hover:scale-[1.03]"
            onError={() => {
              console.error("Logo failed to load:", currentUrl);
              // Only fallback to BOOK HARAJ text if even the default logo.png fails
              if (currentUrl !== 'logo.png') {
                setCurrentUrl('logo.png');
              } else {
                setError(true);
              }
            }}
          />
        ) : (
          <div className="text-white font-black text-4xl sm:text-6xl italic tracking-tighter uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] animate-pulse">
            BOOK HARAJ
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo3;
