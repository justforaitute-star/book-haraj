import React from 'react';
import { RatingCategory } from '../types.ts';
import { SubmittedPhoneReview } from '../lib/deviceLock.ts';
import Logo3 from './Logo3.tsx';

interface AlreadyReviewedViewProps {
  submittedReview: SubmittedPhoneReview | null;
  categories: RatingCategory[];
  logoUrl?: string;
  faceIdEnabled?: boolean;
  onViewFeed: () => void;
  onOpenGallery?: (faceId: string) => void;
}

const AlreadyReviewedView: React.FC<AlreadyReviewedViewProps> = ({
  submittedReview,
  categories,
  logoUrl,
  faceIdEnabled = true,
  onViewFeed,
  onOpenGallery
}) => {
  const hasRatings =
    submittedReview?.ratings &&
    Object.values(submittedReview.ratings).some((val) => Number(val) > 0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-6 py-8 animate-fade-in text-[#2b241e]">
      <div className="pt-2 shrink-0 scale-75">
        <Logo3 logoUrl={logoUrl} />
      </div>

      <div className="w-full max-w-sm my-auto py-4 flex flex-col items-center text-center animate-fade-in-up">
        <div className="liquid-cta w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#f7f3ec]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-xs text-[#5c5147] font-semibold mb-2">
          One review per phone · Recorded
        </p>

        <h1 className="text-3xl font-extrabold text-[#2b241e] tracking-tight leading-none mb-2.5">
          Already Reviewed
        </h1>
        <p className="text-sm text-[#5c5147] leading-relaxed max-w-xs mb-6">
          Your phone has already submitted a review for EDEX at IISJ. Thank you for sharing your feedback.
        </p>

        {submittedReview && (
          <div className="liquid-glass w-full rounded-[32px] p-6 text-left mb-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#312922]/12">
              <div className="min-w-0">
                <p className="text-xs text-[#5c5147] font-medium">Your Submission</p>
                <p className="text-lg font-bold text-[#2b241e] truncate mt-0.5">
                  {submittedReview.name}
                </p>
              </div>
              <span className="text-xs text-[#5c5147] font-medium shrink-0 tabular-nums">
                {new Date(submittedReview.timestamp).toLocaleDateString()}
              </span>
            </div>

            {hasRatings && (
              <div className="py-4 space-y-2.5 border-b border-[#312922]/12">
                {categories.map((cat) => {
                  const val = submittedReview.ratings?.[cat.id] || 0;
                  return (
                    <div key={cat.id} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[#5c5147] font-medium truncate">
                        {cat.label}
                      </span>
                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${star <= val ? 'text-[#b68928]' : 'text-[#312922]/20'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {submittedReview.comment ? (
              <p className="pt-4 text-sm text-[#2b241e] italic leading-relaxed">
                "{submittedReview.comment}"
              </p>
            ) : (
              <p className="pt-4 text-xs text-[#5c5147]">
                Rating recorded
              </p>
            )}
          </div>
        )}

        <div className="w-full space-y-2.5">
          {faceIdEnabled && submittedReview?.face_id && onOpenGallery && (
            <button
              onClick={() => onOpenGallery(submittedReview.face_id!)}
              className="liquid-glass-subtle w-full py-3.5 text-[#2b241e] rounded-full font-semibold text-xs active:scale-[0.98]"
            >
              View My Photo Gallery
            </button>
          )}

          <button
            onClick={onViewFeed}
            className="liquid-cta w-full py-4 rounded-full font-bold text-sm active:scale-[0.98]"
          >
            View Live Review Feed
          </button>
        </div>
      </div>

      <footer className="pt-4 text-xs font-medium text-[#5c5147] shrink-0">
        EDEX Educational Exhibition · IISJ
      </footer>
    </div>
  );
};

export default AlreadyReviewedView;
