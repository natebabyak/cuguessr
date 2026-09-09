"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowLeftIcon, InboxIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import * as v from "valibot";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

const EmailSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address.")),
});

const OtpSchema = v.object({
  otp: v.pipe(
    v.string(),
    v.length(6, "Please enter the 6-digit code from your email."),
    v.regex(/^[0-9]+$/, "The code can only contain numbers."),
  ),
});

export function SignIn() {
  const emailForm = useForm({
    schema: EmailSchema,
    initialInput: {
      email: "",
    },
    validate: "submit",
    revalidate: "input",
  });
  const otpForm = useForm({
    schema: OtpSchema,
    initialInput: {
      otp: "",
    },
    validate: "submit",
    revalidate: "input",
  });

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  const handleEmailSubmit: SubmitHandler<typeof EmailSchema> = async (
    output,
  ) => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: output.email,
      type: "sign-in",
    });

    if (error) {
      toast.add({
        title: "Failed to send sign-in code",
        type: "error",
      });

      return;
    }

    setEmail(output.email);
    setStep("otp");
  };

  const handleOtpSubmit: SubmitHandler<typeof OtpSchema> = async (output) => {
    const { error } = await authClient.signIn.emailOtp({
      email,
      otp: output.otp,
    });

    if (error) {
      toast.add({
        title: "Invalid or expired code",
        description: "Please check the code and try again.",
        type: "error",
      });

      return;
    }

    window.location.assign("/");
  };

  const resendOtp = async () => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    if (error) {
      toast.add({
        title: "Failed to resend sign-in code",
        type: "error",
      });

      return;
    }

    toast.add({
      title: "New code sent",
      description: "Check your inbox for the latest sign-in code.",
      type: "success",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          {step === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, scale: 0.99, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: 24 }}
              transition={{ duration: 0.5 }}
            >
              <Form of={emailForm} onSubmit={handleEmailSubmit}>
                <FieldGroup className="w-sm">
                  <FieldSet>
                    <FieldLegend>Welcome</FieldLegend>
                    <FieldDescription>
                      Sign in to save your stats
                    </FieldDescription>
                    <FieldGroup>
                      <Button
                        disabled={emailForm.isSubmitting}
                        onClick={async () =>
                          await authClient.signIn.social({
                            provider: "discord",
                          })
                        }
                        type="button"
                        variant="outline"
                      >
                        <SiDiscord />
                        Continue with Discord
                      </Button>
                      <Button
                        disabled={emailForm.isSubmitting}
                        onClick={async () =>
                          await authClient.signIn.social({
                            provider: "github",
                          })
                        }
                        type="button"
                        variant="outline"
                      >
                        <SiGithub />
                        Continue with GitHub
                      </Button>
                    </FieldGroup>
                    <FieldSeparator>or</FieldSeparator>
                    <FieldGroup>
                      <FormischField of={emailForm} path={["email"]}>
                        {(field) => (
                          <>
                            <Field data-invalid={field.errors !== null}>
                              <FieldLabel htmlFor="sign-in-email">
                                Your Email
                              </FieldLabel>
                              <Input
                                aria-invalid={field.errors !== null}
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={emailForm.isSubmitting}
                                id="sign-in-email"
                                placeholder="you@example.com"
                                {...field.props}
                              />
                              {field.errors && (
                                <FieldError
                                  errors={field.errors.map((message) => ({
                                    message,
                                  }))}
                                />
                              )}
                            </Field>
                            <Button
                              disabled={
                                field.errors !== null || emailForm.isSubmitting
                              }
                              type="submit"
                            >
                              {emailForm.isSubmitting && <Spinner />}
                              Continue with Email
                            </Button>
                          </>
                        )}
                      </FormischField>
                    </FieldGroup>
                  </FieldSet>
                </FieldGroup>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.99, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: 24 }}
              transition={{ duration: 0.5 }}
            >
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon />
                  </EmptyMedia>
                  <EmptyTitle className="text-2xl">Check your inbox</EmptyTitle>
                  <EmptyDescription>
                    We sent a 6-digit sign-in code to {email}. Enter it below to
                    continue. If you don't see it, check your spam folder.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Form of={otpForm} onSubmit={handleOtpSubmit}>
                    <FieldGroup className="w-sm">
                      <FormischField of={otpForm} path={["otp"]}>
                        {(field) => (
                          <Field data-invalid={field.errors !== null}>
                            <FieldLabel
                              htmlFor="sign-in-otp"
                              className="justify-center text-center"
                            >
                              Sign-in code
                            </FieldLabel>
                            <InputOTP
                              aria-invalid={field.errors !== null}
                              autoFocus
                              containerClassName="justify-center"
                              id="sign-in-otp"
                              maxLength={6}
                              value={field.input ?? ""}
                              onChange={field.onChange}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                            {field.errors && (
                              <FieldError
                                errors={field.errors.map((message) => ({
                                  message,
                                }))}
                              />
                            )}
                            <Button
                              disabled={
                                field.errors !== null ||
                                field.input?.length !== 6 ||
                                otpForm.isSubmitting
                              }
                              type="submit"
                              className="mt-8"
                            >
                              {otpForm.isSubmitting && <Spinner />}
                              Verify code
                            </Button>
                          </Field>
                        )}
                      </FormischField>
                    </FieldGroup>
                  </Form>
                  <Button
                    disabled={otpForm.isSubmitting}
                    onClick={resendOtp}
                    type="button"
                    variant="ghost"
                  >
                    Resend code
                  </Button>
                  <Button onClick={() => setStep("email")} variant="ghost">
                    <ArrowLeftIcon />
                    Use a different email
                  </Button>
                </EmptyContent>
              </Empty>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
