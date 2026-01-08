
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
      // Clean up URL: remove trailing slash if exists
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
    return r?.name || "Expo Visitor";
  }, [reviews, faceId]);

  const baseUrl = PHOTOPRISM_URL.replace(/\/$/, '');

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-fade-in text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] border border-white rounded-full"></div>
         <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] border-2 border-white/50 rounded-full"></div>
      </div>

      <header className="relative z-10 px-8 py-10 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tighter italic uppercase leading-none">{personName}</h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">
            {loading ? 'SCANNING ENGINE...' : `SOUVENIR HISTORY • ${photoPrismImages.length} PHOTOS`}
          </p>
        </div>

        <button 
          onClick={fetchHistory}
          disabled={loading}
          className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar relative z-10">
        {loading && photoPrismImages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Consulting AI Archive</p>
          </div>
        ) : photoPrismImages.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 max-w-6xl mx-auto pb-32">
            {photoPrismImages.map((photo, i) => (
              <div 
                key={photo.ID || photo.Hash} 
                className="break-inside-avoid mb-6 rounded-[32px] overflow-hidden bg-white/5 border border-white/10 shadow-2xl group animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-auto">
                  <img 
                    src={`${baseUrl}/api/v1/t/${photo.Hash}/fit_2048?t=${PHOTOPRISM_API_KEY}`} 
                    alt="Expo Memory" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                     <p className="text-[9px] font-black text-white uppercase tracking-widest">{photo.TakenAt ? new Date(photo.TakenAt).toLocaleDateString() : 'EXPO MEMORY'}</p>
                     <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">{photo.CameraModel || 'PHOTO OPS'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-8">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
             </div>
             <h3 className="text-white text-lg font-black uppercase tracking-[0.2em] mb-4">No Memories Found Yet</h3>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-8">
               Our AI is still processing your face signature. It can take a few minutes for the gallery to sync across the expo network.
             </p>
             <button 
               onClick={fetchHistory}
               className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
             >
                REFRESH GALLERY
             </button>
             {faceId && <p className="text-[7px] text-slate-800 uppercase mt-8 tracking-widest font-mono">ID: {faceId}</p>}
          </div>
        )}
      </main>

      <footer className="relative z-10 px-8 py-8 border-t border-white/5 bg-black/80 backdrop-blur-xl flex justify-center">
         <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">SOUVENIR EXPERIENCE • BOOK HARAJ 3.0</p>
      </footer>
    </div>
  );
};

export default GalleryView;
