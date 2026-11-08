import { SiDiscord, SiGithub, SiReddit } from "@icons-pack/react-simple-icons";
import { formOptions, revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import z from "zod";

import { Footer } from "#/components/footer";
import { Header } from "#/components/header";
import { Button } from "#/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "#/components/ui/input-otp";
import { authClient } from "#/lib/auth-client";
import { getSession } from "#/lib/auth.functions";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const session = await getSession();

    if (session && !session.user.isAnonymous) {
      throw redirect({
        to: "/",
      });
    }
  },
  head: () => ({
    meta: [
      {
        title: "Login | cuGuessr",
      },
    ],
  }),
  component: Login,
});

const emailSchema = z.object({
  email: z.email("Enter a valid email address."),
});

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

const loginFormOptions = formOptions({
  defaultValues: {
    emailStep: { email: "" },
    otpStep: { otp: "" },
  },
});

function Login() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [codeResent, setCodeResent] = useState(false);

  const form = useForm({
    ...loginFormOptions,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({ emailStep: emailSchema, otpStep: otpSchema }),
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const { error } = await authClient.signIn.emailOtp({
          email: value.emailStep.email,
          otp: value.otpStep.otp,
        });

        if (error) {
          setError(error.message ?? "Unable to log in. Please try again.");
          return;
        }

        await router.invalidate();
        await router.navigate({ to: "/" });
      } catch {
        setError("Unable to log in. Please try again.");
      }
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const email = useStore(form.store, (state) => state.values.emailStep.email);
  const isBusy = isSubmitting || isResending || provider !== null;

  async function loginWithProvider(provider: "discord" | "github" | "reddit") {
    setError(null);
    setProvider(provider);

    try {
      const { error } = await authClient.signIn.social({ provider, callbackURL: "/" });

      if (error) {
        setError(error.message ?? "Unable to log in. Please try again.");
        setProvider(null);
      }
    } catch {
      setError("Unable to log in. Please try again.");
      setProvider(null);
    }
  }

  async function sendCode(email: string) {
    setError(null);
    setCodeResent(false);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });

      if (error) {
        setError(error.message ?? "Unable to send a code. Please try again.");
        return false;
      }

      return true;
    } catch {
      setError("Unable to send a code. Please try again.");
      return false;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-sm space-y-8" aria-labelledby="login-title">
          <div className="space-y-2 text-center">
            <h1 id="login-title" className="text-2xl font-bold">
              {step === "email" ? "Login" : "Check your email"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === "email"
                ? "Continue to cuGuessr."
                : `Enter the 6-digit code sent to ${email}.`}
            </p>
          </div>

          {step === "email" ? (
            <form.FormGroup
              name="emailStep"
              validators={{ onDynamic: emailSchema }}
              onGroupSubmit={async ({ value }) => {
                if (await sendCode(value.email)) {
                  form.resetField("otpStep.otp");
                  setStep("otp");
                }
              }}
            >
              {(group) => (
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!isBusy && !group.state.meta.isSubmitting) void group.handleSubmit();
                  }}
                >
                  <FieldGroup>
                    <Field>
                      <Button
                        type="button"
                        disabled={isBusy || group.state.meta.isSubmitting}
                        onClick={() => void loginWithProvider("discord")}
                      >
                        <SiDiscord />
                        Continue with Discord
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy || group.state.meta.isSubmitting}
                        onClick={() => void loginWithProvider("github")}
                      >
                        <SiGithub />
                        Continue with GitHub
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy || group.state.meta.isSubmitting}
                        onClick={() => void loginWithProvider("reddit")}
                      >
                        <SiReddit />
                        Continue with Reddit
                      </Button>
                    </Field>
                    <FieldSeparator>or</FieldSeparator>
                    <form.Field name="emailStep.email">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="email"
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={field.state.value}
                              onChange={(event) => field.handleChange(event.target.value)}
                              onBlur={field.handleBlur}
                              disabled={isBusy || group.state.meta.isSubmitting}
                              aria-invalid={isInvalid}
                              aria-describedby={isInvalid ? "email-error" : undefined}
                            />
                            {isInvalid && (
                              <FieldError id="email-error" errors={field.state.meta.errors} />
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>
                    <Button type="submit" disabled={isBusy || group.state.meta.isSubmitting}>
                      {group.state.meta.isSubmitting ? "Sending code…" : "Continue with email"}
                    </Button>
                  </FieldGroup>
                </form>
              )}
            </form.FormGroup>
          ) : (
            <form.FormGroup
              name="otpStep"
              validators={{ onDynamic: otpSchema }}
              onGroupSubmit={() => form.handleSubmit()}
            >
              {(group) => (
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!isBusy && !group.state.meta.isSubmitting) void group.handleSubmit();
                  }}
                >
                  <FieldGroup>
                    <form.Field name="otpStep.otp">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Verification code</FieldLabel>
                            <InputOTP
                              id={field.name}
                              name={field.name}
                              maxLength={6}
                              pattern={REGEXP_ONLY_DIGITS}
                              autoComplete="one-time-code"
                              autoFocus
                              value={field.state.value}
                              onChange={field.handleChange}
                              onBlur={field.handleBlur}
                              disabled={isBusy || group.state.meta.isSubmitting}
                              aria-invalid={isInvalid}
                              aria-describedby={isInvalid ? "otp-error" : "otp-description"}
                            >
                              <InputOTPGroup>
                                {Array.from({ length: 6 }, (_, index) => (
                                  <InputOTPSlot key={index} index={index} />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                            <FieldDescription id="otp-description">
                              Your code expires in 5 minutes.
                            </FieldDescription>
                            {isInvalid && (
                              <FieldError id="otp-error" errors={field.state.meta.errors} />
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>
                    <Button type="submit" disabled={isBusy || group.state.meta.isSubmitting}>
                      {isSubmitting || group.state.meta.isSubmitting ? "Logging in…" : "Login"}
                    </Button>
                    <div className="flex justify-between gap-3">
                      <Button
                        type="button"
                        variant="link"
                        disabled={isBusy || group.state.meta.isSubmitting}
                        onClick={() => {
                          setError(null);
                          setCodeResent(false);
                          form.resetField("otpStep.otp");
                          setStep("email");
                        }}
                      >
                        Change email
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        disabled={isBusy || group.state.meta.isSubmitting}
                        onClick={async () => {
                          setIsResending(true);
                          if (await sendCode(email)) {
                            form.resetField("otpStep.otp");
                            setCodeResent(true);
                          }
                          setIsResending(false);
                        }}
                      >
                        {isResending ? "Sending code…" : "Resend code"}
                      </Button>
                    </div>
                    {codeResent && (
                      <p role="status" className="text-muted-foreground text-sm">
                        A new code has been sent.
                      </p>
                    )}
                  </FieldGroup>
                </form>
              )}
            </form.FormGroup>
          )}
          {error && <FieldError>{error}</FieldError>}
        </section>
      </main>
      <Footer />
    </div>
  );
}
