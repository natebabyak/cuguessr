import { redirect } from "next/navigation";

export default async function Page() {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  redirect(`/daily/${date}`);
}
