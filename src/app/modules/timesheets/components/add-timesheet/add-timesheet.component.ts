import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { Select } from '@ngxs/store';
import { filter, takeUntil, Observable, merge } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { DialogAction } from '@core/enums';
import { AddDialogHelper, DateTimeHelper } from '@core/helpers';
import { CustomFormGroup, DropdownOption } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { AddRecordBillRate, AddTimsheetForm, TimesheetDetailsAddDialogState } from '../../interface';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { RecordAddDialogConfig, TimesheetConfirmMessages } from '../../constants';
import { RecordFields } from '../../enums';
import { RecordsAdapter } from '../../helpers';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { ShowToast } from 'src/app/store/app.actions';
import { createUniqHashObj } from '@core/helpers/functions.helper';

@Component({
  selector: 'app-add-timesheet',
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimesheetComponent extends AddDialogHelper<AddTimsheetForm> implements OnInit {
  @Input() profileId: number;

  @Input() public container: HTMLElement | null = null;

  public readonly dialogConfig = RecordAddDialogConfig;

  public formType: RecordFields = RecordFields.Time;

  public onCallId: number;

  private initialCostCenterId: number | null = null;

  @Select(TimesheetsState.addDialogOpen)
  public readonly dialogState$: Observable<TimesheetDetailsAddDialogState>;

  ngOnInit(): void {
    this.getDialogState();
    this.confirmMessages = TimesheetConfirmMessages;
  }

  public saveRecord(): void {
    if (this.form?.valid) {
      const { organizationId, id } = this.store.snapshot().timesheets.timesheetDetails;
      const body = RecordsAdapter.adaptRecordAddDto(this.form.value, organizationId, id, this.formType);

      if (!this.checkBillRateDate(body.timeIn, body.billRateConfigId)) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, 'Bill rate is not effective for this date'));
        return;
      }
      this.store.dispatch(new TimesheetDetails.AddTimesheetRecord(body, this.isAgency));
      this.closeDialog();
    } else {
      this.form?.updateValueAndValidity();
      this.cd.detectChanges();
    }
  }

  private getDialogState(): void {
    this.dialogState$
    .pipe(
      filter((value) => value.state),
      tap((value) => {
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

    if (idx === null) {
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
      tap(() => this.cd.markForCheck()),
    ) as Observable<number>;
  }
}
