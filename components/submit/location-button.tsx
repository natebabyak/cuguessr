import { Button } from "@/components/ui/button";
import { DEFAULT_ZOOM } from "@/lib/constants";
import { Navigation } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";

export function LocationButton() {
  const { current: map } = useMap();

  const handleClick = () => {
    if (!map) return;

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      map.flyTo({
        bearing: 0,
        center: [longitude, latitude],
        zoom: DEFAULT_ZOOM,
      });
    });
  };

  return (
    <Button onClick={handleClick} size="icon-lg" className="rounded-full">
      <Navigation />
    </Button>
  );
}
