import * as React from "react";
import useFetch from "lib/useFetch";
import { useDebounce } from "react-use";
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import { useList } from "./use-list";
import type { SortingState } from "@tanstack/react-table";

interface FetchOptions {
  pageSize?: number;
  pageIndex?: number;
  path: string;
  requireFilterText?: boolean;
  onResponse(json: unknown): { data: any; totalCount: number };
}

interface Options<T> {
  search?: string;
  serverSorting?: boolean;

  disabled?: boolean;
  totalCount: number;
  initialData?: T[];
  scrollToTopOnDataChange?: boolean;
  fetchOptions: FetchOptions;
}

export function useAsyncTable<T>(options: Options<T>) {
  const scrollToTopOnDataChange = options.scrollToTopOnDataChange ?? true;

  const list = useList<T>({ initialData: options.initialData ?? [] });
  const { state: loadingState, execute } = useFetch();

  const [debouncedSearch, setDebouncedSearch] = React.useState(options.search);
  const [filters, setFilters] = React.useState<Record<string, string> | null>(null);
  const [totalDataCount, setTotalCount] = React.useState(options.totalCount);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [paginationOptions, setPagination] = React.useState({
    pageSize: options.fetchOptions.pageSize ?? 35,
    pageIndex: options.fetchOptions.pageIndex ?? 0,
  });

  useQuery({
    initialData: options.initialData ?? [],
    queryFn: fetchData,
    queryKey: [paginationOptions.pageIndex, debouncedSearch, filters, sorting],
  });

  async function fetchData(context: QueryFunctionContext<any>) {
    const [pageIndex, search, _filters, _sorting] = context.queryKey;
    const path = options.fetchOptions.path;
    const skip = Number(pageIndex * paginationOptions.pageSize) || 0;
    const filters = _filters || {};
    const sorting = _sorting || [];

    const searchParams = new URLSearchParams();

    filters.query = search;
    filters.skip = skip;

    for (const sort of sorting) {
      filters.sort = `${sort.id}:${sort.desc ? "desc" : "asc"}`;
    }

    for (const filterKey in filters) {
      const filterValue = filters[filterKey];

      if (typeof filterValue !== "undefined" && filterValue !== null) {
        searchParams.append(filterKey, filterValue);
      }
    }

    const { json } = await execute({
      signal: context.signal,
      path,
      params: Object.fromEntries(searchParams),
    });
    const toReturnData = options.fetchOptions.onResponse(json);
    setTotalCount(toReturnData.totalCount);

    if (scrollToTopOnDataChange) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }

    if (scrollToTopOnDataChange) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }

    return list.setItems(toReturnData.data);
  }

  useDebounce(() => setDebouncedSearch(options.search), 200, [options.search]);

  const pagination = {
    /** indicates whether data comes from the useAsyncTable hook. */
    __ASYNC_TABLE__: true,
    totalDataCount,
    isLoading: loadingState === "loading",
    setPagination,
    serverSorting: options.serverSorting ?? false,
    ...paginationOptions,
  } as const;

  return {
    ...list,
    filters,
    setFilters,
    sorting,
    setSorting,
    isLoading: loadingState === "loading",
    pagination,
  };
}
