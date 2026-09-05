import {
  columnFilteringFeature,
  createFilteredRowModel,
  filterFn_includesString,
  tableFeatures,
} from "@tanstack/react-table";

export const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
  },
});

export type Features = typeof features;
