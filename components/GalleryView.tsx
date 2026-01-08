
import React, { useMemo, useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchHistory = async () => {
      if (!PHOTOPRISM_API_KEY || !faceId || faceId === 'GUEST_ID' || faceId.startsWith('ERR')) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${PHOTOPRISM_URL}/api/v1/photos?s=${faceId}&count=100`, {
          headers: { 'X-Auth-Token': PHOTOPRISM_API_KEY }
        });
        const data = await res.json();
        setPhotoPrismImages(data || []);
      } catch (err) {
        console.error("Failed to fetch history from PhotoPrism:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [faceId]);

  const personName = reviews.find(r => r.face_id === faceId)?.name || "Expo Visitor";

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
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">EXIT GALLERY</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tighter italic uppercase leading-none">{personName}</h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">SOUVENIR HISTORY • {photoPrismImages.length} PHOTOS</p>
        </div>

        <div className="w-20"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar relative z-10">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : photoPrismImages.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 max-w-6xl mx-auto pb-20">
            {photoPrismImages.map((photo, i) => (
              <div 
                key={photo.ID} 
                className="break-inside-avoid mb-6 rounded-[32px] overflow-hidden bg-white/5 border border-white/10 shadow-2xl group animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-auto">
                  <img 
                    src={`${PHOTOPRISM_URL}/api/v1/t/${photo.Hash}/fit_2048?t=${PHOTOPRISM_API_KEY}`} 
                    alt="Expo Memory" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">{photo.TakenAt ? new Date(photo.TakenAt).toLocaleDateString() : 'MEMORY'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Personal History Not Found</p>
             <p className="text-[9px] text-slate-700 uppercase mt-2">Face UID: {faceId}</p>
          </div>
        )}
      </main>

      <footer className="relative z-10 px-8 py-8 border-t border-white/5 bg-black/80 backdrop-blur-xl flex justify-center">
         <button className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Download Collection
         </button>
      </footer>
    </div>
  );
};

export default GalleryView;
