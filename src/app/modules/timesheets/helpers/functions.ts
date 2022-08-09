export const reduceFiltersState = <T>(oldFilters: T, saveFiltersKeys: string[]): T => {
  return Object.keys(oldFilters).reduce((acc: any, key: string) => {
    if (saveFiltersKeys.includes(key)) {
      acc[key] = (oldFilters as any)[key];
    }

    return acc;
  }, {})
}
