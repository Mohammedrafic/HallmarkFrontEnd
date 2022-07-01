import { PageOfCollections } from '@shared/models/page.model';

export const defaultEmptyPageOfCollections: <T>() => PageOfCollections<T> = () => ({
  hasNextPage: false,
  hasPreviousPage: false,
  items: [],
  pageNumber: 1,
  totalCount: 0,
  totalPages: 1,
});
