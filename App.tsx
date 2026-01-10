
import React, { useState, useEffect, useCallback } from 'react';
import { KioskStep, Review, DetailedRatings, AppConfig, RatingCategory } from './types.ts';
import HomeView from './components/HomeView.tsx';
import CameraView from './components/CameraView.tsx';
import FormView from './components/FormView.tsx';
import ThanksView from './components/ThanksView.tsx';
import ReviewWall from './components/ReviewWall.tsx';
import GalleryView from './components/GalleryView.tsx';
import LoginView from './components/LoginView.tsx';
import AdminPanel from './components/AdminPanel.tsx';
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

const DEFAULT_CATEGORIES: RatingCategory[] = [
  { id: 'books', label: 'Book Availability', question: 'How was the selection?' },
  { id: 'venue', label: 'Venue Arrangement', question: 'Layout of the venue?' },
  { id: 'collection', label: 'Ease of Collection', question: 'Collection process?' },
  { id: 'authors', label: 'Author Sessions', question: 'Enjoy the sessions?' },
  { id: 'food', label: 'Food Stalls', question: 'Food & Refreshments?' },
  { id: 'artibhition', label: 'Artibhition', question: 'The Artibhition program?' },
  { id: 'coffee', label: 'Book a Coffee', question: 'Coffee experience?' },
  { id: 'overall', label: 'Overall Experience', question: 'Your final verdict?' },
];

