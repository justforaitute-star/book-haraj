import React, { useMemo, useState, useEffect } from 'react';

interface ThanksViewProps {
  onFinish: () => void;
  onViewFeed?: () => void;
  isRemote?: boolean;
  faceId?: string;
  faceIdEnabled?: boolean;
}

const ThanksView: React.FC<ThanksViewProps> = ({ onFinish, onViewFeed, isRemote = false, faceId, faceIdEnabled = true }) => {
  const [qrTick, setQrTick] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setQrTick(Date.now());
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isRemote) return;
    const timer = setTimeout(() => {
      onFinish();
    }, 15000);
    return () => clearTimeout(timer);
  }, [isRemote, onFinish]);

  const personalizedUrl = useMemo(() => {
    if (!faceId || !faceIdEnabled) return null;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('mode', 'gallery');
    url.searchParams.set('faceId', faceId);
    return url.toString();
  }, [faceId, faceIdEnabled]);

  const qrCodeImageUrl = useMemo(() => {
    if (!personalizedUrl) return null;
    const dynamicUrl = `${personalizedUrl}${personalizedUrl.includes('?') ? '&' : '?'}salt=${qrTick}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(dynamicUrl)}&bgcolor=ffffff&color=2b241e&margin=2`;
  }, [personalizedUrl, qrTick]);

  const copyToClipboard = () => {
    if (personalizedUrl) {
      navigator.clipboard.writeText(personalizedUrl);
      alert("Gallery link copied to clipboard!");
    }
  };

  return (
    <div className="text-center flex flex-col items-center px-6 animate-fade-in max-w-sm mx-auto overflow-y-auto no-scrollbar py-8 text-[#2b241e]">
      <div className={`liquid-cta mb-6 ${isRemote ? 'w-14 h-14' : 'w-20 h-20'} rounded-[22px] flex items-center justify-center animate-fade-in-up`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-[#f7f3ec]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className={`${isRemote ? 'text-3xl' : 'text-4xl'} font-extrabold text-[#2b241e] tracking-tight leading-none mb-2`}>
        Moment Saved
      </h2>

      <p className="text-sm text-[#5c5147] mb-7">
        Thank you for sharing your EDEX IISJ review
      </p>

      {faceIdEnabled && faceId && personalizedUrl && qrCodeImageUrl ? (
        <div className="liquid-glass flex flex-col items-center gap-5 p-6 rounded-[36px] relative w-full animate-fade-in mb-7">
          <div className="relative p-3 bg-white rounded-[22px] overflow-hidden shadow-md border border-[#312922]/10">
            <img key={qrTick} src={qrCodeImageUrl} alt="Personal Gallery" className={`${isRemote ? 'w-44 h-44' : 'w-56 h-56'} animate-fade-in`} />
          </div>

          <div className="text-center w-full">
            <h4 className="text-[#2b241e] text-sm font-bold mb-2">Scan for Photo History</h4>

            <button
              type="button"
              onClick={copyToClipboard}
              className="liquid-glass-subtle w-full rounded-2xl p-3 text-left active:scale-[0.98]"
            >
              <p className="text-[11px] text-[#2b241e] font-mono break-all line-clamp-2">
                {personalizedUrl}
              </p>
              <p className="text-[11px] text-[#5c5147] font-medium mt-1">Tap to copy gallery link</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="liquid-glass p-6 rounded-[32px] w-full mb-7">
          <p className="text-sm font-bold text-[#2b241e]">Submission Complete</p>
          <p className="text-xs text-[#5c5147] mt-1">Thank you for visiting EDEX at IISJ.</p>
        </div>
      )}

      {isRemote ? (
        <div className="w-full space-y-2.5">
          <p className="text-xs text-[#5c5147] font-semibold mb-2">
            One review per phone · Saved
          </p>
          {onViewFeed && (
            <button onClick={onViewFeed} className="liquid-cta w-full py-4 rounded-full font-bold text-sm active:scale-[0.98]">
              View Live Feed
            </button>
          )}
          <button onClick={onFinish} className="liquid-glass-subtle w-full py-3.5 text-[#2b241e] rounded-full font-semibold text-xs active:scale-[0.98]">
            View My Submission
          </button>
        </div>
      ) : (
        <>
          <div className="w-full h-1.5 bg-[#312922]/15 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#312922] origin-left animate-loading-bar"></div>
          </div>

          <p className="text-[#5c5147] font-medium text-xs mb-6">Resetting station automatically</p>

          <button onClick={onFinish} className="liquid-cta w-full py-4 rounded-full font-bold text-sm active:scale-[0.98]">
            Back to Home
          </button>
        </>
      )}
    </div>
  );
};

export default ThanksView;
