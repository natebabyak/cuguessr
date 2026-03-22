"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface PhotoCardProps {
  setPhoto: (photo: File) => void;
}

export function PhotoCard({ setPhoto }: PhotoCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File Type", {
        description: "File must be an image",
      });

      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File Too Large", {
        description: "File must be less than 10 MB",
      });

      return false;
    }

    return true;
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;

    if (!validateFile(file)) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();

    setPhoto(file);
    setPhotoPreview(url);
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && !validateFile(file)) {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setPhotoPreview(null);
      return;
    }

    await handleFile(file);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setPhotoPreview(null);
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }

    await handleFile(file);
  };

  return (
    <Card className="pointer-events-auto col-span-2 h-fit justify-start justify-self-start">
      <CardContent className="overflow-hidden">
        <label
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Input
            accept="image/*"
            hidden={!photoPreview}
            onChange={handleChange}
            ref={inputRef}
            type="file"
            className="border-none shadow-none"
          />
          <Empty
            hidden={!!photoPreview}
            className={cn(
              "rounded-md border border-dashed transition-colors",
              isDragging && "border-primary",
            )}
          >
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImageIcon />
              </EmptyMedia>
              <EmptyTitle>Drop your photo here</EmptyTitle>
              <EmptyDescription>
                Or upload it by clicking anywhere in this box
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </label>
      </CardContent>
    </Card>
  );
}
