
import React, { useState, useMemo } from 'react';
import { DetailedRatings, RatingCategory } from '../types.ts';

interface FormViewProps {
  photo: string;
  categories: RatingCategory[];
  onSubmit: (details: { name: string; ratings: DetailedRatings; comment: string }) => void;
  onCancel: () => void;
  isRemote?: boolean;
}

const COMMENT_SUGGESTIONS = [
  "Amazing collection!",
  "Great atmosphere.",
  "Well organized.",
  "Excellent coffee!",
  "Loved it!",
];

const RoundedStar = ({ active, animating, sizeClass }: { active: boolean; animating: boolean; sizeClass: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`${sizeClass} transition-all duration-300 ${active ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]' : 'text-slate-800'} ${animating ? 'animate-star-pop' : ''}`}
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinejoin="round"
  >
    <path d="M12 2.5l2.8 6.5h7l-5.4 4.5 2 7.5-6.4-4.8-6.4 4.8 2-7.5-5.4-4.5h7z" />
  </svg>
);

const FormView: React.FC<FormViewProps> = ({ photo, categories, onSubmit, onCancel, isRemote = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [animatingStar, setAnimatingStar] = useState<number | null>(null);
  
  const [ratings, setRatings] = useState<DetailedRatings>(() => {
    const initial: DetailedRatings = {};
    categories.forEach(c => initial[c.id] = 0);
    return initial;
  });

  const totalSteps = 1 + categories.length + 1; 

  const getCategoryIndex = (step: number) => {
    return step - 1;
  };

  const handleRatingChange = (categoryId: string, value: number) => {
    setRatings(prev => ({ ...prev, [categoryId]: value }));
    setAnimatingStar(value);
    setTimeout(() => {
      setAnimatingStar(null);
      nextStep();
    }, 600);
  };

  const nextStep = () => {
    if (currentStep === 0 && !name.trim()) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel(); 
    }
  };

  const addSuggestion = (text: string) => {
    setComment(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${text}` : text;
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setCurrentStep(0);
      return;
    }
    onSubmit({ name, ratings, comment: comment.trim() });
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-4 text-center animate-fade-in-up">
          <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">WELCOME</h2>
          <h3 className={`${isRemote ? 'text-2xl' : 'text-5xl'} text-white font-black tracking-tight leading-none`}>
            Your Name
          </h3>
          <div className="relative max-w-xs mx-auto pt-4 flex flex-col items-center gap-6">
            <input
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && nextStep()}
              placeholder="TYPE HERE..."
              className={`w-full text-center ${isRemote ? 'text-xl py-2' : 'text-4xl py-4'} border-b border-white/10 focus:border-white outline-none transition-all placeholder:text-white/10 font-black uppercase bg-transparent text-white`}
            />
            {name.trim().length > 0 && (
              <button 
                onClick={nextStep}
                className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl animate-fade-in"
              >
                CONTINUE
              </button>
            )}
          </div>
        </div>
      );
    }

    const catIdx = getCategoryIndex(currentStep);
    if (catIdx >= 0 && catIdx < categories.length) {
      const category = categories[catIdx];
      return (
        <div className="space-y-6 text-center animate-fade-in-up">
          <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
            {category.label}
          </h2>
          <h3 className={`${isRemote ? 'text-2xl' : 'text-4xl'} text-white font-black tracking-tight leading-tight max-w-xs mx-auto`}>
            {category.question}
          </h3>
          
          <div className={`flex justify-center ${isRemote ? 'gap-2' : 'gap-6'} pt-4`}>
            {[1, 2, 3, 4, 5].map((star) => {
              const currentRating = ratings[category.id] || 0;
              const isActive = star <= currentRating;
              const isAnimating = animatingStar === star;
              
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(category.id, star)}
                  className={`${isRemote ? 'w-10 h-10' : 'w-20 h-20'} transition-all active:scale-90 flex flex-col items-center`}
                >
                  <RoundedStar active={isActive} animating={isAnimating} sizeClass="w-full h-full" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentStep === totalSteps - 1) {
      return (
        <div className="space-y-6 text-center animate-fade-in-up">
          <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">LAST STEP</h2>
          <h3 className={`${isRemote ? 'text-2xl' : 'text-4xl'} text-white font-black tracking-tight leading-none`}>
            Final thoughts?
          </h3>
          
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto pt-2">
            {COMMENT_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => addSuggestion(sug)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/50 hover:text-white active:scale-95"
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="max-w-xs mx-auto w-full">
            <textarea
              rows={2}
              autoFocus
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="OPTIONAL..."
              className={`w-full text-center ${isRemote ? 'text-lg py-2' : 'text-2xl py-4'} border-b border-white/10 focus:border-white outline-none transition-all placeholder:text-white/10 resize-none bg-transparent font-bold tracking-tight text-white`}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`bg-black flex flex-col w-full relative transition-all duration-500 ${isRemote ? 'h-full max-w-none' : 'h-[85vh] max-w-4xl rounded-[40px] border border-white/10 shadow-2xl'} overflow-hidden animate-fade-in`}>
      
      <div className="absolute top-0 left-0 right-0 z-40 px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={prevStep} className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <div className="flex gap-1 mt-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 w-4 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-white' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
        <button onClick={onCancel} className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white/40 border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={`flex-1 flex flex-col items-center justify-center ${isRemote ? 'px-6 pt-16' : 'px-20 pt-24'} pb-6 overflow-y-auto no-scrollbar`}>
        <div className="w-full transition-all duration-300 transform" key={currentStep}>
          {renderStepContent()}
        </div>
      </div>

      <div className={`px-6 pb-8 flex gap-3 flex-shrink-0 ${isRemote ? 'safe-bottom' : ''}`}>
        <button
          onClick={prevStep}
          className={`flex-1 ${isRemote ? 'py-4' : 'py-6'} rounded-xl font-black uppercase tracking-widest text-[10px] bg-white/5 text-white/30 active:scale-95`}
        >
          BACK
        </button>

        {currentStep === totalSteps - 1 && (
          <button
            onClick={handleSubmit}
            className={`flex-1 ${isRemote ? 'py-4' : 'py-6'} rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all bg-white text-black`}
          >
            SUBMIT
          </button>
        )}
      </div>
    </div>
  );
};

export default FormView;
