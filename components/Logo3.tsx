
import React, { useState, useEffect } from 'react';

const Logo3: React.FC<{ className?: string; logoUrl?: string }> = ({ className = "", logoUrl = "" }) => {
  const [error, setError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(logoUrl);

  // Sync currentUrl with logoUrl prop when it changes
  useEffect(() => {
    setError(false);
    setCurrentUrl(logoUrl);
  }, [logoUrl]);

  // Determine if we should even attempt to load an image
  const shouldAttemptImage = currentUrl && currentUrl.trim().length > 0 && currentUrl !== 'logo.png';

  return (
    <div className={`flex flex-col items-center select-none ${className} animate-fade-in`}>
      <div className="relative flex items-center justify-center">
        {!error && shouldAttemptImage ? (
          <img 
            src={currentUrl} 
            alt="IISJ EDEX Logo" 
            className="h-32 sm:h-48 md:h-64 object-contain drop-shadow-[0_10px_28px_rgba(26,22,18,0.12)] transition-all duration-700 hover:scale-[1.03]"
            onError={() => {
              console.warn("Logo image failed to load, falling back to text.");
              setError(true);
            }}
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="font-display text-[#2b241e] font-extrabold text-4xl sm:text-6xl tracking-tight leading-none">
              EDEX <span className="text-[#6e6256]">IISJ</span>
            </div>
            <div className="mt-2.5 h-px w-24 bg-gradient-to-r from-transparent via-[#312922]/35 to-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo3;
