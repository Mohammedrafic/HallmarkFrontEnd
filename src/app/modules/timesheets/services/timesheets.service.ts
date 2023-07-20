import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { OrganizationRegion } from '@shared/models/organization.model';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { BaseObservable } from '@core/helpers';

import { TimesheetForm } from '../interface';
import { Timesheets } from '../store/actions/timesheets.actions';
import { TimesheetsTableFiltersColumns } from '../enums';

@Injectable()
export class TimesheetsService {
  /**
   * TODO: remove any.
   */
  private currentSelectedTableRowIndex: BaseObservable<number> = new BaseObservable<number>(null as unknown as number);

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
  }

  public createForm(): CustomFormGroup<TimesheetForm> {
    return this.fb.group({
      searchTerm: [''],
      orderIds: [[]],
      statusIds: [[]],
      skillIds: [[]],
      departmentIds: [[]],
      agencyIds: [[]],
      regionsIds: [[]],
      locationIds: [[]],
      contactEmails: '',
    }) as CustomFormGroup<TimesheetForm>;
  }

  public setDataSourceByFormKey(
    key: TimesheetsTableFiltersColumns,
    source: DataSourceItem[] | OrganizationRegion[],
  ): void {
    this.store.dispatch(new Timesheets.SetFiltersDataSource(key, source));
  }

  public getSelectedTimesheetRowStream(): Observable<number> {
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
