import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignIn } from "./sign-in";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && !session.user.isAnonymous) {
    redirect("/");
  }

  return <SignIn />;
}
