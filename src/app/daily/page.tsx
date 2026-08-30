import { redirect } from "next/navigation";

export default async function Page() {
  redirect(
    `/daily/${Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
    }).format(new Date())}`,
  );
}
