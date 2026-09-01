import { headers } from "next/headers";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export async function AppHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 flex items-center justify-between bg-background p-4">
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
              <DropdownMenuItem>Change Avatar</DropdownMenuItem>
              <DropdownMenuItem>Change Name</DropdownMenuItem>
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
