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
import { Check, ImageIcon } from "lucide-react";
import { ChangeEvent, DragEvent, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface PhotoCardProps {
  setPhoto: (photo: File) => void;
}

export function PhotoCard({ setPhoto }: PhotoCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleFile = (file?: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Valid file types include GIF, JPEG, PNG, SVG, and WebP",
        action: {
          label: <Check />,
          onClick: () => toast.dismiss(),
        },
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Maximum file size is 10 MB",
        action: {
          label: <Check />,
          onClick: () => toast.dismiss(),
        },
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
        "shadow-md w-full max-h-1/2 absolute z-10",
        isMobile && "left-2 max-w-94 top-2",
        !isMobile && "left-4 top-4 max-w-sm"
      )}
    >
      <CardContent>
        <input
          accept="image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
          hidden
          onChange={handleChange}
          type="file"
        />
        <div
          className="cursor-pointer border-dashed border rounded-md"
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Photo" src={photoPreview} className="w-full rounded-md" />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>Upload Photo</EmptyTitle>
                <EmptyDescription>
                  Drop a photo here, or click to browse your files
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
