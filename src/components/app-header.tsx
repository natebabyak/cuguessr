"use client";

import { CopyIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { NameDialog } from "@/app/name-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function AppHeader() {
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-background/90 p-4 backdrop-blur-md">
      <Link href="/" className="font-semibold text-2xl">
        <span className="text-red-500">cu</span>
        Guessr
      </Link>
      <div className="flex gap-2">
        <Link href="/daily" className={buttonVariants({ variant: "ghost" })}>
          Daily
        </Link>
        <Link
          href="/leaderboard"
          className={buttonVariants({ variant: "ghost" })}
        >
          Leaderboard
        </Link>
        <Link href="/submit" className={buttonVariants({ variant: "ghost" })}>
          Submit
        </Link>
      </div>
      {session && !session.user.isAnonymous ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback>
                {session.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                Signed in as {session.user.name}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <NameDialog />
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(session.user.id);
                }}
              >
                <CopyIcon />
                Copy user ID
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
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
    </header>
  );
}
