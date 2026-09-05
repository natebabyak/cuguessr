"use client";

import { LogOutIcon, PenIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyStats } from "@/app/actions";
import { NameDialog } from "@/app/name-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
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
import type { UserStats } from "@/lib/stats";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function AppHeader() {
  const { data: session } = authClient.useSession();
  const [stats, setStats] = useState<UserStats | null>(null);

  const [open, setOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);

  const isSignedIn = Boolean(session && !session.user.isAnonymous);

  useEffect(() => {
    if (!isSignedIn) {
      setStats(null);
      return;
    }

    let cancelled = false;

    void getMyStats().then((nextStats) => {
      if (!cancelled) {
        setStats(nextStats);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/90 p-4 backdrop-blur-md">
      <Link href="/" className="font-semibold text-2xl">
        <span className="text-red-500">cu</span>
        Guessr
      </Link>
      {isSignedIn && session ? (
        <>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              render={
                <Button size="icon-lg" variant="ghost">
                  <Avatar>
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback>
                      {session.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Signed in as {session.user.name}
                </DropdownMenuLabel>
                {stats ? (
                  <DropdownMenuLabel className="font-normal text-muted-foreground">
                    {stats.currentStreak}-day streak · {stats.gamesPlayed}{" "}
                    {stats.gamesPlayed === 1 ? "game" : "games"}
                  </DropdownMenuLabel>
                ) : null}
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setOpen(false);
                    setNameDialogOpen(true);
                  }}
                >
                  <PenIcon />
                  Change Name
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  closeOnClick={false}
                  onClick={async () => await authClient.signOut()}
                >
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <NameDialog open={nameDialogOpen} onOpenChange={setNameDialogOpen} />
        </>
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
