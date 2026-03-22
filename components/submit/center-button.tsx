import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { useMap } from "react-map-gl/maplibre";

export function CenterButton() {
  const { current: map } = useMap();

  const goToCenter = () => {
    if (!map) return;

    map.flyTo({
      bearing: 0,
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  };

  return (
    <Button onClick={goToCenter} size="icon-lg" className="rounded-full">
      <Compass />
    </Button>
  );
}
