import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { CapitalizeFirstPipe } from '@shared/pipes/capitalize-first/capitalize-first.pipe';
import { CustomFormGroup } from '@core/interface';
import { IDataSourceItem, IFilterColumns } from '../interface';
import { defaultFilterColumns, filterColumnDataSource } from '../constants';
import { TimesheetsTableColumns } from '../enums';
import { TimsheetForm } from '../interface';

@Injectable()
export class TimesheetsService {
  constructor(private capitalizeFirst: CapitalizeFirstPipe, private fb: FormBuilder,) {
  }

  public createForm(): CustomFormGroup<TimsheetForm> {
    return this.fb.group({
      date: [null],
      search: [''],
      orderId: [''],
      status: [[]],
      skill: [[]],
      department: [[]],
      billRate: [0],
      agencyName: [[]],
      totalHours: [0],
    }) as CustomFormGroup<TimsheetForm>;
  }

  public createFilterColumns(): IFilterColumns {
    return defaultFilterColumns;
  }

  public setDataSources(filterKey: TimesheetsTableColumns): IDataSourceItem[] | any {
    return filterColumnDataSource[filterKey].map((el: IDataSourceItem) =>
      ({...el, name: this.capitalizeFirst.transform(el.name)})
    );
  }
}
