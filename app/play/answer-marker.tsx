import { Coordinates } from "@/lib/math";
import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";

interface AnswerMarkerProps {
  answerCoordinates: Coordinates | null;
}

export function AnswerMarker({ answerCoordinates }: AnswerMarkerProps) {
  if (!answerCoordinates) return;

  return (
    <Marker
      anchor="bottom"
      latitude={answerCoordinates.latitude}
      longitude={answerCoordinates.longitude}
    >
      <MapPin className="text-primary" />
    </Marker>
  );
}
