"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CARLETON_LATITUDE, CARLETON_LONGITUDE } from "@/lib/constants";
import { MapPin, Navigation } from "lucide-react";
import Map, { useMap } from "react-map-gl/maplibre";
import { useState } from "react";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);

  return (
    <main className="h-screen w-screen">
      <PhotoCard />
      <Map
        initialViewState={{
          latitude: CARLETON_LATITUDE,
          longitude: CARLETON_LONGITUDE,
          zoom: 15,
        }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      >
        <NavigationButton />
      </Map>
    </main>
  );
}

function PhotoCard() {
  return (
    <Card className="shadow-md absolute z-10 top-4 left-4">
      <CardHeader>
        <CardTitle>Submit Your Photo</CardTitle>
        <CardDescription>
          Upload a photo and its location to have it added to the game
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input type="file" />
      </CardContent>
    </Card>
  );
}

function CurrentLocationButton() {
  const { current: map } = useMap();

  return (
    <Button>
      <MapPin />
      Use My Current Location
    </Button>
  );
}

function NavigationButton() {
  const { current: map } = useMap();

  const handleClick = () => {
    if (map) {
      map.flyTo({
        center: [CARLETON_LONGITUDE, CARLETON_LATITUDE],
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className="cursor-pointer absolute rounded-full z-10 right-4 bottom-12"
    >
      <Navigation />
    </Button>
  );
}
