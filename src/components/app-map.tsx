"use client";

import { layers, namedFlavor } from "@protomaps/basemaps";
import * as maplibregl from "maplibre-gl";
import { useTheme } from "next-themes";
import { Protocol } from "pmtiles";
import { useEffect, useMemo } from "react";
import { Map as MapLibreMap, type MapProps } from "react-map-gl/maplibre";

export function AppMap({
  children,
  ...props
}: React.PropsWithChildren<MapProps>) {
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
      glyphs:
        "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
      sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${theme === "dark" ? "dark" : "light"}`,
      sources: {
        protomaps: {
          type: "vector" as const,
          url: `pmtiles://${process.env.NEXT_PUBLIC_R2_URL}/tiles/cu.pmtiles`,
        },
      },
      layers: layers(
        "protomaps",
        namedFlavor(theme === "dark" ? "dark" : "light"),
        {
          lang: "en",
        },
      ),
    };
  }, [theme]);

  return (
    <MapLibreMap
      mapLib={maplibregl}
      mapStyle={mapStyle}
      style={{
        height: "100dvh",
        width: "100dvw",
      }}
      {...props}
    >
      {children}
    </MapLibreMap>
  );
}
