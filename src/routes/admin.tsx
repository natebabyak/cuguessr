import { createFileRoute, redirect } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { getSession } from "#/lib/auth.functions";

export const Route = createFileRoute("/admin")({
  loader: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/sign-in" });
    }

    if (!session.user.isAdmin) {
      throw redirect({ to: "/" });
    }

    return session;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <main>
        <h1>Admin Dashboard</h1>
        <Tabs>
          <TabsList>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="photos"></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
