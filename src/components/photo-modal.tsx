import { Check, ImageIcon } from "lucide-react";
import { Gallery, Item } from "react-photoswipe-gallery";

import { Button } from "#/components/ui/button";
import { photoDimensions, photoUrl } from "#/lib/photo-url";

import { ResponsiveModal } from "./responsive-modal";

export function PhotoModal({
  objectKey,
  height,
  width,
  rotation = 0,
  open,
  onOpenChange,
  triggerClassName = "absolute bottom-12 left-4",
}: {
  objectKey: string;
  height: number;
  width: number;
  rotation?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
}) {
  const dimensions = photoDimensions(width, height, rotation);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button size="lg" className={triggerClassName}>
          <ImageIcon />
          View Photo
        </Button>
      }
      title="Where was this photo taken?"
      description="Click on the image to zoom in."
      close={
        <Button variant="outline">
          <Check />
          Done
        </Button>
      }
    >
      <Gallery>
        <Item
          original={photoUrl(objectKey, Math.min(dimensions.width, 2560), rotation)}
          thumbnail={photoUrl(objectKey, 600, rotation)}
          width={dimensions.width}
          height={dimensions.height}
        >
          {({ ref, open }) => (
            <button
              onClick={open}
              type="button"
              className="max-h-[min(60svh,calc(90svh-12rem))] w-full cursor-zoom-in overflow-hidden rounded-lg"
            >
              <img
                ref={ref}
                src={photoUrl(objectKey, 600, rotation)}
                srcSet={`${photoUrl(objectKey, 600, rotation)} 1x, ${photoUrl(objectKey, 1200, rotation)} 2x`}
                width={dimensions.width}
                height={dimensions.height}
                alt="round location"
                className="h-auto w-full object-cover"
              />
            </button>
          )}
        </Item>
      </Gallery>
    </ResponsiveModal>
  );
}
