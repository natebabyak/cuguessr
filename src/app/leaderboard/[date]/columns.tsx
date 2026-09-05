"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { Features } from "./features";

export interface LeaderboardRow {
  rank: number;
  player: string;
  score: number;
  submittedAt: Date;
  isCurrentUser?: boolean;
}

const columnHelper = createColumnHelper<Features, LeaderboardRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor("rank", {
    header: "#",
  }),
  columnHelper.accessor("player", {
    header: "Player",
    cell: ({ getValue, row }) => {
      const name = getValue();
      if (row.original.isCurrentUser) {
        return (
          <span>
            {name} <span className="text-muted-foreground text-xs">(You)</span>
          </span>
        );
      }
      return name;
    },
  }),
  columnHelper.accessor("score", {
    header: "Score",
    cell: ({ getValue }) => getValue().toLocaleString("en-CA"),
  }),
  columnHelper.accessor("submittedAt", {
    header: "@",
    cell: ({ getValue }) =>
      getValue().toLocaleTimeString("en-CA", {
        hour: "numeric",
        minute: "2-digit",
      }),
  }),
]);
