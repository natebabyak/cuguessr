import {
  Form,
  Field as FormischField,
  reset,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { FlagIcon, SendIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { submitReport } from "./actions";
import { ReportSchema } from "./report-schema";

const TITLE = "Submit Report";
const DESCRIPTION = "Enter a description to submit a report.";

export function ReportDialog({ photoId }: { photoId: number }) {
  const isMobile = useIsMobile();

  const form = useForm({
    schema: ReportSchema,
    initialInput: {
      photoId,
      description: "",
    },
  });

  const [open, setOpen] = useState(false);

  const handleSubmit: SubmitHandler<typeof ReportSchema> = async (output) => {
    toast
      .promise(submitReport(output), {
        loading: "Submitting...",
        success: "Report submitted successfully!",
        error: "Failed to submit report.",
      })
      .finally(() => setOpen(false));
  };

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger render={<ReportDialogTrigger />} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
            <DrawerDescription>{DESCRIPTION}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <SubmitDialogForm />
          </div>
          <DrawerFooter>
            <ReportDialogSubmit />
            <DrawerClose render={<ReportDialogClose />} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<ReportDialogTrigger />} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <SubmitDialogForm />
        <DialogFooter>
          <DialogClose render={<ReportDialogClose />} />
          <ReportDialogSubmit />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function ReportDialogTrigger() {
    return (
      <Button
        onClick={() => setOpen(true)}
        size="icon-lg"
        title="Report photo"
        type="button"
      >
        <FlagIcon />
      </Button>
    );
  }

  function SubmitDialogForm() {
    return (
      <Form of={form} onSubmit={handleSubmit}>
        <FieldGroup>
          <FormischField of={form} path={["description"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <InputGroup>
                  <InputGroupTextarea
                    aria-invalid={field.errors !== null}
                    autoCapitalize="sentences"
                    autoComplete="off"
                    id="report-description"
                    placeholder="Enter a description..."
                    {...field.props}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText
                      className={cn(
                        (field.input?.length ?? 0) > 255 && "text-destructive",
                      )}
                    >
                      {field.input?.length ?? 0}/255
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {field.errors && (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                )}
              </Field>
            )}
          </FormischField>
        </FieldGroup>
      </Form>
    );
  }

  function ReportDialogSubmit() {
    return (
      <Button disabled={!form.isValid || form.isSubmitting} type="submit">
        {form.isSubmitting ? <Spinner /> : <SendIcon />}
        Submit
      </Button>
    );
  }

  function ReportDialogClose() {
    return (
      <Button
        onClick={() => {
          reset(form);
          setOpen(false);
        }}
        type="button"
        variant="outline"
      >
        <XIcon />
        Cancel
      </Button>
    );
  }
}
