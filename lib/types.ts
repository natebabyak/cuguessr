export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type GameType = "classic" | "daily";

export interface Photo {
  id: string;
  image_path: string;
  latitude: number;
  longitude: number;
}

export interface Round {
  photo: Photo;
  guess: Coordinates | null;
  distance: number | null;
  score: number | null;
}
