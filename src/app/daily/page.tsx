import { redirect } from "next/navigation";
import { connection } from "next/server";

export default async function Page() {
  await connection();
  redirect(
    `/daily/${Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
    }).format(new Date())}`,
  );
}
