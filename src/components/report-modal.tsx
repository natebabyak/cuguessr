import { Flag, LoaderCircle, Send, X } from "lucide-react";
import { useState } from "react";

import { reportSchema } from "#/lib/report-schema";
import { submitReportFn } from "#/lib/reports.functions";

import { ResponsiveModal } from "./responsive-modal";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/toast";

export function ReportModal({ photoId }: { photoId: number }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const parsed = reportSchema.safeParse({ photoId, description });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Submit Report"
      description="Enter a description to report a problem with this photo."
      trigger={
        <Button size="lg">
          <Flag />
          Report photo
        </Button>
      }
      close={
        <Button variant="outline">
          <X />
          Cancel
        </Button>
      }
    >
      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!parsed.success || isSubmitting) return;
          setIsSubmitting(true);
          try {
            await submitReportFn({ data: parsed.data });
            toast.add({ title: "Report submitted successfully!", type: "success" });
            setDescription("");
            setOpen(false);
          } catch {
            toast.add({ title: "Failed to submit report. Please try again.", type: "error" });
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <label htmlFor={`report-${photoId}`}>Description</label>
        <Textarea
          id={`report-${photoId}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          minLength={5}
          maxLength={255}
          required
          disabled={isSubmitting}
          placeholder="Describe the problem…"
          aria-describedby={`report-${photoId}-help`}
        />
        <p id={`report-${photoId}-help`} className="text-muted-foreground text-sm">
          {description.length}/255 characters. Enter at least 5 characters.
        </p>
        <Button type="submit" disabled={!parsed.success || isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send />}
          Submit Report
        </Button>
      </form>
    </ResponsiveModal>
  );
}
