import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, take, takeUntil } from 'rxjs';

import { ConfirmService } from '@shared/services/confirm.service';
import { AbstractPermission } from '@shared/helpers/permissions';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { BillRateFormComponent } from './components/bill-rate-form/bill-rate-form.component';
import { ADD_CONFIRM_TEXT, DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, EDIT_CONFIRM_TEXT } from '@shared/constants';
import { BillRate, BillRateOption, BillRateUnit } from '@shared/models/bill-rate.model';
import { BillRatesGridEvent } from './components/bill-rates-grid/bill-rates-grid.component';
import { intervalMaxValidator, intervalMinValidator } from '@shared/validators/interval.validator';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { DateTimeHelper } from '@core/helpers';
import { BillRateTitleId } from '@shared/enums/bill-rate-title-id.enum';

@Component({
  selector: 'app-bill-rates',
  templateUrl: './bill-rates.component.html',
  styleUrls: ['./bill-rates.component.scss'],
})
export class BillRatesComponent extends AbstractPermission implements OnInit, OnDestroy {
  @Select(OrderManagementContentState.predefinedBillRatesOptions)
  billRatesOptions$: Observable<BillRateOption[]>;

  @Input() isActive: boolean | null = false;
  @Input() readOnlyMode = false;
  @Input() isOrderPage = false;
  @Input() set billRates(values: BillRate[]) {
    if (values) {
      this.billRatesControl = new FormArray([]);
      values.forEach((value) => this.billRatesControl.push(this.fromValueToBillRate(value)));
    }
  }

  @Output() billRatesChanged: EventEmitter<any> = new EventEmitter();
  @Output() hourlyRateSync: EventEmitter<{ value: string; billRate: BillRate }> = new EventEmitter<{
    value: string;
    billRate: BillRate;
  }>();

  public billRateFormHeader: string;
  public billRatesControl: FormArray;
  public billRateForm: FormGroup;
  public intervalMinField: AbstractControl;
  public intervalMaxField: AbstractControl;
  public billRatesOptions: BillRateOption[] = [];
  public selectedBillRateUnit: BillRateUnit = BillRateUnit.Multiplier;

  private editBillRateIndex: string | null;

