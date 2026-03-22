import { Coordinates } from "@/lib/types";
import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";

interface MapMarkerProps {
  cursorCoordinates: Coordinates | null;
  markerCoordinates: Coordinates | null;
  setMarkerCoordinates: (value: Coordinates) => void;
}

export function MapMarker({
  cursorCoordinates,
  markerCoordinates,
  setMarkerCoordinates,
}: MapMarkerProps) {
  const handleDrag = () => {
    if (!cursorCoordinates) return;
    setMarkerCoordinates(cursorCoordinates);
  };

  if (!markerCoordinates) return;

  return (
    <Marker
      anchor="bottom"
      draggable={true}
      latitude={markerCoordinates.latitude}
      longitude={markerCoordinates.longitude}
      onDrag={handleDrag}
    >
      <MapPin fill="#fff" className="text-primary size-8" />
    </Marker>
  );
}
