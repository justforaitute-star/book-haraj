
import React, { useState, useMemo, useRef } from 'react';
import { Review, DetailedRatings, AppConfig, RatingCategory } from '../types.ts';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for configuration editing
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

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
      alert("Review updated successfully!");
      onUpdate();
      setEditingReview(null);
      setSearch('');
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm("PERMANENTLY DELETE THIS REVIEW? This cannot be undone.")) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert("Review permanently removed.");
      onUpdate();
      setSearch('');
      setEditingReview(null);
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setIsProcessing(true);
    try {
      const fileName = `logo_${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage.from('photos').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
      setLocalConfig(prev => ({ ...prev, logo_url: publicUrl }));
      alert("Logo uploaded to storage. Don't forget to Save Config!");
    } catch (err: any) {
      alert(`Logo upload failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!supabase) return;
    setIsProcessing(true);
    try {
      // We upsert the config into row id=1
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        logo_url: localConfig.logo_url,
        categories: localConfig.categories
      });
      if (error) throw error;
      alert("Configuration saved successfully!");
      onUpdate();
    } catch (err: any) {
      alert(`Config save failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCategory = (index: number, field: keyof RatingCategory, value: string) => {
    const newCategories = [...localConfig.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setLocalConfig(prev => ({ ...prev, categories: newCategories }));
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center p-8 animate-fade-in overflow-y-auto no-scrollbar">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">EXIT PANEL</span>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Admin Panel</h2>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1">Management Interface</p>
        </div>
        <div className="w-20"></div>
      </header>

      {/* Tab Switcher */}
      <div className="flex bg-white/5 p-1.5 rounded-2xl mb-12 border border-white/10 w-full max-w-sm">
        <button 
          onClick={() => setActiveTab('REVIEWS')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'REVIEWS' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
        >
          REVIEWS
        </button>
        <button 
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CONFIG' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
        >
          STATION SETTINGS
        </button>
      </div>

      <div className="w-full max-w-2xl space-y-8 pb-32">
        {activeTab === 'REVIEWS' ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Search Review</h3>
              <input 
                type="text" 
                placeholder="TYPE SERIAL OR UUID" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border-b border-white/10 py-4 text-center text-xl font-black uppercase tracking-[0.2em] focus:border-white transition-colors outline-none text-white rounded-xl"
              />
            </div>

            {foundReview && !editingReview && (
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 animate-fade-in-up">
                <div className="flex items-start gap-8">
                  <img src={foundReview.photo} className="w-32 h-40 object-cover rounded-2xl border border-white/10 shadow-xl" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">SERIAL #{foundReview.serial_number}</p>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{foundReview.name}</h4>
                    <p className="text-white/60 text-sm leading-relaxed italic mb-8">"{foundReview.comment}"</p>
                    
                    <div className="flex gap-4">
                      <button onClick={() => handleEdit(foundReview)} className="flex-1 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all">EDIT</button>
                      <button onClick={() => handleDelete(foundReview.id)} className="flex-1 py-4 bg-red-600/10 text-red-500 border border-red-500/20 font-black text-[10px] uppercase tracking-widest rounded-xl">DELETE</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editingReview && (
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 animate-fade-in-up space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Edit Review Content</h3>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Visitor Name</label>
                  <input 
                    type="text" 
                    value={editingReview.name} 
                    onChange={(e) => setEditingReview({...editingReview, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-white"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Comment</label>
                  <textarea 
                    rows={4}
                    value={editingReview.comment} 
                    onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium outline-none focus:border-white resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setEditingReview(null)} className="flex-1 py-5 bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/10">CANCEL</button>
                  <button onClick={handleUpdateReview} disabled={isProcessing} className="flex-1 py-5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl">
                    {isProcessing ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-10 animate-fade-in-up">
            {/* Logo Configuration */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Station Branding
              </h3>
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-black rounded-2xl border border-white/10 flex items-center justify-center p-2 overflow-hidden">
                   <img src={localConfig.logo_url} alt="Current Logo" className="max-w-full max-h-full object-contain filter grayscale" />
                </div>
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    ref={fileInputRef} 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all"
                  >
                    UPLOAD NEW LOGO
                  </button>
                  <p className="text-[8px] text-slate-600 mt-2 font-bold uppercase tracking-widest">Recommended: Transparent PNG, High Contrast</p>
                </div>
              </div>
            </div>

            {/* Review Categories Configuration */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Review Questions
              </h3>
              <div className="space-y-6">
                {localConfig.categories.map((cat, idx) => (
                  <div key={cat.id} className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Category ID: {cat.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Step Label</label>
                        <input 
                          type="text" 
                          value={cat.label}
                          onChange={(e) => updateCategory(idx, 'label', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[10px] text-white font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Form Question</label>
                        <input 
                          type="text" 
                          value={cat.question}
                          onChange={(e) => updateCategory(idx, 'question', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[10px] text-white font-bold outline-none"
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
              className="w-full py-6 bg-white text-black rounded-[24px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isProcessing ? 'APPLYING CHANGES...' : 'SAVE GLOBAL CONFIGURATION'}
            </button>
          </div>
        )}
      </div>

      <footer className="mt-auto py-12 text-center border-t border-white/5 w-full max-w-4xl">
        <p className="text-[8px] font-black text-slate-800 uppercase tracking-[1em]">STATION MANAGEMENT INTERFACE V3.2</p>
      </footer>
    </div>
  );
};

export default AdminPanel;
