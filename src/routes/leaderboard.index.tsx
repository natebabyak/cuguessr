import { createFileRoute, redirect } from "@tanstack/react-router";

import { getTorontoDate } from "#/lib/game";

export const Route = createFileRoute("/leaderboard/")({
  beforeLoad: async () => {
    throw redirect({
      to: "/leaderboard/$date",
      params: {
        date: getTorontoDate(),
      },
      replace: true,
    });
  },
});
