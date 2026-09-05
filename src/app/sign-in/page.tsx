"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowLeftIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import * as v from "valibot";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const SignInSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address.")),
});

function getCallbackURL() {
  if (typeof window === "undefined") {
    return "/daily";
  }

  try {
    const referrer = document.referrer;
    if (referrer) {
      const url = new URL(referrer);
      if (url.origin === window.location.origin) {
        return `${url.pathname}${url.search}`;
      }
    }
  } catch {}

  return "/daily";
}

export default function Page() {
  const form = useForm({
    initialInput: {
      email: "",
    },
    schema: SignInSchema,
  });

  const [screen, setScreen] = useState<"email" | "magicLink">("email");

  const handleSubmit: SubmitHandler<typeof SignInSchema> = async (output) => {
    await authClient.signIn.magicLink({
      email: output.email,
      callbackURL: getCallbackURL(),
    });

    setScreen("magicLink");
  };

  return (
    <div className="flex flex-col">
      <AppHeader />
      <main className="flex min-h-[70vh] flex-col items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          {screen === "email" ? (
            <Form of={form} onSubmit={handleSubmit}>
              <FieldGroup className="w-sm">
                <FieldGroup>
                  <Button
                    disabled={form.isSubmitting}
                    onClick={async () =>
                      await authClient.signIn.social({
                        provider: "discord",
                        callbackURL: getCallbackURL(),
                      })
                    }
                    variant="outline"
                  >
                    <SiDiscord />
                    Continue with Discord
                  </Button>
                  <Button
                    disabled={form.isSubmitting}
                    onClick={async () =>
                      await authClient.signIn.social({
                        provider: "github",
                        callbackURL: getCallbackURL(),
                      })
                    }
                    variant="outline"
                  >
                    <SiGithub />
                    Continue with GitHub
                  </Button>
                </FieldGroup>
                <FieldSeparator>or</FieldSeparator>
                <FieldGroup>
                  <FormischField of={form} path={["email"]}>
                    {(field) => (
                      <Field data-invalid={field.errors !== null}>
                        <FieldLabel htmlFor="sign-in-email">
                          Your Email
                        </FieldLabel>
                        <Input
                          aria-invalid={field.errors !== null}
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          id="sign-in-email"
                          placeholder="Enter your email..."
                          {...field.props}
                        />
                        <FieldDescription>
                          Your email will not be visible to others
                        </FieldDescription>
                        {field.errors && (
                          <FieldError
                            errors={field.errors.map((message) => ({
                              message,
                            }))}
                          />
                        )}
                      </Field>
                    )}
                  </FormischField>
                  <Button
                    disabled={!form.isValid || form.isSubmitting}
                    type="submit"
                  >
                    {form.isSubmitting && <Spinner />}
                    Continue with Email
                  </Button>
                </FieldGroup>
              </FieldGroup>
            </Form>
          ) : (
            <div className="flex w-sm flex-col items-center gap-4">
              <h1 className="mt-8 text-center font-medium text-2xl">
                Check your email
              </h1>
              <p className="mt-2 text-balance text-center text-muted-foreground text-sm">
                We sent a temporary sign in link to your email. Please check
                your inbox and click the link to continue.
              </p>
              <Button onClick={() => setScreen("email")} variant="outline">
                <ArrowLeftIcon />
                Back to sign in
              </Button>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
