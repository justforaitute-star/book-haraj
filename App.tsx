
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { KioskStep, Review, DetailedRatings, AppConfig, RatingCategory } from './types.ts';
import HomeView from './components/HomeView.tsx';
import CameraView from './components/CameraView.tsx';
import FormView from './components/FormView.tsx';
import ThanksView from './components/ThanksView.tsx';
import ReviewWall from './components/ReviewWall.tsx';
import GalleryView from './components/GalleryView.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import LoginView from './components/LoginView.tsx';
import AlreadyReviewedView from './components/AlreadyReviewedView.tsx';
import RemoteWelcomeView from './components/RemoteWelcomeView.tsx';
import Logo3 from './components/Logo3.tsx';
import { supabase } from './lib/supabase.ts';
import {
  getOrCreateDeviceId,
  getSubmittedPhoneReview,
  markPhoneAsReviewed,
  clearSubmittedPhoneReview,
  syncSubmittedReviewFromServer,
  getVisitCount,
  incrementVisitCount,
  resetVisitCount,
  getStoredAdminPin,
  setStoredAdminPin,
  SubmittedPhoneReview
} from './lib/deviceLock.ts';

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
  { id: 'universities', label: 'University Stalls', question: 'How informative were the college and university exhibits?' },
  { id: 'guidance', label: 'Career Guidance', question: 'How helpful were the counseling and expert sessions?' },
  { id: 'organization', label: 'Exhibition Setup', question: 'How was the organization and flow at IISJ?' },
  { id: 'overall', label: 'Overall Experience', question: 'Your final verdict on EDEX?' },
];

