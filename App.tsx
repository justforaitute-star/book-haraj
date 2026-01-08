
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskStep, Review, DetailedRatings } from './types.ts';
import HomeView from './components/HomeView.tsx';
import CameraView from './components/CameraView.tsx';
import FormView from './components/FormView.tsx';
import ThanksView from './components/ThanksView.tsx';
import ReviewWall from './components/ReviewWall.tsx';
import GalleryView from './components/GalleryView.tsx';
import Logo3 from './components/Logo3.tsx';
import { supabase, isConfigured } from './lib/supabase.ts';

const PHOTOPRISM_URL = process.env.PHOTOPRISM_URL || 'https://photoprism.example.com';
const PHOTOPRISM_API_KEY = process.env.PHOTOPRISM_API_KEY || '';

const App: React.FC = () => {
  const [step, setStep] = useState<KioskStep>(KioskStep.HOME);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [singleReviewId, setSingleReviewId] = useState<string | null>(null);
  const [galleryFaceId, setGalleryFaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loadingTimeoutRef = useRef<number | null>(null);

  // PhotoPrism Face Recognition Logic
  const identifyFaceWithPhotoPrism = async (base64Photo: string): Promise<string> => {
    if (!PHOTOPRISM_API_KEY) return 'GUEST_ID';
    
    try {
      const base64Data = base64Photo.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/jpeg' });

      // 1. Upload to PhotoPrism
      const formData = new FormData();
      formData.append('file', blob, `kiosk_${Date.now()}.jpg`);
      
      const uploadRes = await fetch(`${PHOTOPRISM_URL}/api/v1/import/upload`, {
        method: 'POST',
        headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY },
        body: formData
      });
      
      if (!uploadRes.ok) throw new Error('PhotoPrism Upload Failed');

      // 2. Trigger Indexing
      await fetch(`${PHOTOPRISM_URL}/api/v1/index`, {
        method: 'POST',
        headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/', cleanup: false })
      });

      // 3. Wait slightly for processing and search for the latest marker
      // Note: In a production app, you'd poll until markers appear.
      await new Promise(r => setTimeout(r, 2000));
      
      const searchRes = await fetch(`${PHOTOPRISM_URL}/api/v1/photos?count=1&order=added`, {
        headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY }
      });
      const searchData = await searchRes.json();
      
      // Extract SubjectUID (the Face ID) from the markers of the most recent photo
      if (searchData && searchData[0] && searchData[0].Subjects && searchData[0].Subjects.length > 0) {
        return searchData[0].Subjects[0].UID;
      }

      return 'GUEST_ID';
    } catch (err) {
      console.error("PhotoPrism Recognition Error:", err);
      return 'ERR_RECOGNITION';
    }
  };

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
      console.error("Fetch error:", err);
      if (reviews.length === 0) setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    }
  }, [reviews.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'display') {
      setIsDisplayMode(true);
    } else if (params.get('mode') === 'gallery') {
      const fid = params.get('faceId');
      if (fid) {
        setGalleryFaceId(fid);
        setStep(KioskStep.GALLERY);
      }
    } else if (params.get('mode') === 'remote') {
      setIsRemoteMode(true);
      setStep(KioskStep.CAMERA);
    }
    
    fetchReviews();
  }, [fetchReviews]);

  const resetKiosk = useCallback(() => {
    setStep(KioskStep.HOME);
    setCurrentReview({});
    setIsSubmitting(false);
    setGalleryFaceId(null);
  }, []);

  const uploadPhotoToStorage = async (base64: string): Promise<string> => {
    if (!supabase) return '';
    const base64Data = base64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/jpeg' });
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, blob);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleFormSubmit = async (details: { name: string; ratings: DetailedRatings; comment: string }) => {
    if (!supabase || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const rawPhoto = currentReview.photo || '';
      // Step 1: Sync with PhotoPrism to get facial identification
      // Step 2: Store in Supabase for the wall
      const [faceId, photoUrl] = await Promise.all([
        identifyFaceWithPhotoPrism(rawPhoto),
        uploadPhotoToStorage(rawPhoto)
      ]);

      const newReview: Partial<Review> = {
        name: details.name,
        photo: photoUrl,
        face_id: faceId, // This is now the PhotoPrism Subject UID
        ratings: details.ratings,
        comment: details.comment,
        timestamp: Date.now()
      };
      
      const { data, error } = await supabase.from('reviews').insert([newReview]).select();
      if (error) throw error;
      if (data && data[0]) {
        setCurrentReview(data[0]);
        setStep(KioskStep.THANKS);
        fetchReviews();
      }
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  if (step === KioskStep.GALLERY && galleryFaceId) {
    return <GalleryView faceId={galleryFaceId} reviews={reviews} onBack={resetKiosk} />;
  }

  if (isDisplayMode) {
    return (
      <div className="h-full w-full relative kiosk-bg overflow-hidden flex flex-col text-white">
        <ReviewWall reviews={reviews} fullScreen singleReviewId={singleReviewId} onExit={() => setIsDisplayMode(false)} />
      </div>
    );
  }

  return (
    <div className={`h-full w-full relative overflow-hidden flex flex-col ${isRemoteMode ? 'bg-black text-white' : 'kiosk-bg text-white'}`}>
      {!isRemoteMode && step === KioskStep.HOME && (
        <header className="pt-16 pb-2 w-full flex flex-col items-center z-20 flex-shrink-0">
          <Logo3 />
        </header>
      )}

      <main className="flex-1 w-full flex items-center justify-center relative z-10 overflow-hidden">
        {isSubmitting ? (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
             <div className="w-20 h-20 relative">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white animate-pulse">Consulting PhotoPrism Engine...</p>
          </div>
        ) : (
          <>
            {step === KioskStep.HOME && <HomeView onStart={() => setStep(KioskStep.CAMERA)} onToggleMode={() => setIsDisplayMode(true)} />}
            {step === KioskStep.CAMERA && <CameraView onCapture={(p) => { setCurrentReview({ photo: p }); setStep(KioskStep.FORM); }} onCancel={resetKiosk} isRemote={isRemoteMode} />}
            {step === KioskStep.FORM && <FormView photo={currentReview.photo || ''} onSubmit={handleFormSubmit} onCancel={resetKiosk} isRemote={isRemoteMode} />}
            {step === KioskStep.THANKS && <ThanksView onFinish={resetKiosk} isRemote={isRemoteMode} reviewId={currentReview.id} faceId={currentReview.face_id} />}
          </>
        )}
      </main>

      {!isRemoteMode && step === KioskStep.HOME && (
        <footer className="pb-12 w-full flex flex-col items-center opacity-40">
           <p className="text-[9px] font-black tracking-[0.5em] uppercase italic">Powered by PhotoPrism AI</p>
        </footer>
      )}
    </div>
  );
};

export default App;
