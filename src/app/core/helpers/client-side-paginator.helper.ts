export function paginateGridData<T>(data: T[], pageSize: number, pageNumber: number): T[] {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = data.length ? data.slice(startIndex, endIndex) : [];

    return pageData;
  }
