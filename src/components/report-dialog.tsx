"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { useState } from "react";
import * as v from "valibot";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "./ui/input-group";

const TITLE = "Submit Report";
const DESCRIPTION = "Enter a description to submit a report.";

const schema = v.object({
  description: v.pipe(
    v.string(),
    v.minLength(1, "Description is required."),
    v.maxLength(255, "Description must be at most 255 characters."),
  ),
});

export function ReportDialog({ photoId }: { photoId: string }) {
  const isMobile = useIsMobile();

  const form = useForm({
    schema,
    initialInput: {
      description: "",
    },
  });

  const handleSubmit: SubmitHandler<typeof schema> = async (output) => {
    console.log(output);
  };

  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger render={<ReportDialogTrigger />} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
            <DrawerDescription>{DESCRIPTION}</DrawerDescription>
          </DrawerHeader>
          <SubmitDialogForm />
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
    return <Button onClick={() => setOpen(true)}>Report</Button>;
  }

  function SubmitDialogForm() {
    return (
      <Form of={form} onSubmit={handleSubmit}>
        <FieldGroup>
          <FormischField of={form} path={["description"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="report-description">
                  Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field.props}
                    aria-invalid={field.errors !== null}
                    id="report-description"
                    placeholder="Enter a description..."
                    value={field.input ?? ""}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText>{field.input?.length}/255</InputGroupText>
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
      <Button disabled={!form.isValid || form.isSubmitting}>
        {form.isSubmitting && <Spinner />}
        Submit
      </Button>
    );
  }

  function ReportDialogClose() {
    return <Button variant="outline">Cancel</Button>;
  }
}
