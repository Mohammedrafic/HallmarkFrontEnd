import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { CheckBoxChangeEventArgs } from '@syncfusion/ej2-angular-grids';
import { Subscription, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { AddRecordBillRate, RecordValue } from '../../../modules/timesheets/interface';

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

  private notApplicableRateIds: number[];

  private rateSubscription: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private store: Store,
  ) {
    super();
  }

  agInit(params: ICellRendererParams): void {
    this.setData(params);
    this.cd.markForCheck();
  }

  refresh(params: ICellRendererParams): boolean {
    this.setData(params);
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
    if (!colDef.cellRendererParams.showCheckbox) {
      this.notApplicableRateIds = this.findDisabledRateIds(storeField);
    }
    this.value = colDef.cellRendererParams.useValueAsTrue ? params.value : !params.value;
    this.showControl = colDef.cellRendererParams.showCheckbox
      || !this.notApplicableRateIds.includes((params.data as RecordValue).billRateConfigId)
      && !(params.data as RecordValue).billRateConfigName?.toLowerCase().includes('ot');

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
        this.showControl = !this.notApplicableRateIds.includes(value);
        this.cd.markForCheck();
      }) as Subscription;
    }
  }

  private findDisabledRateIds(field: string): number[] {
    return (this.store.snapshot().timesheets[field] as AddRecordBillRate[])
    .filter((rate) => rate.text.toLowerCase() === 'oncall' || rate.text.includes('OT') || rate.disableMealBreak)
    .map((rate) => rate.value) as number[];
  }
}
