import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

import { Header } from "#/components/header";
import { Button } from "#/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { authClient } from "#/lib/auth-client";
import { getSession } from "#/lib/auth.functions";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    const session = await getSession();

    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: SignIn,
});

const emailSchema = z.object({
  email: z.email(),
});

const tokenSchema = z.object({
  token: z.string(),
});

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
});

function SignIn() {
  const [step, setStep] = useState<"email" | "token" | "otp">("email");

  const emailForm = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: emailSchema,
    },
    onSubmit: async () => {
      setStep("token");
    },
  });

  const tokenForm = useForm({
    defaultValues: {
      token: "",
    },
    validators: {
      onSubmit: tokenSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.emailOtp.sendVerificationOtp({
        email: emailForm.state.values.email,
        type: "sign-in",
        fetchOptions: {
          headers: {
            "x-captcha-response": value.token,
          },
        },
      });

      setStep("otp");
    },
  });

  const otpForm = useForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: otpSchema,
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.signIn.emailOtp({
        email: emailForm.state.values.email,
        otp: value.otp,
        fetchOptions: {
          headers: {
            "x-captcha-response": tokenForm.state.values.token,
          },
        },
      });

      if (data) {
        throw redirect({ to: "/" });
      }
    },
  });

  return (
    <>
      <Header />
      <main>
        <form id="email-form">
          <FieldGroup>
            <FieldGroup>
              <Field>
                <Button>Continue with Discord</Button>
                <Button>Continue with GitHub</Button>
              </Field>
            </FieldGroup>
            <emailForm.Field
              name="email"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input />
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </main>
    </>
  );
}