const App: React.FC = () => {
  const [step, setStep] = useState<KioskStep>(KioskStep.HOME);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [galleryFaceId, setGalleryFaceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  
  const [config, setConfig] = useState<AppConfig>({
    logo_url: '',
    background_url: '',
    background_config: { zoom: 1, x: 0, y: 0, blur: 0 },
    categories: DEFAULT_CATEGORIES,
    face_id_enabled: true
  });

  const fetchConfig = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        setConfig({
          logo_url: data.logo_url || '',
          background_url: data.background_url || '',
          background_config: data.background_config || { zoom: 1, x: 0, y: 0, blur: 0 },
          categories: data.categories || DEFAULT_CATEGORIES,
          face_id_enabled: data.face_id_enabled !== undefined ? data.face_id_enabled : true
        });
      }
      setIsConfigLoaded(true);
    } catch (err) {
      console.error("Configuration sync error:", err);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (fetchError) throw fetchError;
      if (data) setReviews(data as Review[]);
    } catch (err) {
      console.error("Reviews sync error:", err);
    }
  }, []);

  const handleManualRefresh = useCallback(async () => {
    await Promise.all([fetchReviews(), fetchConfig()]);
  }, [fetchReviews, fetchConfig]);

  useEffect(() => {
    const root = document.documentElement;
    const bg = config.background_config || { zoom: 1, x: 0, y: 0, blur: 0 };
    
    if (config.background_url) {
      root.style.setProperty('--bg-image', `url(${config.background_url})`);
      root.style.setProperty('--bg-zoom', `${bg.zoom}`);
      root.style.setProperty('--bg-x', `${bg.x}%`);
      root.style.setProperty('--bg-y', `${bg.y}%`);
      root.style.setProperty('--bg-blur', `${bg.blur}px`);
    } else {
      root.style.setProperty('--bg-image', 'none');
    }
  }, [config.background_url, config.background_config]);

  useEffect(() => {
    fetchReviews();
    fetchConfig();
    const interval = setInterval(() => {
      fetchReviews();
      fetchConfig();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchReviews, fetchConfig]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    
    if (mode === 'remote' || mode === 'gallery') {
      setIsPublicMode(true);
      setIsAuthenticated(true);
      
      if (mode === 'gallery') {
        const fid = params.get('faceId');
        if (fid) {
          setGalleryFaceId(fid);
          setStep(KioskStep.GALLERY);
        }
      } else if (mode === 'remote') {
        setIsRemoteMode(true);
        if (isConfigLoaded) {
          setStep(config.face_id_enabled ? KioskStep.CAMERA : KioskStep.FORM);
        }
      }
    } else if (mode === 'display') {
      setIsDisplayMode(true);
    }
  }, [isConfigLoaded, config.face_id_enabled]);

  const handleStartReview = () => {
    if (config.face_id_enabled) {
      setStep(KioskStep.CAMERA);
    } else {
      setCurrentReview(prev => ({ ...prev, photo: undefined }));
      setStep(KioskStep.FORM);
    }
  };

  const identifyFaceWithPhotoPrism = async (base64Photo: string): Promise<string> => {
    if (!PHOTOPRISM_API_KEY || !base64Photo) return 'GUEST_ID';
    try {
      const baseUrl = PHOTOPRISM_URL.replace(/\/$/, '');
      setSubmissionStatus('Authenticating Identity...');
      const base64Data = base64Photo.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const blob = new Blob([byteNumbers], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', blob, `kiosk_${Date.now()}.jpg`);
      
      await fetch(`${baseUrl}/api/v1/import/upload`, {
        method: 'POST',
        headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY },
        body: formData
      });
      
      await fetch(`${baseUrl}/api/v1/index`, {
        method: 'POST',
        headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/', cleanup: false })
      });

      for (let i = 0; i < 8; i++) {
        setSubmissionStatus(`AI Recognition (${i+1}/8)...`);
        await new Promise(r => setTimeout(r, 2000));
        const res = await fetch(`${baseUrl}/api/v1/photos?count=15&order=added`, {
          headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY }
        });
        const photos = await res.json();
        if (Array.isArray(photos)) {
          for (const p of photos) {
            if (p.Markers && Array.isArray(p.Markers)) {
              const marker = p.Markers.find((m: any) => m.SubjectUID && m.Type === 'face');
              if (marker) return marker.SubjectUID;
            }
          }
        }
      }
      return `GUEST_${Date.now().toString(36).toUpperCase()}`;
    } catch (err) {
      console.error("Facial ID failed:", err);
      return 'GUEST_ID';
    }
  };

  const uploadToSupabase = async (base64: string): Promise<string> => {
    if (!supabase || !base64) return config.logo_url || ''; 
    const base64Data = base64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([byteNumbers], { type: 'image/jpeg' });
    const fileName = `review_${Date.now()}.jpg`;
    await supabase.storage.from('photos').upload(fileName, blob);
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleFormSubmit = async (details: { name: string; email: string; ratings: DetailedRatings; comment: string }) => {
    if (!supabase || isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionStatus('Initializing...');
    try {
      const rawPhoto = currentReview.photo || '';
      
      const [faceId, photoUrl] = await Promise.all([
        (config.face_id_enabled && rawPhoto) ? identifyFaceWithPhotoPrism(rawPhoto) : Promise.resolve(''),
        rawPhoto ? uploadToSupabase(rawPhoto) : Promise.resolve(config.logo_url || '')
      ]);

      const newReview = {
        name: details.name,
        email: details.email || null,
        photo: photoUrl,
        face_id: faceId || null,
        ratings: details.ratings,
        comment: details.comment,
        timestamp: Date.now()
      };
      
      setSubmissionStatus('Publishing...');
      const { data, error } = await supabase.from('reviews').insert([newReview]).select();
      if (error) {
        const fallbackReview = { ...newReview };
        delete (fallbackReview as any).face_id;
        const { data: fbData, error: fbError } = await supabase.from('reviews').insert([fallbackReview]).select();
        if (fbError) throw fbError;
        if (fbData) setCurrentReview(fbData[0]);
      } else if (data) {
        setCurrentReview(data[0]);
      }
      setStep(KioskStep.THANKS);
      fetchReviews();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
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

  if (!isAuthenticated && !isPublicMode) {
    return <LoginView logoUrl={config.logo_url} onLogin={() => setIsAuthenticated(true)} />;
  }

  if (step === KioskStep.ADMIN) {
    return <AdminPanel config={config} onBack={resetKiosk} reviews={reviews} onUpdate={() => { fetchReviews(); fetchConfig(); }} />;
  }

  if (step === KioskStep.GALLERY && galleryFaceId) {
    return <GalleryView faceId={galleryFaceId} reviews={reviews} onBack={resetKiosk} />;
  }

  if (isDisplayMode) {
    return <ReviewWall reviews={reviews} fullScreen onExit={() => setIsDisplayMode(false)} onRefresh={handleManualRefresh} />;
  }

  return (
    <div className={`h-full w-full relative flex flex-col transition-colors duration-1000 ${isRemoteMode ? 'bg-black text-white' : 'text-white'}`}>
      {!isRemoteMode && step === KioskStep.HOME && (
        <header className="pt-20 pb-4 w-full flex flex-col items-center shrink-0 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <Logo3 logoUrl={config.logo_url} />
          </div>
        </header>
      )}
      <main className="flex-1 w-full flex items-center justify-center relative overflow-hidden z-10">
        {isSubmitting ? (
          <div className="flex flex-col items-center gap-8 animate-fade-in">
             <div className="w-20 h-20 border-[6px] border-white/10 border-t-white rounded-full animate-spin shadow-2xl"></div>
             <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.6em] text-white animate-pulse mb-2">Processing</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{submissionStatus}</p>
             </div>
          </div>
        ) : (
          <>
            {step === KioskStep.HOME && <HomeView onStart={handleStartReview} onToggleMode={() => setIsDisplayMode(true)} onAdmin={() => setStep(KioskStep.ADMIN)} onRefresh={handleManualRefresh} faceIdEnabled={config.face_id_enabled} />}
            {step === KioskStep.CAMERA && <CameraView onCapture={(p) => { setCurrentReview({ photo: p }); setStep(KioskStep.FORM); }} onCancel={resetKiosk} isRemote={isRemoteMode} />}
            {step === KioskStep.FORM && <FormView categories={config.categories} photo={currentReview.photo || ''} onSubmit={handleFormSubmit} onCancel={resetKiosk} isRemote={isRemoteMode} />}
            {step === KioskStep.THANKS && <ThanksView onFinish={resetKiosk} isRemote={isRemoteMode} faceId={currentReview.face_id} faceIdEnabled={config.face_id_enabled} />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
