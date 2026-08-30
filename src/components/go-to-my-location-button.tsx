import { NavigationIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "#/components/ui/button";
import { DEFAULT_ZOOM } from "#/lib/constants";

export function GoToMyLocationButton() {
  const map = useMap();

  function goToMyLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      map.current?.flyTo({
        bearing: 0,
        center: [position.coords.longitude, position.coords.latitude],
        zoom: DEFAULT_ZOOM,
      });
    });
  }

  return (
    <Button onClick={goToMyLocation} size="icon-lg" title="Go to my location">
      <NavigationIcon />
    </Button>
  );
}
