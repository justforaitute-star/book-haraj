import React from 'react';
import Logo3 from './Logo3.tsx';

interface RemoteWelcomeViewProps {
  logoUrl?: string;
  onStart: () => void;
  onViewFeed: () => void;
}

const RemoteWelcomeView: React.FC<RemoteWelcomeViewProps> = ({
  logoUrl,
  onStart,
  onViewFeed
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-6 py-8 animate-fade-in text-[#2b241e]">
      <div className="pt-2 shrink-0 scale-75">
        <Logo3 logoUrl={logoUrl} />
      </div>

      <div className="liquid-glass w-full max-w-sm my-auto p-7 rounded-[36px] flex flex-col items-center text-center animate-fade-in-up">
        <p className="text-xs text-[#5c5147] font-semibold mb-3 tracking-wide uppercase">
          Mobile Review · One per phone
        </p>

        <h1 className="text-3xl font-extrabold editorial-gradient-text tracking-tight leading-tight mb-3">
          Share Your Visit
        </h1>
        <p className="text-sm text-[#5c5147] leading-relaxed mb-7">
          Rate your EDEX Educational Exhibition experience at IISJ right from your phone. One review is allowed per device.
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={onStart}
            className="liquid-cta w-full py-4 rounded-full font-bold text-base active:scale-[0.98]"
          >
            Start My Review
          </button>

          <button
            onClick={onViewFeed}
            className="liquid-glass-subtle w-full py-3.5 text-[#2b241e] rounded-full font-semibold text-xs active:scale-[0.98]"
          >
            View Live Feed
          </button>
        </div>
      </div>

      <footer className="pt-4 text-xs font-medium text-[#5c5147] shrink-0">
        EDEX Educational Exhibition · IISJ
      </footer>
    </div>
  );
};

export default RemoteWelcomeView;
