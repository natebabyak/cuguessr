"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Flag, Send, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { FormEvent, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ReportDialogProps {
  photoId: number;
}

export function ReportDialog({ photoId }: ReportDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const title = `Report Photo (ID: ${photoId})`;
  const description = "Please provide a reason for reporting this photo.";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("reports").insert({
      photo_id: photoId,
      reason: reason,
    });

    if (insertError) {
      toast.error("Something Went Wrong");
      setLoading(false);
      setOpen(false);
      return;
    }

    toast.success("Report Submitted Successfully");
    setLoading(false);
    setOpen(false);
  }

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <TriggerButton handleClick={() => setOpen(true)} />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <Form
              reason={reason}
              handleChange={(e) => setReason(e.target.value)}
              handleSubmit={handleSubmit}
            />
          </div>
          <DrawerFooter>
            <SubmitButton loading={loading} />
            <DrawerClose asChild>
              <CloseButton handleClick={() => setOpen(false)} />
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <TriggerButton handleClick={() => setOpen(true)} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form
          reason={reason}
          handleChange={(e) => setReason(e.target.value)}
          handleSubmit={handleSubmit}
        />
        <DialogFooter>
          <DialogClose asChild>
            <CloseButton handleClick={() => setOpen(false)} />
          </DialogClose>
          <SubmitButton loading={loading} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TriggerButton({ handleClick }: { handleClick: () => void }) {
  return (
    <Button
      onClick={handleClick}
      size="icon-lg"
      className="pointer-events-auto rounded-full"
    >
      <Flag />
    </Button>
  );
}

function Form({
  reason,
  handleChange,
  handleSubmit,
}: {
  reason: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => void;
}) {
  return (
    <form id="report-form" onSubmit={handleSubmit}>
      <Textarea
        onChange={handleChange}
        placeholder="Enter the reason for reporting the photo here."
        required
        value={reason}
      />
    </form>
  );
}

function CloseButton({ handleClick }: { handleClick: () => void }) {
  return (
    <Button onClick={handleClick} size="sm" variant="outline">
      <X />
      Cancel
    </Button>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <Button disabled={loading} form="report-form" size="sm" type="submit">
      {loading ? <Spinner /> : <Send />}
      Submit
    </Button>
  );
}
