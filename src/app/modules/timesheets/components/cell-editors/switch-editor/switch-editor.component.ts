import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { CheckBoxChangeEventArgs } from '@syncfusion/ej2-angular-grids';
import { Subscription, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { AddRecordBillRate } from '../../../interface';
import { RecordValue } from '../../../interface/common.interface';

@Component({
  selector: 'app-switch-editor',
  templateUrl: './switch-editor.component.html',
  styleUrls: ['./switch-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchEditorComponent extends Destroyable implements ICellRendererAngularComp {
  value: boolean;

  showControl = true;

  controlDisabled = true;

  private control: AbstractControl;

  private group: FormGroup;

  private onCallId: number;

  private rateSubscription: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private store: Store,
  ) {
    super();
  }

  agInit(params: ICellRendererParams): void {
    this.setData(params)
    this.cd.markForCheck();
  }

  refresh(params: ICellRendererParams): boolean {
    this.setData(params)
    this.cd.markForCheck();

    return true;
  }

  handleChange(event: CheckBoxChangeEventArgs): void {
    this.control.markAsTouched();
    this.control.patchValue(!event.checked);
  }

  private setData(params: ICellRendererParams): void {
    const colDef = (params.colDef as ColDef);
    const storeField = colDef.cellRendererParams.storeField as string;
    this.controlDisabled = colDef.cellRendererParams.disabled as boolean;

    this.onCallId = (this.store.snapshot().timesheets[storeField] as AddRecordBillRate[])
    .find((rate) => rate.text.toLowerCase() === 'oncall')?.value as number;

    this.value = !params.value;
    this.showControl = (params.data as RecordValue).billRateConfigId !== this.onCallId;
    
    if (!this.controlDisabled) {
      this.setFormControl(params);  
    }
  }

  private setFormControl(params: ICellRendererParams): void {
    if (params.colDef?.cellRendererParams.formGroup?.[params.data.id]) {
      this.group = params.colDef?.cellRendererParams.formGroup[params.data.id] as FormGroup;
      this.control = this.group.get((params.colDef as ColDef).field as string) as AbstractControl;

      this.watchForBillRateControl();
    }
  }

  private watchForBillRateControl(): void {
    const billRateControl = this.group.get('billRateConfigId');

    if (!this.rateSubscription && billRateControl) {
      this.rateSubscription = billRateControl.valueChanges
      .pipe(
        takeUntil(this.componentDestroy()),
      )
      .subscribe((value: number) => {
        this.showControl = value !== this.onCallId;
        this.cd.markForCheck();
      }) as Subscription;
      
    }
  }
}
