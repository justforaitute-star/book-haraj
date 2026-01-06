
export enum KioskStep {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  FORM = 'FORM',
  THANKS = 'THANKS'
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
  photo: string; // base64
  ratings: DetailedRatings;
  comment: string;
  timestamp: number;
}
