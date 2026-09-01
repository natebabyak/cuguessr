"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { Features } from "./features";

interface Row {
  rank: number;
  player: string;
  score: number;
  submittedAt: Date;
}

const columnHelper = createColumnHelper<Features, Row>();

export const columns = columnHelper.columns([
  columnHelper.accessor("rank", {
    header: "#",
  }),
  columnHelper.accessor("player", {
    header: "Player",
  }),
  columnHelper.accessor("score", {
    header: "Score",
  }),
  columnHelper.accessor("submittedAt", {
    header: "@",
  }),
]);
