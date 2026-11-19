import React, { useState } from 'react';
import { DetailedRatings, RatingCategory } from '../types.ts';

interface FormViewProps {
  photo: string;
  categories: RatingCategory[];
  onSubmit: (details: { name: string; ratings: DetailedRatings; comment: string }) => void;
  onCancel: () => void;
  isRemote?: boolean;
}

const COMMENT_SUGGESTIONS = [
  "Great university stalls!",
  "Helpful career guidance.",
  "Well organized at IISJ.",
  "Inspiring sessions!",
  "Loved EDEX!",
];

const RoundedStar = ({ active, animating, sizeClass }: { active: boolean; animating: boolean; sizeClass: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${sizeClass} transition-all duration-300 ${active ? 'text-[#b68928] drop-shadow-[0_4px_12px_rgba(182,137,40,0.35)]' : 'text-[#312922]/20'} ${animating ? 'animate-star-pop' : ''}`}
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinejoin="round"
  >
    <path d="M12 2.5l2.8 6.5h7l-5.4 4.5 2 7.5-6.4-4.8-6.4 4.8 2-7.5-5.4-4.5h7z" />
  </svg>
);

const FormView: React.FC<FormViewProps> = ({ categories, onSubmit, onCancel, isRemote = false }) => {
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

  const getCategoryIndex = (step: number) => step - 1;

  const handleRatingChange = (categoryId: string, value: number) => {
    setRatings(prev => ({ ...prev, [categoryId]: value }));
    setAnimatingStar(value);
    setTimeout(() => {
      setAnimatingStar(null);
      nextStep();
    }, 550);
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
          <p className="text-[#5c5147] text-xs font-semibold">Step 1 of {totalSteps}</p>
          <h3 className={`${isRemote ? 'text-3xl' : 'text-5xl'} text-[#2b241e] font-extrabold tracking-tight leading-none`}>
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
              placeholder="Type your name..."
              className={`w-full text-center ${isRemote ? 'text-xl py-3' : 'text-3xl py-4'} border-b-2 border-[#312922]/25 focus:border-[#312922] outline-none transition-all placeholder:text-[#6e6256]/60 font-bold bg-transparent text-[#2b241e]`}
            />
            {name.trim().length > 0 && (
              <button
                onClick={nextStep}
                className="liquid-cta px-8 py-3.5 rounded-full text-xs font-bold active:scale-[0.98] animate-fade-in"
              >
                Continue
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
        <div className="space-y-5 text-center animate-fade-in-up">
          <p className="text-[#5c5147] text-xs font-semibold">
            {category.label}
          </p>
          <h3 className={`${isRemote ? 'text-2xl' : 'text-4xl'} text-[#2b241e] font-extrabold tracking-tight leading-tight max-w-md mx-auto`}>
            {category.question}
          </h3>

          <div className={`flex justify-center ${isRemote ? 'gap-2.5' : 'gap-5'} pt-4`}>
            {[1, 2, 3, 4, 5].map((star) => {
              const currentRating = ratings[category.id] || 0;
              const isActive = star <= currentRating;
              const isAnimating = animatingStar === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(category.id, star)}
                  className={`${isRemote ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'} transition-transform active:scale-90 flex items-center justify-center rounded-2xl ${isActive ? 'bg-[#b68928]/15' : 'hover:bg-[#312922]/5'}`}
                  aria-label={`Rate ${star} stars`}
                >
                  <RoundedStar active={isActive} animating={isAnimating} sizeClass="w-4/5 h-4/5" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentStep === totalSteps - 1) {
      return (
        <div className="space-y-5 text-center animate-fade-in-up">
          <p className="text-[#5c5147] text-xs font-semibold">Final Step</p>
          <h3 className={`${isRemote ? 'text-2xl' : 'text-4xl'} text-[#2b241e] font-extrabold tracking-tight leading-none`}>
            Final thoughts?
          </h3>

          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto pt-1">
            {COMMENT_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => addSuggestion(sug)}
                className="liquid-glass-subtle px-3.5 py-2 rounded-full text-xs font-semibold text-[#2b241e] active:scale-95"
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="max-w-sm mx-auto w-full pt-2">
            <textarea
              rows={2}
              autoFocus
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment..."
              className={`w-full text-center ${isRemote ? 'text-lg py-2.5' : 'text-2xl py-3'} border-b-2 border-[#312922]/25 focus:border-[#312922] outline-none transition-all placeholder:text-[#6e6256]/60 resize-none bg-transparent font-semibold text-[#2b241e]`}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`liquid-glass flex flex-col w-full relative transition-all duration-300 ${isRemote ? 'min-h-[500px] max-w-md mx-3 my-4 rounded-[36px]' : 'min-h-[540px] max-w-3xl mx-6 my-6 rounded-[40px]'} animate-fade-in text-[#2b241e]`}>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0 z-40">
        <button onClick={prevStep} className="liquid-glass-subtle w-11 h-11 rounded-full flex items-center justify-center text-[#2b241e]" aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= currentStep ? 'w-6 bg-[#312922]' : 'w-3 bg-[#312922]/20'}`} />
          ))}
        </div>
        <button onClick={onCancel} className="liquid-glass-subtle w-11 h-11 rounded-full flex items-center justify-center text-[#2b241e]" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={`flex-1 flex flex-col items-center justify-center ${isRemote ? 'px-6 py-4' : 'px-12 py-8'} overflow-y-auto no-scrollbar`}>
        <div className="w-full" key={currentStep}>
          {renderStepContent()}
        </div>
      </div>

      <div className={`px-6 pb-6 pt-2 flex gap-3 flex-shrink-0 ${isRemote ? 'safe-bottom' : ''}`}>
        <button
          onClick={prevStep}
          className={`liquid-glass-subtle flex-1 ${isRemote ? 'py-3.5' : 'py-4'} rounded-full font-semibold text-xs text-[#2b241e] active:scale-[0.98]`}
        >
          Back
        </button>

        {currentStep === totalSteps - 1 && (
          <button
            onClick={handleSubmit}
            className={`liquid-cta flex-1 ${isRemote ? 'py-3.5' : 'py-4'} rounded-full font-bold text-xs active:scale-[0.98]`}
          >
            Submit Review
          </button>
        )}
      </div>
    </div>
  );
};

export default FormView;
