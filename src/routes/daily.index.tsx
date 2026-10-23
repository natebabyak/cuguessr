import { createFileRoute, redirect } from "@tanstack/react-router";

const formatter = Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const Route = createFileRoute("/daily/")({
  beforeLoad: async () => {
    throw redirect({
      to: "/daily/$date",
      params: {
        date: formatter.format(new Date()),
      },
      replace: true,
    });
  },
});
