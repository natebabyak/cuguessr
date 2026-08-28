import { SiDiscord, SiGithub, SiReddit } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { FieldGroup, FieldSeparator } from "#/components/ui/field";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-full flex-col">
      <header>
        <Link to="/">cuGuessr</Link>
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
              <SiDiscord />
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
              <SiGithub />
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
              <SiReddit />
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
