
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
            alt="Station Logo" 
            className="h-32 sm:h-48 md:h-64 object-contain transition-all duration-700 hover:scale-[1.03]"
            onError={() => {
              console.warn("Logo image failed to load, falling back to text.");
              setError(true);
            }}
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-white font-black text-4xl sm:text-7xl italic tracking-tighter uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] leading-none">
              REVIEW <span className="text-yellow-500">APP</span>
            </div>
            <div className="mt-2 h-1 w-24 bg-white/20 rounded-full overflow-hidden">
               <div className="h-full bg-white animate-loading-bar origin-left"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo3;
