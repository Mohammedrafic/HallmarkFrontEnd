import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams, ColDef } from '@ag-grid-community/core';

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

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  public agInit(params: ICellRendererParams): void {
    this.dateValue = new Date(params.value);
    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
    this.setFormControl(params);
    this.cd.markForCheck();
    return true;
  }

  public handleTimeChange(event: ChangeEventArgs): void {
    this.control.patchValue(event.value);
  }

  private setFormControl(params: ICellRendererParams): void {
    if (params.colDef?.cellRendererParams.formGroup?.[params.data.id]) {
      const group = params.colDef?.cellRendererParams.formGroup[params.data.id] as FormGroup;
      this.control = group.get((params.colDef as ColDef).field as string) as AbstractControl;
    }
  }
}
