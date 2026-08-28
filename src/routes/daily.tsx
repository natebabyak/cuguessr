import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/daily")({
  beforeLoad: () => {
    const today = Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
    }).format(new Date());

    throw redirect({
      to: "/daily/$date",
      params: {
        date: today,
      },
    });
  },
});