  constructor(private confirmService: ConfirmService, protected override store: Store) {
    super(store);
    this.billRatesControl = new FormArray([]);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.billRatesChanges();

    this.billRateForm = BillRateFormComponent.createForm();

    this.intervalMinField = this.billRateForm.get('intervalMin') as AbstractControl;
    this.intervalMinField.addValidators(intervalMinValidator(this.billRateForm, 'intervalMax'));
    this.intervalMinField.valueChanges.subscribe(() =>
      this.intervalMaxField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );

    this.intervalMaxField = this.billRateForm.get('intervalMax') as AbstractControl;
    this.intervalMaxField.addValidators(intervalMaxValidator(this.billRateForm, 'intervalMin'));
    this.intervalMaxField.valueChanges.subscribe(() =>
      this.intervalMinField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
  }

  public onAddBillRate(): void {
    this.editBillRateIndex = null;
    this.billRateForm.reset();
    this.billRateFormHeader = 'Add Bill Rate';
    this.billRateForm.patchValue({
      id: 0,
      editAllowed: false,
      isPredefined: false,
      seventhDayOtEnabled: false,
      weeklyOtEnabled: false,
      dailyOtEnabled: false,
      isUpdated: true,
    });
    this.selectedBillRateUnit = BillRateUnit.Multiplier;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditBillRate({ index, ...value }: BillRatesGridEvent): void {
    this.billRateFormHeader = 'Edit Bill Rate';
    this.editBillRateIndex = index;

    const foundBillRateOption = this.billRatesOptions.find((option) => option.id === value.billRateConfigId);
    const decimals = value.billRateConfigId !== BillRateTitleId.Mileage ? 2 : 3;
    const rateHour =
      foundBillRateOption?.unit === BillRateUnit.Hours
        ? String(value.rateHour)
        : parseFloat(value.rateHour.toString()).toFixed(decimals);
    BillRateFormComponent.calculateOTSFlags = false;

    this.billRateForm.patchValue(
      {
        billRateConfig: value.billRateConfig,
        billRateConfigId: value.billRateConfigId,
        effectiveDate: DateTimeHelper.convertDateToUtc(value.effectiveDate),
        id: value.id,
        intervalMax: value.intervalMax && String(value.intervalMax),
        intervalMin: value.intervalMin && String(value.intervalMin),
        rateHour: rateHour,
        billType: value.billType,
        editAllowed: value.editAllowed || false,
        isPredefined: value.isPredefined || false,
        seventhDayOtEnabled: value.seventhDayOtEnabled,
        weeklyOtEnabled: value.weeklyOtEnabled,
        dailyOtEnabled: value.dailyOtEnabled,
        isUpdated: true,
      }
    );

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

    if (value.isPredefined) {
      this.billRateForm.get('billRateConfigId')?.disable({ emitEvent: false });
      this.billRateForm.get('effectiveDate')?.disable({ emitEvent: false });
    }

    this.selectedBillRateUnit = foundBillRateOption?.unit as BillRateUnit;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveBillRate({ index }: BillRatesGridEvent): void {
    this.confirmService
      .confirm('Are you sure you want to delete it?', {
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
        title: 'Delete record',
      })
      .pipe(
        take(1),
        filter((confirm) => !!confirm)
      )
      .subscribe(() => {
        const removeIndex = Number(index);
        this.billRatesControl.removeAt(removeIndex);
        this.billRatesChanged.emit(removeIndex);
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
      this.syncBillRateHourlyRate(value);

      value.id = value.id ? value.id : 0;

      if (!value.effectiveDate) {
        const existingDateAndConfig = (this.billRatesControl.value as BillRate[]).find(
          (rate) =>
            rate.billRateConfigId === value.billRateConfigId &&
            new Date(rate.effectiveDate).getTime() === new Date(value.effectiveDate).getTime()
        );
        if (existingDateAndConfig) {
          this.billRateForm.get('effectiveDate')?.setErrors({});
          return;
        }
      }

      if (this.editBillRateIndex) {
        const editedControl = this.billRatesControl.at(Number(this.editBillRateIndex));
        const billRateConfig = editedControl.get('billRateConfig');
        billRateConfig?.patchValue({ ...value.billRateConfig });
        editedControl.patchValue({ ...value, billRateConfig });

        if (editedControl.value.isPredefined) {
          this.billRateForm.get('billRateConfigId')?.enable({ emitEvent: false });
          this.billRateForm.get('effectiveDate')?.enable({ emitEvent: false });
        }
      }

      if (value.effectiveDate) {
        value.effectiveDate = DateTimeHelper.toUtcFormat(value.effectiveDate);
        this.billRateForm.get('effectiveDate')?.patchValue(value.effectiveDate);
      }

      const applicantStatus = this.store.selectSnapshot(OrderManagementContentState.candidatesJob)?.applicantStatus.applicantStatus;

      if (applicantStatus === CandidatStatus.OnBoard && !this.isOrderPage) {
        const confirmText = this.editBillRateIndex ? EDIT_CONFIRM_TEXT : ADD_CONFIRM_TEXT;

        this.confirmService
          .confirm(confirmText, {
            title: 'Warning',
            okButtonLabel: 'Yes',
            okButtonClass: 'ok-button',
          })
          .pipe(
            filter(Boolean),
            takeUntil(this.componentDestroy())
          )
          .subscribe(() => {
            if (!this.editBillRateIndex) {
              this.billRatesControl.push(this.fromValueToBillRate(value));
            }
            this.billRatesChanged.emit(this.billRateForm.value);
            this.billRateForm.reset();
            this.store.dispatch(new ShowSideDialog(false));
          });
      } else {
        if (!this.editBillRateIndex) {
          this.billRatesControl.push(this.fromValueToBillRate(value));
        }
        this.billRatesChanged.emit(this.billRateForm.value);
        this.billRateForm.reset();
        this.store.dispatch(new ShowSideDialog(false));
      }
    }
  }

  syncBillRateHourlyRate(billRate: BillRate): void {
    if (billRate.billRateConfig.id !== 1) {
      return;
    }

    this.hourlyRateSync.emit({ value: billRate.rateHour.toString(), billRate });
  }

  private fromValueToBillRate(value: BillRate): FormGroup {
    const billRateControl = BillRateFormComponent.createForm();
    const billRateConfig = billRateControl.get('billRateConfig');
    billRateControl.controls['id'].patchValue(value.id || 0);
    billRateConfig?.patchValue({ ...value.billRateConfig });
    billRateControl.patchValue({ ...value, billRateConfig });
    return billRateControl;
  }

  private billRatesChanges(): void {
    this.billRatesOptions$.pipe(
      filter((data) => !!data.length),
      takeUntil(this.componentDestroy()),
    ).subscribe((options: BillRateOption[]) => {
      this.billRatesOptions = options;
    });
  }
}
