import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { Select, ofActionDispatched } from '@ngxs/store';
import { Observable, filter, merge, of, takeUntil } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { OrganizationStructure } from '@shared/models/organization.model';
import { DialogAction } from '@core/enums';
import { AddDialogHelper, DateTimeHelper } from '@core/helpers';
import { createUniqHashObj } from '@core/helpers/functions.helper';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { AppState } from 'src/app/store/app.state';
import {
  MealBreakeName, GetRecordAddDialogConfig, TimeInName, TimeOutName, TimesheetConfirmMessages, Reorder, BillRateConfig,
} from '../../constants';
import { RecordFields } from '../../enums';
import { GetCostCenterOptions, GetDropdownOptions, RecordsAdapter } from '../../helpers';
import {
  AddRecordBillRate,
  AddTimesheetForm,
  DialogConfig,
  DialogConfigField,
  TimesheetDetailsAddDialogState,
  TimesheetDetailsModel,
  TimesheetReorder,
} from '../../interface';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-add-timesheet',
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimesheetComponent extends AddDialogHelper<AddTimesheetForm> implements OnInit {
  @Input() timesheetDetails: TimesheetDetailsModel;

  @Input() public container: HTMLElement | null = null;

  public dialogConfig: DialogConfig = GetRecordAddDialogConfig(false);
  public formType: RecordFields = RecordFields.Time;
  public filterType = 'Contains';
  public onCallId: number;
  public isReorder = false;
  public reorderMaxDate: string;
  public reorderMinDate: string;

  @Select(TimesheetsState.addDialogOpen)
  public readonly dialogState$: Observable<TimesheetDetailsAddDialogState>;

  @Select(AppState.isMobileScreen)
  public readonly isMobile$: Observable<boolean>;

  private organizationStructure: OrganizationStructure;

  ngOnInit(): void {
    this.getDialogState();
    this.confirmMessages = TimesheetConfirmMessages;
    this.subscribeOnAddRecordSucceed();
  }

  public saveRecord(): void {
    const selectedBillRate = this.findBillRate(this.form?.get('billRateConfigId')?.value as number | null);

    // If bill rate mustn't count hours - time should be null
    const recordTimeNull = selectedBillRate?.disableTime || false;

    if (this.form?.valid) {
      const { organizationId, id } = this.store.snapshot().timesheets.timesheetDetails;
      const body = RecordsAdapter.adaptRecordAddDto(this.form.value, organizationId, id, this.formType, recordTimeNull);

      if (!this.checkBillRateDate(body.timeIn, body.billRateConfigId)) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, 'Bill rate is not effective for this date'));
        return;
      }

      this.store.dispatch(new TimesheetDetails.AddTimesheetRecord(body, this.isAgency));

      this.actions$
        .pipe(
          take(1),
          ofActionDispatched(TimesheetDetails.ForceAddRecord),
          switchMap((payload: TimesheetDetails.ForceAddRecord) => {
            if (payload.force) {
              return this.confirmService.confirm(payload.message as string, {
                title: payload.title as string,
                okButtonLabel: 'Save',
                okButtonClass: 'ok-button',
                customStyleClass: 'wide-dialog',
              })
              .pipe(
                filter((confirm) => !!confirm),
                switchMap(() => {
                  body.forceUpdate = true;

                  return this.store.dispatch(new TimesheetDetails.AddTimesheetRecord(body, this.isAgency));
                }),
              );
            }
            return of(null);
          }),
        )
        .subscribe();
    } else {
      this.form?.markAllAsTouched();
      this.form?.updateValueAndValidity();
      this.cd.detectChanges();
    }
  }

  private subscribeOnAddRecordSucceed(): void {
    this.actions$
      .pipe(
        takeUntil(this.componentDestroy()),
        ofActionDispatched(TimesheetDetails.AddTimesheetRecordSucceed),
      )
      .subscribe(() => this.closeDialog());
  }

  private getDialogState(): void {
    this.dialogState$
    .pipe(
      filter((value) => value.state),
      tap((value) => {
        const isMobile = this.store.selectSnapshot(AppState.isMobileScreen);
        this.isReorder = this.timesheetDetails.reorderDates !== null;
        this.dialogConfig = GetRecordAddDialogConfig(isMobile);
        this.setReordersRange(this.isReorder);
        this.checkReorderVisibility(this.isReorder);
        if (this.form) {
          this.form = null;
          this.cd.detectChanges();
        }
        this.form = this.addService.createForm(value.type) as CustomFormGroup<AddTimesheetForm>;
        this.formType = value.type;
        this.setDateBounds(value.startDate, value.endDate);
        this.populateOptions();
        this.sideAddDialog.show();
        this.cd.detectChanges();
      }),
      filter((value) => value.type === RecordFields.Time),
      switchMap(() => merge(
        this.watchForReorders(),
        this.watchForLocations(),
        this.watchForBillRate(),
        this.watchForDayChange(),
        this.observeStartDate(),
      )),
      takeUntil(this.componentDestroy()),
    )
    .subscribe();
  }

  public override closeDialog(): void {
    super.closeDialog();
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Close, this.formType, '', '', null));
  }

  private populateOptions(): void {
    this.organizationStructure = this.store.selectSnapshot(TimesheetsState.organizationStructure) as OrganizationStructure;
    this.dialogConfig[this.formType].fields.forEach((item) => {
      if (item.optionsStateKey) {
        item.options = this.store.snapshot().timesheets[item.optionsStateKey];
      }

      if (this.formType === RecordFields.Time && item.optionsStateKey === 'organizationStructure') {
        const locations = this.organizationStructure?.regions
          .find((region) => region.id === this.timesheetDetails.orderRegionId)?.locations || [];
        item.options = GetDropdownOptions(locations);
      }

      if (this.formType === RecordFields.Time && item.optionsStateKey === 'costCenterOptions') {
        item.options = GetCostCenterOptions(
          this.organizationStructure,
          this.timesheetDetails.orderRegionId,
          this.timesheetDetails.orderLocationId
        );
      }

      if (item.optionsStateKey === 'billRateTypes') {
        if (this.isReorder) {
          item.options = [];
        } else {
          const filteredOptions = this.filterSelectableRates(item.options);

          const uniqBillRatesHashObj = createUniqHashObj(
            filteredOptions,
            (el: DropdownOption) => el.value,
            (el: DropdownOption) => el,
          );

          item.options = Object.values(uniqBillRatesHashObj);

          this.onCallId = item.options?.find((rate) => rate.text.toLowerCase() === 'oncall')?.value as number;
        }
      }

      this.form?.get('locationId')?.patchValue(this.timesheetDetails.orderLocationId, { emitEvent: false, onlySelf: true });
      this.form?.get('departmentId')?.patchValue(this.timesheetDetails.departmentId, { emitEvent: false, onlySelf: true });
    });
  }

  private filterSelectableRates(options?:  DropdownOption[]): AddRecordBillRate[] {
    const ratesNotForSelect = ['Daily OT', 'Daily Premium OT', 'OT', 'Mileage'];

    return options?.filter((option) => {
      return !ratesNotForSelect.includes(option.text);
    }) as AddRecordBillRate[];
  }

  private watchForLocations(): Observable<number> {
    return this.form?.get('locationId')?.valueChanges
      .pipe(
        tap((locationId) => {
          const departmentIdField = this.dialogConfig[RecordFields.Time].fields
            .find((field) => field.field === 'departmentId') as DialogConfigField;

          departmentIdField.options = GetCostCenterOptions(
            this.organizationStructure,
            this.timesheetDetails.orderRegionId,
            locationId
          );
          this.form?.get('departmentId')?.reset();
          this.cd.markForCheck();
        })
      ) as Observable<number>;
  }

  private watchForDayChange(): Observable<Date> {
    return this.form?.controls['day']?.valueChanges
    .pipe(
      filter((day) => !!day),
      tap((day) => {
        this.form?.controls['timeIn'].patchValue(new Date(day.setHours(0, 0, 0)));
        this.form?.controls['timeOut'].patchValue(new Date(day.setHours(0, 0, 0)));
        this.cd.markForCheck();
      }),
    ) as Observable<Date>;
  }

  private checkBillRateDate(timeIn: string, billRateId: number): boolean {
    const billRatesTypes = this.store.snapshot().timesheets['billRateTypes'] as AddRecordBillRate[];
    const filteredBillRatesBySelected = billRatesTypes.filter((el) => el.value === billRateId);
    const billRatesDates = filteredBillRatesBySelected.map((el) => el.efectiveDate);
    const idx = DateTimeHelper.findPreviousNearestDateIndex(billRatesDates, timeIn);

    if (idx === null || !timeIn) {
      return true;
    }

    const billRate = filteredBillRatesBySelected[idx];

    if (billRate && billRate.efectiveDate > timeIn) {
      return false;
    }

    return true;
  }

  private watchForBillRate(): Observable<number> {
    return this.form?.get('billRateConfigId')?.valueChanges
    .pipe(
      tap((rateId) => {
        const rates = this.store.snapshot().timesheets.billRateTypes as AddRecordBillRate[];

        if (!rates) {
          return;
        }

        const selectedRate = rates.find((rate) => rate.value === rateId);

        if (selectedRate && this.formType === RecordFields.Time) {
          this.checkFieldsVisibility(selectedRate);
        }

        this.cd.markForCheck();
      }),
    ) as Observable<number>;
  }

  private watchForReorders(): Observable<number> {
    return this.form?.get('reorderCandidateJobId')?.valueChanges
    .pipe(
      tap((jobId) => {
        this.form?.get('billRateConfigId')?.reset();
        const rates = this.store.snapshot().timesheets.billRateTypes as AddRecordBillRate[];
        const billRateField = this.dialogConfig.timesheets.fields
          .find((field) => field.field === BillRateConfig) as DialogConfigField;
        billRateField.options = this.filterSelectableRates(rates.filter(rate => rate.candidateJobId === jobId));
        this.cd.markForCheck();
      }),
    ) as Observable<number>;
  }

  private checkReorderVisibility(isReorder: boolean): void {
    const reorderField = this.dialogConfig.timesheets.fields
        .find((field) => field.field === Reorder) as DialogConfigField;
    reorderField.visible = isReorder;
  }

  private setReordersRange(isReorder: boolean): void {
    if (isReorder) {
      const reordersDates = this.store.snapshot().timesheets['timesheetReorders']
        ?.map((reorder: TimesheetReorder) => new Date(reorder.reorderDate));
      
      this.reorderMaxDate = formatDate(Math.max(...reordersDates), 'MM/dd/yyyy', 'en-US');
      this.reorderMinDate = formatDate(Math.min(...reordersDates), 'MM/dd/yyyy', 'en-US');
    }
  }

  private checkFieldsVisibility(rate: AddRecordBillRate): void {
    const mealField = this.dialogConfig.timesheets.fields
    .find((field) => field.field === MealBreakeName) as DialogConfigField;
    const timeInField = this.dialogConfig.timesheets.fields
    .find((field) => field.field === TimeInName) as DialogConfigField;
    const timeOutField = this.dialogConfig.timesheets.fields
    .find((field) => field.field === TimeOutName) as DialogConfigField;

    if (rate.disableMealBreak) {
      mealField.visible = false;
    } else if (!rate.disableMealBreak && !mealField.visible) {
      mealField.visible = true;
    }

    if (rate.disableTime || rate.timeNotRequired) {
      timeInField.visible = false;
      timeOutField.visible = false;

      this.addService.removeTimeValidators(this.form);
    } else if (!timeInField.visible && !rate.disableTime) {
      timeInField.visible = true;
      timeOutField.visible = true;

      this.addService.addTimeValidators(this.form);
    }

    this.form?.get('timeIn')?.updateValueAndValidity();
    this.form?.get('timeOut')?.updateValueAndValidity();

    this.cd.markForCheck();
  }

  private findBillRate(idToLook: number | null): AddRecordBillRate | undefined {
    if (!idToLook) {
      return undefined;
    }

    const rates = this.store.snapshot().timesheets.billRateTypes as AddRecordBillRate[];

    return rates.find((rate) => rate.value === idToLook);
  }

  private observeStartDate(): Observable<Date| null> {
    return this.form?.get('timeIn')?.valueChanges
      .pipe(
        tap((start: Date | null) => {
          const rate = this.findBillRate(this.form?.get('billRateConfigId')?.value as number | null);
          const timeOutField = this.dialogConfig.timesheets.fields
          .find((field) => field.field === TimeOutName) as DialogConfigField;
          const notReqAndStartExist = rate?.timeNotRequired && start;
          const timeRequired = !rate?.timeNotRequired && !timeOutField.required;
          const notReqAndStartNotExist = rate?.timeNotRequired && !start;

          if (notReqAndStartExist || timeRequired) {
            this.addService.addTimeOutValidator(this.form);
            timeOutField.required = true;

            this.cd.markForCheck();
          } else if (notReqAndStartNotExist) {
            this.addService.removeTimeOutValidator(this.form);
            timeOutField.required = false;

            this.cd.markForCheck();
          }
        })
      ) as Observable<Date | null>;
  }
}
