import { redirect } from "next/navigation";

export default async function Page() {
  redirect(
    `/leaderboard/${Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
    }).format(new Date())}`,
  );
}
