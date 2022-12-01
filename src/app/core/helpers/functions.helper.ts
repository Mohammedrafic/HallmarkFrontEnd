import { findItemById } from '@core/helpers';

export const findSelectedItems = <T>(source: number[], arr: T[]): T[] => {
  return source.reduce((acc: T[], itemId: number) => {
    if(findItemById(arr, itemId)) {
      acc.push(findItemById(arr, itemId) as T);
    }

    return acc;
  },
  []);
}

export const createUniqHashObj = <T, U>(
  array: T[],
  keyFn: (arg: T) => string | number,
  valueFn: ((arg: T) => U)
): { [key: string]: U } => {
  return array.reduce((acc: { [key: string]: U }, item: T) => {
    acc[keyFn(item)] = valueFn(item);

    return acc;
  }, {});
};

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
