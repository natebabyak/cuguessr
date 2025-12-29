import { Button } from "@/components/ui/button";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { Navigation } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";

export function NavigationButton() {
  const { current: map } = useMap();

  const handleClick = () => {
    if (!map) return;

    map.flyTo({
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  };

  return (
    <Button onClick={handleClick} size="icon" className="rounded-full">
      <Navigation />
    </Button>
  );
}
