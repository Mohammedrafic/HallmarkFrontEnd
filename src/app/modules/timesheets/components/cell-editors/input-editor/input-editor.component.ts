import { AbstractControl, FormGroup, FormControl } from '@angular/forms';
import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams, ColDef } from '@ag-grid-community/core';

import { EditFieldTypes } from '@core/enums';

@Component({
  selector: 'app-input-editor',
  templateUrl: './input-editor.component.html',
  styleUrls: ['./input-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputEditorComponent implements ICellRendererAngularComp {
  public value: string;

  public editable = false;

  public control: AbstractControl;

  public group: FormGroup;

  public controlName: string;

  public type: EditFieldTypes;

  public formControl: FormControl

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    this.setFormControl(params);
    return true;
  }

  public handleInputChage(event: any): void {
    this.cd.markForCheck();
  }

  private setData(params: ICellRendererParams): void {
    this.editable = (params.colDef as ColDef).cellRendererParams.isEditable;
    this.type = (params.colDef as ColDef).cellRendererParams.type;
    this.value = params.value;
    this.cd.markForCheck();
  }

  private setFormControl(params: ICellRendererParams): void {
    if (params.colDef?.cellRendererParams.formGroup?.[params.data.id]) {
      this.group = params.colDef?.cellRendererParams.formGroup[params.data.id] as FormGroup;
      this.control = this.group.get((params.colDef as ColDef).field as string) as AbstractControl;
      this.formControl = this.control as FormControl;
      this.controlName = (params.colDef as ColDef).field as string;

      if ((params.colDef as ColDef).cellRendererParams.validators) {
        this.control.setValidators((params.colDef as ColDef).cellRendererParams.validators);
      }
    }
    this.cd.detectChanges();
  }
}
