export interface BusinessLinesDtoModel {
  items: BusinessLines[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BusinessLines {
  id: number;
  organizationId?: number;
  line: string;
}
