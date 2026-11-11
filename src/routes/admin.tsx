import { createFileRoute, redirect } from "@tanstack/react-router";

import { getSession } from "#/lib/auth.functions";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session?.user.isAdmin) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div></div>;
}
