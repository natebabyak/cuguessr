"use client";
import { Photo } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, RotateCcw, RotateCw, X } from "lucide-react";
import Image from "next/image";
import { rotateImageAction } from "../actions/image-actions";
import { Spinner } from "@/components/ui/spinner";

const R2_URL = "https://pub-27971f31521f454098a11afbc3ec23b6.r2.dev";

export function PhotoCard({ photo }: { photo: Photo }) {
  const [isRotating, setIsRotating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const imageSrc = `${R2_URL}/${photo.image_path.replace(/\.[^/.]+$/, "")}.webp`;
  const src = timestamp ? `${imageSrc}?t=${timestamp}` : imageSrc;
  const busy = isRotating || isApproving;

  async function handleRotate(degrees: number) {
    setIsRotating(true);
    try {
      await rotateImageAction(imageSrc, degrees);
      setTimestamp(Date.now());
    } finally {
      setIsRotating(false);
    }
  }

  async function handleApprove() {
    setIsApproving(true);
    try {
      const res = await fetch("/api/photos/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: photo.id }),
      });
      if (res.ok) setRemoved(true);
    } finally {
      setIsApproving(false);
    }
  }

  if (removed) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo ID: {photo.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <Image
          src={src}
          alt={`Photo ${photo.id}`}
          className="rounded-md"
          width={768}
          height={768}
          unoptimized
        />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleApprove} disabled={busy}>
          {isApproving ? <Spinner /> : <Check />}
          Approve
        </Button>
        <Button onClick={() => handleRotate(90)} disabled={busy}>
          {isRotating ? <Spinner /> : <RotateCw />}
          Rotate Clockwise
        </Button>
        <Button onClick={() => handleRotate(-90)} disabled={busy}>
          {isRotating ? <Spinner /> : <RotateCcw />}
          Rotate Counterclockwise
        </Button>
        <Button disabled={busy}>
          <X /> Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
