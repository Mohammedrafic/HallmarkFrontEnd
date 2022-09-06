import { findItemById } from '@core/helpers';

export const findSelectedItems = <T>(source: number[], arr: T[]): T[] => {
  return source.reduce((acc: T[], itemId: number) => {
    acc.push(findItemById(arr, itemId) as T);

    return acc;
  },
  []);
}

/**
 * TODO: change to correct type
 */
export const reduceFiltersState = <T>(oldFilters: T, saveFiltersKeys: string[]): T => {
  return Object.keys(oldFilters).reduce((acc: any, key: string) => {
    if (saveFiltersKeys.includes(key)) {
      acc[key] = (oldFilters as any)[key];
    }

    return acc;
  }, {})
}
