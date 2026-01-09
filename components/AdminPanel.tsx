
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Review, DetailedRatings, AppConfig, RatingCategory, BackgroundConfig } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

interface AdminPanelProps {
  reviews: Review[];
  config: AppConfig;
  onBack: () => void;
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ reviews, config, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'REVIEWS' | 'CONFIG'>('REVIEWS');
  const [search, setSearch] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPlacementEditor, setShowPlacementEditor] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

  useEffect(() => {
    if (activeTab === 'CONFIG' && localConfig.background_url) {
      const root = document.documentElement;
      const bg = localConfig.background_config || { zoom: 1, x: 0, y: 0, blur: 0 };
      root.style.setProperty('--bg-image', `url(${localConfig.background_url})`);
      root.style.setProperty('--bg-zoom', `${bg.zoom}`);
      root.style.setProperty('--bg-x', `${bg.x}%`);
      root.style.setProperty('--bg-y', `${bg.y}%`);
      root.style.setProperty('--bg-blur', `${bg.blur}px`);
    }
  }, [localConfig.background_config, localConfig.background_url, activeTab]);

  const foundReview = useMemo(() => {
    if (!search.trim()) return null;
    const num = parseInt(search);
    return reviews.find(r => r.serial_number === num || r.id === search);
  }, [search, reviews]);

  const handleEdit = (review: Review) => setEditingReview({ ...review });

  const handleUpdateReview = async () => {
    if (!editingReview || !supabase) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          name: editingReview.name,
          comment: editingReview.comment,
          ratings: editingReview.ratings
        })
        .eq('id', editingReview.id);

      if (error) throw error;
      alert("Review updated.");
      onUpdate();
      setEditingReview(null);
    } catch (err: any) {
      alert(`Update error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm("Permanently delete this review?")) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      alert("Review removed.");
      onUpdate();
      setSearch('');
    } catch (err: any) {
      alert(`Deletion error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'bg') => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setIsProcessing(true);
    try {
      const fileName = `${type}_${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('photos').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
      
      setLocalConfig(prev => ({ 
        ...prev, 
        [type === 'logo' ? 'logo_url' : 'background_url']: publicUrl 
      }));
      
      alert(`${type.toUpperCase()} uploaded successfully. Please click 'COMMIT GLOBAL CONFIG' below to save.`);
    } catch (err: any) {
      alert(`${type.toUpperCase()} upload failed: ${err.message}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!supabase) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        logo_url: localConfig.logo_url,
        background_url: localConfig.background_url,
        background_config: localConfig.background_config,
        categories: localConfig.categories,
        face_id_enabled: localConfig.face_id_enabled
      });
      
      if (error) throw error;
      alert("Global configuration applied successfully.");
      onUpdate();
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("background_config") && (msg.includes("column") || msg.includes("cache"))) {
        alert("SCHEMA ERROR: Your 'settings' table is missing new columns.\n\nPlease run this SQL in Supabase SQL Editor:\n\nALTER TABLE settings ADD COLUMN background_config jsonb;\nALTER TABLE settings ADD COLUMN face_id_enabled boolean DEFAULT true;");
      } else {
        alert(`Config Save Failed: ${msg}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCategory = (index: number, field: keyof RatingCategory, value: string) => {
    const newCategories = [...localConfig.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setLocalConfig(prev => ({ ...prev, categories: newCategories }));
  };

  const updateBgConfig = (field: keyof BackgroundConfig, value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      background_config: {
        ...(prev.background_config || { zoom: 1, x: 0, y: 0, blur: 0 }),
        [field]: value
      }
    }));
  };

  const toggleFaceId = () => {
    setLocalConfig(prev => ({ ...prev, face_id_enabled: !prev.face_id_enabled }));
  };

  const bgConfig = localConfig.background_config || { zoom: 1, x: 0, y: 0, blur: 0 };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center p-8 animate-fade-in overflow-y-auto no-scrollbar relative z-[100]">
      <header className="w-full max-w-4xl flex items-center justify-between mb-12 shrink-0">
        <button onClick={onBack} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">STATION EXIT</span>
        </button>
        <div className="text-center">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">ADMIN PANEL</h2>
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] mt-1">Management Engine</p>
        </div>
        <div className="w-24"></div>
      </header>

      <div className="flex bg-white/5 p-2 rounded-[24px] mb-12 border border-white/10 w-full max-w-md shadow-2xl shrink-0">
        <button 
          onClick={() => setActiveTab('REVIEWS')}
          className={`flex-1 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'REVIEWS' ? 'bg-white text-black shadow-xl' : 'text-slate-500'}`}
        >
          REVIEWS
        </button>
        <button 
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CONFIG' ? 'bg-white text-black shadow-xl' : 'text-slate-500'}`}
        >
          STATION
        </button>
      </div>

      <div className="w-full max-w-2xl space-y-10 pb-40">
        {activeTab === 'REVIEWS' ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] mb-6">Search Station Registry</h3>
              <input 
                type="text" 
                placeholder="TYPE SERIAL OR UUID" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border-b border-white/10 py-6 text-center text-2xl font-black uppercase tracking-[0.3em] focus:border-white transition-all outline-none text-white rounded-2xl"
              />
            </div>

            {foundReview && !editingReview && (
              <div className="bg-white/5 border border-white/10 rounded-[48px] p-12 animate-fade-in-up">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                  <img src={foundReview.photo} className="w-48 h-60 object-cover rounded-3xl border border-white/10 shadow-2xl" />
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">SERIAL {foundReview.serial_number}</p>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">{foundReview.name}</h4>
                    <p className="text-white/60 text-lg leading-relaxed italic mb-10">"{foundReview.comment}"</p>
                    
                    <div className="flex gap-4">
                      <button onClick={() => handleEdit(foundReview)} className="flex-1 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl">EDIT</button>
                      <button onClick={() => handleDelete(foundReview.id)} className="flex-1 py-5 bg-red-600/10 text-red-500 border border-red-500/20 font-black text-xs uppercase tracking-widest rounded-2xl">REMOVE</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-12 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl flex flex-col items-center">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8">STATION LOGO</h3>
                <div className="w-32 h-32 bg-black rounded-3xl border border-white/10 flex items-center justify-center p-4 overflow-hidden mb-8 group relative">
                   {localConfig.logo_url ? (
                     <img src={localConfig.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                   ) : (
                     <div className="text-[10px] text-slate-700 font-black">NO ASSET</div>
                   )}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} ref={logoInputRef} className="hidden" />
                <button onClick={() => logoInputRef.current?.click()} className="w-full py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all">UPLOAD</button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl flex flex-col items-center">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8">STATION BACKDROP</h3>
                <div className="w-32 h-32 bg-black rounded-3xl border border-white/10 flex items-center justify-center p-4 overflow-hidden mb-8 group relative">
                   {localConfig.background_url ? (
                     <img src={localConfig.background_url} alt="BG" className="max-w-full max-h-full object-cover rounded-lg" />
                   ) : (
                     <div className="text-[10px] text-slate-700 font-black">NO ASSET</div>
                   )}
                </div>
                <div className="flex flex-col w-full gap-2">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'bg')} ref={bgInputRef} className="hidden" />
                  <button onClick={() => bgInputRef.current?.click()} className="w-full py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all">UPLOAD NEW</button>
                  {localConfig.background_url && (
                    <button 
                      onClick={() => setShowPlacementEditor(!showPlacementEditor)} 
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${showPlacementEditor ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:text-white'}`}
                    >
                      {showPlacementEditor ? 'CLOSE PLACEMENT' : 'EDIT PLACEMENT'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI CONFIG TOGGLE */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Recognition Engine</h3>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Facial grouping for visitors</p>
              </div>
              <button 
                onClick={toggleFaceId}
                className={`w-20 h-10 rounded-full p-1 transition-colors duration-500 ${localConfig.face_id_enabled ? 'bg-white' : 'bg-white/10'}`}
              >
                <div className={`w-8 h-8 rounded-full shadow-lg transition-transform duration-500 ${localConfig.face_id_enabled ? 'translate-x-10 bg-black' : 'translate-x-0 bg-white/20'}`}></div>
              </button>
            </div>

            {showPlacementEditor && localConfig.background_url && (
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl animate-fade-in-up space-y-10">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  Backdrop Tuning
                </h3>

                <div className="relative w-full aspect-video bg-black rounded-3xl border-4 border-white/20 overflow-hidden shadow-2xl">
                   <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="absolute inset-x-0 bottom-4 flex justify-center">
                        <div className="w-1/2 h-4 bg-white/20 rounded-full blur-[2px]"></div>
                      </div>
                      <div className="absolute top-4 inset-x-0 flex justify-center">
                        <div className="w-1/3 h-6 border-2 border-white/10 rounded-lg blur-[1px]"></div>
                      </div>
                   </div>
                   
                   <img 
                      src={localConfig.background_url} 
                      alt="Preview Mirror"
                      className="w-full h-full object-cover origin-center transition-all duration-300"
                      style={{
                        transform: `scale(${bgConfig.zoom}) translate(${bgConfig.x}%, ${bgConfig.y}%)`,
                        filter: `blur(${bgConfig.blur}px)`
                      }}
                   />
                   
                   <div className="absolute bottom-4 left-4 z-20">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                         <p className="text-[8px] font-black text-white uppercase tracking-widest">Live Monitor Preview</p>
                      </div>
                   </div>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Zoom</label>
                       <span className="text-xs font-mono font-bold text-white">{bgConfig.zoom.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" step="0.1"
                      value={bgConfig.zoom}
                      onChange={(e) => updateBgConfig('zoom', parseFloat(e.target.value))}
                      className="w-full accent-white h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Horizontal Offset</label>
                         <span className="text-xs font-mono font-bold text-white">{bgConfig.x}%</span>
                      </div>
                      <input 
                        type="range" min="-100" max="100" step="1"
                        value={bgConfig.x}
                        onChange={(e) => updateBgConfig('x', parseInt(e.target.value))}
                        className="w-full accent-white h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vertical Offset</label>
                         <span className="text-xs font-mono font-bold text-white">{bgConfig.y}%</span>
                      </div>
                      <input 
                        type="range" min="-100" max="100" step="1"
                        value={bgConfig.y}
                        onChange={(e) => updateBgConfig('y', parseInt(e.target.value))}
                        className="w-full accent-white h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atmospheric Blur</label>
                       <span className="text-xs font-mono font-bold text-white">{bgConfig.blur}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="1"
                      value={bgConfig.blur}
                      onChange={(e) => updateBgConfig('blur', parseInt(e.target.value))}
                      className="w-full accent-white h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] mb-10 flex items-center gap-4">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Review Configuration
              </h3>
              <div className="space-y-8">
                {localConfig.categories.map((cat, idx) => (
                  <div key={cat.id} className="p-8 bg-black/40 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">SLOT: {cat.id}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Label</label>
                        <input 
                          type="text" 
                          value={cat.label}
                          onChange={(e) => updateCategory(idx, 'label', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Question</label>
                        <input 
                          type="text" 
                          value={cat.question}
                          onChange={(e) => updateCategory(idx, 'question', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSaveConfig}
              disabled={isProcessing}
              className="w-full py-8 bg-white text-black rounded-[32px] font-black text-sm uppercase tracking-[0.6em] shadow-[0_40px_80px_-20px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all shrink-0"
            >
              {isProcessing ? 'SYNCHRONIZING...' : 'COMMIT GLOBAL CONFIG'}
            </button>
          </div>
        )}
      </div>

      <footer className="mt-auto py-12 text-center border-t border-white/5 w-full max-w-4xl opacity-20 shrink-0">
        <p className="text-[10px] font-black text-white uppercase tracking-[1.5em]">HARAJ MANAGEMENT V4.1</p>
      </footer>
    </div>
  );
};

export default AdminPanel;
