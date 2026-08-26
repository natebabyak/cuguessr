import { redirect } from "next/navigation";

export default async function Page() {
  const today = new Date().toISOString().slice(0, 10);

  redirect(`/daily/${today}`);
}
