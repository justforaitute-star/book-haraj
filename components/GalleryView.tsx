import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Review } from '../types.ts';

interface GalleryViewProps {
  faceId: string;
  reviews: Review[];
  onBack: () => void;
}

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

const GalleryView: React.FC<GalleryViewProps> = ({ faceId, reviews, onBack }) => {
  const [photoPrismImages, setPhotoPrismImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!PHOTOPRISM_API_KEY || !faceId || faceId === 'GUEST_ID' || faceId.startsWith('ERR') || faceId.startsWith('GUEST_')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = PHOTOPRISM_URL.replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/v1/photos?s=${faceId}&count=100&order=newest`, {
        headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY }
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      setPhotoPrismImages(data || []);
    } catch (err: any) {
      console.error("Failed to fetch history from PhotoPrism:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [faceId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const personName = useMemo(() => {
    const r = reviews.find(r => r.face_id === faceId);
    return r?.name || "EDEX Visitor";
  }, [reviews, faceId]);

  const baseUrl = PHOTOPRISM_URL.replace(/\/$/, '');

  return (
    <div className="min-h-screen w-full z-[100] flex flex-col animate-fade-in text-[#2b241e]">
      <header className="liquid-glass-bar sticky top-0 z-20 px-6 md:px-10 py-5 flex items-center justify-between">
        <button onClick={onBack} className="liquid-glass-subtle flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[#2b241e]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold">Back</span>
        </button>

        <div className="text-center min-w-0 px-4">
          <h2 className="text-xl font-bold tracking-tight text-[#2b241e] truncate">{personName}</h2>
          <p className="text-xs text-[#5c5147] font-medium mt-0.5 tabular-nums">
            {loading ? 'Scanning archive...' : `Souvenir History · ${photoPrismImages.length} photos`}
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className={`liquid-glass-subtle w-11 h-11 rounded-full flex items-center justify-center text-[#2b241e] ${loading ? 'animate-spin opacity-50' : ''}`}
          aria-label="Refresh Gallery"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      <main className="flex-1 p-6 md:p-8 relative z-10">
        {loading && photoPrismImages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-2 border-[#312922]/20 border-t-[#312922] rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-[#5c5147]">Loading your souvenir archive</p>
          </div>
        ) : photoPrismImages.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 max-w-6xl mx-auto pb-24">
            {photoPrismImages.map((photo, i) => (
              <div
                key={photo.ID || photo.Hash}
                className="liquid-glass break-inside-avoid mb-6 rounded-[28px] overflow-hidden group animate-fade-in-up p-2"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative rounded-[20px] overflow-hidden">
                  <img
                    src={`${baseUrl}/api/v1/t/${photo.Hash}/fit_2048?t=${PHOTOPRISM_API_KEY}`}
                    alt="EDEX Memory"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-xs font-semibold text-white">{photo.TakenAt ? new Date(photo.TakenAt).toLocaleDateString() : 'EDEX IISJ Memory'}</p>
                    <p className="text-xs text-white/75 mt-0.5">{photo.CameraModel || 'Photo Souvenir'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="liquid-glass p-8 rounded-[36px] flex flex-col items-center">
              <div className="liquid-glass-subtle w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-[#2b241e]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-[#2b241e] text-lg font-bold mb-2">No Memories Found Yet</h3>
              <p className="text-[#5c5147] text-xs leading-relaxed mb-6">
                {error ? 'Unable to load archive right now. Please try refreshing.' : 'Your photos may still be indexing. Check back in a moment to view your EDEX IISJ gallery.'}
              </p>
              <button
                onClick={fetchHistory}
                className="liquid-cta px-8 py-3.5 rounded-full text-xs font-bold active:scale-[0.98]"
              >
                Refresh Gallery
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 px-6 py-4 border-t border-[#312922]/12 text-center">
        <p className="text-xs font-medium text-[#5c5147]">EDEX Educational Exhibition · IISJ</p>
      </footer>
    </div>
  );
};

export default GalleryView;
