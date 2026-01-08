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

const COMMENT_SUGGESTIONS = [
  "Amazing collection!",
  "Great atmosphere.",
  "Loved the author talks!",
  "Very well organized.",
  "Excellent coffee!",
  "A book lover's paradise.",
  "Can't wait for next year!",
];

// Custom Rounded Star Component using stroke-linejoin="round" for curved corners
const RoundedStar = ({ active, animating }: { active: boolean; animating: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`w-full h-full transition-all duration-300 ${active ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'text-slate-800 hover:text-slate-700'} ${animating ? 'animate-star-pop' : ''}`}
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
    strokeLinecap="round"
  >
    <path d="M12 2.5l2.35 7.23h7.6l-6.15 4.47 2.35 7.23-6.15-4.47-6.15 4.47 2.35-7.23-6.15-4.47h7.6z" />
  </svg>
);

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
    setTimeout(() => {
      setAnimatingStar(null);
      nextStep();
    }, 700);
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
      if (!prev.trim()) return text;
      return `${prev.trim()} ${text}`;
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

  return (
    <div className={`bg-black flex flex-col w-full relative transition-all duration-500 ${isRemote ? 'h-full max-w-none' : 'h-[85vh] max-w-4xl rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]'} overflow-hidden animate-fade-in`}>
      
      {/* Top Header/Progress */}
      <div className="absolute top-0 left-0 right-0 z-40 px-6 pt-8 pb-4 flex items-center justify-between bg-gradient-to-b from-black via-black/80 to-transparent">
        <button 
          onClick={prevStep}
          className="w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white border border-white/10 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <p className="text-white text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] opacity-80">
          STEP {currentStep + 1} / {totalSteps}
        </p>

        <button 
          onClick={onCancel} 
          className="w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 transition-all border border-white/10 active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-20 pt-24 pb-12 overflow-y-auto no-scrollbar">
        
        {/* Progress Bar */}
        <div className="flex gap-1.5 md:gap-2.5 mb-12 md:mb-20 w-full max-w-md justify-center flex-shrink-0">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-[3px] md:h-[4px] flex-1 rounded-full transition-all duration-700 ${
                i <= currentStep ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'bg-slate-900'
              }`}
            />
          ))}
        </div>

        <div className="w-full transition-all duration-500 transform" key={currentStep}>
          
          {currentStep === 0 && (
            <div className="space-y-6 md:space-y-8 text-center animate-fade-in-up">
              <h2 className="text-slate-500 text-[10px] md:text-[13px] font-black uppercase tracking-[0.4em]">REGISTRATION</h2>
              <h3 className="text-3xl md:text-6xl text-white font-[900] tracking-tight leading-none">
                What is your name?
              </h3>
              <div className="relative max-w-xs md:max-w-md mx-auto pt-4 md:pt-6">
                <input
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && nextStep()}
                  placeholder="TYPE NAME..."
                  className="w-full text-center text-2xl md:text-5xl py-4 border-b-2 border-slate-900 focus:border-white outline-none transition-all placeholder:text-slate-900 font-[800] uppercase bg-transparent text-white"
                />
              </div>
            </div>
          )}

          {currentStep > 0 && currentStep <= RATING_CATEGORIES.length && (
            <div className="space-y-10 md:space-y-12 text-center animate-fade-in-up">
              <h2 className="text-slate-500 text-[10px] md:text-[13px] font-black uppercase tracking-[0.4em]">
                {RATING_CATEGORIES[currentStep - 1].label}
              </h2>
              <h3 className="text-2xl md:text-5xl text-white font-[900] tracking-tight leading-[1.1] max-w-2xl mx-auto">
                {RATING_CATEGORIES[currentStep - 1].question}
              </h3>
              
              <div className="flex justify-center gap-3 md:gap-8 pt-4 md:pt-6">
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
                      className="w-12 h-12 md:w-24 md:h-24 transition-all duration-300 transform hover:scale-110 active:scale-90"
                    >
                      <RoundedStar active={isActive} animating={isAnimating} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === totalSteps - 1 && (
            <div className="space-y-8 md:space-y-10 text-center animate-fade-in-up">
              <h2 className="text-slate-500 text-[10px] md:text-[13px] font-black uppercase tracking-[0.4em]">FEEDBACK</h2>
              <h3 className="text-3xl md:text-6xl text-white font-[900] tracking-tight leading-none">
                Final thoughts?
              </h3>
              
              {/* Quick Suggestions - Optimized for Mobile Typing */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-xl mx-auto pt-4 md:pt-6">
                {COMMENT_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => addSuggestion(sug)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] md:text-xs font-bold text-slate-400 hover:text-white transition-all active:scale-95"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div className="max-w-xl mx-auto w-full pt-6 md:pt-8">
                <textarea
                  rows={2}
                  autoFocus
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="OPTIONAL COMMENT..."
                  className="w-full text-center text-xl md:text-3xl py-4 border-b-2 border-slate-900 focus:border-white outline-none transition-all placeholder:text-slate-900 resize-none bg-transparent font-bold tracking-tight text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`px-6 md:px-10 pb-10 flex gap-4 md:gap-6 flex-shrink-0 ${isRemote ? 'safe-bottom' : ''}`}>
        <button
          onClick={prevStep}
          className="flex-1 py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-[10px] md:text-[12px] flex items-center justify-center gap-2 md:gap-3 bg-slate-950 text-slate-600 hover:text-white border border-white/5 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </button>

        <button
          onClick={() => currentStep === totalSteps - 1 ? handleSubmit() : nextStep()}
          disabled={currentStep === 0 && !name.trim()}
          className={`flex-1 py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-[10px] md:text-[12px] flex items-center justify-center gap-2 md:gap-3 active:scale-95 ${
            (currentStep === totalSteps - 1) || (currentStep > 0 && currentStep <= RATING_CATEGORIES.length && ratings[RATING_CATEGORIES[currentStep-1].id as keyof DetailedRatings] > 0)
            ? 'bg-white text-black shadow-xl' 
            : 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-50'
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