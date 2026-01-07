
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
  const [clickedStar, setClickedStar] = useState<number | null>(null);
  
  // Initialize all ratings to 0 so stars start as grey
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
    setClickedStar(value);
    
    // Reset click animation flag after a moment
    setTimeout(() => setClickedStar(null), 400);
    
    // Auto-advance after animation
    setTimeout(() => {
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
    <div className={`bg-[#050a18] flex flex-col w-full max-w-4xl shadow-2xl relative ${isRemote ? 'h-full rounded-none' : 'h-[85vh] rounded-[40px] border-[1px] border-white/5'} overflow-hidden animate-fade-in`}>
      
      {/* Header Info: Step Counter & Close Button */}
      <div className="absolute top-8 left-10 right-10 flex justify-between items-center z-30">
        <p className="text-[#ffb83d] text-[11px] font-black uppercase tracking-[0.3em]">
          STEP {currentStep + 1} OF {totalSteps}
        </p>
        <button 
          onClick={onCancel} 
          className="w-10 h-10 bg-white/5 hover:bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center text-white/60 transition-all border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-12 pb-12 pt-20">
        
        {/* Dash Progress Bar */}
        <div className="flex gap-2.5 mb-20">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-[4px] w-12 rounded-full transition-all duration-500 ${
                i <= currentStep ? 'bg-[#ffb83d] shadow-[0_0_15px_rgba(255,184,61,0.6)]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <div className="w-full flex flex-col items-center transition-all duration-500 transform" key={currentStep}>
          
          {/* Step 0: Name */}
          {currentStep === 0 && (
            <div className="space-y-6 text-center animate-fade-in-up w-full">
              <h2 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.6em]">IDENTIFICATION</h2>
              <h3 className="text-4xl md:text-5xl text-white font-[900] uppercase tracking-tighter leading-tight max-w-xl mx-auto">
                What is your name?
              </h3>
              <div className="relative max-w-md mx-auto pt-8">
                <input
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && nextStep()}
                  placeholder="TYPE HERE..."
                  className="w-full text-center text-3xl md:text-5xl py-4 border-b-2 border-slate-800 focus:border-[#ffb83d] outline-none transition-all placeholder:text-slate-800 font-[900] uppercase tracking-tighter bg-transparent text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Steps 1-8: Rating Categories */}
          {currentStep > 0 && currentStep <= RATING_CATEGORIES.length && (
            <div className="space-y-12 text-center animate-fade-in-up w-full">
              <h2 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.6em]">
                {RATING_CATEGORIES[currentStep - 1].label}
              </h2>
              <h3 className="text-4xl md:text-5xl text-white font-[900] uppercase tracking-tighter leading-tight max-w-2xl mx-auto">
                {RATING_CATEGORIES[currentStep - 1].question}
              </h3>
              
              <div className="flex justify-center gap-6 md:gap-8 pt-4">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentCategory = RATING_CATEGORIES[currentStep - 1].id as keyof DetailedRatings;
                  const currentVal = ratings[currentCategory];
                  const isSelected = star <= currentVal;
                  const isAnimating = clickedStar === star;
                  
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(currentCategory, star)}
                      className={`text-7xl md:text-8xl transition-all duration-300 transform hover:scale-110 active:scale-90 ${
                        isSelected 
                          ? 'text-[#ffb83d] drop-shadow-[0_0_25px_rgba(255,184,61,0.4)]' 
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

          {/* Step 9: Final Feedback */}
          {currentStep === totalSteps - 1 && (
            <div className="space-y-8 text-center animate-fade-in-up w-full">
              <h2 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.6em]">THE FINAL WORD</h2>
              <h3 className="text-4xl md:text-5xl text-white font-[900] uppercase tracking-tighter leading-tight max-w-xl mx-auto">
                Any final thoughts?
              </h3>
              <div className="max-w-xl mx-auto w-full pt-4">
                <textarea
                  rows={2}
                  autoFocus
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="OPTIONAL FEEDBACK..."
                  className="w-full text-center text-xl md:text-2xl py-4 border-b-2 border-slate-800 focus:border-[#ffb83d] outline-none transition-all placeholder:text-slate-800 resize-none bg-transparent font-bold tracking-tight text-slate-100"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="px-10 pb-12 flex gap-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex-1 py-6 rounded-[18px] font-black uppercase tracking-widest transition-all text-[11px] flex items-center justify-center gap-3 ${
            currentStep === 0 ? 'opacity-0 pointer-events-none' : 'bg-[#101828] text-slate-500 hover:text-white'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
          </svg>
          PREVIOUS
        </button>

        <button
          onClick={() => currentStep === totalSteps - 1 ? handleSubmit() : nextStep()}
          disabled={currentStep === 0 && !name.trim()}
          className={`flex-1 py-6 rounded-[18px] font-black uppercase tracking-widest transition-all text-[11px] flex items-center justify-center gap-3 ${
            currentStep === totalSteps - 1 || (currentStep > 0 && currentStep <= RATING_CATEGORIES.length && ratings[RATING_CATEGORIES[currentStep-1].id as keyof DetailedRatings] > 0)
            ? 'bg-[#ffb83d] text-[#050a18] shadow-lg shadow-[#ffb83d]/20 hover:scale-[1.02]' 
            : 'bg-slate-800 text-slate-600'
          }`}
        >
          {currentStep === totalSteps - 1 ? 'SUBMIT' : 'NEXT'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FormView;
