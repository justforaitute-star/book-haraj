import { DetailedRatings, Review } from '../types.ts';

const DEVICE_ID_KEY = 'bookharaj_device_id';
const SUBMITTED_REVIEW_KEY = 'bookharaj_submitted_review';
const SUBMITTED_FLAG_COOKIE = 'bookharaj_reviewed';
const DEVICE_COOKIE = 'bookharaj_device_id';

export interface SubmittedPhoneReview {
  id?: string;
  device_id: string;
  name: string;
  ratings: DetailedRatings;
  comment: string;
  face_id?: string | null;
  timestamp: number;
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 365) => {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie errors in restricted contexts
  }
};

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
};

export const getOrCreateDeviceId = (): string => {
  let existing: string | null = null;
  try {
    existing = localStorage.getItem(DEVICE_ID_KEY);
  } catch {
    existing = null;
  }

  if (!existing) {
    existing = getCookie(DEVICE_COOKIE);
  }

  if (!existing) {
    existing = generateUuid();
  }

  try {
    localStorage.setItem(DEVICE_ID_KEY, existing);
  } catch {
    // Ignore storage errors
  }
  setCookie(DEVICE_COOKIE, existing);
  return existing;
};

export const getSubmittedPhoneReview = (): SubmittedPhoneReview | null => {
  try {
    const raw = localStorage.getItem(SUBMITTED_REVIEW_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SubmittedPhoneReview;
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // Fallback to cookie check below
  }

  const flagCookie = getCookie(SUBMITTED_FLAG_COOKIE);
  if (flagCookie) {
    return {
      device_id: getOrCreateDeviceId(),
      name: 'Guest',
      ratings: {},
      comment: '',
      timestamp: Date.now()
    };
  }

  return null;
};

export const markPhoneAsReviewed = (review: Partial<Review> & { device_id: string }) => {
  const record: SubmittedPhoneReview = {
    id: review.id,
    device_id: review.device_id,
    name: review.name || 'Guest',
    ratings: review.ratings || {},
    comment: review.comment || '',
    face_id: review.face_id || null,
    timestamp: review.timestamp || Date.now()
  };

  try {
    localStorage.setItem(SUBMITTED_REVIEW_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage errors
  }
  setCookie(SUBMITTED_FLAG_COOKIE, record.id || '1');
  return record;
};

export const syncSubmittedReviewFromServer = (
  reviews: Review[],
  deviceId: string
): SubmittedPhoneReview | null => {
  const match = reviews.find((r) => r.device_id && r.device_id === deviceId);
  if (!match) return null;
  return markPhoneAsReviewed({ ...match, device_id: deviceId });
};
