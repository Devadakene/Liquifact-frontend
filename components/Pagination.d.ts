import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface PaginationProps {
  shown: number;
  total: number;
  onLoadMore: () => void;
  page?: number;
  totalPages?: number;
  pageSize?: number;
}

declare const Pagination: ForwardRefExoticComponent<
  PaginationProps & RefAttributes<HTMLButtonElement>
>;
export default Pagination;

export function normalizePaginationParams(params?: {
  page?: number | string;
  pageSize?: number | string;
  totalItems?: number;
  defaultPageSize?: number;
}): { page: number; pageSize: number; totalPages: number };
