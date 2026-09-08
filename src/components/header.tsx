"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 bg-background p-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="flex font-semibold text-2xl">
          <span className="text-primary">cu</span>
          Guessr
        </Link>
        {session && !session.user.isAnonymous ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  Signed in as {session.user.name}
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={async () => await authClient.signOut()}
                >
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/sign-in"
            className={buttonVariants({ variant: "outline" })}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
