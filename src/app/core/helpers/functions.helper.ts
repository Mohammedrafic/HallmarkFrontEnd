import { HttpParams } from '@angular/common/http';

import { findItemById } from '../helpers';
import { ParamsFromObject } from '../interface';

export const findSelectedItems = <T>(source: number[], arr: T[]): T[] => {
  return source.reduce((acc: T[], itemId: number) => {
    if(findItemById(arr, itemId)) {
      acc.push(findItemById(arr, itemId) as T);
    }

    return acc;
  },
  []);
};

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
  }, {});
};

export function GetQueryParams<T> (params: T): HttpParams {
  if (params) {
    return new HttpParams({ fromObject: params as unknown as ParamsFromObject });
  }

  return new HttpParams();
}

export const CalcDaysMs = (dayNum: number) => {
  return dayNum * 24 * 60 * 60 * 1000;
};

export const GenerateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

export const isObjectsEqual = (obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean => {
  if (obj1 === null && obj2 === null) {
    return true;
  }

  if (!obj1 || typeof obj1 !== 'object' || !obj2 || typeof obj2 !== 'object') {
    return false;
  }

  const firstKeys: string[] = Object.keys(obj1);
  const secondKeys: string[] = Object.keys(obj2);

  if (firstKeys.length !== secondKeys.length) {
    return false;
  }

  return Object.keys(obj1).every((p) => {
    if (Object.prototype.hasOwnProperty.call(obj1, p) !== Object.prototype.hasOwnProperty.call(obj2, p)) {
      return false;
    }

    switch (typeof (obj1[p])) {
      case 'object':
        if (!isObjectsEqual(obj1[p] as Record<string, unknown>, obj2[p] as Record<string, unknown>)) {
          return false;
        }
        break;
      case 'function':
        if (typeof (obj2[p]) === 'undefined' || (p !== 'compare'
        && (obj1[p] as () => unknown).toString() !== (obj2[p] as () => unknown).toString())) {
          return false;
        }
        break;
      default:
        if (obj1[p] !== obj2[p]) {
          return false;
        }
    }

    return true;
  }) && Object.keys(obj2).every((p) => {
    if (typeof (obj1[p]) === 'undefined' && typeof (obj2[p]) !== 'undefined') {
      return false;
    }
    return true;
  });
};
