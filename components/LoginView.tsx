import React, { useState } from 'react';
import Logo3 from './Logo3.tsx';

interface LoginViewProps {
  onLogin: () => void;
  onCancel?: () => void;
  adminPin: string;
  logoUrl?: string;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onCancel, adminPin, logoUrl }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === adminPin) {
      onLogin();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-6 py-8 animate-fade-in text-[#2b241e]">
      <div className="pt-2 shrink-0 scale-75">
        <Logo3 logoUrl={logoUrl} />
      </div>

      <div className="liquid-glass w-full max-w-sm my-auto p-8 rounded-[36px] relative z-10 animate-fade-in-up">
        <div className="text-center mb-7">
          <p className="text-xs font-semibold text-[#5c5147] uppercase tracking-wider mb-1.5">
            Admin Panel Lock
          </p>
          <h2 className="text-2xl font-extrabold text-[#2b241e] tracking-tight leading-none">
            Enter Admin PIN
          </h2>
          <p className="text-xs text-[#5c5147] mt-2">
            Protected access for EDEX IISJ organizers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN..."
              className={`w-full bg-white/65 border ${error ? 'border-[#9f2d2d] text-[#9f2d2d]' : 'border-[#312922]/20 text-[#2b241e]'} focus:border-[#312922] outline-none py-4 px-5 text-center font-bold tracking-[0.35em] text-lg transition-all placeholder:text-[#6e6256]/60 placeholder:tracking-normal placeholder:text-sm rounded-2xl`}
              aria-label="Admin PIN"
            />
            {error && (
              <p className="mt-2 text-center text-xs font-semibold text-[#9f2d2d]">
                Incorrect PIN. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="liquid-cta w-full py-4 rounded-full font-bold text-sm active:scale-[0.98]"
          >
            Unlock Admin Panel
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="liquid-glass-subtle w-full py-3.5 rounded-full font-semibold text-xs text-[#2b241e] active:scale-[0.98]"
            >
              Back to Home
            </button>
          )}
        </form>
      </div>

      <footer className="pt-6 text-xs font-medium text-[#5c5147] shrink-0">
        EDEX Educational Exhibition · IISJ
      </footer>
    </div>
  );
};

export default LoginView;
