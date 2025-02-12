import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { Observable, filter, take, takeUntil, switchMap, tap, catchError, EMPTY, of } from 'rxjs';

import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { DateTimeHelper } from '@core/helpers';
import {
  ADD_CONFIRM_TEXT, DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE,
  EDIT_CONFIRM_TEXT, UpdateClosedPositionRate,
} from '@shared/constants';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { BillRateTitleId } from '@shared/enums/bill-rate-title-id.enum';
import { AbstractPermission } from '@shared/helpers/permissions';
import { BillRate, BillRateCalculationType, BillRateOption, BillRateUnit } from '@shared/models/bill-rate.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { intervalMaxValidator, intervalMinValidator } from '@shared/validators/interval.validator';
import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { BillRateFormComponent } from './components/bill-rate-form/bill-rate-form.component';
import { BillRatesGridEvent } from './components/bill-rates-grid/bill-rates-grid.component';
import { BillRatesSyncService } from '@shared/services/bill-rates-sync.service';
import { BillRatesService } from '@shared/services/bill-rates.service';
import { AlertService } from '@shared/services/alert.service';
import { OrderType } from '@shared/enums/order-type';

@Component({
  selector: 'app-bill-rates',
  templateUrl: './bill-rates.component.html',
})
export class BillRatesComponent extends AbstractPermission implements OnInit, OnDestroy {
  @Select(OrderManagementContentState.predefinedBillRatesOptions)
  billRatesOptions$: Observable<BillRateOption[]>;

