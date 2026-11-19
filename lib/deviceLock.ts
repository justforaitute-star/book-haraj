import { DetailedRatings, Review } from '../types.ts';

const DEVICE_ID_KEY = 'edex_iisj_device_id';
const SUBMITTED_REVIEW_KEY = 'edex_iisj_submitted_review';
const SUBMITTED_FLAG_COOKIE = 'edex_iisj_reviewed';
const DEVICE_COOKIE = 'edex_iisj_device_id';
const VISIT_COUNT_KEY = 'edex_iisj_visit_count';
const ADMIN_PIN_KEY = 'edex_iisj_admin_pin';
const DEFAULT_ADMIN_PIN = '1969';

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

const clearCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie errors
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

export const clearSubmittedPhoneReview = () => {
  try {
    localStorage.removeItem(SUBMITTED_REVIEW_KEY);
  } catch {
    // Ignore storage errors
  }
  clearCookie(SUBMITTED_FLAG_COOKIE);
};

export const syncSubmittedReviewFromServer = (
  reviews: Review[],
  deviceId: string
): SubmittedPhoneReview | null => {
  const match = reviews.find((r) => r.device_id && r.device_id === deviceId);
  if (!match) return null;
  return markPhoneAsReviewed({ ...match, device_id: deviceId });
};

export const getVisitCount = (): number => {
  try {
    const raw = localStorage.getItem(VISIT_COUNT_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
};

export const incrementVisitCount = (): number => {
  const next = getVisitCount() + 1;
  try {
    localStorage.setItem(VISIT_COUNT_KEY, String(next));
  } catch {
    // Ignore storage errors
  }
  return next;
};

export const resetVisitCount = (): number => {
  try {
    localStorage.setItem(VISIT_COUNT_KEY, '0');
  } catch {
    // Ignore storage errors
  }
  return 0;
};

export const getStoredAdminPin = (fallbackPin?: string): string => {
  try {
    const saved = localStorage.getItem(ADMIN_PIN_KEY);
    if (saved && saved.trim().length > 0) return saved.trim();
  } catch {
    // Ignore storage errors
  }
  return fallbackPin && fallbackPin.trim().length > 0 ? fallbackPin.trim() : DEFAULT_ADMIN_PIN;
};

export const setStoredAdminPin = (pin: string) => {
  const clean = pin.trim();
  if (!clean) return;
  try {
    localStorage.setItem(ADMIN_PIN_KEY, clean);
  } catch {
    // Ignore storage errors
  }
};
