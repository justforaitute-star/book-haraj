
export enum KioskStep {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  FORM = 'FORM',
  THANKS = 'THANKS',
  GALLERY = 'GALLERY',
  ADMIN = 'ADMIN'
}

export interface RatingCategory {
  id: string;
  label: string;
  question: string;
}

export interface AppConfig {
  logo_url: string;
  categories: RatingCategory[];
}

export interface DetailedRatings {
  [key: string]: number;
}

export interface Review {
  id: string;
  serial_number?: number;
  name: string;
  photo: string; // URL from Supabase Storage
  face_id?: string; // Unique facial signature for grouping
  ratings: DetailedRatings;
  comment: string;
  timestamp: number;
}
