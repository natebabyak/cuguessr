import { Coordinates } from "@/lib/math";
import { LocateFixed } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";

interface GuessMarkerProps {
  cursorCoordinates: Coordinates | null;
  guessCoordinates: Coordinates | null;
  setGuessCoordinates: (value: Coordinates) => void;
}

export function GuessMarker({
  cursorCoordinates,
  guessCoordinates,
  setGuessCoordinates,
}: GuessMarkerProps) {
  const handleDrag = () => {
    if (!cursorCoordinates) return;
    setGuessCoordinates(cursorCoordinates);
  };

  if (!guessCoordinates) return;

  return (
    <Marker
      draggable={true}
      latitude={guessCoordinates.latitude}
      longitude={guessCoordinates.longitude}
      onDrag={handleDrag}
    >
      <LocateFixed className="text-primary" />
    </Marker>
  );
}
