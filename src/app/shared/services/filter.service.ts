import { DatePipe, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { isBoolean, isDate, isEmpty, isNumber } from 'lodash';
import { debounceTime, map, Observable } from 'rxjs';

import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { CommonFormConfig } from '@shared/models/common-form-config.model';
import { FilteredItem } from '@shared/models/filter.model';
import { FilteredUser } from '@shared/models/user.model';
import { DropdownOption } from '@core/interface';

@Injectable({ providedIn: 'root' })
export class FilterService {
  constructor(private http: HttpClient) {}

  /**
   * Remove value from form control
   * @param event item to remove
   * @param form form group to update
   */
  public removeValue(event: FilteredItem, form: FormGroup, filterColumns: any): void {
    let val = form.controls[event.column].value;

    if (Array.isArray(val)) {
      val = val.filter((item) => {
        return item !== event.value;
      });
      form.controls[event.column].setValue(val);
    } else if (filterColumns[event.column].type === ControlTypes.Checkbox) {
      form.controls[event.column].setValue(false);
    } else if (filterColumns[event.column].type === ControlTypes.Radio) {
      form.controls[event.column].setValue(filterColumns[event.column].default);
    } else if (
      filterColumns[event.column].type === ControlTypes.Date
      || filterColumns[event.column].type === ControlTypes.Dropdown
      || filterColumns[event.column].type === ControlTypes.Autocomplete
      ) {
      form.controls[event.column].setValue(null);
    } else {
      form.controls[event.column].setValue('');
    }
  }

  /**
   * Generate list of applied filters with id/value based on control type
   * @param filterColumns filter configuration
   * @param form form group to update
   * @returns list of applied filters
   */
  public generateChips(form: FormGroup, filterColumns: any, datePipe?: DatePipe): FilteredItem[] {
    const chips: any[] = [];

    Object.keys(form.controls)
      .filter((key) => {
        const value = form.controls[key].value;
        return !isEmpty(value) || isDate(value) || isBoolean(value) || isNumber(value);
      })
      .forEach((key) => {
        if (!filterColumns[key]) {
          console.warn(key + ' is not defined in filter config.');
          return;
        }

        const val = form.controls[key].value;

        switch (filterColumns[key].type) {
          case ControlTypes.Multiselect:
            val.forEach((item: any) => {
              const filteredItem = filterColumns[key].dataSource?.find(
                (data: any) => data[filterColumns[key].valueId] === item
              );
              chips.push({
                text:
                  filterColumns[key].valueType === ValueType.Id ? filteredItem
                  && filteredItem[filterColumns[key].valueField] : item,
                column: key,
                value: item,
                organizationId: filteredItem?.organizationId || filteredItem?.businessUnitId || null,
                regionId: filteredItem?.regionId || null,
                locationId: filteredItem?.locationId || null,
                regionBlocked: filteredItem?.regionBlocked || null,
                locationBlocked: filteredItem?.locationBlocked || null,
              });
            });
            break;

          case ControlTypes.Autocomplete:
            const filteredItem = filterColumns[key].dataSource?.find(
              (data: any) => data[filterColumns[key].valueId] === val
            );
            chips.push({
              text:
                filterColumns[key].valueType === ValueType.Id ? filteredItem
                && filteredItem[filterColumns[key].valueField] : val,
              column: key,
              value: val,
            });
            break;

          case ControlTypes.Checkbox:
            chips.push({ text: filterColumns[key].checkBoxTitle, column: key, value: val });
            break;

          case ControlTypes.Date:
              chips.push({ text: formatDate(val, 'MM/dd/yyyy', 'en-US'), column: key, value: val });
            break;

          case ControlTypes.Radio:
            if (filterColumns[key].dataSource[val]) {
              chips.push({ text: filterColumns[key].dataSource[val], column: key, value: val });
            }
            break;

          case ControlTypes.Dropdown:
            const item: DropdownOption = filterColumns[key].dataSource.find((item: DropdownOption) => item.value === val);

            if (item) {
              chips.push({ text: item.text, column: key, value: val });
            }
            break;
          default:
            chips.push({ text: val, column: key, value: val });
            break;
        }
      });

    return chips;
  }

  public getUsersListBySearchTerm(searchTerm: string): Observable<FilteredUser[]> {
    return this.http.get<FilteredUser[]>('/api/UserSearch', { params: { searchTerm } });
  }

  public syncFilterTagsWithControls<T>(formGroup: FormGroup, filterColumns: T): Observable<FilteredItem[]> {
    return formGroup.valueChanges.pipe(
      debounceTime(300),
      map(() => this.generateChips(formGroup, filterColumns))
    );
  }

  public composeFilterState<T extends CommonFormConfig, S extends Record<string, unknown>>(
    formConfig: T[],
    state: S
  ): S {
    const filter = formConfig.reduce((acc, item) => {
      const field = item.field as keyof S;
      const value = state?.[field];
      if (value) {
        acc[field] = value;
      }
      return acc;
    }, {} as S);

    return filter;
  }
}
