import { Check, ImageIcon } from "lucide-react";
import { Gallery, Item } from "react-photoswipe-gallery";

import { Button } from "#/components/ui/button";

import { ResponsiveModal } from "./responsive-modal";

const cdn = (key: string, width: number) =>
  `${import.meta.env.VITE_CDN_URL}/cdn-cgi/image/width=${width},quality=75,format=auto,fit=scale-down/photos/${key}`;

export function PhotoModal({
  objectKey,
  height,
  width,
  open,
  onOpenChange,
  triggerClassName = "absolute bottom-12 left-4",
}: {
  objectKey: string;
  height: number;
  width: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
}) {
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
          original={cdn(objectKey, Math.min(width, 2560))}
          thumbnail={cdn(objectKey, 600)}
          width={width}
          height={height}
        >
          {({ ref, open }) => (
            <button
              onClick={open}
              type="button"
              className="max-h-[min(60svh,calc(90svh-12rem))] w-full cursor-zoom-in overflow-hidden rounded-lg"
            >
              <img
                ref={ref}
                src={cdn(objectKey, 600)}
                srcSet={`${cdn(objectKey, 600)} 1x, ${cdn(objectKey, 1200)} 2x`}
                width={width}
                height={height}
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
