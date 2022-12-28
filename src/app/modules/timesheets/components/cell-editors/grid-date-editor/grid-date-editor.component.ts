import { AbstractControl, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { DateTimeHelper, TimesheetDateHelper } from '@core/helpers';
import { EditFieldTypes } from '@core/enums';

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

  constructor(
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

  private setFormControl(params: ICellRendererParams): void {
    if (params.colDef?.cellRendererParams.formGroup?.[params.data.id]) {
      const group = params.colDef?.cellRendererParams.formGroup[params.data.id] as FormGroup;
      this.control = group.get((params.colDef as ColDef).field as string) as AbstractControl;

      if (this.type === EditFieldTypes.Time) {
        if (group.get('isTimeInNull')?.value) {
          this.dateValue = null;
          this.control.patchValue(null);
          this.control.markAsTouched();
        }
      }
    }
  }

  private setData(params: ICellRendererParams): void {
    this.dateValue = params.value && new Date(DateTimeHelper.convertDateToUtc(params.value));
    this.value = params.value;

    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
    this.type = (params.colDef as ColDef).cellRendererParams.type;
    this.setdateBoundsForDay(DateTimeHelper.convertDateToUtc(params.value).toISOString());
    this.setFormControl(params);
  }

  private calculateDateValue(date: string): string | null {
    const today = new Date().toISOString();
    const splitStartDate = (this.value || today).split('T')[0];
    const dateStr = date && DateTimeHelper.toUtcFormat(date as string);
    const splitValue = (dateStr as string)?.split('T')[1];

    return dateStr && splitStartDate ? `${splitStartDate}T${splitValue}` : null;
  }
}