const App: React.FC = () => {
  const [step, setStep] = useState<KioskStep>(KioskStep.HOME);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [galleryFaceId, setGalleryFaceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [visitCount, setVisitCount] = useState<number>(() => getVisitCount());
  const [adminPin, setAdminPin] = useState<string>(() => getStoredAdminPin(getEnv('ADMIN_PIN') || '1969'));

  const deviceId = useMemo(() => getOrCreateDeviceId(), []);
  const [submittedPhoneReview, setSubmittedPhoneReview] = useState<SubmittedPhoneReview | null>(() =>
    getSubmittedPhoneReview()
  );
  const remoteInitializedRef = useRef(false);
  
  const [config, setConfig] = useState<AppConfig>({
    logo_url: '/assets/aistudio/image_9f5c8cd4.png',
    background_url: '',
    background_config: { zoom: 1, x: 0, y: 0, blur: 0 },
    categories: DEFAULT_CATEGORIES,
    face_id_enabled: true,
    admin_pin: adminPin
  });

  const fetchConfig = useCallback(async () => {
    if (!supabase) {
      setIsConfigLoaded(true);
      return;
    }
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        if (data.admin_pin) {
          setAdminPin(String(data.admin_pin));
          setStoredAdminPin(String(data.admin_pin));
        }
        setConfig({
          logo_url: data.logo_url || '/assets/aistudio/image_9f5c8cd4.png',
          background_url: data.background_url || '',
          background_config: data.background_config || { zoom: 1, x: 0, y: 0, blur: 0 },
          categories: data.categories || DEFAULT_CATEGORIES,
          face_id_enabled: data.face_id_enabled !== undefined ? data.face_id_enabled : true,
          admin_pin: data.admin_pin || getStoredAdminPin(getEnv('ADMIN_PIN') || '1969')
        });
      }
    } catch (err) {
      console.error("Configuration sync error:", err);
    } finally {
      setIsConfigLoaded(true);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);
      if (fetchError) throw fetchError;
      if (data) {
        const fetched = data as Review[];
        setReviews(fetched);
        const matched = syncSubmittedReviewFromServer(fetched, deviceId);
        if (matched) {
          setSubmittedPhoneReview(matched);
        }
      }
    } catch (err) {
      console.error("Reviews sync error:", err);
    }
  }, [deviceId]);

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
      if (mode === 'gallery') {
        const fid = params.get('faceId');
        if (fid) {
          setGalleryFaceId(fid);
          setStep(KioskStep.GALLERY);
        }
      } else if (mode === 'remote') {
        setIsRemoteMode(true);
        if (isConfigLoaded && !remoteInitializedRef.current) {
          remoteInitializedRef.current = true;
          const existing = submittedPhoneReview || getSubmittedPhoneReview();
          if (existing) {
            setSubmittedPhoneReview(existing);
            setStep(KioskStep.ALREADY_REVIEWED);
          } else {
            setVisitCount(incrementVisitCount());
            setStep(config.face_id_enabled ? KioskStep.CAMERA : KioskStep.FORM);
          }
        }
      }
    } else if (mode === 'display') {
      setIsDisplayMode(true);
    }
  }, [isConfigLoaded, config.face_id_enabled, submittedPhoneReview]);

  useEffect(() => {
    if (
      isRemoteMode &&
      submittedPhoneReview &&
      (step === KioskStep.HOME || step === KioskStep.CAMERA || step === KioskStep.FORM)
    ) {
      setStep(KioskStep.ALREADY_REVIEWED);
    }
  }, [isRemoteMode, submittedPhoneReview, step]);

  const handleStartReview = () => {
    if (isRemoteMode) {
      const existing = submittedPhoneReview || getSubmittedPhoneReview();
      if (existing) {
        setSubmittedPhoneReview(existing);
        setStep(KioskStep.ALREADY_REVIEWED);
        return;
      }
    }

    setVisitCount(incrementVisitCount());
    if (config.face_id_enabled) {
      setStep(KioskStep.CAMERA);
    } else {
      setCurrentReview({ photo: undefined });
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

  const handleFormSubmit = async (details: { name: string; ratings: DetailedRatings; comment: string }) => {
    if (isSubmitting) return;

    if (isRemoteMode) {
      const existingLocal = submittedPhoneReview || getSubmittedPhoneReview();
      if (existingLocal) {
        setSubmittedPhoneReview(existingLocal);
        setStep(KioskStep.ALREADY_REVIEWED);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmissionStatus('Initializing...');
    try {
      if (isRemoteMode && supabase) {
        try {
          const { data: existingRows, error: checkError } = await supabase
            .from('reviews')
            .select('*')
            .eq('device_id', deviceId)
            .limit(1);
          if (!checkError && existingRows && existingRows.length > 0) {
            const synced = markPhoneAsReviewed({ ...(existingRows[0] as Review), device_id: deviceId });
            setSubmittedPhoneReview(synced);
            setStep(KioskStep.ALREADY_REVIEWED);
            return;
          }
        } catch {
          // Ignore if device_id column is not present in Supabase schema
        }
      }

      const rawPhoto = currentReview.photo || '';
      
      const [faceId, photoUrl] = await Promise.all([
        (config.face_id_enabled && rawPhoto) ? identifyFaceWithPhotoPrism(rawPhoto) : Promise.resolve(''),
        (supabase && rawPhoto) ? uploadToSupabase(rawPhoto) : Promise.resolve(rawPhoto || config.logo_url || '')
      ]);

      const newReview: Partial<Review> = {
        name: details.name,
        photo: photoUrl,
        face_id: faceId || undefined,
        device_id: isRemoteMode ? deviceId : null,
        ratings: details.ratings,
        comment: details.comment,
        timestamp: Date.now()
      };
      
      setSubmissionStatus('Publishing...');

      let savedRecord: Partial<Review> = newReview;

      if (supabase) {
        const { data, error } = await supabase.from('reviews').insert([newReview]).select();
        if (error) {
          const withoutDeviceId = { ...newReview };
          delete withoutDeviceId.device_id;
          const { data: fb1Data, error: fb1Error } = await supabase.from('reviews').insert([withoutDeviceId]).select();
          if (fb1Error) {
            const withoutOptionalCols = { ...withoutDeviceId };
            delete withoutOptionalCols.face_id;
            const { data: fb2Data, error: fb2Error } = await supabase.from('reviews').insert([withoutOptionalCols]).select();
            if (fb2Error) throw fb2Error;
            if (fb2Data && fb2Data[0]) savedRecord = fb2Data[0];
          } else if (fb1Data && fb1Data[0]) {
            savedRecord = fb1Data[0];
          }
        } else if (data && data[0]) {
          savedRecord = data[0];
        }
        fetchReviews();
      } else {
        const localReview: Review = {
          id: `local_${Date.now()}`,
          name: details.name,
          photo: photoUrl,
          face_id: faceId || undefined,
          device_id: isRemoteMode ? deviceId : null,
          ratings: details.ratings,
          comment: details.comment,
          timestamp: newReview.timestamp || Date.now()
        };
        savedRecord = localReview;
        setReviews((prev) => [localReview, ...prev]);
      }

      setCurrentReview(savedRecord);
      if (isRemoteMode) {
        const locked = markPhoneAsReviewed({ ...savedRecord, device_id: deviceId });
        setSubmittedPhoneReview(locked);
      }
      setStep(KioskStep.THANKS);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAllStats = useCallback(async () => {
    if (supabase) {
      const { error } = await supabase.from('reviews').delete().gte('timestamp', 0);
      if (error) throw error;
    }
    setReviews([]);
    setCurrentReview({});
    clearSubmittedPhoneReview();
    setSubmittedPhoneReview(null);
    setVisitCount(resetVisitCount());
  }, []);

  const handleAdminPinUpdate = useCallback((newPin: string) => {
    const clean = newPin.trim();
    if (!clean) return;
    setAdminPin(clean);
    setStoredAdminPin(clean);
    setConfig((prev) => ({ ...prev, admin_pin: clean }));
  }, []);

  const resetKiosk = () => {
    setCurrentReview({});
    setIsSubmitting(false);
    setGalleryFaceId(null);
    setIsAdminAuthenticated(false);
    if (isRemoteMode) {
      const existing = submittedPhoneReview || getSubmittedPhoneReview();
      setStep(existing ? KioskStep.ALREADY_REVIEWED : KioskStep.HOME);
    } else {
      setStep(KioskStep.HOME);
    }
  };

  if (step === KioskStep.ADMIN && !isRemoteMode) {
    if (!isAdminAuthenticated) {
      return (
        <LoginView
          adminPin={adminPin}
          logoUrl={config.logo_url}
          onLogin={() => setIsAdminAuthenticated(true)}
          onCancel={resetKiosk}
        />
      );
    }
    return (
      <AdminPanel
        config={{ ...config, admin_pin: adminPin }}
        onBack={resetKiosk}
        reviews={reviews}
        visitCount={visitCount}
        onUpdate={() => { fetchReviews(); fetchConfig(); }}
        onResetAll={handleResetAllStats}
        onAdminPinChange={handleAdminPinUpdate}
      />
    );
  }

  if (step === KioskStep.GALLERY && galleryFaceId) {
    return <GalleryView faceId={galleryFaceId} reviews={reviews} onBack={resetKiosk} />;
  }

  if (isDisplayMode) {
    return <ReviewWall reviews={reviews} categories={config.categories} fullScreen onExit={() => setIsDisplayMode(false)} onRefresh={handleManualRefresh} />;
  }

  if (step === KioskStep.ALREADY_REVIEWED) {
    return (
      <AlreadyReviewedView
        submittedReview={submittedPhoneReview}
        categories={config.categories}
        logoUrl={config.logo_url}
        faceIdEnabled={config.face_id_enabled}
        onViewFeed={() => setIsDisplayMode(true)}
        onOpenGallery={(fid) => {
          setGalleryFaceId(fid);
          setStep(KioskStep.GALLERY);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col text-[#2b241e]">
      {!isRemoteMode && step === KioskStep.HOME && (
        <header className="pt-8 sm:pt-10 pb-2 w-full flex flex-col items-center shrink-0 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <Logo3 logoUrl={config.logo_url} />
          </div>
        </header>
      )}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 py-2">
        {isSubmitting ? (
          <div className="liquid-glass rounded-[32px] px-10 py-9 flex flex-col items-center gap-6 animate-fade-in">
             <div className="w-16 h-16 border-4 border-[#312922]/15 border-t-[#312922] rounded-full animate-spin"></div>
             <div className="text-center">
                <p className="text-sm font-semibold text-[#2b241e] mb-1">Publishing your review</p>
                <p className="text-xs text-[#5c5147]">{submissionStatus || 'Please wait a moment'}</p>
             </div>
          </div>
        ) : (
          <>
            {step === KioskStep.HOME && (
              isRemoteMode ? (
                <RemoteWelcomeView
                  logoUrl={config.logo_url}
                  onStart={handleStartReview}
                  onViewFeed={() => setIsDisplayMode(true)}
                />
              ) : (
                <HomeView
                  reviews={reviews}
                  visitCount={visitCount}
                  categories={config.categories}
                  onStart={handleStartReview}
                  onToggleMode={() => setIsDisplayMode(true)}
                  onAdmin={() => {
                    setIsAdminAuthenticated(false);
                    setStep(KioskStep.ADMIN);
                  }}
                  onRefresh={handleManualRefresh}
                  faceIdEnabled={config.face_id_enabled}
                />
              )
            )}
            {step === KioskStep.CAMERA && (
              <CameraView
                onCapture={(p) => { setCurrentReview({ photo: p }); setStep(KioskStep.FORM); }}
                onCancel={resetKiosk}
                onSkip={isRemoteMode ? () => { setCurrentReview({ photo: undefined }); setStep(KioskStep.FORM); } : undefined}
                isRemote={isRemoteMode}
              />
            )}
            {step === KioskStep.FORM && (
              <FormView
                categories={config.categories}
                photo={currentReview.photo || ''}
                onSubmit={handleFormSubmit}
                onCancel={resetKiosk}
                isRemote={isRemoteMode}
              />
            )}
            {step === KioskStep.THANKS && (
              <ThanksView
                onFinish={resetKiosk}
                onViewFeed={isRemoteMode ? () => setIsDisplayMode(true) : undefined}
                isRemote={isRemoteMode}
                faceId={currentReview.face_id}
                faceIdEnabled={config.face_id_enabled}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
