import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import { CapitalizeFirstPipe } from '@shared/pipes/capitalize-first/capitalize-first.pipe';
import { CustomFormGroup } from '@core/interface';
import { BaseObservable } from '@core/helpers';
import { TimsheetForm } from '../interface';

@Injectable()
export class TimesheetsService {
  private currentSelectedTableRowIndex: BaseObservable<number> = new BaseObservable<number>(null as any);

  constructor(private capitalizeFirst: CapitalizeFirstPipe, private fb: FormBuilder,) {
  }

  public createForm(): CustomFormGroup<TimsheetForm> {
    return this.fb.group({
      search: [''],
      orderId: [[]],
      statusText: [[]],
      skill: [[]],
      department: [[]],
      agencyName: [[]],
      orgName: [[]],
      region: [[]],
      location: [[]],
    }) as CustomFormGroup<TimsheetForm>;
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
