"use client";

import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ChangeNameDialog } from "./change-name-dialog";

export function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="absolute top-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 items-center justify-between rounded-2xl border bg-background/80 p-4 backdrop-blur-md">
      <Link href="/" className="flex font-semibold text-2xl">
        <span className="text-primary">cu</span>
        Guessr
      </Link>
      {session && !session.user.isAnonymous ? (
        <div className="flex items-center gap-2">
          <ChangeNameDialog />
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" />}>
              Sign out
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
