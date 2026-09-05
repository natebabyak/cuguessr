"use client";

import { type ColumnDef, type RowData, useTable } from "@tanstack/react-table";
import { PodiumIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Features } from "./features";
import { features } from "./features";

interface DataTableProps<TData extends RowData & { isCurrentUser?: boolean }> {
  columns: ColumnDef<Features, TData>[];
  data: TData[];
}

export function DataTable<TData extends RowData & { isCurrentUser?: boolean }>({
  columns,
  data,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.original.isCurrentUser ? "selected" : undefined}
            >
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length}>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PodiumIcon />
                  </EmptyMedia>
                  <EmptyTitle>No scores yet</EmptyTitle>
                  <EmptyDescription>
                    No scores have been submitted yet. Be the first to submit a
                    score.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
