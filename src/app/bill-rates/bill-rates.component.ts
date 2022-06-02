import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { filter, take } from 'rxjs';

import { ConfirmService } from '@shared/services/confirm.service';

import { ShowSideDialog } from 'src/app/store/app.actions';
import { BillRateFormComponent } from './components/bill-rate-form/bill-rate-form.component';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { BillRate } from '@shared/models/bill-rate.model';
import { BillRatesGridEvent } from './components/bill-rates-grid/bill-rates-grid.component';

@Component({
  selector: 'app-bill-rates',
  templateUrl: './bill-rates.component.html',
  styleUrls: ['./bill-rates.component.scss'],
})
export class BillRatesComponent implements OnInit {
  public billRateFormHeader: string;
  public orederForm: FormGroup;
  public billRateForm: FormGroup;

  get billRatesControl(): FormArray {
    return this.orederForm.get('billRates') as FormArray;
  }

  private editBillRateIndex: string | null;

  constructor(private confirmService: ConfirmService, private store: Store) {}

  ngOnInit(): void {
    this.orederForm = this.generateForm();
    this.billRateForm = BillRateFormComponent.createForm();
  }

  public onAddBillRate(): void {
    this.editBillRateIndex = null;
    this.billRateForm.reset();
    this.billRateFormHeader = 'Add Bill Rate';
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditBillRate({ index, ...value }: BillRatesGridEvent): void {
    this.billRateFormHeader = 'Edit Bill Rate';
    this.editBillRateIndex = index;
    this.billRateForm.patchValue({ ...value }, { emitEvent: false });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveBillRate({ index }: BillRatesGridEvent): void {
    this.confirmService
      .confirm('Are You sure you want to delete it?', {
        okButtonLabel: 'Remove',
        okButtonClass: 'delete-button',
        title: 'Remove the Bill Rate',
      })
      .pipe(
        take(1),
        filter((confirm) => !!confirm)
      )
      .subscribe(() => {
        this.billRatesControl.removeAt(Number(index));
      });
  }

  public onDialogCancel(): void {
    if (this.billRateForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.billRateForm.reset();
          this.billRateForm.enable();
          this.store.dispatch(new ShowSideDialog(false));
        });
    } else {
      this.billRateForm.reset();
      this.billRateForm.enable();
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  public onDialogOk(): void {
    this.billRateForm.markAllAsTouched();
    if (this.billRateForm.valid) {
      const value: BillRate = this.billRateForm.getRawValue();

      const existingDateAndConfig = (this.billRatesControl.value as BillRate[]).find(
        (rate) =>
          rate.billRateConfigId === value.billRateConfigId &&
          new Date(rate.effectiveDate).getTime() === new Date(value.effectiveDate).getTime()
      );
        if (existingDateAndConfig) {
          this.billRateForm.get( 'effectiveDate')?.setErrors({});
          return;
        }


      if (this.editBillRateIndex) {
        const editedControl = this.billRatesControl.at(Number(this.editBillRateIndex));
        const billRateConfig = editedControl.get('billRateConfig');
        billRateConfig?.patchValue({ ...value.billRateConfig });
        editedControl.patchValue({ ...value, billRateConfig });
      } else {
        this.billRatesControl.push(this.fromValueToBillRate(value));
      }
      this.billRateForm.reset();
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  private fromValueToBillRate(value: BillRate): FormGroup {
    const billRateControl = BillRateFormComponent.createForm();
    const billRateConfig = billRateControl.get('billRateConfig');
    billRateConfig?.patchValue({ ...value.billRateConfig });
    billRateControl.patchValue({ ...value, billRateConfig });
    return billRateControl;
  }

  private generateForm(): FormGroup {
    return new FormGroup({
      billRates: new FormArray([]),
    });
  }
}
