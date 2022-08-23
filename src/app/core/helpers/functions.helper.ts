import { findItemById } from '@core/helpers';

export const findSelectedItems = <T>(source: number[], arr: T[]): T[] => {
  return source.reduce((acc: T[], itemId: number) => {
    acc.push(findItemById(arr, itemId) as T);

    return acc;
  },
  []);
}
