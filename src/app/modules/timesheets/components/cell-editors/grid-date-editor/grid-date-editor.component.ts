import { AbstractControl, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams, ColDef } from '@ag-grid-community/core';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { EditFieldTypes } from './../../../enums/add-edit-timesheet.enum';

@Component({
  selector: 'app-grid-date-editor',
  templateUrl: './grid-date-editor.component.html',
  styleUrls: ['./grid-date-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridDateEditorComponent implements ICellRendererAngularComp {
  public value: string;

  public dateValue: Date;

  public editable = false;

  public control: AbstractControl;

  public type: EditFieldTypes;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  public agInit(params: ICellRendererParams): void {
    const data = params.data as Record<string, string | number>;
    const day = data[params.colDef?.field as string];
    this.dateValue = new Date(day ? day : 0);
    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.dateValue = new Date(params.value);
    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
    this.type = (params.colDef as ColDef).cellRendererParams.type;
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
