
import React, { useState, useEffect, useCallback } from 'react';
import { KioskStep, Review, DetailedRatings } from './types.ts';
import HomeView from './components/HomeView.tsx';
import CameraView from './components/CameraView.tsx';
import FormView from './components/FormView.tsx';
import ThanksView from './components/ThanksView.tsx';
import ReviewWall from './components/ReviewWall.tsx';
import Logo3 from './components/Logo3.tsx';
import { supabase, isConfigured } from './lib/supabase.ts';

const App: React.FC = () => {
  const [step, setStep] = useState<KioskStep>(KioskStep.HOME);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [singleReviewId, setSingleReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        const { data, fetchError } = await supabase
          .from('reviews')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);
        
        if (fetchError) throw fetchError;
        if (data) setReviews(data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        // If the table doesn't exist yet, we don't crash, just show empty
        if (err.code !== 'PGRST116') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();

    const channel = supabase
      .channel('public:reviews')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
        const newReview = payload.new as Review;
        setReviews(prev => [newReview, ...prev].slice(0, 50));
      })
      .subscribe();

    // URL Routing
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'display') {
      setIsDisplayMode(true);
    } else if (params.get('mode') === 'review') {
      setIsDisplayMode(true);
      setSingleReviewId(params.get('id'));
    } else if (params.get('mode') === 'remote') {
      setIsRemoteMode(true);
      setStep(KioskStep.CAMERA);
    }

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleFormSubmit = async (details: { name: string; ratings: DetailedRatings; comment: string }) => {
    if (!supabase) return;

    const newReview: Partial<Review> = {
      name: details.name,
      photo: currentReview.photo || '',
      ratings: details.ratings,
      comment: details.comment,
      timestamp: Date.now()
    };
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([newReview])
      .select();

    if (error) {
      console.error("Error saving review:", error);
      alert("Failed to save review. Please check your database connection.");
      return;
    }

    if (data && data[0]) {
      setCurrentReview(data[0]);
      setStep(KioskStep.THANKS);
    }
  };

  useEffect(() => {
    if (step === KioskStep.THANKS) {
      const timer = setTimeout(resetKiosk, 12000);
      return () => clearTimeout(timer);
    }
  }, [step, resetKiosk]);

  // Handle Missing Configuration
  if (!isConfigured) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center bg-[#020617]">
        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 border border-amber-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Configuration Required</h1>
        <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-8">
          The application is missing its connection to the database. Please add <code className="text-[#ffb83d]">SUPABASE_URL</code> and <code className="text-[#ffb83d]">SUPABASE_ANON_KEY</code> to your Dokploy environment variables.
        </p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:scale-105 transition-transform">
          Refresh Page
        </button>
      </div>
    );
  }

  if (isDisplayMode) {
    return (
      <div className="h-full w-full relative kiosk-bg overflow-hidden flex flex-col text-slate-100">
        <ReviewWall reviews={reviews} fullScreen singleReviewId={singleReviewId} />
        
        <button 
          onClick={() => {
            setIsDisplayMode(false);
            setSingleReviewId(null);
            const url = new URL(window.location.href);
            url.searchParams.delete('mode');
            url.searchParams.delete('id');
            window.history.pushState({}, '', url.toString());
          }}
          className="absolute top-6 right-6 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-white/10 opacity-0 hover:opacity-100 transition-opacity"
        >
          {singleReviewId ? 'Close Review' : 'Close Wall'}
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
        {loading ? (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-[#ffb83d] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connecting to Haraj 3.0...</p>
          </div>
        ) : (
          <>
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
              <ThanksView onFinish={resetKiosk} isRemote={isRemoteMode} reviewId={currentReview.id} />
            )}
          </>
        )}
      </main>

      {!isRemoteMode && step === KioskStep.HOME && (
        <footer className="pt-4 pb-14 w-full flex flex-col items-center z-20 flex-shrink-0">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-[#ffb83d] rounded-[1px]"></div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
               LIVE VISITOR FEED • {reviews.length} POSTS
             </div>
             <div className="w-2 h-2 bg-[#ffb83d] rounded-[1px]"></div>
           </div>
        </footer>
      )}
    </div>
  );
};

export default App;
