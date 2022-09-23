import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { Select } from '@ngxs/store';
import { filter, takeUntil, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { DialogAction } from '@core/enums';
import { AddDialogHelper } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { AddTimsheetForm, TimesheetDetailsAddDialogState } from '../../interface';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { RecordAddDialogConfig, TimesheetConfirmMessages } from '../../constants';
import { RecordFields } from '../../enums';
import { RecordsAdapter } from '../../helpers';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';

@Component({
  selector: 'app-add-timesheet',
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimesheetComponent extends AddDialogHelper<AddTimsheetForm> implements OnInit {
  @Input() profileId: number;

  public readonly dialogConfig = RecordAddDialogConfig;

  public formType: RecordFields = RecordFields.Time;

  @Select(TimesheetsState.addDialogOpen)
  public readonly dialogState$: Observable<TimesheetDetailsAddDialogState>

  ngOnInit(): void {
    this.getDialogState();
    this.confirmMessages = TimesheetConfirmMessages;
  }

  public saveRecord(): void {
    if (this.form?.valid) {
      const { organizationId, id } = this.store.snapshot().timesheets.timesheetDetails;
      const body = RecordsAdapter.adaptRecordAddDto(this.form.value, organizationId, id, this.formType);

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
        this.populateOptions();
        this.sideAddDialog.show();
        this.cd.detectChanges();
      }),
      filter((value) => value.type === RecordFields.Time),
      switchMap(() => this.watchForDayChange()),
      filter((day) => !!day),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((day) => {
      this.form?.controls['timeIn'].patchValue(new Date(day.setHours(0, 0, 0)));
      this.form?.controls['timeOut'].patchValue(new Date(day.setHours(0, 0, 0)));
    });
  }

  public override closeDialog(): void {
    super.closeDialog();
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Close, this.formType, '', ''));
  }

  private populateOptions(): void {
    this.dialogConfig[this.formType].fields.forEach((item) => {
      if (item.optionsStateKey) {
        item.options = this.store.snapshot().timesheets[item.optionsStateKey];
      }

      if (item.optionsStateKey === 'billRateTypes') {
        const ratesNotForSelect = ['Daily OT', 'Daily Premium OT', 'OT', 'Mileage'];

        item.options = item.options?.filter((option) => {
          return !ratesNotForSelect.includes(option.text);
        })
      }
    });
  }

  private watchForDayChange(): Observable<Date> {
    return this.form?.controls['day']?.valueChanges as Observable<Date>;
  }
}
