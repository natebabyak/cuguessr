import { LocateFixed } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";

interface MapMarkerProps {
  cursorLatitude: number;
  cursorLongitude: number;
  markerLatitude: number | null;
  markerLongitude: number | null;
  setMarkerLatitude: (value: number) => void;
  setMarkerLongitude: (value: number) => void;
}

export function MapMarker({
  cursorLatitude,
  cursorLongitude,
  markerLatitude,
  markerLongitude,
  setMarkerLatitude,
  setMarkerLongitude,
}: MapMarkerProps) {
  const handleDrag = () => {
    setMarkerLatitude(cursorLatitude);
    setMarkerLongitude(cursorLongitude);
  };

  if (!markerLatitude || !markerLongitude) return;

  return (
    <Marker
      draggable={true}
      latitude={markerLatitude}
      longitude={markerLongitude}
      onDrag={handleDrag}
    >
      <LocateFixed className="text-primary" />
    </Marker>
  );
}
