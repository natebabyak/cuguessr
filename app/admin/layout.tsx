import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = { robots: "noindex, nofollow" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("admin_token")?.value;

  if (token !== process.env.ADMIN_TOKEN) {
    redirect("/admin-login");
  }

  return <>{children}</>;
}
