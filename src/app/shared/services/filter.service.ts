import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';

@Injectable({ providedIn: 'root' })
export class FilterService {

  constructor() { }

  /**
   * Remove value from form control
   * @param event item to remove
   * @param form form group to update
   */
  public removeValue(event: FilteredItem, form: FormGroup, filterColumns: any): void {
    let val = form.controls[event.column].value;
    if (Array.isArray(val)) {
      val = val.filter(item => {
        return item !== event.value;
      });
      form.controls[event.column].setValue(val);
    } else if (filterColumns[event.column].type === ControlTypes.Checkbox) {
      form.controls[event.column].setValue(false);
    } else if (filterColumns[event.column].type === ControlTypes.Radio) {
      form.controls[event.column].setValue(filterColumns[event.column].default);
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
    let chips: any[] = [];
    Object.keys(form.controls).forEach(key => {
      const val = form.controls[key].value;
      if (!val || !val.length) return;
      if (filterColumns[key].type === ControlTypes.Multiselect) {
        val.forEach((item: any) => {
          chips.push({
            text: filterColumns[key].valueType === ValueType.Id ? 
            filterColumns[key].dataSource.find((data: any) => data[filterColumns[key].valueId] === item)[filterColumns[key].valueField] : item, 
            column: key, 
            value: item 
          });
        });
      } else if (filterColumns[key].type === ControlTypes.Checkbox) {
        chips.push({ text: filterColumns[key].checkBoxTitle, column: key, value: val });
      } else if (filterColumns[key].type === ControlTypes.Date && datePipe) {
        chips.push({ text: datePipe.transform(val,'MM/dd/yyyy'), column: key, value: val });
      } else if (filterColumns[key].type === ControlTypes.Radio) {
        if (filterColumns[key].dataSource[val]) {
          chips.push({ text: filterColumns[key].dataSource[val], column: key, value: val });
        }
      } else {
        chips.push({ text: val, column: key, value: val });
      }
    });
    return chips;
  }
}
