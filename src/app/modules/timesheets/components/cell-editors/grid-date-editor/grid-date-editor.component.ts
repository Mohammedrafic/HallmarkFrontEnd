import { AbstractControl, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams, ColDef } from '@ag-grid-community/core';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { DateTimeHelper } from '@core/helpers';
import { EditFieldTypes } from './../../../enums/add-edit-timesheet.enum';
import { TimesheetDateHelper } from '../../../helpers';

@Component({
  selector: 'app-grid-date-editor',
  templateUrl: './grid-date-editor.component.html',
  styleUrls: ['./grid-date-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridDateEditorComponent extends TimesheetDateHelper implements ICellRendererAngularComp {
  public value: string;

  public dateValue: Date;

  public editable = false;

  public control: AbstractControl;

  public type: EditFieldTypes;

  constructor(
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  public agInit(params: ICellRendererParams): void {
    const data = params.data as Record<string, string | number>;
    this.value = params.value;
    const day = data[params.colDef?.field as string] as string;
    this.dateValue = new Date(day ? day : 0);
    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.dateValue = new Date(DateTimeHelper.convertDateToUtc(params.value));
    this.value = params.value;
    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
    this.type = (params.colDef as ColDef).cellRendererParams.type;

    this.setdateBoundsForDay(params.value);
    this.setFormControl(params);
    this.cd.markForCheck();
    return true;
  }

  public handleTimeChange(event: ChangeEventArgs): void {
    this.control.markAsTouched();
    this.control.patchValue(event.value);
  }

  private setFormControl(params: ICellRendererParams): void {
    if (params.colDef?.cellRendererParams.formGroup?.[params.data.id]) {
      const group = params.colDef?.cellRendererParams.formGroup[params.data.id] as FormGroup;
      this.control = group.get((params.colDef as ColDef).field as string) as AbstractControl;
    }
  }
}
