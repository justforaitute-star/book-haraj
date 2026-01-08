import React, { useState } from 'react';
import { DetailedRatings } from '../types.ts';

interface FormViewProps {
  photo: string;
  onSubmit: (details: { name: string; ratings: DetailedRatings; comment: string }) => void;
  onCancel: () => void;
  isRemote?: boolean;
}

const RATING_CATEGORIES = [
  { id: 'books', label: 'Book Availability', question: 'How was the book selection and availability?' },
  { id: 'venue', label: 'Venue Arrangement', question: 'What did you think of the venue layout?' },
  { id: 'collection', label: 'Ease of Collection', question: 'How easy was it to collect your books?' },
  { id: 'authors', label: 'Author Sessions', question: 'Did you enjoy the author introductions?' },
  { id: 'food', label: 'Food Stalls', question: 'How were the food and refreshments?' },
  { id: 'artibhition', label: 'Artibhition', question: 'What is your verdict on the Artibhition program?' },
  { id: 'coffee', label: 'Book a Coffee', question: 'Did you enjoy the Book a Coffee experience?' },
  { id: 'overall', label: 'Overall Experience', question: 'Finally, rate your overall experience' },
] as const;

const FormView: React.FC<FormViewProps> = ({ photo, onSubmit, onCancel, isRemote = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [animatingStar, setAnimatingStar] = useState<number | null>(null);
  
  const [ratings, setRatings] = useState<DetailedRatings>({
    books: 0,
    venue: 0,
    collection: 0,
    authors: 0,
    food: 0,
    artibhition: 0,
    coffee: 0,
    overall: 0,
  });

  const totalSteps = RATING_CATEGORIES.length + 2; 

  const handleRatingChange = (category: keyof DetailedRatings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
    setAnimatingStar(value);
    
    // Satisfying delay before moving to next step
    setTimeout(() => {
      setAnimatingStar(null);
      nextStep();
    }, 800);
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setCurrentStep(0);
      return;
    }
    onSubmit({ name, ratings, comment: comment.trim() });
  };

  return (
    <div className={`bg-black flex flex-col w-full max-w-4xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative ${isRemote ? 'h-full rounded-none' : 'h-[85vh] rounded-[40px] border border-white/10'} overflow-hidden animate-fade-in`}>
      
      <button 
        onClick={prevStep}
        className="absolute top-8 left-8 z-40 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white border border-white/10 transition-all shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="absolute top-8 left-24 right-8 flex justify-between items-center z-30">
        <p className="text-white text-[12px] font-black uppercase tracking-[0.2em] opacity-80">
          STEP {currentStep + 1} OF {totalSteps}
        </p>
        <button 
          onClick={onCancel} 
          className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 transition-all border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-10 md:px-20 pt-24 pb-12">
        
        <div className="flex gap-2.5 mb-20 w-full max-w-md justify-center">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-[4px] flex-1 rounded-full transition-all duration-700 ${
                i <= currentStep ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <div className="w-full transition-all duration-500 transform" key={currentStep}>
          
          {currentStep === 0 && (
            <div className="space-y-8 text-center animate-fade-in-up">
              <h2 className="text-slate-500 text-[13px] font-black uppercase tracking-[0.4em]">REGISTRATION</h2>
              <h3 className="text-4xl md:text-6xl text-white font-[900] tracking-tight leading-none mb-4">
                What is your name?
              </h3>
              <div className="relative max-w-md mx-auto pt-6">
                <input
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && nextStep()}
                  placeholder="TYPE NAME HERE..."
                  className="w-full text-center text-4xl md:text-5xl py-4 border-b-2 border-slate-800 focus:border-white outline-none transition-all placeholder:text-slate-800 font-[800] uppercase bg-transparent text-white"
                />
              </div>
            </div>
          )}

          {currentStep > 0 && currentStep <= RATING_CATEGORIES.length && (
            <div className="space-y-12 text-center animate-fade-in-up">
              <h2 className="text-slate-500 text-[13px] font-black uppercase tracking-[0.4em]">
                {RATING_CATEGORIES[currentStep - 1].label}
              </h2>
              <h3 className="text-3xl md:text-5xl text-white font-[900] tracking-tight leading-[1.1] max-w-2xl mx-auto">
                {RATING_CATEGORIES[currentStep - 1].question}
              </h3>
              
              <div className="flex justify-center gap-4 md:gap-8 pt-6">
                {[1, 2, 3, 4, 5].map((star) => {
                  const categoryId = RATING_CATEGORIES[currentStep - 1].id as keyof DetailedRatings;
                  const currentRating = ratings[categoryId];
                  const isActive = star <= currentRating;
                  const isAnimating = animatingStar === star;
                  
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(categoryId, star)}
                      className={`text-7xl md:text-9xl transition-all duration-300 transform hover:scale-110 active:scale-90 ${
                        isActive 
                          ? 'text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]' 
                          : 'text-slate-800 hover:text-slate-700'
                      } ${isAnimating ? 'animate-star-pop' : ''}`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === totalSteps - 1 && (
            <div className="space-y-10 text-center animate-fade-in-up">
              <h2 className="text-slate-500 text-[13px] font-black uppercase tracking-[0.4em]">FEEDBACK</h2>
              <h3 className="text-4xl md:text-6xl text-white font-[900] tracking-tight leading-none">
                Any final thoughts?
              </h3>
              <div className="max-w-xl mx-auto w-full pt-4">
                <textarea
                  rows={2}
                  autoFocus
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="OPTIONAL COMMENT..."
                  className="w-full text-center text-2xl md:text-3xl py-4 border-b-2 border-slate-800 focus:border-white outline-none transition-all placeholder:text-slate-800 resize-none bg-transparent font-bold tracking-tight text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-10 pb-12 flex gap-6">
        <button
          onClick={prevStep}
          className="flex-1 py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-[12px] flex items-center justify-center gap-3 bg-slate-900 text-slate-500 hover:text-white border border-white/5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </button>

        <button
          onClick={() => currentStep === totalSteps - 1 ? handleSubmit() : nextStep()}
          disabled={currentStep === 0 && !name.trim()}
          className={`flex-1 py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-[12px] flex items-center justify-center gap-3 ${
            (currentStep === totalSteps - 1) || (currentStep > 0 && currentStep <= RATING_CATEGORIES.length && ratings[RATING_CATEGORIES[currentStep-1].id as keyof DetailedRatings] > 0)
            ? 'bg-white text-black shadow-xl hover:scale-[1.02]' 
            : 'bg-slate-800 text-slate-500'
          }`}
        >
          {currentStep === totalSteps - 1 ? 'COMPLETE' : 'NEXT'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FormView;