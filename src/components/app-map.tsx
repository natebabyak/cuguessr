"use client";

import { layers, namedFlavor } from "@protomaps/basemaps";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { Protocol } from "pmtiles";
import { useEffect, useMemo } from "react";
import { Map as MapLibreMap, type MapProps } from "react-map-gl/maplibre";
import { useTheme } from "./theme-provider";

const PMTILES_URL =
  "https://pub-61e5a4efc2ab4e6fb1a972c88c1acdce.r2.dev/tiles/cu.pmtiles";

maplibregl.setWorkerUrl(workerUrl);

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
          url: `pmtiles://${PMTILES_URL}`,
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
      validateStyle={false}
      {...props}
    >
      {children}
    </MapLibreMap>
  );
}
