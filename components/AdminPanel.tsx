
import React, { useState, useMemo } from 'react';
import { Review, DetailedRatings } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

interface AdminPanelProps {
  reviews: Review[];
  onBack: () => void;
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ reviews, onBack, onUpdate }) => {
  const [search, setSearch] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const foundReview = useMemo(() => {
    if (!search.trim()) return null;
    const num = parseInt(search);
    return reviews.find(r => r.serial_number === num || r.id === search);
  }, [search, reviews]);

  const handleEdit = (review: Review) => setEditingReview({ ...review });

  const handleUpdate = async () => {
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

  return (
    <div className="h-full w-full bg-black flex flex-col items-center p-8 animate-fade-in overflow-y-auto no-scrollbar">
      <header className="w-full max-w-4xl flex items-center justify-between mb-12">
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
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1">Review Management</p>
        </div>
        <div className="w-20"></div>
      </header>

      <div className="w-full max-w-xl space-y-8">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-3xl shadow-2xl">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Search by Serial</h3>
          <input 
            type="text" 
            placeholder="TYPE SERIAL NUMBER (e.g. 1)" 
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
                  <button onClick={() => handleEdit(foundReview)} className="flex-1 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all">EDIT CONTENT</button>
                  <button onClick={() => handleDelete(foundReview.id)} className="flex-1 py-4 bg-red-600/10 text-red-500 border border-red-500/20 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all">DELETE FOREVER</button>
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
              <button onClick={handleUpdate} disabled={isProcessing} className="flex-1 py-5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all">
                {isProcessing ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        )}

        {!foundReview && search.trim() && (
          <div className="text-center py-10 opacity-30 animate-pulse">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No matching serial found</p>
          </div>
        )}
      </div>

      <footer className="mt-20 py-8 text-center border-t border-white/5 w-full max-w-4xl">
        <p className="text-[8px] font-black text-slate-800 uppercase tracking-[1em]">SYSTEM MANAGEMENT INTERFACE V3.1</p>
      </footer>
    </div>
  );
};

export default AdminPanel;
