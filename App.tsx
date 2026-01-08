
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskStep, Review, DetailedRatings } from './types.ts';
import HomeView from './components/HomeView.tsx';
import CameraView from './components/CameraView.tsx';
import FormView from './components/FormView.tsx';
import ThanksView from './components/ThanksView.tsx';
import ReviewWall from './components/ReviewWall.tsx';
import GalleryView from './components/GalleryView.tsx';
import Logo3 from './components/Logo3.tsx';
import { supabase } from './lib/supabase.ts';

const getEnv = (key: string): string => {
  const searchKeys = [`VITE_${key}`, key, `REACT_APP_${key}`, `PUBLIC_${key}`];
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      for (const sk of searchKeys) if (metaEnv[sk]) return metaEnv[sk];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      for (const sk of searchKeys) if ((process.env as any)[sk]) return (process.env as any)[sk];
    }
  } catch (e) {}
  return '';
};

const PHOTOPRISM_URL = getEnv('PHOTOPRISM_URL') || 'https://photoprism.example.com';
const PHOTOPRISM_API_KEY = getEnv('PHOTOPRISM_API_KEY') || '';

const App: React.FC = () => {
  const [step, setStep] = useState<KioskStep>(KioskStep.HOME);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [galleryFaceId, setGalleryFaceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  
  const fetchReviews = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      if (fetchError) throw fetchError;
      if (data) setReviews(data as Review[]);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

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

  // PhotoPrism Face Recognition Polling
  const identifyFaceWithPhotoPrism = async (base64Photo: string): Promise<string> => {
    if (!PHOTOPRISM_API_KEY) return 'GUEST_ID';
    
    try {
      const baseUrl = PHOTOPRISM_URL.replace(/\/$/, '');
      setSubmissionStatus('Connecting to AI Engine...');
      
      const base64Data = base64Photo.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const blob = new Blob([byteNumbers], { type: 'image/jpeg' });

      // 1. Upload to Import Folder
      const formData = new FormData();
      formData.append('file', blob, `kiosk_${Date.now()}.jpg`);
      await fetch(`${baseUrl}/api/v1/import/upload`, {
        method: 'POST',
        headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY },
        body: formData
      });

      // 2. Trigger Indexing
      setSubmissionStatus('Scanning Face Signature...');
      await fetch(`${baseUrl}/api/v1/index`, {
        method: 'POST',
        headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/', cleanup: false })
      });

      // 3. Poll for the specific SubjectUID (Markers)
      // We check for several seconds to allow the recognition cluster to update
      for (let i = 0; i < 8; i++) {
        setSubmissionStatus(`Authenticating Face (${i+1}/8)...`);
        await new Promise(r => setTimeout(r, 2000));
        
        const res = await fetch(`${baseUrl}/api/v1/photos?count=15&order=added`, {
          headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY }
        });
        const photos = await res.json();
        
        if (Array.isArray(photos)) {
          // Look for any photo processed in the last batch with a face marker
          for (const p of photos) {
            if (p.Markers && Array.isArray(p.Markers)) {
              const marker = p.Markers.find((m: any) => m.SubjectUID && m.Type === 'face');
              if (marker) return marker.SubjectUID;
            }
          }
        }
      }
      // If no face found, generate a persistent guest ID based on time
      return `GUEST_${Date.now().toString(36).toUpperCase()}`;
    } catch (err) {
      console.error("PhotoPrism identification error:", err);
      return 'GUEST_ID';
    }
  };

  const uploadToSupabase = async (base64: string): Promise<string> => {
    if (!supabase) return '';
    const base64Data = base64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([byteNumbers], { type: 'image/jpeg' });
    const fileName = `${Date.now()}_review.jpg`;
    await supabase.storage.from('photos').upload(fileName, blob);
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleFormSubmit = async (details: { name: string; ratings: DetailedRatings; comment: string }) => {
    if (!supabase || isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionStatus('Initializing...');

    try {
      const rawPhoto = currentReview.photo || '';
      // Step 1: AI Analysis & DB Storage in parallel
      const [faceId, photoUrl] = await Promise.all([
        identifyFaceWithPhotoPrism(rawPhoto),
        uploadToSupabase(rawPhoto)
      ]);

      const newReview = {
        name: details.name,
        photo: photoUrl,
        face_id: faceId,
        ratings: details.ratings,
        comment: details.comment,
        timestamp: Date.now()
      };

      setSubmissionStatus('Saving Memory...');
      const { data, error } = await supabase.from('reviews').insert([newReview]).select();
      
      if (error) {
        // Fallback for missing column schema cache
        const fallbackReview = { ...newReview };
        delete (fallbackReview as any).face_id;
        const { data: fbData, error: fbError } = await supabase.from('reviews').insert([fallbackReview]).select();
        if (fbError) throw fbError;
        if (fbData) setCurrentReview({ ...fbData[0], face_id: faceId });
      } else if (data) {
        setCurrentReview(data[0]);
      }
      
      setStep(KioskStep.THANKS);
      fetchReviews();
    } catch (err: any) {
      alert(`Submission Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetKiosk = () => {
    setStep(KioskStep.HOME);
    setCurrentReview({});
    setIsSubmitting(false);
    setGalleryFaceId(null);
  };

  if (step === KioskStep.GALLERY && galleryFaceId) {
    return <GalleryView faceId={galleryFaceId} reviews={reviews} onBack={resetKiosk} />;
  }

  if (isDisplayMode) {
    return <ReviewWall reviews={reviews} fullScreen onExit={() => setIsDisplayMode(false)} />;
  }

  return (
    <div className={`h-full w-full relative overflow-hidden flex flex-col ${isRemoteMode ? 'bg-black text-white' : 'kiosk-bg text-white'}`}>
      {!isRemoteMode && step === KioskStep.HOME && <header className="pt-16 pb-2 w-full flex flex-col items-center z-20 shrink-0"><Logo3 /></header>}
      <main className="flex-1 w-full flex items-center justify-center relative z-10 overflow-hidden">
        {isSubmitting ? (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
             <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white animate-pulse mb-1">Processing</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">{submissionStatus}</p>
             </div>
          </div>
        ) : (
          <>
            {step === KioskStep.HOME && <HomeView onStart={() => setStep(KioskStep.CAMERA)} onToggleMode={() => setIsDisplayMode(true)} />}
            {step === KioskStep.CAMERA && <CameraView onCapture={(p) => { setCurrentReview({ photo: p }); setStep(KioskStep.FORM); }} onCancel={resetKiosk} isRemote={isRemoteMode} />}
            {step === KioskStep.FORM && <FormView photo={currentReview.photo || ''} onSubmit={handleFormSubmit} onCancel={resetKiosk} isRemote={isRemoteMode} />}
            {step === KioskStep.THANKS && <ThanksView onFinish={resetKiosk} isRemote={isRemoteMode} faceId={currentReview.face_id} />}
          </>
        )}
      </main>
      {!isRemoteMode && step === KioskStep.HOME && <footer className="pb-12 w-full flex flex-col items-center opacity-40"><p className="text-[9px] font-black tracking-[0.5em] uppercase italic">Powered by PhotoPrism AI</p></footer>}
    </div>
  );
};

export default App;
