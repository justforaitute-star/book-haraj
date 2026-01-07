
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
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('reviews')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);
        
        if (fetchError) throw fetchError;
        if (data) setReviews(data as Review[]);
      } catch (err: any) {
        console.error("Fetch error:", err);
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

  if (!isConfigured) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center bg-[#020617]">
        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 border border-amber-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Configuration Not Found</h1>
        <div className="text-slate-400 max-w-sm text-sm leading-relaxed mb-8 space-y-6">
          <p>The application is running but cannot find your database credentials. This usually means the environment variables were not available when the app was built.</p>
          
          <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl text-left">
            <h4 className="text-slate-200 font-black text-[10px] uppercase tracking-widest mb-3">Checklist for Dokploy:</h4>
            <ul className="text-[11px] text-slate-400 space-y-3 font-medium">
              <li className="flex gap-2">
                <span className="text-[#ffb83d]">01.</span> 
                <span>Verify keys are named <code className="text-white">VITE_SUPABASE_URL</code> and <code className="text-white">VITE_SUPABASE_ANON_KEY</code>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#ffb83d]">02.</span> 
                <span>Go to Deployments and click <b>Redeploy</b> (this is mandatory after changing keys).</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="text-[#ffb83d] text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4"
            >
              {showDiagnostics ? 'Hide Diagnostic Data' : 'View Diagnostic Data'}
            </button>
            
            {showDiagnostics && (
              <div className="mt-4 p-4 bg-black rounded-xl text-left font-mono text-[9px] text-slate-500 overflow-x-auto border border-white/5 animate-fade-in">
                <div>User Agent: {navigator.userAgent}</div>
                <div>Configured: {String(isConfigured)}</div>
                <div className="mt-2 text-white/50 border-t border-white/5 pt-2">Resolution Checks:</div>
                <div className="text-amber-500/70">
                  - import.meta.env detection: {
                    (() => {
                      try { return String(!!((import.meta as any).env?.VITE_SUPABASE_URL)) }
                      catch(e) { return 'N/A' }
                    })()
                  }<br/>
                  - window object keys: {
                    Object.keys(window).filter(k => k.includes('SUPABASE')).join(', ') || 'None'
                  }<br/>
                  - process.env status: {typeof process !== 'undefined' ? 'Available' : 'Missing'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:scale-105 transition-transform">
            Refresh & Retry
          </button>
        </div>
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
