
export enum KioskStep {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  FORM = 'FORM',
  THANKS = 'THANKS',
  GALLERY = 'GALLERY'
}

export interface DetailedRatings {
  books: number;
  venue: number;
  collection: number;
  authors: number;
  food: number;
  artibhition: number;
  coffee: number;
  overall: number;
}

export interface Review {
  id: string;
  name: string;
  photo: string; // URL from Supabase Storage
  face_id?: string; // Unique facial signature for grouping
  ratings: DetailedRatings;
  comment: string;
  timestamp: number;
}
