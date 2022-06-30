import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { CapitalizeFirstPipe } from '@shared/pipes/capitalize-first/capitalize-first.pipe';
import { CustomFormGroup } from '@core/interface';
import { IDataSourceItem, IFilterColumns } from '../interface';
import { defaultFilterColumns, filterColumnDataSource } from '../constants';
import { TimesheetsTableColumns } from '../enums';
import { TimsheetForm } from '../interface';
import { BaseObservable } from '@core/helpers';
import { Observable } from 'rxjs';

@Injectable()
export class TimesheetsService {
  private currentSelectedTableRowIndex: BaseObservable<number> = new BaseObservable<number>(null as any);

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

  public getStream(): Observable<number> {
    return this.currentSelectedTableRowIndex.getStream();
  }

  public setNextValue(next: boolean): void {
    this.currentSelectedTableRowIndex.set(next ?
      this.currentSelectedTableRowIndex.get() + 1 :
      this.currentSelectedTableRowIndex.get() - 1);
  }

  public setCurrentSelectedIndexValue(value: number): void {
    this.currentSelectedTableRowIndex.set(value);
  }
}
