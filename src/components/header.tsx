import { Link } from "@tanstack/react-router";

import { Button, buttonVariants } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

export function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="bg-background border-b p-4">
      <div className="flex max-w-5xl items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          cuGuessr
        </Link>
        {session && !session.user.isAnonymous ? (
          <Button>Signed in as {session.user.name}</Button>
        ) : (
          <Link to="/login" className={buttonVariants({ variant: "outline" })}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
