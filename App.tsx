import React, { useState, useEffect, useCallback } from 'react';
import { KioskStep, Review, DetailedRatings } from './types.ts';
import HomeView from './components/HomeView.tsx';
import CameraView from './components/CameraView.tsx';
import FormView from './components/FormView.tsx';
import ThanksView from './components/ThanksView.tsx';
import ReviewWall from './components/ReviewWall.tsx';
import Logo3 from './components/Logo3.tsx';

const STORAGE_KEY = 'book_haraj_reviews_v3';

const App: React.FC = () => {
  const [step, setStep] = useState<KioskStep>(KioskStep.HOME);
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isRemoteMode, setIsRemoteMode] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setReviews(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'display') {
      setIsDisplayMode(true);
    } else if (params.get('mode') === 'remote') {
      setIsRemoteMode(true);
      setStep(KioskStep.CAMERA);
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const resetKiosk = useCallback(() => {
    if (isRemoteMode) {
      setStep(KioskStep.CAMERA);
    } else {
      setStep(KioskStep.HOME);
    }
    setCurrentReview({});
  }, [isRemoteMode]);

  const handleStart = () => setStep(KioskStep.CAMERA);
  const handlePhotoCapture = (photo: string) => {
    setCurrentReview(prev => ({ ...prev, photo }));
    setStep(KioskStep.FORM);
  };

  const handleFormSubmit = (details: { name: string; ratings: DetailedRatings; comment: string }) => {
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      photo: currentReview.photo || '',
      ...details,
      timestamp: Date.now()
    };
    
    const updatedReviews = [newReview, ...reviews].slice(0, 50);
    setReviews(updatedReviews);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
    setStep(KioskStep.THANKS);
  };

  useEffect(() => {
    if (step === KioskStep.THANKS) {
      const timer = setTimeout(resetKiosk, 6000);
      return () => clearTimeout(timer);
    }
  }, [step, resetKiosk]);

  if (isDisplayMode) {
    return (
      <div className="h-full w-full relative kiosk-bg overflow-hidden flex flex-col text-slate-100">
        <ReviewWall reviews={reviews} fullScreen />
        
        <button 
          onClick={() => {
            setIsDisplayMode(false);
            const url = new URL(window.location.href);
            url.searchParams.delete('mode');
            window.history.pushState({}, '', url.toString());
          }}
          className="absolute top-6 right-6 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-white/10 opacity-0 hover:opacity-100 transition-opacity"
        >
          Close Wall
        </button>
      </div>
    );
  }

  return (
    <div className={`h-full w-full relative overflow-hidden select-none flex flex-col ${isRemoteMode ? 'bg-slate-950 text-white' : 'kiosk-bg text-slate-100'}`}>
      {!isRemoteMode && step === KioskStep.HOME && (
        <header className="pt-16 pb-2 w-full flex flex-col items-center z-20 flex-shrink-0 px-8">
          <Logo3 className="max-w-full" />
        </header>
      )}

      <main className={`flex-1 w-full flex items-center justify-center px-6 relative z-10 overflow-hidden ${isRemoteMode ? 'pt-4' : ''}`}>
        {step === KioskStep.HOME && (
          <HomeView 
            onStart={handleStart} 
            onToggleMode={() => {
              setIsDisplayMode(true);
              const url = new URL(window.location.href);
              url.searchParams.set('mode', 'display');
              window.history.pushState({}, '', url.toString());
            }} 
          />
        )}
        {step === KioskStep.CAMERA && (
          <CameraView onCapture={handlePhotoCapture} onCancel={resetKiosk} isRemote={isRemoteMode} />
        )}
        {step === KioskStep.FORM && (
          <FormView photo={currentReview.photo || ''} onSubmit={handleFormSubmit} onCancel={resetKiosk} isRemote={isRemoteMode} />
        )}
        {step === KioskStep.THANKS && (
          <ThanksView onFinish={resetKiosk} isRemote={isRemoteMode} />
        )}
      </main>

      {!isRemoteMode && step === KioskStep.HOME && (
        <footer className="pt-4 pb-14 w-full flex flex-col items-center z-20 flex-shrink-0">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-[#ffb83d] rounded-[1px]"></div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
               LIVE VISITOR FEED
             </div>
             <div className="w-2 h-2 bg-[#ffb83d] rounded-[1px]"></div>
           </div>
        </footer>
      )}
    </div>
  );
};

export default App;
