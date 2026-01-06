
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
  const [lastRatedValue, setLastRatedValue] = useState<number | null>(null);
  const [ratings, setRatings] = useState<DetailedRatings>({
    books: 5,
    venue: 5,
    collection: 5,
    authors: 5,
    food: 5,
    artibhition: 5,
    coffee: 5,
    overall: 5,
  });

  const totalSteps = RATING_CATEGORIES.length + 2; 

  const handleRatingChange = (category: keyof DetailedRatings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
    setLastRatedValue(value);
    // Auto-advance
    setTimeout(() => {
      nextStep();
      setLastRatedValue(null);
    }, 400);
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
    // Comment is optional, so we submit regardless of its content
    onSubmit({ name, ratings, comment: comment.trim() });
  };

  const renderProgress = () => (
    <div className="flex gap-2 mb-10 justify-center">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i} 
          className={`h-2 transition-all duration-700 rounded-full ${
            i <= currentStep ? 'bg-[#ffb83d] w-10 shadow-[0_0_15px_rgba(255,184,61,0.4)]' : 'bg-slate-800 w-3'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className={`bg-slate-950 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] flex flex-col w-full max-w-4xl ${isRemote ? 'h-full rounded-none' : 'h-[90vh] rounded-[40px] border-[12px] border-slate-900'} overflow-hidden animate-fade-in relative`}>
      
      {/* Photo Header */}
      <div className="h-[18%] relative flex-shrink-0 group overflow-hidden bg-black">
        <img src={photo} alt="Your Capture" className="h-full w-full object-cover opacity-40 grayscale transition-all duration-1000 group-hover:grayscale-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-6">
          <p className="text-[#ffb83d] text-[10px] font-black uppercase tracking-[0.4em] animate-slide-reveal">Step {currentStep + 1} of {totalSteps}</p>
        </div>
        
        <button 
          onClick={onCancel} 
          className="absolute top-6 right-6 w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-3xl rounded-[14px] flex items-center justify-center text-white transition-all border border-white/10 z-30 hover:rotate-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Slider Body */}
      <div className="flex-1 px-8 md:px-16 py-10 flex flex-col justify-center relative">
        {renderProgress()}

        <div className="min-h-[340px] flex flex-col justify-center transition-all duration-500 transform" key={currentStep}>
          
          {/* Step 0: Name (Required) */}
          {currentStep === 0 && (
            <div className="space-y-8 text-center animate-fade-in-up">
              <h2 className="text-slate-500 text-[12px] font-black uppercase tracking-[0.6em]">Identification</h2>
              <h3 className="text-4xl md:text-5xl text-white font-[900] uppercase tracking-tighter leading-none">What is your name?</h3>
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && nextStep()}
                  placeholder="ENTER NAME"
                  className="w-full text-center text-3xl md:text-5xl py-4 border-b-4 border-slate-900 focus:border-[#ffb83d] outline-none transition-all placeholder:text-slate-900 font-[900] uppercase tracking-tighter bg-transparent text-slate-100"
                />
                {!name.trim() && (
                  <p className="absolute -bottom-6 left-0 right-0 text-[10px] text-slate-700 font-bold tracking-widest uppercase animate-pulse">Required to continue</p>
                )}
              </div>
            </div>
          )}

          {/* Steps 1-8: Ratings (Mandatory selection to advance, though they have default values) */}
          {currentStep > 0 && currentStep <= RATING_CATEGORIES.length && (
            <div className="space-y-12 text-center animate-fade-in-up">
              <h2 className="text-slate-500 text-[12px] font-black uppercase tracking-[0.6em] animate-slide-reveal">
                {RATING_CATEGORIES[currentStep - 1].label}
              </h2>
              <h3 className="text-3xl md:text-5xl text-white font-[900] uppercase tracking-tighter leading-snug max-w-2xl mx-auto">
                {RATING_CATEGORIES[currentStep - 1].question}
              </h3>
              
              <div className="flex justify-center gap-4 md:gap-8">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= ratings[RATING_CATEGORIES[currentStep - 1].id as keyof DetailedRatings];
                  const isJustClicked = lastRatedValue === star;
                  
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(RATING_CATEGORIES[currentStep - 1].id as keyof DetailedRatings, star)}
                      className={`text-6xl md:text-8xl transition-all transform hover:scale-125 active:scale-90 ${
                        isActive 
                          ? 'text-[#ffb83d] drop-shadow-[0_0_25px_rgba(255,184,61,0.6)]' 
                          : 'text-slate-900'
                      } ${isJustClicked ? 'animate-star-pop' : ''}`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Step: Feedback (EXPLICITLY OPTIONAL) */}
          {currentStep === totalSteps - 1 && (
            <div className="space-y-10 text-center animate-fade-in-up">
              <div className="space-y-2">
                <h2 className="text-slate-500 text-[12px] font-black uppercase tracking-[0.6em]">The Final Word</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#ffb83d]/10 rounded-full border border-[#ffb83d]/20 animate-pulse">
                  <p className="text-[#ffb83d] text-[10px] font-black uppercase tracking-widest">Optional</p>
                </div>
              </div>
              <h3 className="text-3xl md:text-5xl text-white font-[900] uppercase tracking-tighter leading-none">Any final thoughts?</h3>
              <textarea
                rows={2}
                autoFocus
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="TYPE HERE OR SKIP TO SUBMIT..."
                className="w-full text-center text-xl md:text-3xl py-4 border-b-4 border-slate-900 focus:border-[#ffb83d] outline-none transition-all placeholder:text-slate-900 resize-none bg-transparent font-bold tracking-tight text-slate-200"
              />
              {!comment.trim() && (
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">You can leave this blank</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-between mt-12 gap-6 relative z-20">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex-1 py-6 rounded-2xl font-[900] uppercase tracking-widest transition-all text-[10px] flex items-center justify-center gap-3 ${
              currentStep === 0 ? 'opacity-0 pointer-events-none' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {currentStep === totalSteps - 1 ? (
            <button
              onClick={() => handleSubmit()}
              className="flex-[2] py-8 bg-white text-slate-950 rounded-2xl font-[900] shadow-[0_20px_40px_rgba(255,184,61,0.2)] hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-tighter relative overflow-hidden group"
            >
              <div className="absolute inset-0 animate-shimmer opacity-20 group-hover:opacity-40"></div>
              <span className="relative z-10">
                {comment.trim() ? 'SUBMIT REVIEW' : 'SKIP & SUBMIT'}
              </span>
              <div className="w-10 h-10 bg-[#ffb83d] rounded-[6px] flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-700 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={currentStep === 0 && !name.trim()}
              className="flex-1 py-6 bg-[#ffb83d] text-slate-950 rounded-2xl font-[900] shadow-xl hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 animate-shimmer opacity-20"></div>
              <span className="relative z-10">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormView;
