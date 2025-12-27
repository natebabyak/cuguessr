import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import { ChangeEvent, DragEvent, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface PhotoCardProps {
  setPhoto: (photo: File) => void;
}

export function PhotoCard({ setPhoto }: PhotoCardProps) {
  const [, setIsDragging] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleFile = (file?: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File Type", {
        description: "File must be an image",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File Too Large", {
        description: "File must be less than 10 MB",
      });
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <Card
      className={cn(
        "shadow-md w-full max-h-1/2 h-fit absolute z-10",
        isMobile && "left-2 max-w-94 top-2",
        !isMobile && "left-4 top-4 max-w-sm"
      )}
    >
      <CardContent className="overflow-hidden">
        <label>
          <input accept="image/*" hidden onChange={handleChange} type="file" />
          <div
            className={cn(
              "cursor-pointer border-dashed rounded-md",
              !photoPreview && "border"
            )}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {photoPreview ? (
              <div className="relative overflow-hidden rounded-md h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Photo"
                  src={photoPreview}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ImageIcon />
                  </EmptyMedia>
                  <EmptyTitle>Drop your photo here</EmptyTitle>
                  <EmptyDescription>
                    Or upload it by clicking this area
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </label>
      </CardContent>
    </Card>
  );
}
