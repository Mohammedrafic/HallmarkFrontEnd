import { AbstractControl, FormGroup } from '@angular/forms';

export const leftOnlyValidValues = (formGroup: FormGroup): any => {
  return Object.entries(formGroup.controls).reduce((acc: any, [key, control]: [string, AbstractControl]) => {
    if (
      control.dirty &&
      (!Array.isArray(control.value) && control.value ||
        Array.isArray(control.value) && control.value.length)
    ) {
      acc[key] = control.value;
    }

    return acc;
  }, {});
}

export const reduceFiltersState = <T>(oldFilters: T, saveFiltersKeys: string[]): T => {
  return Object.keys(oldFilters).reduce((acc: any, key: string) => {
    if (saveFiltersKeys.includes(key)) {
      acc[key] = (oldFilters as any)[key];
    }

    return acc;
  }, {})
}

export const findItemById = <T>(arr: T[], id: number): T => {
  return arr.find((el: any) => el.id === id) as T;
}
