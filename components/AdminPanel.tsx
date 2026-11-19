import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Review, AppConfig, RatingCategory, BackgroundConfig } from '../types.ts';
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
    } else if (activeTab === 'CONFIG') {
      const root = document.documentElement;
      root.style.setProperty('--bg-image', 'none');
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

      alert(`${type.toUpperCase()} uploaded successfully. Please click 'Save Global Configuration' below to save.`);
    } catch (err: any) {
      alert(`${type.toUpperCase()} upload failed: ${err.message}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAsset = (type: 'logo' | 'bg') => {
    if (!confirm(`Are you sure you want to remove the station ${type === 'logo' ? 'logo' : 'backdrop'}?`)) return;

    setLocalConfig(prev => ({
      ...prev,
      [type === 'logo' ? 'logo_url' : 'background_url']: ''
    }));

    if (type === 'bg') setShowPlacementEditor(false);
    alert(`${type.toUpperCase()} marked for removal. Click 'Save Global Configuration' to apply changes.`);
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
      alert(`Config Save Failed: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCategory = (index: number, field: keyof RatingCategory, value: string) => {
    const newCategories = [...localConfig.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setLocalConfig(prev => ({ ...prev, categories: newCategories }));
  };

  const removeCategory = (index: number) => {
    if (localConfig.categories.length <= 1) {
      alert("Station must have at least one question.");
      return;
    }
    const newCategories = localConfig.categories.filter((_, i) => i !== index);
    setLocalConfig(prev => ({ ...prev, categories: newCategories }));
  };

  const addCategory = () => {
    const newId = `cat_${Date.now()}`;
    const newCat: RatingCategory = {
      id: newId,
      label: 'New Category',
      question: 'How was this part of EDEX?'
    };
    setLocalConfig(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
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
    <div className="h-full w-full flex flex-col items-center p-6 md:p-8 animate-fade-in overflow-y-auto no-scrollbar relative z-[100] text-[#2b241e]">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 shrink-0">
        <button onClick={onBack} className="liquid-glass-subtle flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[#2b241e]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold">Exit Admin</span>
        </button>
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2b241e]">Admin Panel</h2>
          <p className="text-xs text-[#5c5147] font-medium mt-0.5">EDEX IISJ Management</p>
        </div>
        <div className="w-24 hidden sm:block"></div>
      </header>

      <div className="liquid-glass flex p-1.5 rounded-full mb-8 w-full max-w-md shrink-0">
        <button
          onClick={() => setActiveTab('REVIEWS')}
          className={`flex-1 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'REVIEWS' ? 'liquid-cta' : 'text-[#5c5147] hover:text-[#2b241e]'}`}
        >
          Reviews
        </button>
        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'CONFIG' ? 'liquid-cta' : 'text-[#5c5147] hover:text-[#2b241e]'}`}
        >
          Station Config
        </button>
      </div>

      <div className="w-full max-w-2xl space-y-6 pb-28">
        {activeTab === 'REVIEWS' ? (
          <>
            <div className="liquid-glass rounded-[32px] p-7">
              <h3 className="text-xs font-semibold text-[#5c5147] mb-4">Search Station Registry</h3>
              <input
                type="text"
                placeholder="Type serial number or UUID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/60 border border-[#312922]/20 py-4 px-5 text-center text-lg font-semibold focus:border-[#312922] transition-all outline-none text-[#2b241e] rounded-2xl placeholder:text-[#6e6256]/70"
              />
            </div>

            {foundReview && !editingReview && (
              <div className="liquid-glass rounded-[36px] p-8 animate-fade-in-up">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-7">
                  {foundReview.photo ? (
                    <img src={foundReview.photo} alt={foundReview.name} referrerPolicy="no-referrer" className="w-40 h-52 object-cover rounded-2xl border border-[#312922]/15 shadow-lg" />
                  ) : (
                    <div className="w-40 h-52 rounded-2xl bg-[#312922]/10 flex items-center justify-center text-[#5c5147] text-xs font-medium">No Photo</div>
                  )}
                  <div className="flex-1 text-center md:text-left min-w-0">
                    <p className="text-xs text-[#5c5147] font-medium mb-1 tabular-nums">Serial #{foundReview.serial_number ?? '—'}</p>
                    <h4 className="text-2xl font-bold text-[#2b241e] mb-4 truncate">{foundReview.name}</h4>

                    <div className="mb-5 divide-y divide-[#312922]/12 border-y border-[#312922]/12 py-2">
                      {localConfig.categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center py-2">
                          <span className="text-xs text-[#5c5147] font-medium">{cat.label}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-sm ${i < (foundReview.ratings?.[cat.id] || 0) ? 'text-[#b68928]' : 'text-[#312922]/20'}`}>★</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[#2b241e] text-base leading-relaxed italic mb-6">"{foundReview.comment || 'No comment provided.'}"</p>

                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(foundReview)} className="liquid-cta flex-1 py-3.5 font-bold text-xs rounded-full">Edit</button>
                      <button onClick={() => handleDelete(foundReview.id)} className="liquid-glass-subtle flex-1 py-3.5 text-[#9f2d2d] font-bold text-xs rounded-full">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editingReview && (
              <div className="liquid-glass rounded-[36px] p-8 space-y-5 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-[#2b241e]">Edit Review</h4>
                  <button onClick={() => setEditingReview(null)} className="text-xs font-semibold text-[#5c5147] hover:text-[#2b241e]">Cancel</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5147] mb-1.5">Visitor Name</label>
                    <input
                      type="text"
                      value={editingReview.name}
                      onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                      className="w-full bg-white/60 border border-[#312922]/20 rounded-2xl px-4 py-3 text-sm text-[#2b241e] font-medium outline-none focus:border-[#312922]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5c5147] mb-1.5">Comment</label>
                    <textarea
                      rows={3}
                      value={editingReview.comment}
                      onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                      className="w-full bg-white/60 border border-[#312922]/20 rounded-2xl px-4 py-3 text-sm text-[#2b241e] font-medium outline-none focus:border-[#312922] resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditingReview(null)} className="liquid-glass-subtle flex-1 py-3.5 rounded-full text-xs font-semibold text-[#2b241e]">Cancel</button>
                  <button onClick={handleUpdateReview} disabled={isProcessing} className="liquid-cta flex-1 py-3.5 rounded-full text-xs font-bold">
                    {isProcessing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="liquid-glass rounded-[32px] p-7 flex flex-col items-center">
                <h3 className="text-xs font-semibold text-[#5c5147] mb-5">Station Logo</h3>
                <div className="w-28 h-28 bg-white/50 rounded-2xl border border-[#312922]/15 flex items-center justify-center p-4 overflow-hidden mb-6">
                  {localConfig.logo_url ? (
                    <img src={localConfig.logo_url} alt="Logo" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-xs text-[#5c5147] font-medium">No logo</div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} ref={logoInputRef} className="hidden" />
                <div className="flex flex-col w-full gap-2">
                  <button onClick={() => logoInputRef.current?.click()} className="liquid-glass-subtle w-full py-3.5 text-[#2b241e] rounded-full text-xs font-semibold">Upload Logo</button>
                  {localConfig.logo_url && (
                    <button onClick={() => handleDeleteAsset('logo')} className="liquid-glass-subtle w-full py-3.5 text-[#9f2d2d] rounded-full text-xs font-bold">Remove Logo</button>
                  )}
                </div>
              </div>

              <div className="liquid-glass rounded-[32px] p-7 flex flex-col items-center">
                <h3 className="text-xs font-semibold text-[#5c5147] mb-5">Station Backdrop</h3>
                <div className="w-28 h-28 bg-white/50 rounded-2xl border border-[#312922]/15 flex items-center justify-center p-2 overflow-hidden mb-6">
                  {localConfig.background_url ? (
                    <img src={localConfig.background_url} alt="Backdrop" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-xs text-[#5c5147] font-medium">No backdrop</div>
                  )}
                </div>
                <div className="flex flex-col w-full gap-2">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'bg')} ref={bgInputRef} className="hidden" />
                  <button onClick={() => bgInputRef.current?.click()} className="liquid-glass-subtle w-full py-3.5 text-[#2b241e] rounded-full text-xs font-semibold">Upload Backdrop</button>
                  {localConfig.background_url && (
                    <>
                      <button
                        onClick={() => setShowPlacementEditor(!showPlacementEditor)}
                        className={`w-full py-3.5 rounded-full text-xs font-semibold ${showPlacementEditor ? 'liquid-cta' : 'liquid-glass-subtle text-[#2b241e]'}`}
                      >
                        {showPlacementEditor ? 'Close Placement' : 'Edit Placement'}
                      </button>
                      <button onClick={() => handleDeleteAsset('bg')} className="liquid-glass-subtle w-full py-3.5 text-[#9f2d2d] rounded-full text-xs font-bold">Remove Backdrop</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="liquid-glass rounded-[32px] p-7 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#2b241e]">Photo & Recognition Engine</h3>
                <p className="text-xs text-[#5c5147] mt-0.5">Capture souvenir photos and facial grouping</p>
              </div>
              <button
                onClick={toggleFaceId}
                className={`w-16 h-9 rounded-full p-1 transition-colors duration-300 shrink-0 ${localConfig.face_id_enabled ? 'bg-[#312922]' : 'bg-[#312922]/20'}`}
                aria-label="Toggle Recognition Engine"
              >
                <div className={`w-7 h-7 rounded-full shadow-md transition-transform duration-300 ${localConfig.face_id_enabled ? 'translate-x-7 bg-[#f7f3ec]' : 'translate-x-0 bg-white'}`}></div>
              </button>
            </div>

            {showPlacementEditor && localConfig.background_url && (
              <div className="liquid-glass rounded-[32px] p-7 animate-fade-in-up space-y-6">
                <h3 className="text-sm font-bold text-[#2b241e]">Backdrop Tuning</h3>

                <div className="relative w-full aspect-video bg-[#2b241e]/10 rounded-2xl border border-[#312922]/15 overflow-hidden">
                  <img
                    src={localConfig.background_url}
                    alt="Preview Mirror"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover origin-center transition-all duration-300"
                    style={{
                      transform: `scale(${bgConfig.zoom}) translate(${bgConfig.x}%, ${bgConfig.y}%)`,
                      filter: `blur(${bgConfig.blur}px)`
                    }}
                  />
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-[#5c5147] font-medium">Digital Zoom</label>
                      <span className="font-mono font-semibold text-[#2b241e] tabular-nums">{bgConfig.zoom.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min="1" max="5" step="0.1"
                      value={bgConfig.zoom}
                      onChange={(e) => updateBgConfig('zoom', parseFloat(e.target.value))}
                      className="w-full accent-[#312922] h-1.5 bg-[#312922]/15 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-[#5c5147] font-medium">Horizontal Offset</label>
                        <span className="font-mono font-semibold text-[#2b241e] tabular-nums">{bgConfig.x}%</span>
                      </div>
                      <input
                        type="range" min="-100" max="100" step="1"
                        value={bgConfig.x}
                        onChange={(e) => updateBgConfig('x', parseInt(e.target.value))}
                        className="w-full accent-[#312922] h-1.5 bg-[#312922]/15 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-[#5c5147] font-medium">Vertical Offset</label>
                        <span className="font-mono font-semibold text-[#2b241e] tabular-nums">{bgConfig.y}%</span>
                      </div>
                      <input
                        type="range" min="-100" max="100" step="1"
                        value={bgConfig.y}
                        onChange={(e) => updateBgConfig('y', parseInt(e.target.value))}
                        className="w-full accent-[#312922] h-1.5 bg-[#312922]/15 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-[#5c5147] font-medium">Atmospheric Blur</label>
                      <span className="font-mono font-semibold text-[#2b241e] tabular-nums">{bgConfig.blur}px</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={bgConfig.blur}
                      onChange={(e) => updateBgConfig('blur', parseInt(e.target.value))}
                      className="w-full accent-[#312922] h-1.5 bg-[#312922]/15 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="liquid-glass rounded-[32px] p-7">
              <h3 className="text-sm font-bold text-[#2b241e] mb-6">Review Questions</h3>
              <div className="divide-y divide-[#312922]/12">
                {localConfig.categories.map((cat, idx) => (
                  <div key={cat.id} className="py-5 first:pt-0 space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#5c5147]">Question {idx + 1}</span>
                      <button
                        onClick={() => removeCategory(idx)}
                        className="text-xs font-semibold text-[#9f2d2d] hover:text-[#7f1d1d] px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#5c5147]">Category Label</label>
                        <input
                          type="text"
                          value={cat.label}
                          onChange={(e) => updateCategory(idx, 'label', e.target.value)}
                          className="w-full bg-white/60 border border-[#312922]/20 rounded-xl p-3 text-xs text-[#2b241e] font-semibold outline-none focus:border-[#312922]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#5c5147]">Visitor Question</label>
                        <input
                          type="text"
                          value={cat.question}
                          onChange={(e) => updateCategory(idx, 'question', e.target.value)}
                          className="w-full bg-white/60 border border-[#312922]/20 rounded-xl p-3 text-xs text-[#2b241e] font-semibold outline-none focus:border-[#312922]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addCategory}
                className="liquid-glass-subtle w-full py-4 mt-4 rounded-full text-xs font-semibold text-[#2b241e] flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add New Question
              </button>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={isProcessing}
              className="liquid-cta w-full py-4 rounded-full font-bold text-sm active:scale-[0.98] shrink-0"
            >
              {isProcessing ? 'Synchronizing...' : 'Save Global Configuration'}
            </button>
          </div>
        )}
      </div>

      <footer className="mt-auto py-6 text-center text-xs font-medium text-[#5c5147] w-full max-w-4xl shrink-0">
        EDEX IISJ · Management
      </footer>
    </div>
  );
};

export default AdminPanel;
