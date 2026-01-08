
import React, { useState } from 'react';
import Logo3 from './Logo3.tsx';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple station access code for Book Haraj 3.0
    if (password === 'haraj2025' || password === 'admin') {
      onLogin();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black text-white overflow-hidden animate-fade-in">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      <div className="mb-12 scale-75 md:scale-100">
        <Logo3 />
      </div>

      <div className="w-full max-w-sm bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2">STATION AUTH</h2>
          <p className="text-xl font-black italic tracking-tighter uppercase leading-none">Access Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER STATION PIN"
              className={`w-full bg-black/40 border-b ${error ? 'border-red-500 text-red-500' : 'border-white/10 text-white'} focus:border-white outline-none py-4 text-center font-black tracking-[0.3em] text-xs uppercase transition-all placeholder:text-white/10 rounded-xl`}
            />
            {error && (
              <p className="absolute -bottom-6 left-0 right-0 text-center text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                INVALID ACCESS CODE
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            AUTHORIZE
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em]">
            Station ID: BHRJ-ST-01
          </p>
        </div>
      </div>

      <footer className="fixed bottom-12 text-center opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[0.8em]">ADMINISTRATIVE INTERFACE ONLY</p>
      </footer>
    </div>
  );
};

export default LoginView;
