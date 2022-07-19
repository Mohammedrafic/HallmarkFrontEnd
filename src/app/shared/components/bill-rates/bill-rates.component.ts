import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';

import { ConfirmService } from '@shared/services/confirm.service';

import { ShowSideDialog } from 'src/app/store/app.actions';
import { BillRateFormComponent } from './components/bill-rate-form/bill-rate-form.component';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { BillRate, BillRateOption, BillRateUnit } from '@shared/models/bill-rate.model';
import { BillRatesGridEvent } from './components/bill-rates-grid/bill-rates-grid.component';
import { intervalMaxValidator, intervalMinValidator } from '@shared/validators/interval.validator';
import { GetBillRateOptions } from '@shared/components/bill-rates/store/bill-rate.actions';
import { BillRateState } from '@shared/components/bill-rates/store/bill-rate.state';

@Component({
  selector: 'app-bill-rates',
  templateUrl: './bill-rates.component.html',
  styleUrls: ['./bill-rates.component.scss'],
})
export class BillRatesComponent implements OnInit, OnDestroy {
  @Input() isActive = false;
  @Input() readOnlyMode = false;
  @Input() set billRates(values: BillRate[]) {
    if (values) {
      this.billRatesControl = new FormArray([]);
      values.forEach(value => this.billRatesControl.push(this.fromValueToBillRate(value)));
    }
  }

  @Output() billRatesChanged: EventEmitter<void> = new EventEmitter();

  public billRateFormHeader: string;
  public billRatesControl: FormArray;
  public billRateForm: FormGroup;
  public intervalMinField: AbstractControl;
  public intervalMaxField: AbstractControl;
  public billRatesOptions: BillRateOption[];
  public selectedBillRateUnit: BillRateUnit = BillRateUnit.Multiplier;

  @Select(BillRateState.billRateOptions)
  billRatesOptions$: Observable<BillRateOption[]>;

  private editBillRateIndex: string | null;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private confirmService: ConfirmService, private store: Store) {
    this.billRatesControl = new FormArray([]);
  }

  ngOnInit(): void {
    this.billRateForm = BillRateFormComponent.createForm();

    this.intervalMinField = this.billRateForm.get('intervalMin') as AbstractControl;
    this.intervalMinField.addValidators(intervalMinValidator(this.billRateForm, 'intervalMax'));
    this.intervalMinField.valueChanges.subscribe(() => this.intervalMaxField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));

    this.intervalMaxField = this.billRateForm.get('intervalMax') as AbstractControl;
    this.intervalMaxField.addValidators(intervalMaxValidator(this.billRateForm, 'intervalMin'));
    this.intervalMaxField.valueChanges.subscribe(() => this.intervalMinField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));

    this.store.dispatch(new GetBillRateOptions());
    this.billRatesOptions$.pipe(takeUntil(this.unsubscribe$)).subscribe(options => {
      if (options && options.length > 0) {
        this.billRatesOptions = options;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onAddBillRate(): void {
    this.editBillRateIndex = null;
    this.billRateForm.reset();
    this.billRateFormHeader = 'Add Bill Rate';
    this.selectedBillRateUnit = BillRateUnit.Multiplier;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditBillRate({ index, ...value }: BillRatesGridEvent): void {
    this.billRateFormHeader = 'Edit Bill Rate';
    this.editBillRateIndex = index;

    const foundBillRateOption = this.billRatesOptions.find(option => option.title === value.billRateConfig.title && option.type === value.billRateConfig.type);
    const rateHour = foundBillRateOption?.unit === BillRateUnit.Hours ? String(value.rateHour) : parseFloat(value.rateHour.toString()).toFixed(2);
    this.billRateForm.patchValue({
      billRateConfig: value.billRateConfig,
      billRateConfigId: value.billRateConfigId,
      effectiveDate: value.effectiveDate,
      id: value.id,
      intervalMax: value.intervalMax && String(value.intervalMax),
      intervalMin: value.intervalMin && String(value.intervalMin),
      rateHour: rateHour
     }, { emitEvent: false });

    if (!value.billRateConfig.intervalMin) {
      this.billRateForm.controls['intervalMin'].removeValidators(Validators.required);
      this.billRateForm.controls['intervalMin'].disable();
      this.billRateForm.controls['intervalMin'].updateValueAndValidity();
    }

    if (!value.billRateConfig.intervalMax) {
      this.billRateForm.controls['intervalMax'].removeValidators(Validators.required);
      this.billRateForm.controls['intervalMax'].disable();
      this.billRateForm.controls['intervalMax'].updateValueAndValidity();
    }

    this.selectedBillRateUnit = foundBillRateOption?.unit as BillRateUnit;

    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveBillRate({ index }: BillRatesGridEvent): void {
    this.confirmService
      .confirm('Are you sure you want to delete it?', {
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
        title: 'Delete record'
      })
      .pipe(
        take(1),
        filter((confirm) => !!confirm)
      )
      .subscribe(() => {
        this.billRatesControl.removeAt(Number(index));
        this.billRatesChanged.emit();
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

      value.id = value.id ? value.id : 0;

      if (!value.effectiveDate) {
        const existingDateAndConfig = (this.billRatesControl.value as BillRate[]).find(
          (rate) =>
            rate.billRateConfigId === value.billRateConfigId &&
            new Date(rate.effectiveDate).getTime() === new Date(value.effectiveDate).getTime()
        );
        if (existingDateAndConfig) {
          this.billRateForm.get( 'effectiveDate')?.setErrors({});
          return;
        }
      }

      if (this.editBillRateIndex) {
        const editedControl = this.billRatesControl.at(Number(this.editBillRateIndex));
        const billRateConfig = editedControl.get('billRateConfig');
        billRateConfig?.patchValue({ ...value.billRateConfig });
        editedControl.patchValue({ ...value, billRateConfig });
      } else {
        this.billRatesControl.push(this.fromValueToBillRate(value));
      }
      this.billRatesChanged.emit();
      this.billRateForm.reset();
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  private fromValueToBillRate(value: BillRate): FormGroup {
    const billRateControl = BillRateFormComponent.createForm();
    const billRateConfig = billRateControl.get('billRateConfig');
    billRateControl.controls['id'].patchValue(value.id || 0);
    billRateConfig?.patchValue({ ...value.billRateConfig });
    billRateControl.patchValue({ ...value, billRateConfig });
    return billRateControl;
  }
}
