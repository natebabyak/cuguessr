"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import DiscordIcon from "@iconify-react/logos/discord-icon";
import GithubIcon from "@iconify-react/logos/github-icon";
import RedditIcon from "@iconify-react/logos/reddit-icon";
import Link from "next/link";
import * as v from "valibot";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const schema = v.object({
  email: v.string(),
});

export default function Page() {
  const form = useForm({
    schema,
    initialInput: {
      email: "",
    },
  });

  const handleSubmit: SubmitHandler<typeof schema> = (output) => {
    console.log(output);
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <header>
        <Link href="/">cuGuessr</Link>
      </header>
      <main>
        <FieldGroup className="mx-auto w-full max-w-sm">
          <FieldGroup>
            <Button
              onClick={async () =>
                await authClient.signIn.social({
                  provider: "discord",
                })
              }
              variant="outline"
            >
              <DiscordIcon />
              Continue with Discord
            </Button>
            <Button
              onClick={async () =>
                await authClient.signIn.social({
                  provider: "github",
                })
              }
              variant="outline"
            >
              <GithubIcon />
              Continue with GitHub
            </Button>
            <Button
              onClick={async () =>
                await authClient.signIn.social({
                  provider: "reddit",
                })
              }
              variant="outline"
            >
              <RedditIcon />
              Continue with Reddit
            </Button>
          </FieldGroup>
          <FieldSeparator>or</FieldSeparator>
          <Form of={form} onSubmit={handleSubmit}>
            <FieldGroup>
              <FormischField of={form} path={["email"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="sign-in-email">Your Email</FieldLabel>
                    <Input
                      {...field.props}
                      aria-invalid={field.errors !== null}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      id="sign-in-email"
                      placeholder="Enter your email..."
                      value={field.input ?? ""}
                    />
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
          <Button disabled={form.isSubmitting}>
            {form.isSubmitting && <Spinner />}
            Continue
          </Button>
        </FieldGroup>
      </main>
    </div>
  );
}
