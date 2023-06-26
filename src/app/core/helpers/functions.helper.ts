import { HttpParams } from '@angular/common/http';
import { sortBy } from '@shared/helpers/sort-array.helper';

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

export const reduceFiltersState = <T>(oldFilters: T,
  saveFiltersKeys: string[]): Partial<T> => {
  return Object.keys(oldFilters as Record<string, unknown>)
  .reduce((acc: Partial<T>, key: string) => {
    if (saveFiltersKeys.includes(key)) {
     (acc[key as keyof T]) = oldFilters[key as keyof T];
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

export const areArraysEqual = (arr1: unknown[], arr2: unknown[], strictEquality = false): boolean => {
  let arrayA = arr1;
  let arrayB = arr2;

  if (!Array.isArray(arrayA) || !Array.isArray(arrayB)) {
    return false;
  }
  if (arrayA === arrayB) {
    return true;
  }
  if (arrayA.length !== arrayB.length) {
    return false;
  }

  if (strictEquality) {
    arrayA = sortBy(arrayA);
    arrayB = sortBy(arrayB);
  }

  return arrayA.every((val: unknown, index: number) => val === arrayB[index]);
};

/**
 * TODO: Add correct naming, add interface for return. PascalCase for naming
 * @param arr array to group
 * @param keys group by keys
 * @param names names of the groups
 * @returns { groupId: { items: [], id: '0', name: 'groupName' } }
 */
export const groupBy = <T>(arr: T[], keys: (keyof T)[], names: (keyof T)[]):
{ [key: string]: {items:T[], id: string, name: string} } => {

  return arr.reduce((storage, item) => {
    const objKey = keys.map(key => `${ item[key] }`).join(':');
    const objName = names.map(name => `${ item[name] }`).join(':');

    if (storage[objKey]) {
      storage[objKey].items.push(item);
    } else {
      storage[objKey] = { items: [item], id: objKey, name: objName };
    }
    return storage;
  }, {} as { [key: string]: { items: T[], id: string, name: string }});
};

export const distinctByKey = <T>(arr: T[], key: (keyof T)): T[] => {
  return [...new Map(arr.map(item => [item[key], item])).values()];
};

export const CheckNumberValue = (value: number | null | undefined): number => {
  return value ?? 0;
};

export const allAreEqual = <T>(array: T[]): boolean => {
  return array.every((item) => item === array[0]);
};
