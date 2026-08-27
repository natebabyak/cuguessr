import { NavigationIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";

export function GoToCenterButton() {
  const map = useMap();

  function goToCenter() {
    map.current?.flyTo({
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  }

  return (
    <Button
      onClick={goToCenter}
      size="icon-lg"
      className="pointer-events-auto rounded-full"
    >
      <NavigationIcon />
    </Button>
  );
}
