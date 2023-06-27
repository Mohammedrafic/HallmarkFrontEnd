import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { Select, ofActionDispatched } from '@ngxs/store';
import { Observable, filter, merge, of, takeUntil } from 'rxjs';
import { catchError, concatMap, switchMap, take, tap } from 'rxjs/operators';

import { DialogAction } from '@core/enums';
import { AddDialogHelper, DateTimeHelper } from '@core/helpers';
import { createUniqHashObj } from '@core/helpers/functions.helper';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import {
  MealBreakeName, RecordAddDialogConfig, TimeInName, TimeOutName, TimesheetConfirmMessages,
} from '../../constants';
import { RecordFields } from '../../enums';
import { RecordsAdapter } from '../../helpers';
import {
  AddRecordBillRate, AddTimsheetForm, DialogConfig, DialogConfigField,
  TimesheetDetailsAddDialogState,
} from '../../interface';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetsState } from '../../store/state/timesheets.state';

@Component({
  selector: 'app-add-timesheet',
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimesheetComponent extends AddDialogHelper<AddTimsheetForm> implements OnInit {
  @Input() profileId: number;

  @Input() public container: HTMLElement | null = null;

  public dialogConfig: DialogConfig = JSON.parse(JSON.stringify(RecordAddDialogConfig));

  public formType: RecordFields = RecordFields.Time;

  public onCallId: number;

  private initialCostCenterId: number | null = null;

  @Select(TimesheetsState.addDialogOpen)
  public readonly dialogState$: Observable<TimesheetDetailsAddDialogState>;

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
        this.dialogConfig = JSON.parse(JSON.stringify(RecordAddDialogConfig));

        if (this.form) {
          this.form = null;
          this.cd.detectChanges();
        }
        this.form = this.addService.createForm(value.type) as CustomFormGroup<AddTimsheetForm>;
        this.formType = value.type;
        this.setDateBounds(value.startDate, value.endDate);
        this.initialCostCenterId = value.orderCostCenterId;
        this.populateOptions();
        this.sideAddDialog.show();
        this.cd.detectChanges();
      }),
      filter((value) => value.type === RecordFields.Time),
      switchMap(() => merge(
        this.watchForBillRate(),
        this.watchForDayChange(),
        this.observaStartDate(),
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
    this.dialogConfig[this.formType].fields.forEach((item) => {
      if (item.optionsStateKey) {
        item.options = this.store.snapshot().timesheets[item.optionsStateKey];
      }

      if (item.optionsStateKey === 'billRateTypes') {
        const ratesNotForSelect = ['Daily OT', 'Daily Premium OT', 'OT', 'Mileage'];

        const filteredOptions = item.options?.filter((option) => {
          return !ratesNotForSelect.includes(option.text);
        }) as DropdownOption[];

        const uniqBillRatesHashObj = createUniqHashObj(
          filteredOptions,
          (el: DropdownOption) => el.value,
          (el: DropdownOption) => el,
        );

        item.options = Object.values(uniqBillRatesHashObj);

        this.onCallId = item.options?.find((rate) => rate.text.toLowerCase() === 'oncall')?.value as number;
        this.form?.get('departmentId')?.patchValue(this.initialCostCenterId, { emitEvent: false, onlySelf: true });
      }
    });
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
          this.checkFieldsVisiility(selectedRate);
        }

        this.cd.markForCheck();
      }),
    ) as Observable<number>;
  }
  
  private checkFieldsVisiility(rate: AddRecordBillRate): void {
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

  private observaStartDate(): Observable<Date| null> {
    return this.form?.get('timeIn')?.valueChanges
      .pipe(
        tap((start: Date | null) => {
          const rate = this.findBillRate(this.form?.get('billRateConfigId')?.value as number | null);
          const timeOutField = this.dialogConfig.timesheets.fields
          .find((field) => field.field === TimeOutName) as DialogConfigField;
          const notReqAndStartExist = rate?.timeNotRequired && start ;
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
