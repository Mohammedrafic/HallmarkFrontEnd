import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ChangedEventArgs } from '@syncfusion/ej2-angular-inputs';
import { takeUntil, throttleTime } from 'rxjs';

import { PeriodType } from '@core/enums';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DatePeriod } from '@core/interface';

@Component({
  selector: 'app-period-picker',
  templateUrl: './period-picker.component.html',
  styleUrls: ['./period-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodPickerComponent extends Destroyable implements OnInit {
  @Input() periodType = PeriodType.Year;

  @Input() headerFormat = 'MMMM, yyyy';

  @Input() firstWeekDay = 0;

  @Output() periodSelected: EventEmitter<DatePeriod> = new EventEmitter();

  dateControl = new FormControl(new Date());

  ngOnInit(): void {
    this.observeSelectedDate();
  }

  selectPeriod(event: ChangedEventArgs): void {
    const selectedValue = event.value as unknown as Date;
    this.periodSelected.emit(DateTimeHelper.calculateMonthBoundDays(selectedValue, this.firstWeekDay));
  }

  slectNextPeriod(): void {
    this.shiftPeriod();
  }

  selectPreviousPeriod(): void {
    this.shiftPeriod(false);
  }

  private observeSelectedDate(): void {
    this.dateControl.valueChanges
    .pipe(
      throttleTime(1000),
      takeUntil(this.componentDestroy())
    )
    .subscribe((selectedDate: Date) => {
      this.periodSelected.emit(DateTimeHelper.calculateMonthBoundDays(selectedDate, this.firstWeekDay));
    });
  }

  private shiftPeriod(next = true): void {
    const shift = next ? 1 : -1;
    const currentDate = this.dateControl.value as Date;

    this.dateControl.patchValue(new Date(currentDate.setMonth(currentDate.getMonth() + shift)));
  }
}