  @Input() orderId: number | null = null;
  @Input() organizationId: number | null = null;
  @Input() candidateJobId: number | null = null;
  @Input() isActive: boolean | null = false;
  @Input() isLocal = false;
  @Input() readOnlyMode = false;
  @Input() isOrderPage = false;
  @Input() isExtension = false;
  @Input() set billRates(values: BillRate[]) {
    if (values) {
      this.billRatesControl = new FormArray([]);
      values.forEach((value) => this.billRatesControl.push(this.fromValueToBillRate(value)));
    }
  }
  @Input() set orderType(type: OrderType | undefined) {
    this.canDeletePredefinedBillRates = type !== OrderType.ContractToPerm;
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
  public allBillRatesConfigs: BillRateOption[] = [];
  public canDeletePredefinedBillRates = false;

  private editBillRateIndex: string | null;

  constructor(
    protected override store: Store,
    private confirmService: ConfirmService,
    private alertService: AlertService,
    private billRatesSyncService: BillRatesSyncService,
    private billRatesService: BillRatesService,
    private cd: ChangeDetectorRef,
    ) {
    super(store);
    this.billRatesControl = new FormArray([]);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.billRatesChanges();

    this.billRateForm = BillRateFormComponent.createForm();

    this.intervalMinField = this.billRateForm.get('intervalMin') as AbstractControl;
    this.intervalMinField.addValidators(intervalMinValidator(this.billRateForm, 'intervalMax'));
    this.intervalMinField.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe(() =>
      this.intervalMaxField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );

    this.intervalMaxField = this.billRateForm.get('intervalMax') as AbstractControl;
    this.intervalMaxField.addValidators(intervalMaxValidator(this.billRateForm, 'intervalMin'));
    this.intervalMaxField.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe(() =>
      this.intervalMinField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.billRatesSyncService.resetDeletedBillRateIds();
  }

  public addBillRate(): void {
    this.setAllBillRates();
    this.billRatesSyncService.setFormChangedState(false);
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
      holidayCalculationEnabled: false,
      isUpdated: true,
    });
    this.selectedBillRateUnit = BillRateUnit.Multiplier;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public editBillRate({ index, ...value }: BillRatesGridEvent): void {
    this.setAllBillRates();
    this.billRateFormHeader = 'Edit Bill Rate';
    this.editBillRateIndex = index;
    this.billRatesSyncService.setFormChangedState(false);

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
        effectiveDate: DateTimeHelper.setCurrentTimeZone(value.effectiveDate),
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
        holidayCalculationEnabled: value.holidayCalculationEnabled,
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

  public removeBillRate(event: BillRatesGridEvent): void {
    const { index, id } = event;

    this.confirmService
      .confirm('Are you sure you want to delete it?', {
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
        title: 'Delete record',
      })
      .pipe(
        take(1),
        filter((confirm) => !!confirm),
        switchMap(() => this.billRatesService.canRemoveBillRate(id, this.organizationId, this.orderId, this.candidateJobId)),
        catchError(() => {
          this.store.dispatch(new ShowToast(MessageTypes.Error, 'Cannot check and delete this bill rate'));

          return EMPTY;
        }),
        tap((canRemove: boolean) => {
          if (!canRemove) {
            this.showRemoveBillRateErrorDialog();
          }
        }),
        filter(Boolean)
      )
      .subscribe(() => {
        const removeIndex = Number(index);
        this.billRatesSyncService.addDeletedBillRateId(id);
        this.billRatesControl.removeAt(removeIndex);
        this.billRatesChanged.emit(removeIndex);
      });
  }

  public cancelChanges(): void {
    if (this.billRateForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
          zIndex: 1020,
        })
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => {
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

  public saveChanges(): void {
    this.billRateForm.markAllAsTouched();

    if (this.billRateForm.valid) {
      const value: BillRate = this.billRateForm.getRawValue();
      this.syncBillRateHourlyRate(value, this.isLocal);

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
        value.effectiveDate = DateTimeHelper.setUtcTimeZone(value.effectiveDate);
        this.billRateForm.get('effectiveDate')?.patchValue(value.effectiveDate);
      }

      const applicantStatus = this.store
      .selectSnapshot(OrderManagementContentState.candidatesJob)?.applicantStatus.applicantStatus;
      const isCandidateCanceled = applicantStatus === CandidatStatus.Cancelled
      || applicantStatus === CandidatStatus.Offboard;
      const showWarnMessage = (applicantStatus === CandidatStatus.OnBoard && !this.isOrderPage) || isCandidateCanceled;

      if (showWarnMessage) {
        const confirmText = this.editBillRateIndex ? EDIT_CONFIRM_TEXT : ADD_CONFIRM_TEXT;
        const messageToShow = isCandidateCanceled ? UpdateClosedPositionRate : confirmText;

        this.confirmService
          .confirm(messageToShow, {
            title: 'Warning',
            okButtonLabel: 'Yes',
            okButtonClass: 'ok-button',
            zIndex: 1020,
          })
          .pipe(
            filter((confirm) => confirm),
            take(1),
          )
          .subscribe(() => {
            this.saveBillRate(value);
          });

      } else {
        this.saveBillRate(value);
      }
    }
  }

  public syncBillRateHourlyRate(billRate: BillRate, isLocal = false): void {
    const billRateType = isLocal ? BillRateCalculationType.RegularLocal : BillRateCalculationType.Regular;
    if (billRate.billRateConfig.id === billRateType) {
      this.hourlyRateSync.emit({ value: billRate.rateHour.toString(), billRate });
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

  private billRatesChanges(): void {
    this.billRatesOptions$.pipe(
      filter((data) => !!data.length),
      takeUntil(this.componentDestroy()),
    ).subscribe((options: BillRateOption[]) => {
      this.billRatesOptions = options;
    });
  }

  private saveBillRate(rate: BillRate): void {
    if (!this.editBillRateIndex) {
      this.billRatesControl.push(this.fromValueToBillRate(rate));
    }

    this.billRatesChanged.emit(this.billRateForm.getRawValue());
    this.billRateForm.reset();
    this.store.dispatch(new ShowSideDialog(false));
  }

  private showRemoveBillRateErrorDialog(): void {
    this.alertService
      .alert('This Bill Rate cannot be removed as it is already in use in Timesheets.', {
        title: 'Remove Bill Rate',
        okButtonClass: 'e-outline close-button',
        okButtonLabel: 'Close',
      })
      .pipe(take(1))
      .subscribe();
  }

  private setAllBillRates(): void {
    if (!this.organizationId || (!this.candidateJobId && !this.orderId)) {
      this.allBillRatesConfigs = [];
      return;
    }

    const allBillRatesConfigs$ = this.candidateJobId
      ? this.billRatesService.getCandidateBillRateConfigs(this.candidateJobId, this.organizationId as number)
      : this.billRatesService.getOrderBillRateConfigs(this.orderId as number, this.organizationId as number);

    allBillRatesConfigs$
      .pipe(
        catchError(() => {
          this.store.dispatch(new ShowToast(MessageTypes.Error, 'Cannot fetch bill rates'));

          return of([]);
        }),
        take(1)
      )
      .subscribe((billRates: BillRateOption[]) => {
        this.allBillRatesConfigs = billRates;
        this.cd.detectChanges();
      });
  }
}
