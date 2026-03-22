import { Coordinates } from "@/lib/types";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const ZOOM = 20;

export function MarkerButton({
  markerCoordinates,
}: {
  markerCoordinates: Coordinates | null;
}) {
  const { current: map } = useMap();

  function goToMarker() {
    if (!map || !markerCoordinates) return;

    const { latitude, longitude } = markerCoordinates;

    map.flyTo({
      center: [longitude, latitude],
      zoom: ZOOM,
    });
  }

  return (
    <Button
      disabled={!markerCoordinates}
      onClick={goToMarker}
      size="icon-lg"
      className="rounded-full"
    >
      <MapPin />
    </Button>
  );
}
