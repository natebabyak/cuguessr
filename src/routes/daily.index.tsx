import { createFileRoute, redirect } from "@tanstack/react-router";

import { getTorontoDate } from "#/lib/game";

export const Route = createFileRoute("/daily/")({
  beforeLoad: async () => {
    throw redirect({
      to: "/daily/$date",
      params: {
        date: getTorontoDate(),
      },
      replace: true,
    });
  },
});
