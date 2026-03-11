import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { Eye, ImageIcon } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface PhotoCardProps {
  setPhoto: (photo: File) => void;
}

interface PreviewDialogProps {
  photoPreview: string | null;
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
          <InputGroup
            hidden={!photoPreview}
            className="flex items-center justify-between"
          >
            <Input
              accept="image/*"
              onChange={handleChange}
              ref={inputRef}
              type="file"
              className="border-0 shadow-none"
            />
            <InputGroupAddon align="inline-end">
              <PreviewDialog photoPreview={photoPreview} />
            </InputGroupAddon>
          </InputGroup>
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

function PreviewDialog({ photoPreview }: PreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <InputGroupButton size="icon-xs" variant="outline">
            <Eye />
          </InputGroupButton>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-lg leading-none font-semibold">
              Preview
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Preview"
              src={photoPreview ?? undefined}
              className="rounded-md"
            />
          </div>
          <DrawerFooter>
            <DrawerClose />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <InputGroupButton size="icon-xs" variant="outline">
          <Eye />
        </InputGroupButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg leading-none font-semibold">
            Preview
          </DialogTitle>
        </DialogHeader>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Preview"
          src={photoPreview ?? undefined}
          className="rounded-md"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
