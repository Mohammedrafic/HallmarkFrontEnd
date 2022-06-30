export interface InvoicesTableConfig {
  onPageSizeChange: (size: number) => void;
  onPageChange: (pageNumber: number) => void;
}

export interface PagingQueryParams {
  page: number;
  pageSize: number;
}
