import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DropdownOption } from '@core/interface';
import { Store } from '@ngxs/store';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { FilteredUser, User } from '@shared/models/user.model';
import { isBoolean, isDate, isEmpty, isNumber } from 'lodash';
import { Observable } from 'rxjs';
import { SetPreservedFilters, SetPreservedFiltersForTimesheets } from 'src/app/store/preserved-filters.actions';

@Injectable({ providedIn: 'root' })
export class FilterService {
  constructor(private store: Store, private http: HttpClient) {}

  public canPreserveFilters(): boolean {
    const user = JSON.parse(localStorage.getItem('User') || '') as User;
    return ![BusinessUnitType.Hallmark, BusinessUnitType.MSP].includes(user.businessUnitType);
  }

  public setPreservedFIlters(filters: any, regionPropName = 'regionIds'): void {
    if (this.canPreserveFilters()) {
      this.store.dispatch(
        new SetPreservedFilters(
          { 
            regions: filters[regionPropName] || [], 
            locations: filters.locationIds || [], 
            organizations: filters.organizationIds || null, 
            contactEmails: Array.isArray(filters.contactEmails) ? filters.contactEmails[0] : filters.contactEmails || null
          }
        )
      );
    }
  }

  public setPreservedFIltersTimesheets(filters: any, regionPropName = 'regionIds'): void {
    if (this.canPreserveFilters()) {
      this.store.dispatch(new SetPreservedFiltersForTimesheets({ regions: filters[regionPropName] || [], locations: filters.locationIds || [], organizations: filters.organizationIds || null }));
    }
  }

  public setPreservedFIltersGlobal(filters: any, regionPropName = 'regionsNames'): void {
    if (this.canPreserveFilters()) {
      this.store.dispatch(new SetPreservedFilters({ regions: filters[regionPropName] || [], locations: filters.locationIds || [], organizations: filters.organizationIds || null }, true));
    }
  }

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
            if (datePipe) {
              // TODO use formatDate instead of date Pipe
              chips.push({ text: datePipe.transform(val, 'MM/dd/yyyy'), column: key, value: val });
            }
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
}
