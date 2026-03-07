export interface Photo {
  id: string;
  image_path: string;
  latitude: number;
  longitude: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Round {
  photo: Photo;
  guessCoordinates: Coordinates | null;
  distance: number | null;
  score: number | null;
}
