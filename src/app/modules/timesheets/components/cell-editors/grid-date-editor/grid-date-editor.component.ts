import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Subscription, takeUntil } from 'rxjs';

import { EditFieldTypes } from '@core/enums';
import { DateTimeHelper, TimesheetDateHelper } from '@core/helpers';
import { AddRecordBillRate } from '../../../interface';

@Component({
  selector: 'app-grid-date-editor',
  templateUrl: './grid-date-editor.component.html',
  styleUrls: ['./grid-date-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridDateEditorComponent extends TimesheetDateHelper implements ICellRendererAngularComp {
  public value: string | null;

  public dateValue: Date | null;

  public editable = false;

  public control: AbstractControl;

  public type: EditFieldTypes;

  public fieldVisible = true;

  private controlSub: Subscription;

  private rateSub: Subscription;

  private timeInSub: Subscription;

  private group: FormGroup;

  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
    this.cd.markForCheck();
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    this.cd.markForCheck();
    return true;
  }

  public handleTimeChange(event: ChangeEventArgs): void {
    this.control.markAsTouched();
    this.control.patchValue(this.calculateDateValue(event.value as string));
  }

  private setData(params: ICellRendererParams): void {
    this.dateValue = params.value && new Date(DateTimeHelper.setCurrentTimeZone(params.value));
    this.value = params.value;

    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
    this.type = (params.colDef as ColDef).cellRendererParams.type;
    this.fieldVisible = !params.data.disableTime;

    this.setdateBoundsForDay(DateTimeHelper.setCurrentTimeZone(params.value).toISOString());
    this.setFormControl(params);
  }

  private setFormControl(params: ICellRendererParams): void {
    if (params.colDef?.cellRendererParams.formGroup?.[params.data.id]) {
      this.group = params.colDef?.cellRendererParams.formGroup[params.data.id] as FormGroup;
      this.control = this.group.get((params.colDef as ColDef).field as string) as AbstractControl;

      if (this.type === EditFieldTypes.Time) {
        if (this.group.get('isTimeInNull')?.value) {
          this.dateValue = null;
          this.control.patchValue(null);
          this.control.markAsTouched();
        }
      }
    }

    if (!this.controlSub && this.control) {
      this.watchForValidation();
    }

    if (!this.rateSub && this.group) {
      this.observeBillRate();
    }
  }

  private calculateDateValue(date: string): string | null {
    const today = new Date().toISOString();
    const splitStartDate = (this.value || today).split('T')[0];
    const dateStr = date && DateTimeHelper.setUtcTimeZone(date as string);
    const splitValue = (dateStr as string)?.split('T')[1];

    return dateStr && splitStartDate ? `${splitStartDate}T${splitValue}` : null;
  }

  private watchForValidation(): void {
    this.controlSub = this.control.statusChanges
    .pipe(
      takeUntil(this.componentDestroy())
    )
    .subscribe(() => {
      this.cd.markForCheck();
    });
  }

  private observeBillRate(): void {
    this.rateSub = this.group.get('billRateConfigId')?.valueChanges
    .pipe(
      takeUntil(this.componentDestroy())
    )
    .subscribe((rateId: number) => {
      const selectedRate = this.getCurrentBillRate(rateId);

      if (selectedRate && selectedRate.disableTime || selectedRate?.timeNotRequired) {
        this.fieldVisible = false;
        this.group.get('timeIn')?.patchValue(null);
        this.group.get('timeOut')?.patchValue(null);
      } else {
        this.fieldVisible = true;
      }
    }) as Subscription;
  }

  private getCurrentBillRate(rateId: number): AddRecordBillRate | undefined {
    const rates = this.store.snapshot().timesheets.billRateTypes as AddRecordBillRate[];
    return rates.find((rate) => rate.value === rateId);
  }
}
