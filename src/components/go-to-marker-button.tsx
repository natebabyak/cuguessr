import { MapPinSearchIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "#/components/ui/button";
import type { Coordinates } from "#/lib/types";

export function GoToMarkerButton({ marker }: { marker: Coordinates | null }) {
	const map = useMap();

	function goToMarker() {
		if (!marker) return;

		const { latitude, longitude } = marker;

		map.current?.flyTo({
			center: [longitude, latitude],
			zoom: 20,
		});
	}

	return (
		<Button
			disabled={!marker}
			onClick={goToMarker}
			size="icon-lg"
			type="button"
			title="Go to marker"
		>
			<MapPinSearchIcon />
		</Button>
	);
}
