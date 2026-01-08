
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loadingTimeoutRef = useRef<number | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (fetchError) throw fetchError;
      if (data) {
        setReviews(data as Review[]);
        setError(null);
      }
    } catch (err: any) {
      console.error("Book Haraj Kiosk: Fetch error:", err);
      if (reviews.length === 0) {
        setError(`Database Error: ${err.message || 'Could not connect'}`);
      }
    } finally {
      setLoading(false);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    }
  }, [reviews.length]);

  const handleDeleteAll = async () => {
    if (!supabase) return;
    if (!window.confirm("CRITICAL ACTION: Are you sure you want to delete ALL reviews from the database? This cannot be undone.")) return;

    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); 

      if (deleteError) throw deleteError;
      
      setReviews([]);
      alert("Feed cleared successfully.");
    } catch (err: any) {
      console.error("Delete all error:", err);
      alert(`Failed to delete reviews: ${err.message}`);
    }
  };

  useEffect(() => {
    loadingTimeoutRef.current = window.setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (reviews.length === 0 && !error) {
          setError("Database connection timed out.");
        }
      }
    }, 8000);

    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    fetchReviews();

    const pollInterval = setInterval(fetchReviews, 20000);

    try {
      const channel = supabase
        .channel('public:reviews')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          fetchReviews(); 
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        clearInterval(pollInterval);
      };
    } catch (e) {
      console.warn("Realtime error:", e);
      return () => clearInterval(pollInterval);
    }
  }, [fetchReviews]);

  useEffect(() => {
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
  }, []);

  const resetKiosk = useCallback(() => {
    setStep(KioskStep.HOME);
    setCurrentReview({});
    setIsSubmitting(false);
  }, []);

  const handleStart = () => setStep(KioskStep.CAMERA);
  
  const handlePhotoCapture = (photo: string) => {
    setCurrentReview(prev => ({ ...prev, photo }));
    setStep(KioskStep.FORM);
  };

  const handleExitDisplay = () => {
    setIsDisplayMode(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
  };

  // Helper to upload base64 to Supabase Storage
  const uploadPhotoToStorage = async (base64: string): Promise<string> => {
    if (!supabase) return '';
    
    try {
      // 1. Convert base64 to Blob
      const base64Data = base64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // 2. Generate unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`;
      
      // 3. Upload to "photos" bucket
      const { data, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 4. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error("Storage upload failed:", err);
      throw err;
    }
  };

  const handleFormSubmit = async (details: { name: string; ratings: DetailedRatings; comment: string }) => {
    if (!supabase || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let finalPhotoPath = '';
      
      // If we have a captured base64 photo, upload it to storage first
      if (currentReview.photo && currentReview.photo.startsWith('data:image')) {
        finalPhotoPath = await uploadPhotoToStorage(currentReview.photo);
      }

      const newReview: Partial<Review> = {
        name: details.name,
        photo: finalPhotoPath, // This is now a URL, not base64
        ratings: details.ratings,
        comment: details.comment,
        timestamp: Date.now()
      };
      
      const { data, error } = await supabase
        .from('reviews')
        .insert([newReview])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        setCurrentReview(data[0]);
        setStep(KioskStep.THANKS);
        fetchReviews();
      }
    } catch (err: any) {
      alert(`Submission failed: ${err.message || 'Check your internet connection'}`);
      setIsSubmitting(false);
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
      <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center bg-black text-white">
        <h1 className="text-2xl font-black uppercase mb-4">Connection Required</h1>
        <p className="text-slate-400 mb-8">Database credentials missing.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-black rounded-xl font-bold uppercase text-[11px] tracking-widest">Retry</button>
      </div>
    );
  }

  if (error && reviews.length === 0 && !loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center bg-black text-white">
        <h2 className="text-xl font-black uppercase mb-2">Database Error</h2>
        <p className="text-slate-500 text-xs mb-8 max-w-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Refresh</button>
      </div>
    );
  }

  if (isDisplayMode) {
    return (
      <div className="h-full w-full relative kiosk-bg overflow-hidden flex flex-col text-white">
        <ReviewWall 
          reviews={reviews} 
          fullScreen 
          singleReviewId={singleReviewId} 
          onDeleteAll={handleDeleteAll}
          onExit={handleExitDisplay}
        />
      </div>
    );
  }

  return (
    <div className={`h-full w-full relative overflow-hidden select-none flex flex-col ${isRemoteMode ? 'bg-black text-white' : 'kiosk-bg text-white'}`}>
      {!isRemoteMode && step === KioskStep.HOME && (
        <header className="pt-16 pb-2 w-full flex flex-col items-center z-20 flex-shrink-0 px-8">
          <Logo3 className="max-w-full" />
        </header>
      )}

      <main className="flex-1 w-full flex items-center justify-center px-6 relative z-10 overflow-hidden">
        {loading || isSubmitting ? (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            {isSubmitting && <p className="text-xs font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">Uploading Story...</p>}
          </div>
        ) : (
          <>
            {step === KioskStep.HOME && <HomeView onStart={handleStart} onToggleMode={() => setIsDisplayMode(true)} />}
            {step === KioskStep.CAMERA && <CameraView onCapture={handlePhotoCapture} onCancel={resetKiosk} isRemote={isRemoteMode} />}
            {step === KioskStep.FORM && <FormView photo={currentReview.photo || ''} onSubmit={handleFormSubmit} onCancel={resetKiosk} isRemote={isRemoteMode} />}
            {step === KioskStep.THANKS && <ThanksView onFinish={resetKiosk} isRemote={isRemoteMode} reviewId={currentReview.id} />}
          </>
        )}
      </main>

      {!isRemoteMode && step === KioskStep.HOME && (
        <footer className="pt-4 pb-14 w-full flex flex-col items-center z-20 flex-shrink-0">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-white rounded-[1px]"></div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
               LIVE VISITOR FEED • {reviews.length} POSTS
             </div>
             <div className="w-2 h-2 bg-white rounded-[1px]"></div>
           </div>
        </footer>
      )}
    </div>
  );
};

export default App;
