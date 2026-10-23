import { layers, namedFlavor } from "@protomaps/basemaps";
import { setWorkerUrl } from "maplibre-gl";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { Protocol } from "pmtiles";
import { useEffect, useMemo, type Ref } from "react";
import { Map, type MapProps, type MapRef } from "react-map-gl/maplibre";

import { useTheme } from "./theme-provider";

setWorkerUrl(workerUrl);

export function AppMap({
  children,
  ref,
  ...props
}: React.PropsWithChildren<MapProps> & {
  ref?: Ref<MapRef>;
}) {
  const { theme } = useTheme();

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const mapStyle = useMemo(() => {
    return {
      version: 8 as const,
      glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
      sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${theme === "dark" ? "dark" : "light"}`,
      sources: {
        protomaps: {
          type: "vector" as const,
          url: `pmtiles://${import.meta.env.VITE_CDN_URL}/tiles/cu.pmtiles`,
        },
      },
      layers: layers("protomaps", namedFlavor(theme === "dark" ? "dark" : "light"), {
        lang: "en",
      }),
    };
  }, [theme]);

  return (
    <Map
      mapLib={maplibregl}
      mapStyle={mapStyle}
      ref={ref}
      style={{
        height: "100dvh",
        width: "100dvw",
      }}
      {...props}
    >
      {children}
    </Map>
  );
}
